"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/currentChild";
import { EstadoFeedback, StatusPreferencia } from "@prisma/client";

/**
 * Registra a reação da criança a uma refeição.
 *
 * É a ação mais usada do app — o custo dela é o que a pessoa sente como
 * "demora pra acontecer". Três coisas foram corrigidas aqui:
 *
 * 1. A consulta do slot carregava a receita inteira com todos os ingredientes
 *    e o perfil da criança. Agora traz só os campos usados.
 * 2. Os `foodJourney.upsert` rodavam num laço sequencial — uma ida ao banco
 *    por ingrediente. Agora vão todos em paralelo.
 * 3. As gravações independentes (feedback e status do slot) também são
 *    paralelas.
 */
export async function registrarFeedback(
  mealSlotId: string,
  estado: EstadoFeedback,
  observacao?: string
) {
  const session = await requireSession();

  const slot = await db.mealSlot.findUniqueOrThrow({
    where: { id: mealSlotId },
    select: {
      mealPlan: { select: { childProfileId: true, child: { select: { userId: true } } } },
      recipe: { select: { ingredients: { select: { ingredientId: true } } } },
    },
  });
  if (slot.mealPlan.child.userId !== session.user.id) throw new Error("Não autorizado.");

  const childId = slot.mealPlan.childProfileId;

  const [, , desejadas] = await Promise.all([
    db.mealFeedback.upsert({
      where: { mealSlotId },
      update: { estado, observacao },
      create: { mealSlotId, estado, observacao },
    }),
    db.mealSlot.update({ where: { id: mealSlotId }, data: { status: "CONCLUIDO" } }),
    slot.recipe
      ? db.foodPreference.findMany({
          where: { childProfileId: childId, status: StatusPreferencia.DESEJADA },
          select: { ingredientId: true },
        })
      : Promise.resolve([]),
  ]);

  if (slot.recipe && desejadas.length > 0) {
    const desejadaIds = new Set(desejadas.map((d) => d.ingredientId));
    const aRegistrar = slot.recipe.ingredients.filter((ri) => desejadaIds.has(ri.ingredientId));

    // Em paralelo: antes era uma ida ao banco por ingrediente, em fila.
    await Promise.all(
      aRegistrar.map((ri) =>
        db.foodJourney.upsert({
          where: {
            childProfileId_ingredientId: { childProfileId: childId, ingredientId: ri.ingredientId },
          },
          update: { exposicoes: { increment: 1 }, ultimoEstado: estado },
          create: {
            childProfileId: childId,
            ingredientId: ri.ingredientId,
            exposicoes: 1,
            ultimoEstado: estado,
          },
        })
      )
    );
  }

  // Todas as telas que mostram a reação continuam sendo invalidadas: o custo
  // disso é do lado do cliente, não do servidor, e tirar /relatorio deixaria
  // "dias acompanhados" desatualizado depois de um toque.
  revalidatePath("/hoje");
  revalidatePath("/plano");
  revalidatePath("/descobertas");
  revalidatePath("/relatorio");
}
