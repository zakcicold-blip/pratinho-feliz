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

export default function BibliotecaReceitas({ receitas }: { receitas: Receita[] }) {
  const [busca, setBusca] = useState("");
  const [tipo, setTipo] = useState<string>("TODAS");

  const filtradas = useMemo(() => {
    const termo = semAcento(busca.trim());
    return receitas.filter((r) => {
      if (tipo !== "TODAS" && r.tipoRefeicao !== tipo) return false;
      if (!termo) return true;
      return semAcento(r.nome).includes(termo) || semAcento(r.resumo).includes(termo);
    });
  }, [receitas, busca, tipo]);

  const abas = ["TODAS", ...TIPO_REFEICAO_ORDEM];

  return (
    <div>
      <div className="relative mb-3">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por nome ou ingrediente…"
          className="w-full rounded-xl border border-stone-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-orange-300"
        />
      </div>

      <div className="mb-4 flex gap-1.5 overflow-x-auto pb-1">
        {abas.map((t) => (
          <button
            key={t}
            onClick={() => setTipo(t)}
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
        {filtradas.map((r) => (
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

        {filtradas.length === 0 && (
          <p className="py-10 text-center text-sm text-stone-400">
            Nenhuma receita encontrada para essa busca.
          </p>
        )}
      </div>
    </div>
  );
}
