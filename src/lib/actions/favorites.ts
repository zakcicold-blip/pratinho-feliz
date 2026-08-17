"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/currentChild";

export async function alternarFavorito(childId: string, recipeId: string) {
  const session = await requireSession();
  const child = await db.childProfile.findUniqueOrThrow({ where: { id: childId } });
  if (child.userId !== session.user.id) throw new Error("Não autorizado.");

  const existente = await db.favorite.findUnique({
    where: { childProfileId_recipeId: { childProfileId: childId, recipeId } },
  });

  if (existente) {
    await db.favorite.delete({ where: { id: existente.id } });
  } else {
    await db.favorite.create({ data: { childProfileId: childId, recipeId, origem: "manual" } });
  }

  revalidatePath("/hoje");
  revalidatePath("/plano");
  revalidatePath("/favoritos");
  revalidatePath(`/receita/${recipeId}`);

  return { favorito: !existente };
}
