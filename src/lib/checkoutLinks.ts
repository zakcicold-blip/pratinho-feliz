/**
 * Links de checkout da Cakto.
 *
 * Sao paginas hospedadas por eles: a pessoa sai do nosso site, paga la e a
 * assinatura passa a existir do lado da Cakto. Diferente do Checkout do Stripe,
 * nao volta `session_id` nenhum para /bem-vindo — enquanto o webhook da Cakto
 * nao estiver ligado, o acesso NAO e liberado sozinho depois do pagamento.
 *
 * Sao assinaturas com cobranca imediata, sem teste gratis. O teste de 7 dias
 * continua saindo pelo fluxo de cadastro (/assinar), que ainda usa o Stripe.
 */
export type PlanoCheckout = "MENSAL" | "TRIMESTRAL";

export const CHECKOUT_CAKTO: Record<PlanoCheckout, string> = {
  MENSAL: "https://pay.cakto.com.br/h8c9jbm_1061491",
  TRIMESTRAL: "https://pay.cakto.com.br/suy962v",
};

/** Valor cobrado em cada plano, usado nos eventos do Meta. */
export const VALOR_PLANO: Record<PlanoCheckout, number> = {
  MENSAL: 29.9,
  TRIMESTRAL: 59.9,
};
