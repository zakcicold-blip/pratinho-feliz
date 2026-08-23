"use server";

import { requireAdmin } from "@/lib/admin";
import { gerarRoteiro } from "@/lib/roteiroVideo";

export async function criarRoteiro(recipeId: string) {
  await requireAdmin();
  return gerarRoteiro(recipeId);
}
