"use client";

import { useState, useTransition } from "react";
import { Clapperboard, Copy, Check, Loader2, Search } from "lucide-react";
import { criarRoteiro } from "@/lib/actions/roteiroVideo";
import type { RoteiroVideo } from "@/lib/roteiroVideo";
import { cn } from "@/lib/cn";

type Receita = {
  id: string;
  nome: string;
  tipoRefeicao: string;
  tempoPreparoMin: number;
  idadeMinimaMeses: number;
};

/**
 * Faixas de idade para achar receita rápido.
 *
 * A distribuicao real e torta: 276 das 319 receitas sao liberadas ate os 11
 * meses. Filtrar so por idade quase nao reduz a lista, por isso o filtro de
 * refeicao vem junto — e o cruzamento dos dois que torna a busca util.
 */
const FAIXAS = [
  { id: "TODAS", rotulo: "Todas as idades", teste: () => true },
  { id: "INICIO", rotulo: "Início · 6 meses", teste: (m: number) => m <= 6 },
  { id: "BEBE", rotulo: "Bebê · 7 a 11 meses", teste: (m: number) => m > 6 && m < 12 },
  { id: "MAIOR", rotulo: "1 ano ou mais", teste: (m: number) => m >= 12 },
] as const;

const REFEICOES = [
  { id: "TODAS", rotulo: "Toda refeição" },
  { id: "CAFE_DA_MANHA", rotulo: "Café" },
  { id: "ALMOCO", rotulo: "Almoço" },
  { id: "LANCHE", rotulo: "Lanche" },
  { id: "JANTAR", rotulo: "Jantar" },
] as const;

/** Quantas receitas desenhar de uma vez — a lista inteira travaria a tela. */
const POR_PAGINA = 24;

function semAcento(t: string) {
  return t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

/** Botão de copiar que confirma visualmente — o fluxo é colar no Veo. */
function Copiar({ texto, rotulo = "Copiar" }: { texto: string; rotulo?: string }) {
  const [copiado, setCopiado] = useState(false);
  return (
    <button
      onClick={async () => {
        await navigator.clipboard.writeText(texto);
        setCopiado(true);
        setTimeout(() => setCopiado(false), 1800);
      }}
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition",
        copiado ? "bg-emerald-100 text-emerald-700" : "bg-stone-100 text-stone-600 hover:bg-stone-200"
      )}
    >
      {copiado ? <Check size={13} /> : <Copy size={13} />}
      {copiado ? "Copiado" : rotulo}
    </button>
  );
}

export default function GeradorRoteiro({ receitas }: { receitas: Receita[] }) {
  const [busca, setBusca] = useState("");
  const [faixa, setFaixa] = useState<string>("TODAS");
  const [refeicao, setRefeicao] = useState<string>("TODAS");
  const [visiveis, setVisiveis] = useState(POR_PAGINA);
  const [escolhida, setEscolhida] = useState<Receita | null>(null);
  const [roteiro, setRoteiro] = useState<RoteiroVideo | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [pendente, iniciar] = useTransition();

  const termo = semAcento(busca.trim());
  const testeFaixa = FAIXAS.find((f) => f.id === faixa)!.teste;

  const filtradas = receitas.filter((r) => {
    if (!testeFaixa(r.idadeMinimaMeses)) return false;
    if (refeicao !== "TODAS" && r.tipoRefeicao !== refeicao) return false;
    if (termo && !semAcento(r.nome).includes(termo)) return false;
    return true;
  });

  const mostradas = filtradas.slice(0, visiveis);
  const faltam = filtradas.length - mostradas.length;

  /** Mexer em qualquer filtro recomeça a contagem da lista. */
  function ajustar(fn: () => void) {
    fn();
    setVisiveis(POR_PAGINA);
  }

  function rotuloIdade(meses: number): string {
    if (meses <= 6) return "6 m";
    if (meses < 12) return `${meses} m`;
    return `${Math.floor(meses / 12)} ano${meses >= 24 ? "s" : ""}`;
  }

  function gerar(r: Receita) {
    setEscolhida(r);
    setRoteiro(null);
    setErro(null);
    setBusca("");
    iniciar(async () => {
      const resp = await criarRoteiro(r.id);
      if (resp.ok) setRoteiro(resp.roteiro);
      else setErro(resp.erro);
    });
  }

  const tudo = roteiro
    ? [
        `GANCHO: ${roteiro.gancho}`,
        "",
        ...roteiro.cenas.flatMap((c) => [
          `CENA ${c.numero} — ${c.descricao}`,
          `Texto na tela: ${c.textoNaTela}`,
          `Prompt Veo: ${c.promptVeo}`,
          "",
        ]),
        `LEGENDA:\n${roteiro.legenda}`,
        "",
        `CTA: ${roteiro.chamada}`,
        `ÁUDIO: ${roteiro.audio}`,
        "",
        roteiro.hashtags.join(" "),
      ].join("\n")
    : "";

  return (
    <div>
      {/* Filtros */}
      <div className="rounded-2xl border border-stone-200 bg-white p-4">
        <p className="mb-2 text-[11px] font-bold tracking-wide text-stone-400 uppercase">Idade</p>
        <div className="mb-4 flex flex-wrap gap-1.5">
          {FAIXAS.map((f) => {
            const quantas = receitas.filter((r) => f.teste(r.idadeMinimaMeses)).length;
            return (
              <button
                key={f.id}
                onClick={() => ajustar(() => setFaixa(f.id))}
                className={cn(
                  "rounded-full px-3 py-1.5 text-[13px] font-medium transition",
                  faixa === f.id
                    ? "bg-orange-500 text-white"
                    : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                )}
              >
                {f.rotulo}{" "}
                <span className={faixa === f.id ? "text-white/70" : "text-stone-400"}>
                  {quantas}
                </span>
              </button>
            );
          })}
        </div>

        <p className="mb-2 text-[11px] font-bold tracking-wide text-stone-400 uppercase">
          Refeição
        </p>
        <div className="mb-4 flex flex-wrap gap-1.5">
          {REFEICOES.map((t) => (
            <button
              key={t.id}
              onClick={() => ajustar(() => setRefeicao(t.id))}
              className={cn(
                "rounded-full px-3 py-1.5 text-[13px] font-medium transition",
                refeicao === t.id
                  ? "bg-stone-900 text-white"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              )}
            >
              {t.rotulo}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search size={16} className="absolute top-1/2 left-3 -translate-y-1/2 text-stone-400" />
          <input
            value={busca}
            onChange={(e) => ajustar(() => setBusca(e.target.value))}
            placeholder="Refinar pelo nome…"
            className="w-full rounded-xl border border-stone-200 bg-white py-2.5 pr-3 pl-9 text-sm outline-none focus:border-orange-300"
          />
        </div>
      </div>

      {/* Lista */}
      <p className="mt-4 mb-2 text-xs text-stone-400">
        {filtradas.length} receita{filtradas.length === 1 ? "" : "s"}
      </p>

      {filtradas.length === 0 ? (
        <p className="rounded-xl border border-dashed border-stone-300 py-10 text-center text-sm text-stone-400">
          Nenhuma receita com esses filtros.
        </p>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2">
          {mostradas.map((r) => (
            <button
              key={r.id}
              onClick={() => gerar(r)}
              disabled={pendente}
              className={cn(
                "flex items-center justify-between gap-3 rounded-xl border bg-white px-3 py-2.5 text-left transition",
                escolhida?.id === r.id
                  ? "border-orange-400 ring-1 ring-orange-200"
                  : "border-stone-200 hover:border-orange-300 hover:bg-orange-50/40",
                pendente && "opacity-60"
              )}
            >
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-stone-800">{r.nome}</span>
                <span className="block text-[11px] text-stone-400">
                  {r.tipoRefeicao.toLowerCase().replace(/_/g, " ")} · {r.tempoPreparoMin} min
                </span>
              </span>
              <span className="shrink-0 rounded-full bg-stone-100 px-2 py-0.5 text-[11px] font-semibold text-stone-500">
                {rotuloIdade(r.idadeMinimaMeses)}
              </span>
            </button>
          ))}
        </div>
      )}

      {faltam > 0 && (
        <button
          onClick={() => setVisiveis((v) => v + POR_PAGINA)}
          className="mt-3 w-full rounded-xl border border-stone-200 bg-white py-2.5 text-sm font-semibold text-stone-600 transition hover:border-orange-300"
        >
          Mostrar mais {Math.min(faltam, POR_PAGINA)} de {faltam}
        </button>
      )}

      {pendente && (
        <div className="mt-6 flex items-center gap-2 text-sm text-stone-500">
          <Loader2 size={16} className="animate-spin" />
          Escrevendo o roteiro de {escolhida?.nome}…
        </div>
      )}

      {erro && (
        <div className="mt-6 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {erro}
        </div>
      )}

      {roteiro && (
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between gap-3 rounded-2xl bg-stone-900 px-5 py-4 text-white">
            <div className="min-w-0">
              <p className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wide text-white/60 uppercase">
                <Clapperboard size={12} /> Roteiro
              </p>
              <p className="truncate font-bold">{roteiro.receita}</p>
            </div>
            <Copiar texto={tudo} rotulo="Copiar tudo" />
          </div>

          {/* Gancho */}
          <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4">
            <p className="mb-1 text-[11px] font-bold tracking-wide text-orange-700 uppercase">
              Gancho · primeiros 3 segundos
            </p>
            <p className="text-lg font-bold text-stone-900">{roteiro.gancho}</p>
          </div>

          {/* Cenas */}
          {roteiro.cenas.map((cena) => (
            <div
              key={cena.numero}
              className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm"
            >
              <div className="mb-2 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-stone-900 text-[11px] font-bold text-white">
                  {cena.numero}
                </span>
                <span className="text-[11px] font-semibold tracking-wide text-stone-400 uppercase">
                  Cena {cena.numero} · até 8 s
                </span>
              </div>

              <p className="text-sm text-stone-700">{cena.descricao}</p>

              <div className="mt-3 rounded-xl bg-stone-50 p-3">
                <div className="mb-1 flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold tracking-wide text-stone-400 uppercase">
                    Prompt do Veo
                  </span>
                  <Copiar texto={cena.promptVeo} />
                </div>
                <p className="font-mono text-[12px] leading-relaxed text-stone-600">
                  {cena.promptVeo}
                </p>
              </div>

              <p className="mt-2 text-[13px] text-stone-500">
                <span className="font-semibold text-stone-700">Texto na tela:</span>{" "}
                {cena.textoNaTela}
              </p>
            </div>
          ))}

          {/* Legenda e hashtags */}
          <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[11px] font-bold tracking-wide text-stone-400 uppercase">
                Legenda do post
              </span>
              <Copiar texto={`${roteiro.legenda}\n\n${roteiro.hashtags.join(" ")}`} />
            </div>
            <p className="text-sm whitespace-pre-wrap text-stone-700">{roteiro.legenda}</p>
            <p className="mt-3 text-[13px] text-sky-600">{roteiro.hashtags.join(" ")}</p>
            <div className="mt-3 grid gap-2 border-t border-stone-100 pt-3 text-[13px] text-stone-500 sm:grid-cols-2">
              <p>
                <span className="font-semibold text-stone-700">Chamada:</span> {roteiro.chamada}
              </p>
              <p>
                <span className="font-semibold text-stone-700">Áudio:</span> {roteiro.audio}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
