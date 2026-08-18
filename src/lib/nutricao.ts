import { TACO_FONTE } from "@/lib/tacoFonte";

export type IngredienteNutricional = {
  quantidade: string;
  gramas: number | null;
  ingredient: {
    nome: string;
    energiaKcal: number | null;
    proteinaG: number | null;
    carboidratoG: number | null;
    lipideoG: number | null;
    fibraG: number | null;
    calcioMg: number | null;
    ferroMg: number | null;
    sodioMg: number | null;
    vitaminaCMg: number | null;
    zincoMg: number | null;
  };
};

export type ResumoNutricional = {
  /** Valores por porção. */
  porPorcao: {
    energiaKcal: number;
    proteinaG: number;
    carboidratoG: number;
    lipideoG: number;
    fibraG: number;
    calcioMg: number;
    ferroMg: number;
    sodioMg: number;
    vitaminaCMg: number;
    zincoMg: number;
  };
  /** Quantos ingredientes entraram no cálculo. */
  ingredientesCalculados: number;
  /** Total de ingredientes da receita. */
  ingredientesTotal: number;
  /** Nomes dos ingredientes que ficaram de fora (sem dado ou sem medida convertível). */
  ingredientesIgnorados: string[];
  /** `true` quando todos os ingredientes entraram no cálculo. */
  completo: boolean;
  fonte: string;
};

const CAMPOS = [
  "energiaKcal",
  "proteinaG",
  "carboidratoG",
  "lipideoG",
  "fibraG",
  "calcioMg",
  "ferroMg",
  "sodioMg",
  "vitaminaCMg",
  "zincoMg",
] as const;

/**
 * Soma a composição dos ingredientes e divide pelo número de porções.
 *
 * Ingredientes sem dado na TACO ou com medida não convertível ("a gosto") são
 * ignorados — por isso o retorno informa quantos entraram, para a interface
 * poder deixar claro que é uma estimativa parcial.
 */
export function calcularNutricao(
  itens: IngredienteNutricional[],
  porcoes: number
): ResumoNutricional | null {
  const divisor = porcoes > 0 ? porcoes : 1;

  const total: Record<(typeof CAMPOS)[number], number> = {
    energiaKcal: 0,
    proteinaG: 0,
    carboidratoG: 0,
    lipideoG: 0,
    fibraG: 0,
    calcioMg: 0,
    ferroMg: 0,
    sodioMg: 0,
    vitaminaCMg: 0,
    zincoMg: 0,
  };

  let calculados = 0;
  const ignorados: string[] = [];

  for (const item of itens) {
    const temDado = item.ingredient.energiaKcal !== null;
    if (item.gramas === null || !temDado) {
      ignorados.push(item.ingredient.nome);
      continue;
    }

    const fator = item.gramas / 100;
    for (const campo of CAMPOS) {
      const valor = item.ingredient[campo];
      if (valor !== null) total[campo] += valor * fator;
    }
    calculados++;
  }

  if (calculados === 0) return null;

  const porPorcao = {} as ResumoNutricional["porPorcao"];
  for (const campo of CAMPOS) {
    const v = total[campo] / divisor;
    porPorcao[campo] = campo === "energiaKcal" ? Math.round(v) : Number(v.toFixed(1));
  }

  return {
    porPorcao,
    ingredientesCalculados: calculados,
    ingredientesTotal: itens.length,
    ingredientesIgnorados: ignorados,
    completo: ignorados.length === 0,
    fonte: TACO_FONTE,
  };
}
