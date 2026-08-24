"use server";

import { headers, cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import type Stripe from "stripe";
import { db } from "@/lib/db";
import { getStripe } from "@/lib/stripe";
import { signIn } from "@/auth";

// ---------------------------------------------------------------------------
// Opção B do funil: pague primeiro, receba acesso.
// Diferente do fluxo de trial (billing.ts), aqui a pessoa NÃO tem conta ainda.
// O checkout cobra na hora (sem trial), o Stripe coleta o e-mail e cria o
// customer, e o provisionamento acontece na página /bem-vindo (sem depender de
// e-mail transacional).
// ---------------------------------------------------------------------------

export type PlanoDireto = "MENSAL" | "TRIMESTRAL";

async function origem(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "https";
  if (host) return `${proto}://${host}`;
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

function priceIdDoPlano(plano: PlanoDireto): string | undefined {
  return plano === "TRIMESTRAL"
    ? process.env.STRIPE_PRICE_ID_TRIMESTRAL
    : process.env.STRIPE_PRICE_ID;
}

/** Cria o checkout SEM trial e manda a pessoa para o Stripe. */
export async function irParaCheckoutDireto(plano: PlanoDireto = "MENSAL") {
  const priceId = priceIdDoPlano(plano);
  if (!priceId) redirect(`/?erro=${encodeURIComponent("Plano ainda não configurado.")}#planos`);

  const base = await origem();
  const jar = await cookies();
  const fbp = jar.get("_fbp")?.value ?? "";
  const fbc = jar.get("_fbc")?.value ?? "";
  const purchaseEventId = crypto.randomUUID();

  const stripe = getStripe();
  const checkout = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId!, quantity: 1 }],
    // Sem trial_period_days → cobrança imediata. Stripe coleta e-mail e cria o customer.
    subscription_data: { metadata: { fbp, fbc, purchaseEventId, origem: "oferta" } },
    metadata: { purchaseEventId, plano, origem: "oferta" },
    custom_text: {
      submit: { message: "Seu acesso é liberado assim que o pagamento for confirmado." },
    },
    success_url: `${base}/bem-vindo?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${base}/?cancelado=1#planos`,
  });

  if (!checkout.url) redirect(`/?erro=${encodeURIComponent("Não foi possível iniciar o pagamento.")}#planos`);
  redirect(checkout.url);
}

export type ProvisaoState = { error?: string } | undefined;

/**
 * Confirma o pagamento pela sessão do Stripe, cria a conta com o e-mail do
 * pagamento (fonte confiável) e a senha escolhida, vincula a assinatura ATIVA e
 * loga a pessoa. Segurança: só provisiona se a sessão estiver paga.
 */
export async function provisionarAcesso(
  sessionId: string,
  _prev: ProvisaoState,
  formData: FormData,
): Promise<ProvisaoState> {
  const senha = String(formData.get("senha") ?? "");
  if (senha.length < 6) return { error: "A senha precisa ter ao menos 6 caracteres." };
  if (!sessionId) return { error: "Sessão de pagamento não encontrada." };

  const stripe = getStripe();
  let sessao: Stripe.Checkout.Session;
  try {
    sessao = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["subscription", "customer"],
    });
  } catch {
    return { error: "Não foi possível validar o pagamento." };
  }

  if (sessao.payment_status !== "paid" && sessao.status !== "complete") {
    return { error: "Pagamento ainda não confirmado. Aguarde alguns segundos e recarregue." };
  }

  const email = (sessao.customer_details?.email ?? "").toLowerCase().trim();
  const nome = sessao.customer_details?.name?.trim() || "Responsável";
  if (!email) return { error: "Não foi possível ler o e-mail do pagamento." };

  const existente = await db.user.findUnique({ where: { email } });
  if (existente) {
    return { error: "Já existe uma conta com esse e-mail. Use a tela de login para entrar." };
  }

  const sub = (typeof sessao.subscription === "object" ? sessao.subscription : null) as
    | Stripe.Subscription
    | null;
  const customerId = typeof sessao.customer === "string" ? sessao.customer : (sessao.customer?.id ?? null);
  const subscriptionId =
    typeof sessao.subscription === "string" ? sessao.subscription : (sub?.id ?? null);
  const priceId = sub?.items?.data?.[0]?.price?.id ?? null;
  const fimPeriodo = sub?.current_period_end ? new Date(sub.current_period_end * 1000) : null;

  const passwordHash = await bcrypt.hash(senha, 10);
  await db.user.create({
    data: {
      name: nome,
      email,
      passwordHash,
      subscription: {
        create: {
          plano: "ESSENCIAL",
          status: "ATIVA",
          stripeCustomerId: customerId,
          stripeSubscriptionId: subscriptionId,
          stripePriceId: priceId,
          currentPeriodEnd: fimPeriodo,
          renovaEm: fimPeriodo,
        },
      },
    },
  });

  // compra=1 sinaliza ao Pixel que foi uma compra concluída (Opção B).
  await signIn("credentials", { email, password: senha, redirectTo: "/onboarding?novo=1&compra=1" });
}
