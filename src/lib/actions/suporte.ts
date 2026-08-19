"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/currentChild";
import { requireAdmin } from "@/lib/admin";
import { getStripe } from "@/lib/stripe";

/**
 * A pessoa pede o cancelamento escrevendo o motivo. Não cancela nada sozinho —
 * vira uma solicitação PENDENTE que o admin analisa e aprova (no painel e no
 * Stripe). Um pedido pendente por vez.
 */
export async function solicitarCancelamento(motivo: string) {
  const session = await requireSession();
  const texto = motivo.trim().slice(0, 1000);
  if (texto.length < 3) return { error: "Conte brevemente o motivo do cancelamento." };

  const pendente = await db.solicitacaoCancelamento.findFirst({
    where: { userId: session.user.id, status: "PENDENTE" },
  });
  if (pendente) return { error: "Você já tem uma solicitação em análise." };

  await db.solicitacaoCancelamento.create({
    data: { userId: session.user.id, motivo: texto },
  });

  await db.auditLog.create({
    data: {
      userId: session.user.id,
      evento: "cancelamento_solicitado",
      detalhes: `Motivo: ${texto.slice(0, 200)}`,
    },
  });

  revalidatePath("/configuracoes");
  return { ok: true as const };
}

/**
 * Admin resolve a solicitação. Ao aprovar, agenda o cancelamento no Stripe
 * (ao fim do período já pago) para não estornar dias, e marca a assinatura.
 */
export async function resolverCancelamento(id: string, aprovar: boolean, resposta?: string) {
  await requireAdmin();

  const solicitacao = await db.solicitacaoCancelamento.findUniqueOrThrow({
    where: { id },
    include: { user: { include: { subscription: true } } },
  });

  if (aprovar) {
    const subId = solicitacao.user.subscription?.stripeSubscriptionId;
    if (subId) {
      const stripe = getStripe();
      try {
        await stripe.subscriptions.update(subId, { cancel_at_period_end: true });
      } catch (e) {
        console.error("Falha ao agendar cancelamento no Stripe:", e);
      }
      await db.subscription.update({
        where: { userId: solicitacao.userId },
        data: { cancelAtPeriodEnd: true },
      });
    }
  }

  await db.solicitacaoCancelamento.update({
    where: { id },
    data: {
      status: aprovar ? "APROVADO" : "RECUSADO",
      respostaAdmin: resposta?.trim().slice(0, 1000) || null,
      resolvidoEm: new Date(),
    },
  });

  await db.auditLog.create({
    data: {
      userId: solicitacao.userId,
      evento: aprovar ? "cancelamento_aprovado" : "cancelamento_recusado",
      detalhes: `Solicitação ${id} resolvida pelo admin.`,
    },
  });

  revalidatePath("/admin/cancelamentos");
  revalidatePath("/admin");
}
