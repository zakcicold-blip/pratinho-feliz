import type Stripe from "stripe";
import { db } from "@/lib/db";
import { getStripe } from "@/lib/stripe";
import type { StatusAssinatura } from "@prisma/client";

/** Traduz o status do Stripe para o enum local. */
export function traduzStatus(status: Stripe.Subscription.Status): StatusAssinatura {
  switch (status) {
    case "trialing":
      return "TESTE";
    case "active":
      return "ATIVA";
    case "canceled":
    case "incomplete_expired":
      return "CANCELADA";
    default:
      // past_due, unpaid, incomplete, paused: acesso suspenso até regularizar.
      return "CARENCIA";
  }
}

function unixParaData(segundos: number | null | undefined): Date | null {
  return segundos ? new Date(segundos * 1000) : null;
}

/** Espelha uma assinatura do Stripe no banco local. */
export async function sincronizarAssinaturaStripe(sub: Stripe.Subscription): Promise<void> {
  const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
  const userId = sub.metadata?.userId;

  const dados = {
    stripeSubscriptionId: sub.id,
    stripePriceId: sub.items.data[0]?.price.id ?? null,
    status: traduzStatus(sub.status),
    currentPeriodEnd: unixParaData(sub.current_period_end),
    trialEnd: unixParaData(sub.trial_end),
    cancelAtPeriodEnd: sub.cancel_at_period_end,
    renovaEm: unixParaData(sub.current_period_end),
  };

  const existentePorCustomer = await db.subscription.findFirst({
    where: { stripeCustomerId: customerId },
  });

  if (existentePorCustomer) {
    await db.subscription.update({ where: { id: existentePorCustomer.id }, data: dados });
    return;
  }

  if (userId) {
    await db.subscription.upsert({
      where: { userId },
      update: { stripeCustomerId: customerId, ...dados },
      create: { userId, stripeCustomerId: customerId, ...dados },
    });
  }
}

/**
 * Se o responsável pode usar o app.
 *
 * Regra central do paywall: um TESTE só libera quando existe uma assinatura
 * real no Stripe (stripeSubscriptionId). Assim, a conta recém-criada — que
 * nasce com status TESTE e sem Stripe — cai no paywall até passar o cartão.
 * ATIVA libera direto (cobre contas internas provisionadas à mão).
 *
 * Cortesia (liberada no painel admin) passa na frente de tudo: são convidados,
 * parceiras e imprensa, que usam o app sem cartão e sem entrar na receita.
 */
export type AssinaturaParaAcesso = {
  status: StatusAssinatura;
  stripeSubscriptionId: string | null;
  acessoCortesia: boolean;
};

/**
 * Regra pura do paywall, sem ida ao banco.
 *
 * Separada de `podeAcessarApp` para o layout do app poder reaproveitar a
 * assinatura que ja veio junto com a conta, em vez de consultar de novo a
 * cada navegacao.
 */
export function liberaAcesso(sub: AssinaturaParaAcesso | null | undefined): boolean {
  if (!sub) return false;
  if (sub.acessoCortesia) return true;
  if (sub.status === "ATIVA") return true;
  if (sub.status === "TESTE") return Boolean(sub.stripeSubscriptionId);
  return false; // CANCELADA, CARENCIA
}

export async function podeAcessarApp(userId: string): Promise<boolean> {
  const sub = await db.subscription.findUnique({ where: { userId } });
  return liberaAcesso(sub);
}

/**
 * Busca no Stripe a assinatura mais recente do cliente e sincroniza. Usada no
 * retorno do Checkout para não depender do tempo de entrega do webhook.
 */
export async function reconciliarAssinatura(userId: string): Promise<boolean> {
  const sub = await db.subscription.findUnique({ where: { userId } });
  if (!sub?.stripeCustomerId) return false;

  const stripe = getStripe();
  const lista = await stripe.subscriptions.list({
    customer: sub.stripeCustomerId,
    status: "all",
    limit: 1,
  });

  const maisRecente = lista.data[0];
  if (maisRecente) await sincronizarAssinaturaStripe(maisRecente);

  return podeAcessarApp(userId);
}
