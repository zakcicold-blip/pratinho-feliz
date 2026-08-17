"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/currentChild";
import { EstadoFeedback, StatusPreferencia } from "@prisma/client";

export async function registrarFeedback(mealSlotId: string, estado: EstadoFeedback, observacao?: string) {
  const session = await requireSession();
  const slot = await db.mealSlot.findUniqueOrThrow({
    where: { id: mealSlotId },
    include: {
      mealPlan: { include: { child: true } },
      recipe: { include: { ingredients: { include: { ingredient: true } } } },
    },
  });
  if (slot.mealPlan.child.userId !== session.user.id) throw new Error("Não autorizado.");

  await db.mealFeedback.upsert({
    where: { mealSlotId },
    update: { estado, observacao },
    create: { mealSlotId, estado, observacao },
  });

  await db.mealSlot.update({ where: { id: mealSlotId }, data: { status: "CONCLUIDO" } });

  const childId = slot.mealPlan.childProfileId;

  if (slot.recipe) {
    const desejadas = await db.foodPreference.findMany({
      where: { childProfileId: childId, status: StatusPreferencia.DESEJADA },
    });
    const desejadaIds = new Set(desejadas.map((d) => d.ingredientId));

    for (const ri of slot.recipe.ingredients) {
      if (!desejadaIds.has(ri.ingredientId)) continue;
      await db.foodJourney.upsert({
        where: { childProfileId_ingredientId: { childProfileId: childId, ingredientId: ri.ingredientId } },
        update: { exposicoes: { increment: 1 }, ultimoEstado: estado },
        create: {
          childProfileId: childId,
          ingredientId: ri.ingredientId,
          exposicoes: 1,
          ultimoEstado: estado,
        },
      });
    }
  }

  revalidatePath("/hoje");
  revalidatePath("/plano");
  revalidatePath("/descobertas");
  revalidatePath("/relatorio");
}
