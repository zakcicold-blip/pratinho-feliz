import { db } from "@/lib/db";
import { baseDoSite, requireParceira } from "@/lib/parceiraSessao";
import { dataBR } from "@/lib/dates";
import CopiarLink from "../CopiarLink";
import NovoLinkForm from "./NovoLinkForm";
import DesligarLinkButton from "./DesligarLinkButton";

/**
 * Um link por peca de divulgacao.
 *
 * Bio, story, grupo de WhatsApp e live respondem perguntas diferentes. Com um
 * link so, a parceira sabe que 40 pessoas vieram e nao sabe de onde — que e a
 * informacao de que ela precisa para repetir o que funcionou.
 */
export const dynamic = "force-dynamic";
export const metadata = { title: "Meus links" };

export default async function LinksParceiraPage() {
  const { parceira } = await requireParceira();

  const [links, base] = await Promise.all([
    db.linkParceira.findMany({
      where: { parceiraId: parceira.id },
      orderBy: [{ revogadoEm: "asc" }, { createdAt: "desc" }],
      select: {
        id: true,
        slug: true,
        rotulo: true,
        cliques: true,
        ultimoCliqueEm: true,
        revogadoEm: true,
        createdAt: true,
        _count: { select: { indicacoes: true } },
      },
    }),
    baseDoSite(),
  ]);

  const ativos = links.filter((l) => !l.revogadoEm);
  const desligados = links.filter((l) => l.revogadoEm);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-stone-800">Meus links</h1>
        <p className="mt-1 text-sm text-stone-500">
          Crie um link para cada lugar onde você divulga. Assim dá para ver qual peça trouxe gente
          de verdade, em vez de adivinhar.
        </p>
      </div>

      {parceira.ativa && <NovoLinkForm />}

      <div className="space-y-3">
        {ativos.length === 0 && (
          <p className="rounded-2xl border border-dashed border-stone-300 p-8 text-center text-sm text-stone-400">
            Nenhum link ativo ainda.
          </p>
        )}

        {ativos.map((l) => (
          <div key={l.id} className="rounded-2xl border border-stone-200/70 bg-white p-5 shadow-card">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-semibold text-stone-800">{l.rotulo}</h2>
                <p className="text-xs text-stone-400">criado em {dataBR(l.createdAt)}</p>
              </div>
              <DesligarLinkButton linkId={l.id} rotulo={l.rotulo} />
            </div>

            <div className="mt-3">
              <CopiarLink url={`${base}/p/${l.slug}`} />
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <Numero rotulo="Cliques" valor={String(l.cliques)} />
              <Numero rotulo="Cadastros" valor={String(l._count.indicacoes)} />
              <Numero
                rotulo="Último clique"
                valor={l.ultimoCliqueEm ? dataBR(l.ultimoCliqueEm) : "—"}
                pequeno
              />
            </div>
          </div>
        ))}
      </div>

      {desligados.length > 0 && (
        <div>
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-400">
            Links desligados
          </h2>
          <div className="overflow-hidden rounded-2xl border border-stone-200/70 bg-white">
            {desligados.map((l, i) => (
              <div
                key={l.id}
                className={`flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm ${
                  i > 0 ? "border-t border-stone-100" : ""
                }`}
              >
                <div>
                  <span className="font-medium text-stone-600">{l.rotulo}</span>
                  <span className="ml-2 text-xs text-stone-400">/p/{l.slug}</span>
                </div>
                <span className="text-xs text-stone-400">
                  {l.cliques} cliques · {l._count.indicacoes} cadastros · desligado em{" "}
                  {dataBR(l.revogadoEm as Date)}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs leading-relaxed text-stone-400">
            Link desligado para de contar cadastros novos e passa a levar para a página inicial.
            Quem já veio por ele continua valendo — inclusive para comissão.
          </p>
        </div>
      )}
    </div>
  );
}

function Numero({
  rotulo,
  valor,
  pequeno = false,
}: {
  rotulo: string;
  valor: string;
  pequeno?: boolean;
}) {
  return (
    <div className="rounded-xl bg-stone-50 p-3">
      <div className={`font-extrabold text-stone-900 ${pequeno ? "text-sm" : "text-xl"}`}>
        {valor}
      </div>
      <div className="mt-0.5 text-[11px] uppercase tracking-wide text-stone-400">{rotulo}</div>
    </div>
  );
}
