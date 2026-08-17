"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/currentChild";
import {
  gerarAlternativasComDespensa,
  gerarAlternativasParaSlot,
  gerarPlano30Dias,
} from "@/lib/planEngine";

async function assertOwnership(mealSlotId: string) {
  const session = await requireSession();
  const slot = await db.mealSlot.findUniqueOrThrow({
    where: { id: mealSlotId },
    include: { mealPlan: { include: { child: true } } },
  });
  if (slot.mealPlan.child.userId !== session.user.id) {
    throw new Error("Não autorizado.");
  }
  return slot;
}

export async function buscarAlternativas(mealSlotId: string) {
  await assertOwnership(mealSlotId);
  return gerarAlternativasParaSlot(mealSlotId, 3);
}

export async function buscarAlternativasComDespensa(mealSlotId: string) {
  await assertOwnership(mealSlotId);
  return gerarAlternativasComDespensa(mealSlotId, 3);
}

export async function trocarRefeicao(mealSlotId: string, novoRecipeId: string, explicacao: string) {
  await assertOwnership(mealSlotId);
  await db.mealSlot.update({
    where: { id: mealSlotId },
    data: { recipeId: novoRecipeId, status: "TROCADO", explicacao },
  });
  revalidatePath("/hoje");
  revalidatePath("/plano");
  revalidatePath("/compras");
}

export async function marcarForaDeCasa(mealSlotId: string) {
  await assertOwnership(mealSlotId);
  await db.mealSlot.update({ where: { id: mealSlotId }, data: { status: "FORA_DE_CASA" } });
  revalidatePath("/hoje");
  revalidatePath("/plano");
  revalidatePath("/compras");
}

export async function marcarSemTempo(mealSlotId: string) {
  await assertOwnership(mealSlotId);
  const alternativas = await gerarAlternativasParaSlot(mealSlotId, 5);
  const rapida = alternativas[0];
  if (rapida) {
    await db.mealSlot.update({
      where: { id: mealSlotId },
      data: {
        recipeId: rapida.recipeId,
        status: "SEM_TEMPO",
        explicacao: "Opção rápida para hoje",
      },
    });
  } else {
    await db.mealSlot.update({ where: { id: mealSlotId }, data: { status: "SEM_TEMPO" } });
  }
  revalidatePath("/hoje");
  revalidatePath("/plano");
  revalidatePath("/compras");
}

export async function desfazerStatusSlot(mealSlotId: string) {
  await assertOwnership(mealSlotId);
  await db.mealSlot.update({ where: { id: mealSlotId }, data: { status: "PLANEJADO" } });
  revalidatePath("/hoje");
  revalidatePath("/plano");
}

export async function gerarProximoCiclo(childId: string) {
  const session = await requireSession();
  const child = await db.childProfile.findUniqueOrThrow({ where: { id: childId } });
  if (child.userId !== session.user.id) throw new Error("Não autorizado.");

  const atual = await db.mealPlan.findFirst({
    where: { childProfileId: childId, ativo: true },
    orderBy: { cicloNumero: "desc" },
  });

  if (atual) {
    await db.mealPlan.update({ where: { id: atual.id }, data: { ativo: false } });
  }

  const dataInicio = new Date();
  dataInicio.setHours(0, 0, 0, 0);

  await gerarPlano30Dias(childId, (atual?.cicloNumero ?? 0) + 1, dataInicio);

  await db.auditLog.create({
    data: {
      userId: session.user.id,
      evento: "novo_ciclo_gerado",
      detalhes: `Ciclo ${(atual?.cicloNumero ?? 0) + 1} gerado para o perfil ${childId}.`,
    },
  });

  revalidatePath("/hoje");
  revalidatePath("/plano");
  revalidatePath("/relatorio");
  redirect("/hoje");
}
