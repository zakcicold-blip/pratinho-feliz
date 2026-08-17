"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/currentChild";
import { signOut } from "@/auth";
import { Objetivo, Praticidade, StatusPreferencia } from "@prisma/client";

export type PerfilInput = {
  nome: string;
  faixaEtaria: string;
  refeicoesPorDia: number;
  tempoDisponivel: number;
  praticidade: Praticidade;
  objetivo: Objetivo;
  equipamentos: string;
  aceitos: string[];
  recusados: string[];
  desejados: string[];
  restricoes: string[];
};

export async function atualizarPerfilCrianca(childId: string, input: PerfilInput) {
  const session = await requireSession();
  const child = await db.childProfile.findUniqueOrThrow({ where: { id: childId } });
  if (child.userId !== session.user.id) throw new Error("Não autorizado.");

  if (!input.nome.trim()) return { error: "Informe o nome ou apelido da criança." };

  await db.childProfile.update({
    where: { id: childId },
    data: {
      nome: input.nome.trim(),
      faixaEtaria: input.faixaEtaria,
      refeicoesPorDia: input.refeicoesPorDia,
      tempoDisponivel: input.tempoDisponivel,
      praticidade: input.praticidade,
      objetivo: input.objetivo,
      equipamentos: input.equipamentos || null,
    },
  });

  await db.foodPreference.deleteMany({ where: { childProfileId: childId } });

  const preferencias: { childProfileId: string; ingredientId: string; status: StatusPreferencia }[] =
    [];
  for (const id of input.aceitos)
    preferencias.push({ childProfileId: childId, ingredientId: id, status: StatusPreferencia.ACEITA });
  for (const id of input.recusados)
    preferencias.push({ childProfileId: childId, ingredientId: id, status: StatusPreferencia.RECUSA });
  for (const id of input.desejados)
    preferencias.push({
      childProfileId: childId,
      ingredientId: id,
      status: StatusPreferencia.DESEJADA,
    });
  for (const id of input.restricoes)
    preferencias.push({
      childProfileId: childId,
      ingredientId: id,
      status: StatusPreferencia.RESTRICAO,
    });

  if (preferencias.length > 0) {
    await db.foodPreference.createMany({ data: preferencias });
  }

  revalidatePath("/perfil");
  revalidatePath("/hoje");
  revalidatePath("/plano");

  return { ok: true };
}

export async function excluirConta() {
  const session = await requireSession();
  await db.user.delete({ where: { id: session.user.id } });
  await signOut({ redirectTo: "/" });
}
