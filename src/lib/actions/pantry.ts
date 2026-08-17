"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/currentChild";

export async function alternarDespensa(childId: string, ingredientId: string) {
  const session = await requireSession();
  const child = await db.childProfile.findUniqueOrThrow({ where: { id: childId } });
  if (child.userId !== session.user.id) throw new Error("Não autorizado.");

  const existente = await db.pantryItem.findUnique({
    where: { childProfileId_ingredientId: { childProfileId: childId, ingredientId } },
  });

  if (existente) {
    await db.pantryItem.delete({ where: { id: existente.id } });
  } else {
    await db.pantryItem.create({ data: { childProfileId: childId, ingredientId } });
  }

  revalidatePath("/compras");
}

export async function marcarComprado(
  childId: string,
  semanaInicio: Date,
  ingredientId: string,
  comprado: boolean
) {
  const session = await requireSession();
  const child = await db.childProfile.findUniqueOrThrow({ where: { id: childId } });
  if (child.userId !== session.user.id) throw new Error("Não autorizado.");

  await db.shoppingCheck.upsert({
    where: {
      childProfileId_semanaInicio_ingredientId: {
        childProfileId: childId,
        semanaInicio,
        ingredientId,
      },
    },
    update: { comprado },
    create: { childProfileId: childId, semanaInicio, ingredientId, comprado },
  });

  revalidatePath("/compras");
}
