import { db } from "@/lib/db";
import { dataBR } from "@/lib/dates";
import { mesDe, reais, resumirParceira } from "@/lib/parceiras";
import Badge from "@/components/ui/Badge";
import NovaParceiraForm from "./NovaParceiraForm";
import LinhaParceira from "./LinhaParceira";

/**
 * Parceiras — visao do admin.
 *
 * A pergunta daqui e "quanto eu devo este mes e para quem". Os numeros saem
 * exatamente da mesma funcao que alimenta o painel delas: se as duas telas
 * calculassem por caminhos diferentes, a primeira divergencia viraria uma
 * conversa desagradavel sobre dinheiro.
 */
export const dynamic = "force-dynamic";
export const metadata = { title: "Parceiras" };

export default async function AdminParceirasPage() {
  const mes = mesDe(new Date());

  const parceiras = await db.parceira.findMany({
    orderBy: [{ ativa: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      nome: true,
      codigo: true,
      comissaoPct: true,
      ativa: true,
      observacao: true,
      chavePix: true,
      createdAt: true,
      user: { select: { email: true } },
      _count: { select: { indicacoes: true, links: true } },
    },
  });

  const resumos = await Promise.all(parceiras.map((p) => resumirParceira(p.id, mes)));
  const totalDoMes = resumos.reduce((soma, r) => soma + r.comissaoPeriodo, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-stone-800">Parceiras</h1>
        <p className="mt-1 text-sm text-stone-500">
          Cada uma vê o próprio painel em <code className="text-xs">/parceira</code> — links,
          indicações e comissão. Nunca o backoffice.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Cartao rotulo="Parceiras ativas" valor={String(parceiras.filter((p) => p.ativa).length)} />
        <Cartao
          rotulo="Indicações no total"
          valor={String(parceiras.reduce((s, p) => s + p._count.indicacoes, 0))}
        />
        <Cartao
          rotulo={`A pagar em ${mes.rotulo}`}
          valor={reais(Math.round(totalDoMes * 100) / 100)}
          destaque
        />
      </div>

      <NovaParceiraForm />

      <div className="space-y-3">
        {parceiras.length === 0 && (
          <p className="rounded-2xl border border-dashed border-stone-300 p-8 text-center text-sm text-stone-400">
            Nenhuma parceira cadastrada ainda.
          </p>
        )}

        {parceiras.map((p, i) => (
          <div key={p.id} className="rounded-2xl border border-stone-200/70 bg-white p-5 shadow-card">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold text-stone-800">{p.nome}</h2>
                  {p.ativa ? (
                    <Badge tone="emerald">Ativa</Badge>
                  ) : (
                    <Badge tone="neutral">Pausada</Badge>
                  )}
                </div>
                <p className="text-xs text-stone-400">
                  {p.user.email} · /p/{p.codigo} · desde {dataBR(p.createdAt)}
                </p>
                {p.observacao && <p className="mt-1 text-xs text-stone-500">{p.observacao}</p>}
              </div>

              <LinhaParceira
                parceiraId={p.id}
                comissaoPct={p.comissaoPct}
                ativa={p.ativa}
                nome={p.nome}
              />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
              <Numero rotulo="Cliques" valor={String(resumos[i].cliques)} />
              <Numero rotulo="Indicações" valor={String(resumos[i].indicacoes)} />
              <Numero rotulo="Ativos" valor={String(resumos[i].ativos)} />
              <Numero rotulo="Cancelaram" valor={String(resumos[i].cancelados)} />
              <Numero rotulo="A pagar no mês" valor={reais(resumos[i].comissaoPeriodo)} destaque />
            </div>

            <p className="mt-3 text-xs text-stone-400">
              PIX: {p.chavePix ? <code className="text-stone-600">{p.chavePix}</code> : "não informado"}
              {" · "}
              acumulado desde o início: {reais(resumos[i].comissaoTotal)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function Cartao({
  rotulo,
  valor,
  destaque = false,
}: {
  rotulo: string;
  valor: string;
  destaque?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-stone-200/70 bg-white p-5 shadow-card">
      <div className="text-xs font-semibold uppercase tracking-wide text-stone-400">{rotulo}</div>
      <div
        className={`mt-1 text-2xl font-extrabold ${destaque ? "text-orange-600" : "text-stone-900"}`}
      >
        {valor}
      </div>
    </div>
  );
}

function Numero({
  rotulo,
  valor,
  destaque = false,
}: {
  rotulo: string;
  valor: string;
  destaque?: boolean;
}) {
  return (
    <div className="rounded-xl bg-stone-50 p-3">
      <div className={`font-bold ${destaque ? "text-orange-600" : "text-stone-900"}`}>{valor}</div>
      <div className="mt-0.5 text-[11px] uppercase tracking-wide text-stone-400">{rotulo}</div>
    </div>
  );
}
