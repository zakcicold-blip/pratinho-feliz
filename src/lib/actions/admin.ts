"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";
import { estimarGramas } from "@/lib/medidas";
import type { ReceitaImportada } from "@/lib/importarReceitas";
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
  imagemUrl: string;
  fonte: string;
  ingredientes: { ingredientId: string; quantidade: string }[];
};

/** Só aceita https, para não servir imagem por conexão insegura. */
function normalizarImagemUrl(valor: string): { url: string | null; erro?: string } {
  const url = valor.trim();
  if (!url) return { url: null };
  if (!/^https:\/\//i.test(url)) return { url: null, erro: "A URL da imagem precisa começar com https://" };
  return { url };
}

/**
 * Monta os itens da receita já com o peso estimado, para a tabela nutricional
 * ficar correta assim que a receita é salva.
 */
async function montarIngredientes(
  entrada: { ingredientId: string; quantidade: string }[]
): Promise<{ ingredientId: string; quantidade: string; gramas: number | null }[]> {
  const validos = entrada.filter((i) => i.ingredientId);
  if (validos.length === 0) return [];

  const ingredientes = await db.ingredient.findMany({
    where: { id: { in: validos.map((i) => i.ingredientId) } },
    select: { id: true, gramasPorUnidade: true },
  });
  const porId = new Map(ingredientes.map((i) => [i.id, i]));

  const itens: { ingredientId: string; quantidade: string; gramas: number | null }[] = [];
  for (const item of validos) {
    // A unique (recipeId, ingredientId) impede repetir o mesmo ingrediente.
    if (itens.some((i) => i.ingredientId === item.ingredientId)) continue;
    itens.push({
      ingredientId: item.ingredientId,
      quantidade: item.quantidade,
      gramas: estimarGramas(item.quantidade, porId.get(item.ingredientId)?.gramasPorUnidade),
    });
  }
  return itens;
}

function lerPorcoes(rendimento: string): number {
  const n = Number(rendimento.match(/(\d+)/)?.[1] ?? 1);
  return Number.isFinite(n) && n > 0 ? n : 1;
}

export async function criarReceita(input: ReceitaInput) {
  await requireAdmin();
  if (!input.nome.trim()) return { error: "Informe o nome da receita." };

  const imagem = normalizarImagemUrl(input.imagemUrl);
  if (imagem.erro) return { error: imagem.erro };

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
      imagemUrl: imagem.url,
      fonte: input.fonte.trim() || null,
      porcoes: lerPorcoes(input.rendimento),
      ingredients: { create: await montarIngredientes(input.ingredientes) },
    },
  });

  revalidatePath("/admin/receitas");
  redirect(`/admin/receitas/${receita.id}`);
}

export async function atualizarReceita(id: string, input: ReceitaInput) {
  await requireAdmin();
  if (!input.nome.trim()) return { error: "Informe o nome da receita." };

  const imagem = normalizarImagemUrl(input.imagemUrl);
  if (imagem.erro) return { error: imagem.erro };

  const itens = await montarIngredientes(input.ingredientes);

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
      imagemUrl: imagem.url,
      fonte: input.fonte.trim() || null,
      porcoes: lerPorcoes(input.rendimento),
      ingredients: { create: itens },
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

/**
 * Grava em lote as receitas já validadas pela tela de importação.
 *
 * - Ingrediente que não existe é criado na categoria OUTROS (o admin ajusta depois).
 * - Receita com nome já existente é pulada, para o import ser seguro de repetir.
 * - As gramas de cada ingrediente são estimadas na hora, para a nutrição já sair pronta.
 */
export async function importarReceitas(receitas: ReceitaImportada[]) {
  await requireAdmin();

  if (!Array.isArray(receitas) || receitas.length === 0) {
    return { error: "Nenhuma receita para importar." };
  }
  if (receitas.length > 500) {
    return { error: "Importe no máximo 500 receitas por vez." };
  }

  const ingredientesExistentes = await db.ingredient.findMany();
  const porNomeNormalizado = new Map(
    ingredientesExistentes.map((i) => [i.nome.trim().toLowerCase(), i])
  );

  let criadas = 0;
  const puladas: string[] = [];
  const ingredientesNovos: string[] = [];

  for (const receita of receitas) {
    const jaExiste = await db.recipe.findFirst({ where: { nome: receita.nome } });
    if (jaExiste) {
      puladas.push(receita.nome);
      continue;
    }

    const itens: { ingredientId: string; quantidade: string; gramas: number | null }[] = [];

    for (const item of receita.ingredientes) {
      const chave = item.nome.trim().toLowerCase();
      let ingrediente = porNomeNormalizado.get(chave);

      if (!ingrediente) {
        ingrediente = await db.ingredient.create({
          data: { nome: item.nome.trim(), categoria: "OUTROS" },
        });
        porNomeNormalizado.set(chave, ingrediente);
        ingredientesNovos.push(ingrediente.nome);
      }

      // Evita violar a unique (recipeId, ingredientId) se o arquivo repetir o ingrediente.
      if (itens.some((i) => i.ingredientId === ingrediente!.id)) continue;

      itens.push({
        ingredientId: ingrediente.id,
        quantidade: item.quantidade,
        gramas: estimarGramas(item.quantidade, ingrediente.gramasPorUnidade),
      });
    }

    const porcoes = Number(receita.rendimento.match(/(\d+)/)?.[1] ?? 1) || 1;

    await db.recipe.create({
      data: {
        nome: receita.nome,
        resumo: receita.resumo,
        tipoRefeicao: receita.tipoRefeicao,
        tempoPreparoMin: receita.tempoPreparoMin,
        dificuldade: receita.dificuldade,
        rendimento: receita.rendimento,
        passos: receita.passos.join("\n"),
        tags: receita.tags.join(","),
        restricoes: receita.restricoes.join(","),
        idadeMinimaMeses: receita.idadeMinimaMeses,
        imagemUrl: receita.imagemUrl,
        fonte: receita.fonte,
        porcoes,
        ingredients: { create: itens },
      },
    });
    criadas++;
  }

  await db.auditLog.create({
    data: {
      evento: "receitas_importadas",
      detalhes: `${criadas} criadas, ${puladas.length} puladas (nome ja existente).`,
    },
  });

  revalidatePath("/admin/receitas");
  revalidatePath("/admin/ingredientes");

  return { ok: true, criadas, puladas, ingredientesNovos };
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
