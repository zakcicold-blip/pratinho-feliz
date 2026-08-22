/**
 * Converte o que o plano consome em quantidade de compra.
 *
 * O plano guarda gramas por uso (RecipeIngredient.gramas). Somando os usos do
 * período e dividindo pela unidade de compra do ingrediente, a lista deixa de
 * dizer "aparece 5x" e passa a dizer "5 abacates" — que é o que se leva ao
 * mercado.
 *
 * Esse número é apenas SUGESTÃO: quem manda é a quantidade que a pessoa anota
 * ter pegado (ShoppingCheck.quantidadeComprada), guardada sempre na unidade
 * base — contagem para itens por unidade, gramas/ml para os demais.
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

/**
 * "maço" + 3 => "maços". Cobre todos os rótulos usados (maço, cabeça, lata,
 * pote, pé, espiga, pacote). "un" é abreviação e não flexiona.
 */
function pluralizar(palavra: string, n: number): string {
  if (palavra === "un") return palavra;
  return n === 1 ? palavra : `${palavra}s`;
}

export type MedidaCompra = {
  /** Valor na unidade base: contagem de itens, ou gramas/ml. */
  base: number;
  /** Quanto vale 1 unidade exibida na base (1 para un/g/ml, 1000 para kg/L). */
  fator: number;
  /** Passo do stepper, na unidade exibida. */
  passo: number;
  /** Casas decimais aceitas na unidade exibida. */
  casas: number;
  /** Rótulo no singular, para montar o texto. */
  unidadeSingular: string;
  /** True quando o ingrediente é contado (aí o rótulo pluraliza). */
  contavel: boolean;
  /** Tempero: não vale mostrar número. */
  aGosto: boolean;
};

/**
 * Traduz um total em gramas para a medida de compra do ingrediente.
 * Usada tanto para a sugestão quanto para exibir o que a pessoa anotou.
 */
export function medirCompra(ing: IngredienteCompra, gramas: number): MedidaCompra {
  if (gramas > 0 && gramas < LIMIAR_A_GOSTO) {
    return {
      base: 0,
      fator: 1,
      passo: 1,
      casas: 0,
      unidadeSingular: "",
      contavel: false,
      aGosto: true,
    };
  }

  if (ing.unidadeCompra === "UNIDADE") {
    const peso = ing.gramasCompra ?? ing.gramasPorUnidade;
    if (peso && peso > 0) {
      return {
        base: Math.max(1, Math.ceil(gramas / peso)),
        fator: 1,
        passo: 1,
        casas: 0,
        unidadeSingular: ing.rotuloCompra ?? "un",
        contavel: true,
        aGosto: false,
      };
    }
    // Sem peso de referência, cai no peso bruto em vez de inventar unidade.
  }

  const liquido = ing.unidadeCompra === "ML";

  if (gramas >= 1000) {
    return {
      base: arredondarPara(gramas, 100),
      fator: 1000,
      passo: 0.1,
      casas: 2,
      unidadeSingular: liquido ? "L" : "kg",
      contavel: false,
      aGosto: false,
    };
  }

  // Passo menor em volume pequeno: 51 g de azeite vira 60 ml, não 100 ml.
  const passoArredondamento = liquido && gramas < 200 ? 10 : liquido ? 50 : 10;
  return {
    base: arredondarPara(gramas, passoArredondamento),
    fator: 1,
    passo: 50,
    casas: 0,
    unidadeSingular: liquido ? "ml" : "g",
    contavel: false,
    aGosto: false,
  };
}

/** Formata um valor já na unidade base, usando a medida do ingrediente. */
export function formatarMedida(medida: MedidaCompra, base: number): string {
  if (medida.aGosto) return "a gosto";
  const exibido = base / medida.fator;
  const numero = numeroBR(exibido, medida.casas);
  const unidade = medida.contavel
    ? pluralizar(medida.unidadeSingular, exibido)
    : medida.unidadeSingular;
  return `${numero} ${unidade}`;
}

/**
 * Quantidade a comprar, já formatada. Sempre arredonda para cima: sobrar um
 * pouco no mercado é melhor que faltar no meio da semana.
 */
export function formatarQuantidadeCompra(ing: IngredienteCompra, gramas: number): string {
  if (gramas < LIMIAR_A_GOSTO) return "a gosto";
  const medida = medirCompra(ing, gramas);
  return formatarMedida(medida, medida.base);
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
  /** Sugestão formatada ("27 un", "1,2 kg"). */
  quantidade: string;
  /** Sugestão na unidade base, para pré-preencher o campo do usuário. */
  sugestaoBase: number;
  /** Como converter e formatar o que a pessoa anotar. */
  medida: MedidaCompra;
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
  const ingredientePor = new Map<string, IngredienteCompra>();

  for (const linha of linhas) {
    if (naDespensa.has(linha.ingredientId)) continue;
    ingredientePor.set(linha.ingredientId, linha.ingredient);

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
        sugestaoBase: 0,
        medida: medirCompra(linha.ingredient, 0),
      });
    }
  }

  for (const item of mapa.values()) {
    const ing = ingredientePor.get(item.ingredientId)!;
    const medida = medirCompra(ing, item.gramas);
    item.medida = medida;
    item.sugestaoBase = medida.base;
    item.quantidade = formatarMedida(medida, medida.base);
  }

  return mapa;
}
