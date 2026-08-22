"use client";

import { useMemo, useState, useTransition } from "react";
import { Search, Check, X, PackageCheck } from "lucide-react";
import { alternarDespensa } from "@/lib/actions/pantry";
import { CATEGORIA_INGREDIENTE_LABEL, CATEGORIA_INGREDIENTE_ORDEM } from "@/lib/constants";
import { CategoriaIcon } from "@/components/categoryIcons";
import Card from "@/components/ui/Card";
import { cn } from "@/lib/cn";

export type IngredienteOpcao = {
  id: string;
  nome: string;
  categoria: string;
  /** Em quantas receitas do catálogo ele aparece. */
  receitas: number;
};

/** Tira acento para a busca casar "maca" com "Maçã". */
function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

/**
 * Aba "Tenho em casa": todos os ingredientes que aparecem nas receitas do
 * catálogo. O que for marcado aqui some da lista de compras de todas as
 * semanas.
 */
export default function DespensaLista({
  childId,
  ingredientes,
  selecionadosIniciais,
}: {
  childId: string;
  ingredientes: IngredienteOpcao[];
  selecionadosIniciais: string[];
}) {
  const [selecionados, setSelecionados] = useState<Set<string>>(
    () => new Set(selecionadosIniciais)
  );
  const [busca, setBusca] = useState("");
  const [, start] = useTransition();

  function alternar(id: string) {
    // Otimista: a lista responde na hora, o servidor confirma depois.
    setSelecionados((antes) => {
      const novo = new Set(antes);
      if (novo.has(id)) novo.delete(id);
      else novo.add(id);
      return novo;
    });
    start(async () => {
      await alternarDespensa(childId, id);
    });
  }

  const termo = normalizar(busca);
  const grupos = useMemo(() => {
    const filtrados = termo
      ? ingredientes.filter((i) => normalizar(i.nome).includes(termo))
      : ingredientes;

    return CATEGORIA_INGREDIENTE_ORDEM.map((categoria) => ({
      categoria,
      itens: filtrados
        .filter((i) => i.categoria === categoria)
        .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR")),
    })).filter((g) => g.itens.length > 0);
  }, [ingredientes, termo]);

  const totalFiltrado = grupos.reduce((acc, g) => acc + g.itens.length, 0);

  return (
    <div className="space-y-4">
      <Card padding="sm" className="px-4">
        <p className="text-sm leading-relaxed text-stone-600">
          Marque o que você já tem em casa. Esses itens somem da lista de compras de{" "}
          <strong className="text-stone-800">todas as semanas</strong>, até você desmarcar.
        </p>
        <div className="mt-3 flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5 font-semibold text-stone-600">
            <PackageCheck size={14} className="text-emerald-500" /> Marcados
          </span>
          <span className="text-stone-400">
            {selecionados.size} de {ingredientes.length}
          </span>
        </div>
      </Card>

      {/* Busca */}
      <div className="relative">
        <Search
          size={16}
          className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-stone-400"
        />
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar ingrediente…"
          className="w-full rounded-2xl border border-stone-200 bg-white py-3 pr-10 pl-10 text-sm outline-none transition focus:border-orange-400"
        />
        {busca && (
          <button
            type="button"
            onClick={() => setBusca("")}
            aria-label="Limpar busca"
            className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full p-1 text-stone-400 hover:bg-stone-100"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {totalFiltrado === 0 ? (
        <p className="rounded-2xl border border-dashed border-stone-300 px-4 py-8 text-center text-sm text-stone-400">
          Nenhum ingrediente encontrado para “{busca}”.
        </p>
      ) : (
        grupos.map((g) => (
          <Card key={g.categoria} padding="sm" className="px-4">
            <h2 className="mb-1 flex items-center gap-1.5 text-xs font-semibold tracking-wide text-stone-400 uppercase">
              <CategoriaIcon categoria={g.categoria} size={13} />
              {CATEGORIA_INGREDIENTE_LABEL[g.categoria]}
            </h2>
            <div className="divide-y divide-stone-100">
              {g.itens.map((i) => {
                const on = selecionados.has(i.id);
                return (
                  <button
                    key={i.id}
                    type="button"
                    onClick={() => alternar(i.id)}
                    aria-pressed={on}
                    className="flex w-full items-center gap-3 py-2.5 text-left transition active:opacity-60"
                  >
                    <span
                      className={cn(
                        "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition",
                        on
                          ? "border-emerald-500 bg-emerald-500 text-white"
                          : "border-stone-300 bg-white"
                      )}
                    >
                      {on && <Check size={13} strokeWidth={3} />}
                    </span>
                    <span
                      className={cn(
                        "min-w-0 flex-1 truncate text-sm",
                        on ? "font-medium text-stone-400 line-through" : "text-stone-700"
                      )}
                    >
                      {i.nome}
                    </span>
                    <span className="shrink-0 text-[11px] text-stone-300">
                      {i.receitas} {i.receitas === 1 ? "receita" : "receitas"}
                    </span>
                  </button>
                );
              })}
            </div>
          </Card>
        ))
      )}
    </div>
  );
}
