import { CHECKOUT_CAKTO, type PlanoCheckout } from "@/lib/checkoutLinks";
import type { AssinaturaParaAcesso } from "@/lib/assinatura";

/**
 * O que a conta gratuita pode fazer.
 *
 * O app deixou de ser fechado atras de pagamento: qualquer pessoa cria conta e
 * usa. O que se paga e a continuidade e o trabalho repetido — nao a primeira
 * impressao. Por isso o cardapio de hoje e livre: e ele que prova o valor. O
 * mes inteiro, a lista de compras, a rotina e o modo cozinha sao o produto.
 *
 * Um lugar so decide isso. Espalhar `if (assinatura...)` pelas telas era como
 * um bloqueio novo acabaria esquecido em alguma rota.
 */

export const RECURSOS = [
  "plano_completo",
  "rotina",
  "modo_cozinha",
  "lista_compras",
  "trocar_refeicao",
  "varios_filhos",
  "relatorio",
  "assistente",
  "catalogo",
  "gerar_ciclo",
] as const;

export type Recurso = (typeof RECURSOS)[number];

/** Limites do plano gratuito. */
export const TROCAS_GRATIS = 3;
export const FILHOS_GRATIS = 1;

/**
 * Se a conta e paga. Reaproveita a regra do paywall antigo: assinatura ATIVA,
 * cortesia liberada pelo admin, ou teste com assinatura real no Stripe (contas
 * que comecaram antes do freemium).
 */
export function contaPaga(sub: AssinaturaParaAcesso | null | undefined): boolean {
  if (!sub) return false;
  if (sub.acessoCortesia) return true;
  if (sub.status === "ATIVA") return true;
  if (sub.status === "TESTE") return Boolean(sub.stripeSubscriptionId);
  return false;
}

export function podeUsar(recurso: Recurso, sub: AssinaturaParaAcesso | null | undefined): boolean {
  if (contaPaga(sub)) return true;
  // Nada da lista e liberado no gratuito hoje. A funcao existe para o dia em
  // que algum recurso mudar de lado — o que acontece mudando so esta linha.
  void recurso;
  return false;
}

/** Texto curto que explica o bloqueio, por recurso. */
export const MOTIVO_BLOQUEIO: Record<Recurso, { titulo: string; texto: string }> = {
  plano_completo: {
    titulo: "Os 30 dias fazem parte do plano",
    texto: "No gratuito você acompanha o cardápio de hoje. Assinando, os 30 dias abrem de uma vez.",
  },
  rotina: {
    titulo: "Rotina é do plano completo",
    texto:
      "Registrando sono e disposição, o cardápio se ajusta aos dias difíceis em vez de sugerir prato elaborado.",
  },
  modo_cozinha: {
    titulo: "Modo cozinha é do plano completo",
    texto: "Passo a passo em tela cheia, para seguir a receita com as mãos ocupadas.",
  },
  lista_compras: {
    titulo: "A lista de compras é do plano completo",
    texto:
      "Ela soma tudo que a semana pede, ingrediente por ingrediente, e marca o que já tem na despensa.",
  },
  trocar_refeicao: {
    titulo: "Suas trocas gratuitas acabaram",
    texto: "No plano completo você troca qualquer refeição quantas vezes quiser.",
  },
  varios_filhos: {
    titulo: "Mais de um filho é do plano completo",
    texto: "Cada criança com seu perfil, sua rotina e seu cardápio.",
  },
  relatorio: {
    titulo: "O relatório é do plano completo",
    texto: "Acompanhe aceitação, variedade e nutrientes ao longo das semanas.",
  },
  assistente: {
    titulo: "O assistente é do plano completo",
    texto: "Tire dúvidas sobre a alimentação do seu filho com base no que já está no plano dele.",
  },
  catalogo: {
    titulo: "O catálogo completo é do plano",
    texto: "Todas as receitas e papinhas, com busca por ingrediente, idade e tempo de preparo.",
  },
  gerar_ciclo: {
    titulo: "Gerar um novo mês é do plano completo",
    texto: "Ao fim do ciclo, um mês novo é montado com o que a criança aceitou.",
  },
};

/**
 * Link de upgrade com os dados da conta ja preenchidos no checkout.
 *
 * Isso nao e enfeite: o webhook casa a compra com a conta pelo e-mail. Se a
 * pessoa digitar outro e-mail no checkout, o pagamento entra e o acesso nao
 * libera. Preencher o campo e o que evita esse descasamento.
 */
export function linkDeUpgrade(
  plano: PlanoCheckout,
  dados: { email?: string | null; nome?: string | null; telefone?: string | null },
): string {
  const url = new URL(CHECKOUT_CAKTO[plano]);
  if (dados.nome) url.searchParams.set("name", dados.nome);
  if (dados.email) {
    url.searchParams.set("email", dados.email);
    url.searchParams.set("confirmEmail", dados.email);
  }
  if (dados.telefone) {
    const digitos = dados.telefone.replace(/\D/g, "");
    if (digitos.length >= 10) {
      url.searchParams.set("phone", digitos.startsWith("55") ? digitos : `55${digitos}`);
    }
  }
  return url.toString();
}
