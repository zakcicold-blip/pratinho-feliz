import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Atribuicao de origem, gravada num cookie de primeira parte.
 *
 * Roda antes da pagina para pegar as UTMs enquanto elas ainda estao na URL —
 * depois do primeiro clique interno elas somem. O cookie viaja com a pessoa
 * ate a compra, e e dele que o painel de funil tira "de qual anuncio veio".
 *
 * Primeira parte importa: bloqueador de anuncio derruba script de terceiro,
 * nao cookie do proprio dominio.
 *
 * (Em Next 16 este arquivo se chama proxy.ts — o antigo middleware.ts foi
 * renomeado; a funcionalidade e a mesma.)
 */

const COOKIE = "pf_atrib";
const DIAS = 90;

/** Campos guardados curtos de proposito: cookie e enviado em toda requisicao. */
type Atribuicao = {
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

function corta(v: string | null, max = 120): string | undefined {
  if (!v) return undefined;
  const t = v.trim().slice(0, max);
  return t.length ? t : undefined;
}

export function proxy(request: NextRequest) {
  const resposta = NextResponse.next();
  const params = request.nextUrl.searchParams;

  const chegouComCampanha =
    params.has("utm_source") ||
    params.has("utm_campaign") ||
    params.has("fbclid") ||
    params.has("gclid");

  let atual: Atribuicao = {};
  const bruto = request.cookies.get(COOKIE)?.value;
  if (bruto) {
    try {
      atual = JSON.parse(decodeURIComponent(bruto)) as Atribuicao;
    } catch {
      atual = {};
    }
  }

  // Sem campanha nova e com cookie ja formado, nao ha o que atualizar.
  if (!chegouComCampanha && atual.sid) return resposta;

  const referrer = request.headers.get("referer");
  const novo: Atribuicao = chegouComCampanha
    ? {
        // Ultimo toque pago vence: e o clique que trouxe a pessoa desta vez.
        sid: atual.sid ?? crypto.randomUUID(),
        src: corta(params.get("utm_source")),
        med: corta(params.get("utm_medium")),
        cmp: corta(params.get("utm_campaign")),
        cnt: corta(params.get("utm_content")),
        trm: corta(params.get("utm_term")),
        fbc: corta(params.get("fbclid") ?? params.get("gclid"), 255),
        ref: corta(referrer, 255),
        em: Date.now(),
      }
    : { ...atual, sid: crypto.randomUUID(), ref: corta(referrer, 255), em: Date.now() };

  resposta.cookies.set({
    // Sem encodeURIComponent aqui: a propria API do cookie ja codifica o valor.
    // Codificar duas vezes gerava %257B e o JSON.parse do outro lado falhava,
    // fazendo a atribuicao inteira se perder em silencio.
    name: COOKIE,
    value: JSON.stringify(novo),
    maxAge: DIAS * 24 * 60 * 60,
    httpOnly: false, // o mapa de calor le o mesmo sid no navegador
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
  });

  return resposta;
}

export const config = {
  // Fora: estaticos, imagens otimizadas e as rotas de API (que nao sao paginas
  // e nao iniciam sessao).
  matcher: ["/((?!api|_next/static|_next/image|icons|screens|fotos|favicon.ico|sw.js).*)"],
};
