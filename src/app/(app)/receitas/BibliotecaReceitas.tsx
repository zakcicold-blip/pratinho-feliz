"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, ChevronRight } from "lucide-react";
import RecipeThumb from "@/components/RecipeThumb";
import { TIPO_REFEICAO_LABEL, TIPO_REFEICAO_ORDEM } from "@/lib/constants";
import { cn } from "@/lib/cn";
import type { TipoRefeicao } from "@prisma/client";

type Receita = {
  id: string;
  nome: string;
  resumo: string;
  tipoRefeicao: TipoRefeicao;
  tempoPreparoMin: number;
  imagemUrl: string | null;
};

function semAcento(t: string) {
  return t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

/**
 * Quantas receitas desenham de uma vez.
 *
 * O catalogo passou de 175 para 319 receitas e a lista desenhava todas: eram
 * ~4.000 nos no DOM e 815 KB de HTML numa tela so — o suficiente para
 * travar um celular. A busca continua percorrendo o catalogo inteiro; o que
 * limita e apenas quanto vai para a tela de cada vez.
 */
const POR_PAGINA = 30;

export default function BibliotecaReceitas({ receitas }: { receitas: Receita[] }) {
  const [busca, setBusca] = useState("");
  const [tipo, setTipo] = useState<string>("TODAS");
  const [visiveis, setVisiveis] = useState(POR_PAGINA);

  const filtradas = useMemo(() => {
    const termo = semAcento(busca.trim());
    return receitas.filter((r) => {
      if (tipo !== "TODAS" && r.tipoRefeicao !== tipo) return false;
      if (!termo) return true;
      return semAcento(r.nome).includes(termo) || semAcento(r.resumo).includes(termo);
    });
  }, [receitas, busca, tipo]);

  // Buscar ou trocar de aba recomeca a contagem.
  const mostradas = filtradas.slice(0, visiveis);
  const faltam = filtradas.length - mostradas.length;

  function ajustarFiltro(fn: () => void) {
    fn();
    setVisiveis(POR_PAGINA);
  }

  const abas = ["TODAS", ...TIPO_REFEICAO_ORDEM];

  return (
    <div>
      <div className="relative mb-3">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
        <input
          value={busca}
          onChange={(e) => ajustarFiltro(() => setBusca(e.target.value))}
          placeholder="Buscar por nome ou ingrediente…"
          className="w-full rounded-xl border border-stone-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-orange-300"
        />
      </div>

      <div className="mb-4 flex gap-1.5 overflow-x-auto pb-1">
        {abas.map((t) => (
          <button
            key={t}
            onClick={() => ajustarFiltro(() => setTipo(t))}
            className={cn(
              "shrink-0 rounded-full px-3 py-1.5 text-sm font-medium transition",
              tipo === t
                ? "bg-orange-500 text-white shadow-card"
                : "bg-stone-100 text-stone-600 hover:bg-stone-200"
            )}
          >
            {t === "TODAS" ? "Todas" : TIPO_REFEICAO_LABEL[t]}
          </button>
        ))}
      </div>

      <p className="mb-2 text-xs text-stone-400">
        {filtradas.length} receita{filtradas.length === 1 ? "" : "s"}
      </p>

      <div className="space-y-2">
        {mostradas.map((r) => (
          <Link
            key={r.id}
            href={`/receita/${r.id}`}
            className="flex items-center gap-3 rounded-2xl border border-stone-200/70 bg-white p-2.5 shadow-card transition hover:border-orange-200"
          >
            <RecipeThumb tipo={r.tipoRefeicao} imagemUrl={r.imagemUrl} nome={r.nome} size={52} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-stone-800">{r.nome}</p>
              <p className="truncate text-xs text-stone-400">
                {TIPO_REFEICAO_LABEL[r.tipoRefeicao]} · {r.tempoPreparoMin} min
              </p>
            </div>
            <ChevronRight size={16} className="shrink-0 text-stone-300" />
          </Link>
        ))}

        {faltam > 0 && (
          <button
            onClick={() => setVisiveis((v) => v + POR_PAGINA)}
            className="w-full rounded-2xl border border-stone-200 bg-white py-3 text-sm font-semibold text-stone-600 transition hover:border-orange-300 hover:text-stone-800"
          >
            Mostrar mais {Math.min(faltam, POR_PAGINA)} de {faltam}
          </button>
        )}

        {filtradas.length === 0 && (
          <p className="py-10 text-center text-sm text-stone-400">
            Nenhuma receita encontrada para essa busca.
          </p>
        )}
      </div>
    </div>
  );
}
