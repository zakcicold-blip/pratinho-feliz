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
