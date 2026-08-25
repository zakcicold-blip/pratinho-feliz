import { cookies, headers } from "next/headers";
import { db } from "@/lib/db";

/**
 * Medicao propria do funil.
 *
 * A pergunta que isso responde e "de qual anuncio veio quem paga". Ferramenta
 * externa e pixel respondem parte disso, mas os dois vivem no navegador: quem
 * usa bloqueador some da conta. Aqui o registro e feito no servidor, no nosso
 * dominio, a partir de um cookie de primeira parte gravado na chegada.
 *
 * So marcos entram — visita a landing, ida ao checkout, conta criada, plano
 * gerado, paywall, compra. Nada de page view bruto: o volume nao paga o custo.
 */

export const ETAPAS = [
  "visita",
  "checkout_iniciado",
  "conta_criada",
  "plano_gerado",
  "paywall_visto",
  "compra_aprovada",
] as const;

export type Etapa = (typeof ETAPAS)[number];

export const ETAPA_LABEL: Record<Etapa, string> = {
  visita: "Visitou a página",
  checkout_iniciado: "Foi ao checkout",
  conta_criada: "Criou a conta",
  plano_gerado: "Gerou o cardápio",
  paywall_visto: "Viu o pagamento",
  compra_aprovada: "Comprou",
};

/** Nome do cookie de atribuicao (primeiro toque). */
export const COOKIE_ATRIBUICAO = "pf_atrib";
export const DIAS_ATRIBUICAO = 90;

export type Atribuicao = {
  sid?: string;
  src?: string;
  med?: string;
  cmp?: string;
  cnt?: string;
  trm?: string;
  fbc?: string;
  ref?: string;
  em?: number;
};

export function serializarAtribuicao(a: Atribuicao): string {
  return encodeURIComponent(JSON.stringify(a));
}

export function lerAtribuicao(valor: string | undefined): Atribuicao {
  if (!valor) return {};
  // cookies() ja devolve o valor decodificado. O decodeURIComponent extra
  // existe so para cookies antigos, gravados quando o proxy codificava duas
  // vezes — some sozinho conforme eles expiram.
  for (const tentativa of [valor, safeDecode(valor)]) {
    try {
      const bruto = JSON.parse(tentativa) as unknown;
      if (bruto && typeof bruto === "object") return bruto as Atribuicao;
    } catch {
      // tenta a proxima forma
    }
  }
  return {};
}

function safeDecode(v: string): string {
  try {
    return decodeURIComponent(v);
  } catch {
    return v;
  }
}

function corta(v: string | null | undefined, max = 120): string | null {
  if (!v) return null;
  const t = String(v).trim().slice(0, max);
  return t.length ? t : null;
}

/**
 * Grava um marco do funil.
 *
 * Nunca lanca: medicao quebrada nao pode derrubar cadastro nem pagamento. Em
 * caso de erro, so registra no log do servidor.
 */
export async function registrarEtapa(
  etapa: Etapa,
  extras: { valor?: number; userId?: string; email?: string; path?: string } = {},
): Promise<void> {
  try {
    const jar = await cookies();
    const atrib = lerAtribuicao(jar.get(COOKIE_ATRIBUICAO)?.value);
    const h = await headers();

    await db.eventoFunil.create({
      data: {
        etapa,
        sessionId: corta(atrib.sid, 40),
        path: corta(extras.path ?? h.get("x-pathname") ?? null),
        valor: extras.valor ?? null,
        userId: extras.userId ?? null,
        email: extras.email ? extras.email.toLowerCase().trim().slice(0, 160) : null,
        utmSource: corta(atrib.src),
        utmMedium: corta(atrib.med),
        utmCampaign: corta(atrib.cmp),
        utmContent: corta(atrib.cnt),
        utmTerm: corta(atrib.trm),
        fbclid: corta(atrib.fbc, 255),
        referrer: corta(atrib.ref, 255),
      },
    });
  } catch (err) {
    console.error("Falha ao registrar etapa do funil:", etapa, err);
  }
}

/**
 * Grava um marco vindo de fora do navegador — hoje, o webhook da Cakto.
 *
 * Nao ha cookie aqui, entao a atribuicao e emprestada do evento mais recente
 * com o mesmo e-mail. Quem comprou sem nunca ter deixado e-mail no site fica
 * sem campanha, e o painel mostra isso como "sem atribuição" em vez de chutar.
 */
export async function registrarEtapaSemCookie(
  etapa: Etapa,
  dados: { email: string; valor?: number; userId?: string },
): Promise<void> {
  try {
    const email = dados.email.toLowerCase().trim();
    const anterior = await db.eventoFunil.findFirst({
      where: { email, utmSource: { not: null } },
      orderBy: { createdAt: "desc" },
      select: {
        sessionId: true,
        utmSource: true,
        utmMedium: true,
        utmCampaign: true,
        utmContent: true,
        utmTerm: true,
        fbclid: true,
        referrer: true,
      },
    });

    await db.eventoFunil.create({
      data: {
        etapa,
        email: email.slice(0, 160),
        valor: dados.valor ?? null,
        userId: dados.userId ?? null,
        ...(anterior ?? {}),
      },
    });
  } catch (err) {
    console.error("Falha ao registrar etapa sem cookie:", etapa, err);
  }
}
