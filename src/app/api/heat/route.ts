import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { HEAT_TIPOS } from "@/lib/heat";
import { consumir, ipDaRequest } from "@/lib/rateLimit";

export const runtime = "nodejs";

const MAX_EVENTOS = 60;
const TIPOS = new Set<string>(HEAT_TIPOS);

function clamp01(n: unknown): number | null {
  if (typeof n !== "number" || !Number.isFinite(n)) return null;
  return Math.min(1, Math.max(0, n));
}
function inteiro(n: unknown, min: number, max: number): number | null {
  if (typeof n !== "number" || !Number.isFinite(n)) return null;
  return Math.min(max, Math.max(min, Math.round(n)));
}
function texto(v: unknown, max: number): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim().slice(0, max);
  return t.length ? t : null;
}

// Recebe lotes anônimos do mapa de calor. Sempre responde 204 (nunca deixa um
// erro de tracking impactar o visitante). sendBeacon manda o corpo como texto.
export async function POST(req: Request) {
  try {
    // Rota de escrita sem login: sem limite, qualquer um enche a tabela de
    // eventos. 204 mesmo ao recusar — quem estiver abusando nao ganha um
    // sinal de que foi barrado, e o visitante legitimo nunca ve erro.
    const limite = await consumir("heat_ip", ipDaRequest(req));
    if (!limite.ok) return new NextResponse(null, { status: 204 });

    const raw = await req.text();
    if (!raw || raw.length > 100_000) return new NextResponse(null, { status: 204 });

    const body = JSON.parse(raw);
    const sessionId = texto(body?.sessionId, 40);
    const viewport = body?.viewport === "desktop" ? "desktop" : "mobile";
    const path = texto(body?.path, 120) ?? "/";
    const eventos = Array.isArray(body?.events) ? body.events.slice(0, MAX_EVENTOS) : [];

    if (!sessionId || eventos.length === 0) return new NextResponse(null, { status: 204 });

    const linhas = eventos
      .filter((e: unknown): e is Record<string, unknown> => !!e && typeof e === "object")
      .filter((e: Record<string, unknown>) => TIPOS.has(e.tipo as string))
      .map((e: Record<string, unknown>) => ({
        sessionId,
        viewport,
        path,
        tipo: e.tipo as string,
        secao: texto(e.secao, 40),
        rotulo: texto(e.rotulo, 60),
        xRel: clamp01(e.xRel),
        yRel: clamp01(e.yRel),
        scrollPct: inteiro(e.scrollPct, 0, 100),
        dwellMs: inteiro(e.dwellMs, 0, 3_600_000),
      }));

    if (linhas.length > 0) {
      await db.heatEvent.createMany({ data: linhas });
    }
  } catch {
    // corpo inválido ou falha de escrita — ignora silenciosamente
  }
  return new NextResponse(null, { status: 204 });
}
