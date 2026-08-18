/**
 * Converte as medidas caseiras usadas nas receitas ("1 xícara", "2 fatias",
 * "200 ml") em gramas, para permitir o cálculo nutricional.
 *
 * São aproximações de porção usual: servem para dar uma estimativa ao
 * responsável, não para prescrição clínica.
 */

/** Medidas com peso fixo, independente do ingrediente. */
const MEDIDAS_FIXAS: { padrao: RegExp; gramas: number }[] = [
  { padrao: /colher(?:es)?\s+de\s+sopa/i, gramas: 15 },
  { padrao: /colher(?:es)?\s+de\s+ch[áa]/i, gramas: 5 },
  { padrao: /pitada/i, gramas: 1 },
];

/**
 * Medidas contadas: o peso vem do próprio ingrediente
 * (`Ingredient.gramasPorUnidade`, o peso de 1 medida usual daquele alimento).
 */
const MEDIDAS_POR_UNIDADE =
  /(unidade|fatia|x[íi]cara|concha|pote|dente|fio|cubo|pacote|copo|por[çc][ãa]o)/i;

/** Medidas que não dá para converter — o ingrediente é ignorado no cálculo. */
const NAO_CONVERSIVEL = /(a\s+gosto|quanto\s+baste|q\.?b\.?)/i;

/** Lê "2", "1/2", "1 1/2" e "0,5" no início da string. */
function lerQuantidade(texto: string): number | null {
  const t = texto.trim();

  const misto = t.match(/^(\d+)\s+(\d+)\s*\/\s*(\d+)/);
  if (misto) {
    const [, inteiro, num, den] = misto;
    const d = Number(den);
    if (d === 0) return null;
    return Number(inteiro) + Number(num) / d;
  }

  const fracao = t.match(/^(\d+)\s*\/\s*(\d+)/);
  if (fracao) {
    const d = Number(fracao[2]);
    if (d === 0) return null;
    return Number(fracao[1]) / d;
  }

  const decimal = t.match(/^(\d+(?:[.,]\d+)?)/);
  if (decimal) return Number(decimal[1].replace(",", "."));

  return null;
}

/**
 * Estima o peso em gramas de uma medida.
 *
 * @param quantidade texto livre da receita, ex.: "2 colheres de sopa"
 * @param gramasPorUnidade peso de 1 medida usual do ingrediente, quando conhecido
 * @returns gramas estimadas, ou `null` quando não é possível converter
 */
export function estimarGramas(
  quantidade: string,
  gramasPorUnidade: number | null | undefined
): number | null {
  if (!quantidade) return null;
  const texto = quantidade.trim();

  if (NAO_CONVERSIVEL.test(texto)) return null;

  // Peso ou volume explícito: "150 g", "200 ml". Para líquidos de cozinha
  // assume-se densidade ~1 g/ml.
  const explicito = texto.match(/(\d+(?:[.,]\d+)?)\s*(g|gramas?|ml|mL)\b/);
  if (explicito) {
    const valor = Number(explicito[1].replace(",", "."));
    return Number.isFinite(valor) ? valor : null;
  }

  const qtd = lerQuantidade(texto);
  if (qtd === null) return null;

  for (const { padrao, gramas } of MEDIDAS_FIXAS) {
    if (padrao.test(texto)) return Number((qtd * gramas).toFixed(1));
  }

  if (MEDIDAS_POR_UNIDADE.test(texto) && gramasPorUnidade) {
    return Number((qtd * gramasPorUnidade).toFixed(1));
  }

  // Número solto ("3 ovos") também conta como unidade.
  if (gramasPorUnidade && /^\d/.test(texto)) {
    return Number((qtd * gramasPorUnidade).toFixed(1));
  }

  return null;
}
