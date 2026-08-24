"use server";

import { headers, cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/currentChild";
import { getStripe, DIAS_TESTE_GRATIS } from "@/lib/stripe";
import { enviarEventoCapi } from "@/lib/metaCapi";

/** Origem da requisição (https://host), para montar as URLs de retorno. */
async function origem(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "https";
  if (host) return `${proto}://${host}`;
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

/**
 * Garante um Customer do Stripe para o responsável e devolve o id.
 * Guarda o id na assinatura local para não recriar a cada visita.
 */
async function garantirCustomer(userId: string, email: string, nome: string): Promise<string> {
  const assinatura = await db.subscription.findUnique({ where: { userId } });
  if (assinatura?.stripeCustomerId) return assinatura.stripeCustomerId;

  const stripe = getStripe();
  const customer = await stripe.customers.create({
    email,
    name: nome,
    metadata: { userId },
  });

  await db.subscription.upsert({
    where: { userId },
    update: { stripeCustomerId: customer.id },
    create: { userId, stripeCustomerId: customer.id },
  });

  return customer.id;
}

/**
 * Cria a sessão de Checkout do trial e devolve a URL hospedada do Stripe.
 *
 * - modo assinatura, com o preço recorrente definido em STRIPE_PRICE_ID
 * - 7 dias de teste grátis (trial_period_days)
 * - cartão exigido já na entrada (payment_method_collection: "always"), então a
 *   cobrança acontece sozinha quando o trial termina
 */
export type PlanoAssinado = "MENSAL" | "TRIMESTRAL";

function priceIdDoPlano(plano: PlanoAssinado): string | undefined {
  return plano === "TRIMESTRAL"
    ? process.env.STRIPE_PRICE_ID_TRIMESTRAL
    : process.env.STRIPE_PRICE_ID;
}

export async function criarCheckoutTrial(
  plano: PlanoAssinado = "MENSAL"
): Promise<{ url: string } | { error: string }> {
  const session = await requireSession();

  const priceId = priceIdDoPlano(plano);
  if (!priceId) {
    return {
      error:
        plano === "TRIMESTRAL"
          ? "Plano trimestral ainda não configurado (falta STRIPE_PRICE_ID_TRIMESTRAL)."
          : "Assinatura ainda não configurada (falta STRIPE_PRICE_ID).",
    };
  }

  const user = await db.user.findUniqueOrThrow({
    where: { id: session.user.id },
    select: { email: true, name: true },
  });

  // Se já existe assinatura utilizável, não faz sentido abrir novo checkout.
  const atual = await db.subscription.findUnique({ where: { userId: session.user.id } });
  if (atual?.status === "ATIVA" || (atual?.status === "TESTE" && atual.stripeSubscriptionId)) {
    return { error: "Você já tem uma assinatura ativa." };
  }

  const customerId = await garantirCustomer(session.user.id, user.email, user.name);
  const base = await origem();

  // Cookies do Meta (não são httpOnly, chegam ao servidor) para casar a
  // conversão com o clique do anúncio no CAPI. E um event_id compartilhado
  // entre o pixel do navegador e o evento server-side, para deduplicar.
  const jar = await cookies();
  const fbp = jar.get("_fbp")?.value ?? "";
  const fbc = jar.get("_fbc")?.value ?? "";
  const startTrialEventId = crypto.randomUUID();

  const stripe = getStripe();
  const checkout = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    payment_method_collection: "always",
    subscription_data: {
      trial_period_days: DIAS_TESTE_GRATIS,
      metadata: { userId: session.user.id, fbp, fbc, startTrialEventId },
    },
    // Deixa claro o que acontece quando o trial acabar.
    custom_text: {
      submit: {
        message: `Você não será cobrado agora. Após ${DIAS_TESTE_GRATIS} dias de teste grátis, a assinatura é renovada automaticamente. Cancele quando quiser.`,
      },
    },
    // Passa pelo /assinar (que reconcilia a assinatura na hora) levando o plano
    // e o event_id, e de lá segue para /hoje?assinatura=ok — onde o pixel marca
    // o StartTrial com o mesmo id que o CAPI usa.
    success_url: `${base}/assinar?sucesso=1&plano=${plano}&eid=${startTrialEventId}`,
    cancel_url: `${base}/assinar?cancelado=1`,
  });

  if (!checkout.url) return { error: "Não foi possível iniciar o checkout." };
  return { url: checkout.url };
}

/** Ação de formulário: cria o checkout do plano escolhido e vai para o Stripe. */
export async function irParaCheckout(plano: PlanoAssinado = "MENSAL", formData?: FormData) {
  const res = await criarCheckoutTrial(plano);
  if (!("url" in res)) redirect(`/assinar?erro=${encodeURIComponent(res.error)}`);

  // InitiateCheckout pelo servidor, com o mesmo id que o botao usou no pixel.
  // Ir para o Stripe e sair do site: bloqueador de anuncio, aba fechada rapido
  // ou pixel ainda carregando derrubam o evento do navegador — o do servidor
  // chega de qualquer forma, e a Meta junta os dois pelo id.
  const h = await headers();
  const jar = await cookies();
  await enviarEventoCapi({
    eventName: "InitiateCheckout",
    eventId: String(formData?.get("eventId") ?? "") || crypto.randomUUID(),
    fbp: jar.get("_fbp")?.value ?? null,
    fbc: jar.get("_fbc")?.value ?? null,
    clientIp: h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
    userAgent: h.get("user-agent"),
    value: plano === "TRIMESTRAL" ? 59.9 : 29.9,
    currency: "BRL",
    eventSourceUrl: `${await origem()}/assinar`,
  });

  redirect(res.url);
}
