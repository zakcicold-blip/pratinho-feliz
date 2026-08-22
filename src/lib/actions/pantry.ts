"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/currentChild";
import { CATEGORIA_INGREDIENTE_ORDEM } from "@/lib/constants";

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

/**
 * Registra quanto a pessoa realmente pegou no mercado.
 *
 * O valor chega na unidade base do ingrediente (contagem, gramas ou ml) e a
 * sugestao do plano passa a ser so referencia. Anotar uma quantidade marca o
 * item como comprado; zerar apenas limpa o numero, sem desmarcar.
 */
export async function registrarQuantidade(
  childId: string,
  semanaInicio: Date,
  ingredientId: string,
  quantidade: number | null
) {
  const session = await requireSession();
  const child = await db.childProfile.findUniqueOrThrow({ where: { id: childId } });
  if (child.userId !== session.user.id) throw new Error("Nao autorizado.");

  const valor =
    quantidade == null || !Number.isFinite(quantidade) || quantidade <= 0
      ? null
      : Math.min(quantidade, 100000);

  await db.shoppingCheck.upsert({
    where: {
      childProfileId_semanaInicio_ingredientId: {
        childProfileId: childId,
        semanaInicio,
        ingredientId,
      },
    },
    update: valor == null ? { quantidadeComprada: null } : { quantidadeComprada: valor, comprado: true },
    create: {
      childProfileId: childId,
      semanaInicio,
      ingredientId,
      quantidadeComprada: valor,
      comprado: valor != null,
    },
  });

  revalidatePath("/compras");
}

/**
 * Item avulso da lista de compras — o que a família precisa comprar mas não
 * vem de nenhuma receita do plano (produtos de limpeza, fruta extra, etc).
 * Fica preso à semana em que foi criado, igual aos itens gerados.
 */
export async function adicionarItemManual(
  childId: string,
  semanaInicio: Date,
  nome: string,
  quantidade: string,
  categoria: string
) {
  const session = await requireSession();
  const child = await db.childProfile.findUniqueOrThrow({ where: { id: childId } });
  if (child.userId !== session.user.id) throw new Error("Não autorizado.");

  const nomeLimpo = nome.trim().slice(0, 80);
  if (!nomeLimpo) return;

  await db.shoppingExtra.create({
    data: {
      childProfileId: childId,
      semanaInicio,
      nome: nomeLimpo,
      quantidade: quantidade.trim().slice(0, 40) || null,
      categoria: CATEGORIA_INGREDIENTE_ORDEM.includes(categoria) ? categoria : "OUTROS",
    },
  });

  revalidatePath("/compras");
}

export async function marcarExtraComprado(extraId: string, comprado: boolean) {
  const session = await requireSession();
  const extra = await db.shoppingExtra.findUniqueOrThrow({
    where: { id: extraId },
    include: { child: true },
  });
  if (extra.child.userId !== session.user.id) throw new Error("Não autorizado.");

  await db.shoppingExtra.update({ where: { id: extraId }, data: { comprado } });
  revalidatePath("/compras");
}

export async function removerItemManual(extraId: string) {
  const session = await requireSession();
  const extra = await db.shoppingExtra.findUniqueOrThrow({
    where: { id: extraId },
    include: { child: true },
  });
  if (extra.child.userId !== session.user.id) throw new Error("Não autorizado.");

  await db.shoppingExtra.delete({ where: { id: extraId } });
  revalidatePath("/compras");
}
