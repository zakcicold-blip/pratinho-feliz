"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { hojeChave } from "@/lib/dates";
import { requireSession, getConta } from "@/lib/currentChild";
import { podeUsar, TROCAS_GRATIS } from "@/lib/plano";
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

/**
 * Troca de refeicao.
 *
 * No plano gratuito a troca e limitada: e o momento em que a pessoa quer
 * controle sobre o cardapio, entao vale como amostra e como argumento. O
 * contador nao precisa de coluna nova — os slots trocados ficam com status
 * TROCADO, entao basta conta-los.
 */
export async function trocarRefeicao(
  mealSlotId: string,
  novoRecipeId: string,
  explicacao: string,
): Promise<{ error?: string; limiteAtingido?: boolean } | void> {
  await assertOwnership(mealSlotId);

  const { conta } = await getConta();
  if (!podeUsar("trocar_refeicao", conta.subscription)) {
    const usadas = await db.mealSlot.count({
      where: {
        status: "TROCADO",
        mealPlan: { child: { userId: conta.id } },
      },
    });
    if (usadas >= TROCAS_GRATIS) {
      return {
        error: `Você usou suas ${TROCAS_GRATIS} trocas gratuitas.`,
        limiteAtingido: true,
      };
    }
  }

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

  const dataInicio = hojeChave();

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
