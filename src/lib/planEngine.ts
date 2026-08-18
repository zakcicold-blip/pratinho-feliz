import { db } from "@/lib/db";
import {
  EstadoFeedback,
  Objetivo,
  Praticidade,
  StatusPreferencia,
  TipoRefeicao,
} from "@prisma/client";
import { TIPO_REFEICAO_ORDEM, parseEquipamentos } from "@/lib/constants";
import { faixaEtariaEmMeses } from "@/lib/idade";
import { campoDoObjetivo, lerRotina, type ObjetivoRotina } from "@/lib/objetivosRotina";
import { lerSinaisRotina } from "@/lib/rotinaSinais";

const REPETITION_WINDOW_DIAS = 4;

type RecipeWithIngredients = {
  id: string;
  nome: string;
  tipoRefeicao: TipoRefeicao;
  tempoPreparoMin: number;
  restricoes: string;
  idadeMinimaMeses: number;
  scoreSono: number | null;
  scoreEnergia: number | null;
  scoreCalma: number | null;
  equipamentos: string;
  ingredients: { ingredient: { id: string; nome: string } }[];
};

type ChildContext = {
  childId: string;
  praticidade: Praticidade;
  objetivo: Objetivo;
  tempoDisponivel: number;
  idadeMeses: number;
  objetivoRotina: ObjetivoRotina;
  restricaoNomes: Set<string>;
  aceitaIds: Set<string>;
  desejadaIds: Set<string>;
  recusaIds: Set<string>;
  favoriteRecipeIds: Set<string>;
  feedbackByRecipe: Map<string, { estado: EstadoFeedback; peso: number }[]>;
  equipamentosDisponiveis: Set<string>;
};

function norm(text: string) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

async function buildChildContext(childId: string): Promise<ChildContext> {
  const child = await db.childProfile.findUniqueOrThrow({
    where: { id: childId },
  });

  const preferences = await db.foodPreference.findMany({
    where: { childProfileId: childId },
    include: { ingredient: true },
  });

  const restricaoNomes = new Set(
    preferences
      .filter((p) => p.status === StatusPreferencia.RESTRICAO)
      .map((p) => norm(p.ingredient.nome))
  );
  const aceitaIds = new Set(
    preferences.filter((p) => p.status === StatusPreferencia.ACEITA).map((p) => p.ingredientId)
  );
  const desejadaIds = new Set(
    preferences.filter((p) => p.status === StatusPreferencia.DESEJADA).map((p) => p.ingredientId)
  );
  const recusaIds = new Set(
    preferences.filter((p) => p.status === StatusPreferencia.RECUSA).map((p) => p.ingredientId)
  );

  const favorites = await db.favorite.findMany({ where: { childProfileId: childId } });
  const favoriteRecipeIds = new Set(favorites.map((f) => f.recipeId));

  const feedbacks = await db.mealFeedback.findMany({
    where: { mealSlot: { mealPlan: { childProfileId: childId }, recipeId: { not: null } } },
    include: { mealSlot: true },
    orderBy: { createdAt: "desc" },
    take: 300,
  });

  const feedbackByRecipe = new Map<string, { estado: EstadoFeedback; peso: number }[]>();
  feedbacks.forEach((f, index) => {
    const recipeId = f.mealSlot.recipeId;
    if (!recipeId) return;
    const peso = Math.max(1, 10 - Math.floor(index / 10));
    const list = feedbackByRecipe.get(recipeId) ?? [];
    list.push({ estado: f.estado, peso });
    feedbackByRecipe.set(recipeId, list);
  });

  const sinais = await lerSinaisRotina(childId);
  const objetivoRotina = lerRotina(sinais).objetivo;

  return {
    childId,
    praticidade: child.praticidade,
    objetivo: child.objetivo,
    tempoDisponivel: child.tempoDisponivel,
    idadeMeses: faixaEtariaEmMeses(child.faixaEtaria),
    objetivoRotina,
    restricaoNomes,
    aceitaIds,
    desejadaIds,
    recusaIds,
    favoriteRecipeIds,
    feedbackByRecipe,
    equipamentosDisponiveis: parseEquipamentos(child.equipamentos),
  };
}

function passaRegrasDuras(recipe: RecipeWithIngredients, ctx: ChildContext): boolean {
  // Idade é bloqueio duro: cobre mel antes de 1 ano (botulismo infantil) e
  // oleaginosas inteiras antes dos 3 anos (risco de engasgo).
  if (recipe.idadeMinimaMeses > ctx.idadeMeses) return false;

  const tagsRestricao = recipe.restricoes
    .split(",")
    .map((t) => norm(t))
    .filter(Boolean);

  for (const tag of tagsRestricao) {
    if (ctx.restricaoNomes.has(tag)) return false;
  }

  for (const ri of recipe.ingredients) {
    if (ctx.restricaoNomes.has(norm(ri.ingredient.nome))) return false;
  }

  if (ctx.praticidade === Praticidade.MUITO_RAPIDO && recipe.tempoPreparoMin > 25) return false;
  if (recipe.tempoPreparoMin > ctx.tempoDisponivel + 20) return false;

  // Equipamento: só filtra quando a família declarou o que tem. Sem declaração,
  // não punimos (não dá para saber). Com declaração, uma receita que precisa de
  // um aparelho não marcado sai do plano — é o "influenciável" que o produto promete.
  if (ctx.equipamentosDisponiveis.size > 0 && recipe.equipamentos) {
    const exigidos = parseEquipamentos(recipe.equipamentos);
    for (const eq of exigidos) {
      if (!ctx.equipamentosDisponiveis.has(eq)) return false;
    }
  }

  return true;
}

function scoreRecipe(
  recipe: RecipeWithIngredients,
  ctx: ChildContext,
  recentUsados: string[]
): { score: number; motivo: string } {
  let score = 0;
  let motivoForte: string | null = null;

  for (const ri of recipe.ingredients) {
    if (ctx.aceitaIds.has(ri.ingredient.id)) score += 3;
    if (ctx.desejadaIds.has(ri.ingredient.id)) {
      const bonus = ctx.objetivo === Objetivo.APRESENTAR_NOVOS_ALIMENTOS ? 6 : 4;
      score += bonus;
      motivoForte = "Ajuda a apresentar um novo alimento";
    }
    if (ctx.recusaIds.has(ri.ingredient.id)) score -= 2;
  }

  const historico = ctx.feedbackByRecipe.get(recipe.id) ?? [];
  for (const h of historico) {
    if (h.estado === EstadoFeedback.GOSTOU) {
      score += 0.5 * h.peso;
      motivoForte = "Sugerido porque foi bem aceito antes";
    }
    if (h.estado === EstadoFeedback.ACEITOU) score += 0.3 * h.peso;
    if (h.estado === EstadoFeedback.EXPERIMENTOU) score += 0.1 * h.peso;
    if (h.estado === EstadoFeedback.RECUSOU) score -= 0.4 * h.peso;
  }

  if (ctx.favoriteRecipeIds.has(recipe.id)) {
    score += 6;
    motivoForte = "Um dos favoritos da família";
  }

  if (ctx.praticidade === Praticidade.MUITO_RAPIDO && recipe.tempoPreparoMin <= 15) {
    score += 3;
    if (!motivoForte) motivoForte = "Opção rápida para o seu dia a dia";
  }
  if (ctx.praticidade === Praticidade.PODE_COZINHAR_MAIS && recipe.tempoPreparoMin > 30) {
    score += 1;
  }

  // Objetivo vindo da rotina (sono / disposição / regulação).
  // Peso deliberadamente forte, mas abaixo de favoritos: a família ainda manda
  // mais que o algoritmo no que a criança já aceita.
  const campo = campoDoObjetivo(ctx.objetivoRotina);
  if (campo) {
    const valor = recipe[campo];
    if (valor !== null) {
      score += (valor / 100) * 5;
      if (valor >= 65 && !motivoForte) {
        motivoForte = MOTIVO_ROTINA[ctx.objetivoRotina];
      }
    }
  }

  const vezesRecentes = recentUsados.filter((id) => id === recipe.id).length;
  score -= vezesRecentes * 50;

  score += Math.random() * 1.5;

  return { score, motivo: motivoForte ?? "Selecionado para variar o cardápio do mês" };
}

const MOTIVO_ROTINA: Record<ObjetivoRotina, string> = {
  SONO: "Escolhida para apoiar o sono",
  ENERGIA: "Escolhida para dar mais disposição",
  CALMA: "Escolhida para ajudar a regular o dia",
  EQUILIBRIO: "Selecionado para variar o cardápio do mês",
};

async function getRecipePool(tipo: TipoRefeicao): Promise<RecipeWithIngredients[]> {
  return db.recipe.findMany({
    where: { tipoRefeicao: tipo, ativo: true },
    include: { ingredients: { include: { ingredient: true } } },
  });
}

export async function gerarPlano30Dias(childId: string, cicloNumero: number, dataInicio: Date) {
  const ctx = await buildChildContext(childId);

  const dataFim = new Date(dataInicio);
  dataFim.setDate(dataFim.getDate() + 29);

  const plano = await db.mealPlan.create({
    data: {
      childProfileId: childId,
      cicloNumero,
      dataInicio,
      dataFim,
      ativo: true,
    },
  });

  const poolPorTipo: Record<string, RecipeWithIngredients[]> = {};
  for (const tipo of TIPO_REFEICAO_ORDEM) {
    poolPorTipo[tipo] = await getRecipePool(tipo as TipoRefeicao);
  }

  const usadosRecentes: Record<string, string[]> = {
    CAFE_DA_MANHA: [],
    ALMOCO: [],
    LANCHE: [],
    JANTAR: [],
  };

  const slotsData: {
    mealPlanId: string;
    data: Date;
    tipo: TipoRefeicao;
    recipeId: string | null;
    explicacao: string | null;
  }[] = [];

  for (let dia = 0; dia < 30; dia++) {
    const data = new Date(dataInicio);
    data.setDate(data.getDate() + dia);

    for (const tipo of TIPO_REFEICAO_ORDEM) {
      const candidatos = (poolPorTipo[tipo] ?? []).filter((r) => passaRegrasDuras(r, ctx));

      if (candidatos.length === 0) {
        slotsData.push({
          mealPlanId: plano.id,
          data,
          tipo: tipo as TipoRefeicao,
          recipeId: null,
          explicacao: "Nenhuma receita compatível encontrada — ajuste o perfil.",
        });
        continue;
      }

      const ranqueados = candidatos
        .map((r) => ({ recipe: r, ...scoreRecipe(r, ctx, usadosRecentes[tipo]) }))
        .sort((a, b) => b.score - a.score);

      const escolhido = ranqueados[0];

      slotsData.push({
        mealPlanId: plano.id,
        data,
        tipo: tipo as TipoRefeicao,
        recipeId: escolhido.recipe.id,
        explicacao: escolhido.motivo,
      });

      usadosRecentes[tipo].push(escolhido.recipe.id);
      if (usadosRecentes[tipo].length > REPETITION_WINDOW_DIAS) usadosRecentes[tipo].shift();
    }
  }

  await db.mealSlot.createMany({ data: slotsData });

  return plano;
}

export async function gerarAlternativasParaSlot(mealSlotId: string, quantidade = 3) {
  const slot = await db.mealSlot.findUniqueOrThrow({
    where: { id: mealSlotId },
    include: { mealPlan: true },
  });

  const ctx = await buildChildContext(slot.mealPlan.childProfileId);

  const janelaInicio = new Date(slot.data);
  janelaInicio.setDate(janelaInicio.getDate() - REPETITION_WINDOW_DIAS);
  const janelaFim = new Date(slot.data);
  janelaFim.setDate(janelaFim.getDate() + REPETITION_WINDOW_DIAS);

  const vizinhos = await db.mealSlot.findMany({
    where: {
      mealPlanId: slot.mealPlanId,
      tipo: slot.tipo,
      data: { gte: janelaInicio, lte: janelaFim },
    },
  });
  const usadosRecentes = vizinhos.map((v) => v.recipeId).filter((id): id is string => !!id);

  const pool = await getRecipePool(slot.tipo);
  const candidatos = pool.filter((r) => passaRegrasDuras(r, ctx) && r.id !== slot.recipeId);

  const ranqueados = candidatos
    .map((r) => ({ recipe: r, ...scoreRecipe(r, ctx, usadosRecentes) }))
    .sort((a, b) => b.score - a.score);

  return ranqueados.slice(0, quantidade).map((r) => ({
    recipeId: r.recipe.id,
    nome: r.recipe.nome,
    explicacao: r.motivo,
  }));
}

export async function gerarAlternativasComDespensa(mealSlotId: string, quantidade = 3) {
  const slot = await db.mealSlot.findUniqueOrThrow({
    where: { id: mealSlotId },
    include: { mealPlan: true },
  });

  const childId = slot.mealPlan.childProfileId;
  const ctx = await buildChildContext(childId);

  const pantryItems = await db.pantryItem.findMany({ where: { childProfileId: childId } });
  const pantryIds = new Set(pantryItems.map((p) => p.ingredientId));

  const janelaInicio = new Date(slot.data);
  janelaInicio.setDate(janelaInicio.getDate() - REPETITION_WINDOW_DIAS);
  const janelaFim = new Date(slot.data);
  janelaFim.setDate(janelaFim.getDate() + REPETITION_WINDOW_DIAS);

  const vizinhos = await db.mealSlot.findMany({
    where: {
      mealPlanId: slot.mealPlanId,
      tipo: slot.tipo,
      data: { gte: janelaInicio, lte: janelaFim },
    },
  });
  const usadosRecentes = vizinhos.map((v) => v.recipeId).filter((id): id is string => !!id);

  const pool = await getRecipePool(slot.tipo);
  const candidatos = pool.filter((r) => passaRegrasDuras(r, ctx) && r.id !== slot.recipeId);

  const ranqueados = candidatos
    .map((r) => {
      const total = r.ingredients.length;
      const emCasa = r.ingredients.filter((ri) => pantryIds.has(ri.ingredient.id)).length;
      const cobertura = total > 0 ? emCasa / total : 0;
      const { score } = scoreRecipe(r, ctx, usadosRecentes);
      return { recipe: r, total, emCasa, cobertura, completo: total > 0 && emCasa === total, score };
    })
    .sort((a, b) => b.cobertura - a.cobertura || b.score - a.score);

  return {
    temItensNaDespensa: pantryIds.size > 0,
    alternativas: ranqueados.slice(0, quantidade).map((r) => ({
      recipeId: r.recipe.id,
      nome: r.recipe.nome,
      explicacao: r.completo
        ? "Você já tem tudo em casa"
        : `${r.emCasa} de ${r.total} ingredientes em casa`,
      emCasa: r.emCasa,
      total: r.total,
      completo: r.completo,
    })),
  };
}

/**
 * Receitas que melhor atendem ao objetivo lido da rotina, uma por tipo de
 * refeição. Usada na tela de Rotina para mostrar, de forma concreta, o que a
 * leitura de sono/atividade/disposição muda no cardápio.
 *
 * Passa pelas mesmas regras duras do plano (idade, restrições, recusas), então
 * o que aparece aqui é sempre algo que a criança pode de fato comer.
 */
export async function sugestoesDaRotina(childId: string) {
  const ctx = await buildChildContext(childId);
  const campo = campoDoObjetivo(ctx.objetivoRotina);

  const sugestoes: {
    tipo: TipoRefeicao;
    recipeId: string;
    nome: string;
    tempoPreparoMin: number;
    aderencia: number | null;
  }[] = [];

  for (const tipo of TIPO_REFEICAO_ORDEM as TipoRefeicao[]) {
    const pool = (await getRecipePool(tipo)).filter((r) => passaRegrasDuras(r, ctx));
    if (pool.length === 0) continue;

    const melhor = pool
      .map((r) => ({ recipe: r, ...scoreRecipe(r, ctx, []) }))
      .sort((a, b) => b.score - a.score)[0];

    sugestoes.push({
      tipo,
      recipeId: melhor.recipe.id,
      nome: melhor.recipe.nome,
      tempoPreparoMin: melhor.recipe.tempoPreparoMin,
      aderencia: campo ? melhor.recipe[campo] : null,
    });
  }

  return { objetivo: ctx.objetivoRotina, sugestoes };
}
