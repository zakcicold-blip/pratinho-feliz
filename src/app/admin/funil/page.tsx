import Link from "next/link";
import { db } from "@/lib/db";
import { ETAPAS, ETAPA_LABEL, type Etapa } from "@/lib/funil";
import { cn } from "@/lib/cn";
import { TrendingUp, Info } from "lucide-react";

/**
 * Funil medido pelo proprio site.
 *
 * Os numeros aqui sao de primeira parte: nao dependem do pixel nem de
 * ferramenta externa, entao bloqueador de anuncio nao derruba. Por isso mesmo
 * eles NAO vao bater com o Gerenciador do Meta, que usa janela de atribuicao
 * propria — as duas contas medem coisas diferentes e as duas estao certas.
 */

const PERIODOS = [
  { dias: 1, label: "Hoje" },
  { dias: 7, label: "7 dias" },
  { dias: 30, label: "30 dias" },
  { dias: 90, label: "90 dias" },
];

function inicioDoPeriodo(dias: number): Date {
  const d = new Date();
  if (dias === 1) {
    d.setHours(0, 0, 0, 0);
    return d;
  }
  d.setDate(d.getDate() - dias);
  return d;
}

function pct(parte: number, todo: number): string {
  if (!todo) return "—";
  return `${((parte / todo) * 100).toFixed(1).replace(".", ",")}%`;
}

function reais(v: number): string {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function AdminFunilPage({
  searchParams,
}: {
  searchParams: Promise<{ dias?: string }>;
}) {
  const { dias: diasParam } = await searchParams;
  const dias = PERIODOS.some((p) => String(p.dias) === diasParam) ? Number(diasParam) : 7;
  const desde = inicioDoPeriodo(dias);

  const [porEtapa, porCampanha, receita, ultimas] = await Promise.all([
    db.eventoFunil.groupBy({
      by: ["etapa"],
      where: { createdAt: { gte: desde } },
      _count: { _all: true },
    }),
    db.eventoFunil.groupBy({
      by: ["utmSource", "utmCampaign", "etapa"],
      where: { createdAt: { gte: desde } },
      _count: { _all: true },
      _sum: { valor: true },
    }),
    db.eventoFunil.aggregate({
      where: { createdAt: { gte: desde }, etapa: "compra_aprovada" },
      _sum: { valor: true },
      _count: { _all: true },
    }),
    db.eventoFunil.findMany({
      where: { createdAt: { gte: desde } },
      orderBy: { createdAt: "desc" },
      take: 25,
    }),
  ]);

  const contagem = new Map<string, number>(porEtapa.map((e) => [e.etapa, e._count._all]));
  const topo = contagem.get("visita") ?? 0;

  // Agrupa campanha -> etapa, para a tabela por origem.
  type LinhaCampanha = { origem: string; campanha: string; etapas: Map<string, number>; receita: number };
  const campanhas = new Map<string, LinhaCampanha>();
  for (const linha of porCampanha) {
    const origem = linha.utmSource ?? "(sem atribuição)";
    const campanha = linha.utmCampaign ?? "—";
    const chave = `${origem}|${campanha}`;
    const atual = campanhas.get(chave) ?? { origem, campanha, etapas: new Map(), receita: 0 };
    atual.etapas.set(linha.etapa, (atual.etapas.get(linha.etapa) ?? 0) + linha._count._all);
    if (linha.etapa === "compra_aprovada") atual.receita += linha._sum.valor ?? 0;
    campanhas.set(chave, atual);
  }
  const linhasCampanha = [...campanhas.values()].sort(
    (a, b) => (b.etapas.get("visita") ?? 0) - (a.etapas.get("visita") ?? 0),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-stone-800">Funil</h1>
          <p className="mt-1 text-sm text-stone-500">
            Medição própria, no nosso domínio — não depende do pixel nem de ferramenta externa.
          </p>
        </div>
        <div className="flex gap-1 rounded-full bg-white p-1 text-sm shadow-card">
          {PERIODOS.map((p) => (
            <Link
              key={p.dias}
              href={`/admin/funil?dias=${p.dias}`}
              className={cn(
                "rounded-full px-3 py-1.5 font-medium transition",
                p.dias === dias ? "bg-orange-50 text-orange-600" : "text-stone-500 hover:bg-stone-100",
              )}
            >
              {p.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Cartao titulo="Compras" valor={String(receita._count._all)} />
        <Cartao titulo="Receita" valor={reais(receita._sum.valor ?? 0)} />
        <Cartao
          titulo="Visita → compra"
          valor={pct(contagem.get("compra_aprovada") ?? 0, topo)}
        />
      </div>

      {/* FUNIL */}
      <div className="rounded-2xl border border-stone-200/70 bg-white p-5 shadow-card">
        <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-stone-800">
          <TrendingUp size={16} className="text-orange-500" /> Etapas
        </div>
        <div className="space-y-2.5">
          {ETAPAS.map((etapa, i) => {
            const n = contagem.get(etapa) ?? 0;
            const anterior = i === 0 ? n : (contagem.get(ETAPAS[i - 1]) ?? 0);
            const largura = topo ? Math.max(2, (n / topo) * 100) : 2;
            return (
              <div key={etapa}>
                <div className="flex items-baseline justify-between text-sm">
                  <span className="font-medium text-stone-700">{ETAPA_LABEL[etapa as Etapa]}</span>
                  <span className="text-stone-500">
                    <strong className="text-stone-800">{n}</strong>
                    {i > 0 && <span className="ml-2 text-xs">({pct(n, anterior)} da anterior)</span>}
                  </span>
                </div>
                <div className="mt-1 h-2.5 w-full overflow-hidden rounded-full bg-stone-100">
                  <div
                    className="h-full rounded-full bg-orange-400"
                    style={{ width: `${largura}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
        {topo === 0 && (
          <p className="mt-4 flex items-start gap-2 rounded-xl bg-stone-50 px-3 py-2 text-[13px] text-stone-500">
            <Info size={15} className="mt-0.5 shrink-0" />
            Nenhum evento no período. A medição começa a valer a partir do deploy — dados anteriores
            não existem.
          </p>
        )}
      </div>

      {/* POR ORIGEM */}
      <div className="overflow-hidden rounded-2xl border border-stone-200/70 bg-white shadow-card">
        <div className="border-b border-stone-100 px-5 py-4 text-sm font-semibold text-stone-800">
          Por origem
        </div>
        <table className="w-full text-sm">
          <thead className="bg-stone-50 text-left text-xs uppercase tracking-wide text-stone-400">
            <tr>
              <th className="px-4 py-3">Origem / campanha</th>
              <th className="px-4 py-3">Visitas</th>
              <th className="px-4 py-3">Checkout</th>
              <th className="px-4 py-3">Contas</th>
              <th className="px-4 py-3">Compras</th>
              <th className="px-4 py-3">Receita</th>
            </tr>
          </thead>
          <tbody>
            {linhasCampanha.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-stone-400">
                  Sem dados no período.
                </td>
              </tr>
            )}
            {linhasCampanha.map((l) => (
              <tr key={`${l.origem}|${l.campanha}`} className="border-t border-stone-100">
                <td className="px-4 py-3">
                  <div className="font-medium text-stone-800">{l.origem}</div>
                  <div className="text-xs text-stone-400">{l.campanha}</div>
                </td>
                <td className="px-4 py-3 text-stone-600">{l.etapas.get("visita") ?? 0}</td>
                <td className="px-4 py-3 text-stone-600">{l.etapas.get("checkout_iniciado") ?? 0}</td>
                <td className="px-4 py-3 text-stone-600">{l.etapas.get("conta_criada") ?? 0}</td>
                <td className="px-4 py-3 font-semibold text-stone-800">
                  {l.etapas.get("compra_aprovada") ?? 0}
                </td>
                <td className="px-4 py-3 text-emerald-600">{l.receita ? reais(l.receita) : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ÚLTIMOS EVENTOS */}
      <div className="overflow-hidden rounded-2xl border border-stone-200/70 bg-white shadow-card">
        <div className="border-b border-stone-100 px-5 py-4 text-sm font-semibold text-stone-800">
          Últimos eventos
        </div>
        <table className="w-full text-sm">
          <thead className="bg-stone-50 text-left text-xs uppercase tracking-wide text-stone-400">
            <tr>
              <th className="px-4 py-3">Quando</th>
              <th className="px-4 py-3">Etapa</th>
              <th className="px-4 py-3">Origem</th>
              <th className="px-4 py-3">Quem</th>
              <th className="px-4 py-3">Valor</th>
            </tr>
          </thead>
          <tbody>
            {ultimas.map((e) => (
              <tr key={e.id} className="border-t border-stone-100">
                <td className="px-4 py-2.5 whitespace-nowrap text-stone-500">
                  {e.createdAt.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                </td>
                <td className="px-4 py-2.5 text-stone-700">
                  {ETAPA_LABEL[e.etapa as Etapa] ?? e.etapa}
                </td>
                <td className="px-4 py-2.5 text-stone-500">
                  {e.utmSource ?? "—"}
                  {e.utmCampaign ? ` · ${e.utmCampaign}` : ""}
                </td>
                <td className="px-4 py-2.5 text-stone-400">{e.email ?? "—"}</td>
                <td className="px-4 py-2.5 text-stone-500">{e.valor ? reais(e.valor) : "—"}</td>
              </tr>
            ))}
            {ultimas.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-stone-400">
                  Sem eventos ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs leading-relaxed text-stone-400">
        Estes números não vão bater com o Gerenciador do Meta: lá a conversão é atribuída pela
        janela de clique/visualização do anúncio, aqui pelo último clique com UTM guardado em cookie
        próprio. Compras da Cakto chegam sem cookie e herdam a origem pelo e-mail — quando não há
        e-mail conhecido, aparecem como &quot;sem atribuição&quot;. Custo de anúncio não entra aqui,
        então não há ROAS nem CPA por enquanto.
      </p>
    </div>
  );
}

function Cartao({ titulo, valor }: { titulo: string; valor: string }) {
  return (
    <div className="rounded-2xl border border-stone-200/70 bg-white p-5 shadow-card">
      <div className="text-xs font-semibold uppercase tracking-wide text-stone-400">{titulo}</div>
      <div className="font-display mt-1 text-2xl font-extrabold text-stone-900">{valor}</div>
    </div>
  );
}
