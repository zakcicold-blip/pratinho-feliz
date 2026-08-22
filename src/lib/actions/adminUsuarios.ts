"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";

/**
 * Exclui uma conta pelo painel admin (para limpar contas de teste).
 * A exclusão cascateia perfis, assinatura e solicitações da conta.
 *
 * Guardas de segurança:
 * - não exclui contas de administrador;
 * - não permite excluir a si mesmo;
 * - recusa contas com assinatura REAL no Stripe (deletar aqui deixaria a
 *   cobrança viva no Stripe) — nesse caso, cancele no Stripe antes.
 */
export async function deletarUsuario(userId: string): Promise<{ error?: string } | void> {
  const session = await requireAdmin();

  const alvo = await db.user.findUnique({
    where: { id: userId },
    include: { subscription: true },
  });
  if (!alvo) return { error: "Usuário não encontrado." };
  if (alvo.id === session.user.id) return { error: "Você não pode excluir a própria conta." };
  if (alvo.role === "ADMIN") return { error: "Contas de administrador não podem ser excluídas por aqui." };
  if (alvo.subscription?.stripeSubscriptionId) {
    return { error: "Assinatura ativa no Stripe. Cancele no Stripe antes de excluir a conta." };
  }

  await db.user.delete({ where: { id: userId } });
  await db.auditLog.create({
    data: {
      userId: session.user.id,
      evento: "usuario_excluido",
      detalhes: `Conta ${alvo.email} excluída pelo admin.`,
    },
  });

  revalidatePath("/admin/usuarios");
}

/**
 * Liga/desliga o acesso de cortesia de uma conta (convidados, parceiras,
 * imprensa). Libera o app sem passar pelo Stripe e sem contar como receita —
 * por isso o status da assinatura não é tocado.
 *
 * Guardas:
 * - quem já paga no Stripe não recebe cortesia (seria cobrança duplicada);
 * - toda mudança fica registrada no log de auditoria.
 */
export async function alternarCortesia(
  userId: string,
  liberar: boolean,
  motivo?: string
): Promise<{ error?: string } | void> {
  const session = await requireAdmin();

  const alvo = await db.user.findUnique({
    where: { id: userId },
    include: { subscription: true },
  });
  if (!alvo) return { error: "Usuário não encontrado." };

  if (liberar && alvo.subscription?.stripeSubscriptionId) {
    return { error: "Esta conta já tem assinatura no Stripe. Cancele lá antes de liberar cortesia." };
  }

  const anotacao = motivo?.trim().slice(0, 120) || null;

  await db.subscription.upsert({
    where: { userId },
    update: {
      acessoCortesia: liberar,
      cortesiaMotivo: liberar ? anotacao : null,
      cortesiaEm: liberar ? new Date() : null,
    },
    create: {
      userId,
      plano: "ESSENCIAL",
      status: "TESTE",
      acessoCortesia: liberar,
      cortesiaMotivo: liberar ? anotacao : null,
      cortesiaEm: liberar ? new Date() : null,
    },
  });

  await db.auditLog.create({
    data: {
      userId: session.user.id,
      evento: liberar ? "cortesia_liberada" : "cortesia_removida",
      detalhes: liberar
        ? `Acesso liberado para ${alvo.email}${anotacao ? ` — ${anotacao}` : ""}.`
        : `Acesso de cortesia removido de ${alvo.email}.`,
    },
  });

  revalidatePath("/admin/usuarios");
}
