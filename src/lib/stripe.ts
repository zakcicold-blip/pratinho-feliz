import Stripe from "stripe";

/**
 * Cliente do Stripe (lado servidor).
 *
 * Inicializado sob demanda para o build/typecheck não quebrarem quando a chave
 * ainda não está no ambiente — o erro só aparece quando alguém realmente tenta
 * cobrar, com uma mensagem clara do que falta configurar.
 */
let cliente: Stripe | null = null;

export function getStripe(): Stripe {
  if (cliente) return cliente;

  const chave = process.env.STRIPE_SECRET_KEY;
  if (!chave) {
    throw new Error(
      "STRIPE_SECRET_KEY não configurada. Defina a chave secreta do Stripe no ambiente."
    );
  }

  cliente = new Stripe(chave, { apiVersion: "2025-02-24.acacia" });
  return cliente;
}

/** Dias de teste grátis antes da primeira cobrança. */
export const DIAS_TESTE_GRATIS = 7;
