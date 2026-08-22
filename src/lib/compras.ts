/**
 * Converte o que o plano consome em quantidade de compra.
 *
 * O plano guarda gramas por uso (RecipeIngredient.gramas). Somando os usos do
 * período e dividindo pela unidade de compra do ingrediente, a lista deixa de
 * dizer "aparece 5x" e passa a dizer "5 abacates" — que é o que se leva ao
 * mercado.
 */

export type IngredienteCompra = {
  unidadeCompra: string;
  gramasCompra: number | null;
  gramasPorUnidade: number | null;
  rotuloCompra: string | null;
};

/** Abaixo disso não vale ocupar espaço com número: é tempero. */
const LIMIAR_A_GOSTO = 5;

function arredondarPara(valor: number, passo: number): number {
  return Math.ceil(valor / passo) * passo;
}

function numeroBR(valor: number, casas = 1): string {
  return valor.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: casas });
}

/** "maço" + 3 => "maços". Cobre todos os rótulos usados (maço, cabeça, lata, pote, pé, espiga, pacote). */
function pluralizar(palavra: string, n: number): string {
  return n === 1 ? palavra : `${palavra}s`;
}

/**
 * Quantidade a comprar, já formatada. Sempre arredonda para cima: sobrar um
 * pouco no mercado é melhor que faltar no meio da semana.
 */
export function formatarQuantidadeCompra(ing: IngredienteCompra, gramas: number): string {
  if (gramas < LIMIAR_A_GOSTO) return "a gosto";

  if (ing.unidadeCompra === "UNIDADE") {
    const peso = ing.gramasCompra ?? ing.gramasPorUnidade;
    if (peso && peso > 0) {
      const n = Math.max(1, Math.ceil(gramas / peso));
      return ing.rotuloCompra ? `${n} ${pluralizar(ing.rotuloCompra, n)}` : `${n} un`;
    }
    // Sem peso de referência, cai no peso bruto em vez de inventar unidade.
  }

  if (ing.unidadeCompra === "ML") {
    // Leite e azeite têm densidade próxima de 1 g/ml — a aproximação serve à lista.
    if (gramas >= 1000) return `${numeroBR(arredondarPara(gramas, 100) / 1000)} L`;
    // Passo menor em volume pequeno: 51 g de azeite vira 60 ml, não 100 ml.
    return `${arredondarPara(gramas, gramas < 200 ? 10 : 50)} ml`;
  }

  return gramas >= 1000
    ? `${numeroBR(arredondarPara(gramas, 100) / 1000)} kg`
    : `${arredondarPara(gramas, 10)} g`;
}

export type ItemAgregado = {
  ingredientId: string;
  nome: string;
  categoria: string;
  /** Total consumido no período. */
  gramas: number;
  /** Em quantos preparos o ingrediente aparece. */
  usos: number;
  /** Algum uso não tinha peso convertível — o total está subestimado. */
  aproximado: boolean;
  quantidade: string;
};

type LinhaReceita = {
  ingredientId: string;
  quantidade: string;
  gramas: number | null;
  ingredient: { nome: string; categoria: string } & IngredienteCompra;
};

/**
 * Soma os usos de cada ingrediente nos preparos do período, ignorando o que já
 * está na despensa.
 */
export function agregarCompras(
  linhas: LinhaReceita[],
  naDespensa: Set<string>
): Map<string, ItemAgregado> {
  const mapa = new Map<string, ItemAgregado>();

  for (const linha of linhas) {
    if (naDespensa.has(linha.ingredientId)) continue;

    const atual = mapa.get(linha.ingredientId);
    if (atual) {
      atual.gramas += linha.gramas ?? 0;
      atual.usos += 1;
      if (linha.gramas == null) atual.aproximado = true;
    } else {
      mapa.set(linha.ingredientId, {
        ingredientId: linha.ingredientId,
        nome: linha.ingredient.nome,
        categoria: linha.ingredient.categoria,
        gramas: linha.gramas ?? 0,
        usos: 1,
        aproximado: linha.gramas == null,
        quantidade: "",
      });
    }
  }

  for (const item of mapa.values()) {
    const linha = linhas.find((l) => l.ingredientId === item.ingredientId)!;
    item.quantidade = formatarQuantidadeCompra(linha.ingredient, item.gramas);
  }

  return mapa;
}
