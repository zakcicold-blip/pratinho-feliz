"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/currentChild";
import { StatusPreferencia } from "@prisma/client";

async function assertOwnership(childId: string) {
  const session = await requireSession();
  const child = await db.childProfile.findUniqueOrThrow({ where: { id: childId } });
  if (child.userId !== session.user.id) throw new Error("Não autorizado.");
}

export async function buscarOuCriarIngrediente(nomeInput: string) {
  await requireSession();
  const nome = nomeInput.trim();
  if (!nome) return { error: "Digite o nome do alimento." };
  if (nome.length > 40) return { error: "Nome muito longo." };

  const todos = await db.ingredient.findMany();
  const existente = todos.find((i) => i.nome.toLowerCase() === nome.toLowerCase());
  if (existente) return { ingredient: existente };

  const criado = await db.ingredient.create({ data: { nome, categoria: "OUTROS" } });
  return { ingredient: criado };
}

export async function adicionarDesejado(childId: string, ingredientId: string) {
  await assertOwnership(childId);

  await db.foodPreference.deleteMany({
    where: { childProfileId: childId, ingredientId, status: { in: ["RECUSA", "ACEITA"] } },
  });

  await db.foodPreference.upsert({
    where: {
      childProfileId_ingredientId_status: {
        childProfileId: childId,
        ingredientId,
        status: StatusPreferencia.DESEJADA,
      },
    },
    update: {},
    create: { childProfileId: childId, ingredientId, status: StatusPreferencia.DESEJADA },
  });

  revalidatePath("/descobertas");
}

export async function removerDesejado(childId: string, ingredientId: string) {
  await assertOwnership(childId);

  await db.foodPreference.deleteMany({
    where: { childProfileId: childId, ingredientId, status: StatusPreferencia.DESEJADA },
  });

  revalidatePath("/descobertas");
}
