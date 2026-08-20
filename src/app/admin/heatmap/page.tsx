import Link from "next/link";
import { db } from "@/lib/db";
import { SECOES_HEAT, BOTAO_LABEL } from "@/lib/heat";
import HeatCanvas from "./HeatCanvas";
import StatCard from "@/components/ui/StatCard";
import Card from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import { MousePointerClick, Users, ArrowDownWideNarrow, Flame } from "lucide-react";

const PERIODOS = [
  { dias: 1, label: "24h" },
  { dias: 7, label: "7 dias" },
  { dias: 30, label: "30 dias" },
];

function mediana(nums: number[]): number {
  if (nums.length === 0) return 0;
  const s = [...nums].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

export default async function HeatmapPage({
  searchParams,
}: {
  searchParams: Promise<{ dias?: string; d?: string }>;
}) {
  const sp = await searchParams;
  const dias = [1, 7, 30].includes(Number(sp.dias)) ? Number(sp.dias) : 7;
  const device = sp.d === "desktop" ? "desktop" : "mobile";
  // eslint-disable-next-line react-hooks/purity -- server component: avaliado uma vez por requisição
  const desde = new Date(Date.now() - dias * 86400000);
  const baseWhere = { path: "/", createdAt: { gte: desde } };

  const [clicks, secaoEventos, scrollEventos, sessoesTotais, botoesRaw] = await Promise.all([
    // Cliques com coordenadas (para o heatmap) — do device selecionado.
    db.heatEvent.findMany({
      where: { ...baseWhere, tipo: "click", viewport: device, xRel: { not: null }, yRel: { not: null } },
      select: { xRel: true, yRel: true, secao: true },
      orderBy: { createdAt: "desc" },
      take: 4000,
    }),
    // Eventos de seção (para funil de atenção + tempo por seção) — device selecionado.
    db.heatEvent.findMany({
      where: { ...baseWhere, tipo: "secao", viewport: device },
      select: { sessionId: true, secao: true, dwellMs: true },
      take: 20000,
    }),
    // Rolagem máxima por sessão — device selecionado.
    db.heatEvent.findMany({
      where: { ...baseWhere, tipo: "scroll", viewport: device },
      select: { sessionId: true, scrollPct: true },
      take: 20000,
    }),
    // Sessões distintas do device.
    db.heatEvent.findMany({
      where: { ...baseWhere, viewport: device },
      select: { sessionId: true },
      distinct: ["sessionId"],
      take: 50000,
    }),
    // Cliques por botão (ambos devices — visão de performance de CTA).
    db.heatEvent.groupBy({
      by: ["rotulo"],
      where: { ...baseWhere, tipo: "click", rotulo: { not: null } },
      _count: { _all: true },
    }),
  ]);

  const totalSessoes = sessoesTotais.length;
  const totalCliques = clicks.length;

  // Pontos do heatmap + posição (mediana y) por seção, para rotular o mapa.
  const pontos = clicks.map((c) => ({ x: c.xRel!, y: c.yRel! }));
  const yPorSecao = new Map<string, number[]>();
  for (const c of clicks) {
    if (c.secao) yPorSecao.set(c.secao, [...(yPorSecao.get(c.secao) ?? []), c.yRel!]);
  }
  const marcadores = SECOES_HEAT.filter((s) => yPorSecao.has(s.id)).map((s) => ({
    label: s.label,
    y: mediana(yPorSecao.get(s.id)!),
  }));

  // Funil de atenção + tempo por seção.
  const porSecao = new Map<string, { sessoes: Set<string>; dwell: number }>();
  for (const e of secaoEventos) {
    if (!e.secao) continue;
    const atual = porSecao.get(e.secao) ?? { sessoes: new Set<string>(), dwell: 0 };
    atual.sessoes.add(e.sessionId);
    atual.dwell += e.dwellMs ?? 0;
    porSecao.set(e.secao, atual);
  }
  const funil = SECOES_HEAT.map((s) => {
    const d = porSecao.get(s.id);
    const sessoes = d?.sessoes.size ?? 0;
    const pct = totalSessoes > 0 ? Math.round((sessoes / totalSessoes) * 100) : 0;
    const segPorSessao = sessoes > 0 ? d!.dwell / sessoes / 1000 : 0;
    return { id: s.id, label: s.label, sessoes, pct, segPorSessao };
  });
  const maxSeg = Math.max(1, ...funil.map((f) => f.segPorSessao));

  // Rolagem média (média das profundidades máximas por sessão).
  const maxScrollPorSessao = new Map<string, number>();
  for (const e of scrollEventos) {
    const v = e.scrollPct ?? 0;
    maxScrollPorSessao.set(e.sessionId, Math.max(maxScrollPorSessao.get(e.sessionId) ?? 0, v));
  }
  const rolagens = [...maxScrollPorSessao.values()];
  const rolagemMedia =
    rolagens.length > 0 ? Math.round(rolagens.reduce((a, b) => a + b, 0) / rolagens.length) : 0;

  // Cliques por botão (rótulos amigáveis).
  const botoes = botoesRaw
    .map((b) => ({
      rotulo: b.rotulo as string,
      label: BOTAO_LABEL[b.rotulo as string] ?? (b.rotulo as string),
      total: b._count._all,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 12);
  const maxBotao = Math.max(1, ...botoes.map((b) => b.total));

  const semDados = totalSessoes === 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="flex items-center gap-2 text-xl font-bold text-stone-800">
          <Flame size={20} className="text-orange-500" /> Mapa de calor · Landing
        </h1>
        <div className="flex items-center gap-2">
          {/* Device */}
          <div className="flex gap-1 rounded-xl bg-stone-200/70 p-1 text-sm">
            {(["mobile", "desktop"] as const).map((dev) => (
              <Link
                key={dev}
                href={`/admin/heatmap?dias=${dias}&d=${dev}`}
                className={cn(
                  "rounded-lg px-3 py-1 font-medium capitalize transition",
                  device === dev ? "bg-white text-stone-800 shadow-sm" : "text-stone-500",
                )}
              >
                {dev === "mobile" ? "Celular" : "Desktop"}
              </Link>
            ))}
          </div>
          {/* Período */}
          <div className="flex gap-1 rounded-xl bg-stone-200/70 p-1 text-sm">
            {PERIODOS.map((p) => (
              <Link
                key={p.dias}
                href={`/admin/heatmap?dias=${p.dias}&d=${device}`}
                className={cn(
                  "rounded-lg px-3 py-1 font-medium transition",
                  dias === p.dias ? "bg-white text-stone-800 shadow-sm" : "text-stone-500",
                )}
              >
                {p.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {semDados ? (
        <Card padding="lg">
          <p className="text-sm text-stone-600">
            Ainda não há dados de <strong>{device === "mobile" ? "celular" : "desktop"}</strong> neste
            período. Os eventos são coletados quando visitantes anônimos navegam pela landing
            (pratinho-feliz.vercel.app). Assim que o tráfego chegar, o mapa aparece aqui.
          </p>
          <p className="mt-2 text-xs text-stone-400">
            Dica: abra a landing numa aba anônima, role a página e clique em alguns botões para gerar
            os primeiros pontos.
          </p>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-4">
            <StatCard icon={Users} tone="orange" label="sessões" value={totalSessoes} hint={device === "mobile" ? "celular" : "desktop"} />
            <StatCard icon={MousePointerClick} tone="blue" label="cliques" value={totalCliques} />
            <StatCard icon={ArrowDownWideNarrow} tone="emerald" label="rolagem média" value={`${rolagemMedia}%`} />
          </div>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,380px)_1fr]">
            {/* Heatmap de cliques */}
            <Card padding="md">
              <h2 className="mb-1 text-sm font-semibold text-stone-700">Onde clicam</h2>
              <p className="mb-3 text-xs text-stone-400">
                Cada ponto quente é um clique. Zonas vermelhas concentram mais toques.
              </p>
              <HeatCanvas pontos={pontos} marcadores={marcadores} />
            </Card>

            <div className="space-y-6">
              {/* Funil de atenção */}
              <Card padding="md">
                <h2 className="mb-1 text-sm font-semibold text-stone-700">Funil de atenção (rolagem)</h2>
                <p className="mb-3 text-xs text-stone-400">
                  % das sessões que chegaram a ver cada seção. A queda mostra onde as pessoas param.
                </p>
                <ul className="space-y-2">
                  {funil.map((f) => (
                    <li key={f.id} className="flex items-center gap-3">
                      <span className="w-40 shrink-0 truncate text-xs text-stone-600">{f.label}</span>
                      <div className="h-5 flex-1 overflow-hidden rounded-md bg-stone-100">
                        <div
                          className="flex h-full items-center justify-end rounded-md bg-gradient-to-r from-orange-300 to-orange-500 px-2 text-[10px] font-semibold text-white transition-all"
                          style={{ width: `${Math.max(f.pct, f.pct > 0 ? 8 : 0)}%` }}
                        >
                          {f.pct > 0 ? `${f.pct}%` : ""}
                        </div>
                      </div>
                      <span className="w-8 shrink-0 text-right text-[11px] tabular-nums text-stone-400">
                        {f.sessoes}
                      </span>
                    </li>
                  ))}
                </ul>
              </Card>

              {/* Tempo por seção */}
              <Card padding="md">
                <h2 className="mb-1 text-sm font-semibold text-stone-700">Tempo por seção</h2>
                <p className="mb-3 text-xs text-stone-400">
                  Média de segundos que cada visitante passou olhando a seção.
                </p>
                <ul className="space-y-2">
                  {funil.map((f) => (
                    <li key={f.id} className="flex items-center gap-3">
                      <span className="w-40 shrink-0 truncate text-xs text-stone-600">{f.label}</span>
                      <div className="h-5 flex-1 overflow-hidden rounded-md bg-stone-100">
                        <div
                          className="h-full rounded-md bg-gradient-to-r from-indigo-300 to-indigo-500 transition-all"
                          style={{ width: `${(f.segPorSessao / maxSeg) * 100}%` }}
                        />
                      </div>
                      <span className="w-12 shrink-0 text-right text-[11px] tabular-nums text-stone-500">
                        {f.segPorSessao.toFixed(1)}s
                      </span>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          </div>

          {/* Cliques por botão */}
          <Card padding="md">
            <h2 className="mb-1 text-sm font-semibold text-stone-700">Cliques por botão</h2>
            <p className="mb-3 text-xs text-stone-400">
              Quais chamadas mais recebem toque (celular + desktop somados).
            </p>
            {botoes.length === 0 ? (
              <p className="text-sm text-stone-400">Nenhum clique em botão rastreado ainda.</p>
            ) : (
              <ul className="space-y-2">
                {botoes.map((b) => (
                  <li key={b.rotulo} className="flex items-center gap-3">
                    <span className="w-56 shrink-0 truncate text-xs text-stone-600">{b.label}</span>
                    <div className="h-5 flex-1 overflow-hidden rounded-md bg-stone-100">
                      <div
                        className="h-full rounded-md bg-gradient-to-r from-emerald-300 to-emerald-500 transition-all"
                        style={{ width: `${(b.total / maxBotao) * 100}%` }}
                      />
                    </div>
                    <span className="w-8 shrink-0 text-right text-[11px] tabular-nums text-stone-500">
                      {b.total}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
