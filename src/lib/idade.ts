import { FAIXAS_ETARIAS } from "@/lib/constants";

/**
 * Converte a faixa etária escolhida no perfil em meses.
 *
 * Usamos o LIMITE INFERIOR da faixa de propósito: é a idade da criança mais
 * nova que pode estar naquele grupo. Assim uma receita liberada só a partir de
 * 12 meses não entra no plano de alguém em "6 meses a 1 ano".
 */
const MESES_POR_FAIXA: Record<string, number> = {
  "6 meses a 1 ano": 6,
  "1 a 2 anos": 12,
  "2 a 3 anos": 24,
  "3 a 5 anos": 36,
  "6 a 8 anos": 72,
  "9 a 12 anos": 108,
};

export function faixaEtariaEmMeses(faixa: string): number {
  const direto = MESES_POR_FAIXA[faixa];
  if (direto !== undefined) return direto;

  // Perfil antigo ou texto fora do padrão: tenta ler o primeiro número.
  const anos = faixa.match(/(\d+)\s*ano/i);
  if (anos) return Number(anos[1]) * 12;
  const meses = faixa.match(/(\d+)\s*m[êe]s/i);
  if (meses) return Number(meses[1]);

  // Sem conseguir interpretar, assume a faixa mais nova — é o lado seguro,
  // porque restringe mais receitas em vez de liberar indevidamente.
  return 6;
}

/** Rótulo curto da faixa, para textos da interface. */
export function rotuloFaixa(faixa: string): string {
  return FAIXAS_ETARIAS.includes(faixa) ? faixa : `${faixaEtariaEmMeses(faixa)} meses`;
}
