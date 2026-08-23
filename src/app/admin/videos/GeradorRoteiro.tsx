"use client";

import { useState, useTransition } from "react";
import { Clapperboard, Copy, Check, Loader2, Search } from "lucide-react";
import { criarRoteiro } from "@/lib/actions/roteiroVideo";
import type { RoteiroVideo } from "@/lib/roteiroVideo";
import { cn } from "@/lib/cn";

type Receita = { id: string; nome: string; tipoRefeicao: string; tempoPreparoMin: number };

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
  const [escolhida, setEscolhida] = useState<Receita | null>(null);
  const [roteiro, setRoteiro] = useState<RoteiroVideo | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [pendente, iniciar] = useTransition();

  const termo = semAcento(busca.trim());
  const filtradas = termo
    ? receitas.filter((r) => semAcento(r.nome).includes(termo)).slice(0, 8)
    : [];

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
      {/* Busca */}
      <div className="relative max-w-md">
        <Search size={16} className="absolute top-1/2 left-3 -translate-y-1/2 text-stone-400" />
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar receita pelo nome…"
          className="w-full rounded-xl border border-stone-200 bg-white py-2.5 pr-3 pl-9 text-sm outline-none focus:border-orange-300"
        />
        {filtradas.length > 0 && (
          <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-xl border border-stone-200 bg-white shadow-lg">
            {filtradas.map((r) => (
              <button
                key={r.id}
                onClick={() => gerar(r)}
                className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left text-sm transition hover:bg-orange-50"
              >
                <span className="truncate text-stone-800">{r.nome}</span>
                <span className="shrink-0 text-[11px] text-stone-400">
                  {r.tipoRefeicao.toLowerCase()} · {r.tempoPreparoMin} min
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

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
