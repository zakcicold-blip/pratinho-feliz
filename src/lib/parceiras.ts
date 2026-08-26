import { db } from "@/lib/db";

/**
 * Programa de parceiras.
 *
 * Uma parceira divulga o app, ganha um percentual do que as pessoas que ela
 * trouxe pagam, e acompanha isso num painel proprio. O painel e so leitura:
 * ela cria links e olha numeros, nunca mexe em conta, receita, preco ou
 * assinatura de ninguem.
 *
 * A regra que estrutura tudo: comissao sai de PAGAMENTO CONFIRMADO, nunca de
 * cadastro. Contar cadastro como ganho e o caminho mais curto para um painel
 * que promete um numero e paga outro — e para uma parceira que se sente
 * enganada no fim do mes.
 */

/** Cookie de indicacao. Primeira parte, como o de atribuicao. */
export const COOKIE_INDICACAO = "pf_par";
export const DIAS_INDICACAO = 90;

/** Eventos da Cakto que representam dinheiro efetivamente entrando. */
const EVENTOS_PAGOS = new Set([
  "purchase_approved",
  "subscription_created",
  "subscription_renewed",
  "subscription_resumed",
]);

/**
 * Eventos que DEVOLVEM dinheiro ja pago, e por isso descontam comissao.
 *
 * Cancelamento e recusa de renovacao nao entram: neles ninguem estorna nada,
 * so param as cobrancas futuras. Descontar comissao ja ganha porque a pessoa
 * cancelou meses depois seria cobrar de volta da parceira um trabalho que ela
 * fez.
 */
const EVENTOS_ESTORNADOS = new Set(["refund", "chargeback"]);

/* --------------------------------------------------------------- privacidade */

/**
 * O que a parceira pode ver de quem ela indicou.
 *
 * Ela precisa saber QUANTAS pessoas vieram e quantas pagaram. Ela nao precisa
 * saber QUEM sao — nome completo e e-mail de terceiro nao sao dela, e entregar
 * essa lista seria compartilhar dado pessoal sem base legal nenhuma (LGPD,
 * Art. 7). Primeiro nome e e-mail mascarado bastam para ela reconhecer alguem
 * que perguntou "chegou meu cadastro?" sem virar uma lista de contatos.
 */
export function primeiroNome(nome: string): string {
  const partes = nome.trim().split(/\s+/);
  return partes[0] ?? "—";
}

export function mascararEmail(email: string): string {
  const [usuario, dominio] = email.split("@");
  if (!dominio) return "—";
  const visivel = usuario.slice(0, 2);
  return `${visivel}${"•".repeat(Math.max(3, usuario.length - 2))}@${dominio}`;
}

/* -------------------------------------------------------------------- codigo */

/** Normaliza um codigo/slug: minusculo, sem acento, so letras, numeros e hifen. */
export function normalizarCodigo(bruto: string): string {
  return bruto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
}

/**
 * Codigos que nao podem virar link de parceira porque colidiriam com rota do
 * app ou se passariam por pagina oficial.
 */
const RESERVADOS = new Set([
  "admin",
  "api",
  "app",
  "cadastro",
  "checkout",
  "conta",
  "login",
  "parceira",
  "parceiras",
  "pagamento",
  "privacidade",
  "suporte",
  "termos",
  "p",
]);

export function codigoValido(codigo: string): { ok: true } | { ok: false; erro: string } {
  if (codigo.length < 3) return { ok: false, erro: "O código precisa ter ao menos 3 caracteres." };
  if (RESERVADOS.has(codigo)) return { ok: false, erro: "Esse código é reservado do sistema." };
  return { ok: true };
}

/* ------------------------------------------------------------------ comissao */

export type ResumoParceira = {
  cliques: number;
  indicacoes: number;
  /** Indicados com assinatura valendo agora. */
  ativos: number;
  cancelados: number;
  /** Indicados que ainda nao pagaram nada. */
  emTeste: number;
  /** Comissao do periodo consultado, em reais. */
  comissaoPeriodo: number;
  /** Comissao desde sempre, em reais. */
  comissaoTotal: number;
  /** Faturamento bruto gerado no periodo, em reais. */
  brutoPeriodo: number;
  /** Quantos pagamentos entraram no periodo. */
  pagamentosPeriodo: number;
};

/**
 * Fecha os numeros de uma parceira num periodo.
 *
 * A comissao e recalculada a partir de CompraCakto toda vez, em vez de somada
 * num saldo gravado. Saldo gravado e onde estorno vira divergencia silenciosa:
 * o dinheiro volta para o cliente e o painel continua mostrando que ha o que
 * pagar. Recalcular custa uma consulta e nunca mente.
 */
export async function resumirParceira(
  parceiraId: string,
  periodo: { de: Date; ate: Date },
): Promise<ResumoParceira> {
  const [indicacoes, links] = await Promise.all([
    db.indicacao.findMany({
      where: { parceiraId },
      select: {
        userId: true,
        comissaoPct: true,
        user: { select: { subscription: { select: { status: true, acessoCortesia: true } } } },
      },
    }),
    db.linkParceira.findMany({ where: { parceiraId }, select: { cliques: true } }),
  ]);

  const pctPorUser = new Map(indicacoes.map((i) => [i.userId, i.comissaoPct]));
  const userIds = [...pctPorUser.keys()];

  const compras = userIds.length
    ? await db.compraCakto.findMany({
        where: { userId: { in: userIds } },
        select: { userId: true, evento: true, valor: true, createdAt: true },
      })
    : [];

  let comissaoTotal = 0;
  let comissaoPeriodo = 0;
  let brutoPeriodo = 0;
  let pagamentosPeriodo = 0;

  for (const compra of compras) {
    if (!compra.userId) continue;
    const pct = pctPorUser.get(compra.userId);
    if (pct === undefined) continue;

    const noPeriodo = compra.createdAt >= periodo.de && compra.createdAt <= periodo.ate;
    const valor = compra.valor ?? 0;

    if (EVENTOS_PAGOS.has(compra.evento)) {
      const comissao = (valor * pct) / 100;
      comissaoTotal += comissao;
      if (noPeriodo) {
        comissaoPeriodo += comissao;
        brutoPeriodo += valor;
        pagamentosPeriodo += 1;
      }
      continue;
    }

    // Estorno e chargeback devolvem o dinheiro: a comissao correspondente sai
    // da conta. Cancelamento simples nao estorna nada — so para de renovar —
    // entao nao desconta o que ja foi pago.
    if (EVENTOS_ESTORNADOS.has(compra.evento)) {
      const comissao = (valor * pct) / 100;
      comissaoTotal -= comissao;
      if (noPeriodo) {
        comissaoPeriodo -= comissao;
        brutoPeriodo -= valor;
      }
    }
  }

  const ativos = indicacoes.filter(
    (i) => i.user.subscription?.status === "ATIVA" || i.user.subscription?.acessoCortesia,
  ).length;
  const cancelados = indicacoes.filter((i) => i.user.subscription?.status === "CANCELADA").length;

  return {
    cliques: links.reduce((soma, l) => soma + l.cliques, 0),
    indicacoes: indicacoes.length,
    ativos,
    cancelados,
    emTeste: indicacoes.length - ativos - cancelados,
    comissaoPeriodo: arredondar(comissaoPeriodo),
    comissaoTotal: arredondar(comissaoTotal),
    brutoPeriodo: arredondar(brutoPeriodo),
    pagamentosPeriodo,
  };
}

function arredondar(v: number): number {
  return Math.round(v * 100) / 100;
}

export function reais(v: number): string {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/** Primeiro e ultimo instante de um mes, no fuso do app. */
export function mesDe(referencia: Date): { de: Date; ate: Date; rotulo: string } {
  const de = new Date(Date.UTC(referencia.getUTCFullYear(), referencia.getUTCMonth(), 1));
  const ate = new Date(
    Date.UTC(referencia.getUTCFullYear(), referencia.getUTCMonth() + 1, 0, 23, 59, 59, 999),
  );
  return {
    de,
    ate,
    rotulo: de.toLocaleDateString("pt-BR", { month: "long", year: "numeric", timeZone: "UTC" }),
  };
}

/* ----------------------------------------------------------------- indicacao */

/**
 * Registra que uma conta nova veio de uma parceira.
 *
 * Silencioso de proposito: se o codigo nao existe, esta revogado ou a pessoa
 * ja pertence a outra parceira, a funcao nao faz nada e nao levanta erro. Ela
 * roda dentro do cadastro, e nenhum problema de atribuicao pode impedir
 * alguem de criar conta.
 */
export async function registrarIndicacao(userId: string, slugDoLink: string | undefined) {
  if (!slugDoLink) return;

  try {
    const link = await db.linkParceira.findUnique({
      where: { slug: slugDoLink },
      select: {
        id: true,
        revogadoEm: true,
        parceira: { select: { id: true, ativa: true, comissaoPct: true } },
      },
    });
    if (!link || link.revogadoEm || !link.parceira.ativa) return;

    await db.indicacao.create({
      data: {
        parceiraId: link.parceira.id,
        linkId: link.id,
        userId,
        comissaoPct: link.parceira.comissaoPct,
      },
    });
  } catch {
    // Conflito na unica de userId significa que a pessoa ja tinha dono. A
    // primeira indicacao vence e nao ha nada a corrigir.
  }
}
