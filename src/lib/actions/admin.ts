"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";
import { TipoRefeicao } from "@prisma/client";

export type ReceitaInput = {
  nome: string;
  resumo: string;
  tipoRefeicao: TipoRefeicao;
  tempoPreparoMin: number;
  dificuldade: string;
  rendimento: string;
  passos: string;
  tags: string;
  restricoes: string;
  nutricao: string;
  idadeMinimaMeses: number;
  ingredientes: { ingredientId: string; quantidade: string }[];
};

export async function criarReceita(input: ReceitaInput) {
  await requireAdmin();
  if (!input.nome.trim()) return { error: "Informe o nome da receita." };

  const receita = await db.recipe.create({
    data: {
      nome: input.nome.trim(),
      resumo: input.resumo,
      tipoRefeicao: input.tipoRefeicao,
      tempoPreparoMin: input.tempoPreparoMin,
      dificuldade: input.dificuldade,
      rendimento: input.rendimento,
      passos: input.passos,
      tags: input.tags,
      restricoes: input.restricoes,
      nutricao: input.nutricao,
      idadeMinimaMeses: input.idadeMinimaMeses,
      ingredients: {
        create: input.ingredientes
          .filter((i) => i.ingredientId)
          .map((i) => ({ ingredientId: i.ingredientId, quantidade: i.quantidade })),
      },
    },
  });

  revalidatePath("/admin/receitas");
  redirect(`/admin/receitas/${receita.id}`);
}

export async function atualizarReceita(id: string, input: ReceitaInput) {
  await requireAdmin();
  if (!input.nome.trim()) return { error: "Informe o nome da receita." };

  await db.recipeIngredient.deleteMany({ where: { recipeId: id } });
  await db.recipe.update({
    where: { id },
    data: {
      nome: input.nome.trim(),
      resumo: input.resumo,
      tipoRefeicao: input.tipoRefeicao,
      tempoPreparoMin: input.tempoPreparoMin,
      dificuldade: input.dificuldade,
      rendimento: input.rendimento,
      passos: input.passos,
      tags: input.tags,
      restricoes: input.restricoes,
      nutricao: input.nutricao,
      idadeMinimaMeses: input.idadeMinimaMeses,
      ingredients: {
        create: input.ingredientes
          .filter((i) => i.ingredientId)
          .map((i) => ({ ingredientId: i.ingredientId, quantidade: i.quantidade })),
      },
    },
  });

  revalidatePath("/admin/receitas");
  revalidatePath(`/admin/receitas/${id}`);
  return { ok: true };
}

export async function alternarAtivoReceita(id: string) {
  await requireAdmin();
  const receita = await db.recipe.findUniqueOrThrow({ where: { id } });
  await db.recipe.update({ where: { id }, data: { ativo: !receita.ativo } });
  revalidatePath("/admin/receitas");
}

export async function criarIngrediente(nome: string, categoria: string) {
  await requireAdmin();
  if (!nome.trim()) return { error: "Informe o nome do ingrediente." };
  const existente = await db.ingredient.findUnique({ where: { nome: nome.trim() } });
  if (existente) return { error: "Já existe um ingrediente com esse nome." };
  await db.ingredient.create({ data: { nome: nome.trim(), categoria } });
  revalidatePath("/admin/ingredientes");
  revalidatePath("/admin/receitas/nova");
  return { ok: true };
}
