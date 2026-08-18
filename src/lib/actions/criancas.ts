"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { COOKIE_CRIANCA, requireSession } from "@/lib/currentChild";

const UM_ANO_EM_SEGUNDOS = 60 * 60 * 24 * 365;

/** Troca qual filho o responsável está visualizando. */
export async function selecionarCrianca(childId: string) {
  const session = await requireSession();

  const child = await db.childProfile.findFirst({
    where: { id: childId, userId: session.user.id },
    select: { id: true },
  });
  if (!child) throw new Error("Perfil não encontrado.");

  (await cookies()).set(COOKIE_CRIANCA, child.id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: UM_ANO_EM_SEGUNDOS,
  });

  // Toda tela do app é derivada da criança ativa.
  for (const rota of ["/hoje", "/plano", "/rotina", "/compras", "/favoritos", "/perfil", "/relatorio", "/descobertas"]) {
    revalidatePath(rota);
  }
}

/**
 * Remove um perfil de criança e tudo ligado a ele (plano, rotina, compras,
 * preferências) — o cascade do schema cuida disso. Só é permitido quando
 * existe outro filho, para o responsável nunca ficar sem nenhum perfil.
 */
export async function removerCrianca(childId: string) {
  const session = await requireSession();

  const filhos = await db.childProfile.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });

  if (!filhos.some((f) => f.id === childId)) throw new Error("Perfil não encontrado.");
  if (filhos.length <= 1) throw new Error("É preciso manter ao menos um perfil de criança.");

  await db.childProfile.delete({ where: { id: childId } });

  const jar = await cookies();
  if (jar.get(COOKIE_CRIANCA)?.value === childId) {
    const restante = filhos.find((f) => f.id !== childId)!;
    jar.set(COOKIE_CRIANCA, restante.id, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: UM_ANO_EM_SEGUNDOS,
    });
  }

  await db.auditLog.create({
    data: {
      userId: session.user.id,
      evento: "perfil_crianca_removido",
      detalhes: `Perfil ${childId} removido junto com plano, rotina e listas.`,
    },
  });

  redirect("/perfil");
}
