"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/currentChild";
import { notificar } from "@/lib/notificacoes";

/** Guarda a inscrição de push deste aparelho. */
export async function salvarInscricaoPush(inscricao: {
  endpoint: string;
  p256dh: string;
  auth: string;
}) {
  const session = await requireSession();

  // O endpoint é único por aparelho; reinscrever atualiza as chaves e
  // reativa uma inscrição que tinha sido marcada como inválida.
  await db.pushSubscription.upsert({
    where: { endpoint: inscricao.endpoint },
    update: {
      userId: session.user.id,
      p256dh: inscricao.p256dh,
      auth: inscricao.auth,
      invalidaEm: null,
    },
    create: {
      userId: session.user.id,
      endpoint: inscricao.endpoint,
      p256dh: inscricao.p256dh,
      auth: inscricao.auth,
    },
  });

  revalidatePath("/notificacoes");
}

export async function removerInscricaoPush(endpoint: string) {
  const session = await requireSession();
  await db.pushSubscription.deleteMany({
    where: { endpoint, userId: session.user.id },
  });
  revalidatePath("/notificacoes");
}

/**
 * Manda uma notificação de teste para a própria conta.
 *
 * Existe para a pessoa CONFIRMAR que funciona no aparelho dela, logo depois
 * de autorizar — sem isso, ela autoriza e fica sem saber se deu certo até o
 * dia seguinte.
 */
export async function enviarNotificacaoDeTeste() {
  const session = await requireSession();
  const resultado = await notificar({
    userId: session.user.id,
    tipo: "SISTEMA",
    titulo: "Tudo certo! 🍊",
    corpo: "As notificações do Pratinho Feliz estão funcionando neste aparelho.",
    link: "/notificacoes",
  });
  revalidatePath("/notificacoes");
  return resultado;
}

export async function marcarTodasComoLidas() {
  const session = await requireSession();
  await db.notificacao.updateMany({
    where: { userId: session.user.id, lida: false },
    data: { lida: true },
  });
  revalidatePath("/notificacoes");
  revalidatePath("/hoje");
}

export async function marcarComoLida(id: string) {
  const session = await requireSession();
  await db.notificacao.updateMany({
    where: { id, userId: session.user.id },
    data: { lida: true },
  });
  revalidatePath("/notificacoes");
  revalidatePath("/hoje");
}
