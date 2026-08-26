/**
 * Quem responde legalmente pelo Pratinho Feliz.
 *
 * Termos de uso e politica de privacidade PRECISAM identificar o controlador:
 * a LGPD (Art. 9, I e Art. 41) exige saber quem trata os dados e quem e o
 * encarregado, e o CDC exige que o fornecedor seja identificavel. As lojas de
 * aplicativo tambem recusam publicacao sem isso.
 *
 * Fica num arquivo so porque os mesmos dados aparecem em quatro lugares e a
 * primeira divergencia entre eles e um problema juridico, nao um typo.
 *
 * ATENCAO: os campos marcados como PENDENTE precisam do dado real antes de
 * publicar na Play Store ou na App Store. Enquanto estiverem assim, as
 * paginas mostram um aviso em vez de fingir que estao completas.
 */

export const PENDENTE = "PENDENTE";

export const IDENTIFICACAO = {
  /** Nome fantasia do produto. */
  produto: "Pratinho Feliz",
  /** Razao social de quem opera. Pessoa fisica: nome civil completo. */
  razaoSocial: PENDENTE,
  /** CNPJ (ou CPF, se a operacao ainda for como pessoa fisica). */
  documento: PENDENTE,
  /** Endereco completo, exigido no contrato de consumo. */
  endereco: PENDENTE,
  /** Canal oficial de atendimento e de exercicio dos direitos da LGPD. */
  email: "contato@pratinhofeliz.online",
  /**
   * Encarregado pelo tratamento de dados (LGPD, Art. 41). Pode ser a propria
   * pessoa que opera o negocio; o que a lei exige e que exista e que o canal
   * seja publico.
   */
  encarregado: PENDENTE,
  emailEncarregado: "privacidade@pratinhofeliz.online",
  site: "https://www.pratinhofeliz.online",
} as const;

/** Campos ainda sem o dado real. Vazio significa pronto para publicar. */
export function pendencias(): string[] {
  return Object.entries(IDENTIFICACAO)
    .filter(([, valor]) => valor === PENDENTE)
    .map(([campo]) => campo);
}

/** Data da ultima revisao dos documentos legais. Aparece no rodape deles. */
export const VIGENCIA = "26 de agosto de 2026";
