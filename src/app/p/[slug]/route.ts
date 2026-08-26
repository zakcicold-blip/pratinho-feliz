import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { COOKIE_INDICACAO, DIAS_INDICACAO } from "@/lib/parceiras";
import { consumir, ipDaRequest } from "@/lib/rateLimit";

/**
 * O link da parceira: /p/<slug>.
 *
 * Conta o clique, grava a indicacao num cookie de primeira parte e manda a
 * pessoa para a home. Curto de proposito — cabe em bio de Instagram e a
 * pessoa consegue ditar por telefone.
 *
 * Rota, e nao pagina: nao ha nada a renderizar, e um redirect imediato evita
 * a piscada de uma tela intermediaria.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const destino = new URL("/", request.url);

  const link = await db.linkParceira.findUnique({
    where: { slug },
    select: { id: true, revogadoEm: true, parceira: { select: { ativa: true, codigo: true } } },
  });

  // Link inexistente, revogado ou de parceira desligada leva para a home sem
  // marcar nada. Nunca mostra erro: quem clicou e um visitante, e o problema
  // e nosso.
  if (!link || link.revogadoEm || !link.parceira.ativa) {
    return NextResponse.redirect(destino);
  }

  // UTMs para o link aparecer tambem no painel de funil, junto das campanhas.
  destino.searchParams.set("utm_source", "parceira");
  destino.searchParams.set("utm_medium", "indicacao");
  destino.searchParams.set("utm_campaign", link.parceira.codigo);
  destino.searchParams.set("utm_content", slug);

  const resposta = NextResponse.redirect(destino);
  resposta.cookies.set({
    name: COOKIE_INDICACAO,
    value: slug,
    maxAge: DIAS_INDICACAO * 24 * 60 * 60,
    // httpOnly aqui: diferente do cookie de atribuicao, nada no navegador
    // precisa ler este valor, e ele decide quem recebe dinheiro.
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
  });

  // Contagem sem bloquear o redirect: a pessoa nao espera o banco para ver a
  // pagina. Se falhar, perde-se um clique, nao a visita.
  //
  // O limite por IP nao protege o servidor, protege o NUMERO: sem ele, dar
  // F5 trinta vezes infla o painel da parceira e a metrica de conversao dela
  // deixa de significar qualquer coisa.
  const podeContar = await consumir("link_parceira", `${slug}:${ipDaRequest(request)}`);
  if (podeContar.ok) {
    db.linkParceira
      .update({
        where: { id: link.id },
        data: { cliques: { increment: 1 }, ultimoCliqueEm: new Date() },
      })
      .catch(() => {});
  }

  return resposta;
}
