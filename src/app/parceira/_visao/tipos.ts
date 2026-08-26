/**
 * O painel da parceira, em pedacos reaproveitaveis.
 *
 * Existem dois lugares que mostram estas telas: a propria parceira em
 * /parceira e o admin, em previa, para dar suporte ("ela disse que nao
 * aparece nada"). Se cada lado tivesse a sua copia do JSX, a previa
 * comecaria a divergir do que ela realmente ve — e a previa so serve para
 * conferir exatamente isso.
 *
 * `somenteLeitura` desliga o que escreve. O admin ve, nao mexe: alterar o
 * link de alguem sem que ela saiba e o tipo de coisa que quebra a confianca
 * de uma parceria.
 */
export type VisaoParceira = {
  id: string;
  nome: string;
  codigo: string;
  comissaoPct: number;
  ativa: boolean;
};

export type PropsVisao = {
  parceira: VisaoParceira;
  base: string;
  somenteLeitura?: boolean;
};
