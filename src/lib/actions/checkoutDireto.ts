"use server";

import { headers, cookies } from "next/headers";
import type Stripe from "stripe";
import { db } from "@/lib/db";
import { avaliarSenha, gerarHash } from "@/lib/senha";
import { getStripe } from "@/lib/stripe";
import { signIn } from "@/auth";
import { enviarEventoCapi } from "@/lib/metaCapi";
import { registrarEtapa } from "@/lib/funil";

// ---------------------------------------------------------------------------
// Compra direta: pague primeiro, receba acesso.
//
// O checkout passou a ser hospedado pela Cakto (src/lib/checkoutLinks.ts), que
// nao devolve session_id. O provisionamento por /bem-vindo abaixo continua
// valendo para quem comprou pelo Stripe antes da troca — e volta a ser o
// caminho de todo mundo se o webhook da Cakto for ligado no futuro.
// ---------------------------------------------------------------------------

export type PlanoDireto = "MENSAL" | "TRIMESTRAL";

/** Host de onde a pessoa veio, para carimbar o evento com a URL certa. */
async function origem(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "https";
  if (host) return `${proto}://${host}`;
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

/**
 * InitiateCheckout pelo servidor, disparado quando a pessoa clica em assinar.
 *
 * O checkout agora e uma pagina da Cakto, fora do nosso dominio — nao ha mais
 * sessao do Stripe para criar aqui. O evento continua saindo em duas vias
 * (pixel no navegador + esta, pela Conversions API) com o mesmo eventId, que e
 * como a Meta sabe que os dois sao o mesmo checkout.
 */
export async function registrarInicioCheckout(plano: PlanoDireto, eventId: string): Promise<void> {
  const h = await headers();
  const jar = await cookies();

  await registrarEtapa("checkout_iniciado", {
    valor: plano === "TRIMESTRAL" ? 59.9 : 29.9,
    path: "/#planos",
  });

  await enviarEventoCapi({
    eventName: "InitiateCheckout",
    eventId: eventId || crypto.randomUUID(),
    fbp: jar.get("_fbp")?.value ?? null,
    fbc: jar.get("_fbc")?.value ?? null,
    clientIp: h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
    userAgent: h.get("user-agent"),
    value: plano === "TRIMESTRAL" ? 59.9 : 29.9,
    currency: "BRL",
    eventSourceUrl: `${await origem()}/#planos`,
  });
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
  const forca = avaliarSenha(senha);
  if (!forca.ok) return { error: forca.erro };
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

  const passwordHash = await gerarHash(senha);
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
  await signIn("credentials", { email, password: senha, redirectTo: "/hoje?novo=1&compra=1" });
}
