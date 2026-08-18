"use client";

import { useRef, useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { adicionarItemManual } from "@/lib/actions/pantry";
import { CATEGORIA_INGREDIENTE_LABEL, CATEGORIA_INGREDIENTE_ORDEM } from "@/lib/constants";
import Card from "@/components/ui/Card";

export default function ItemManualForm({
  childId,
  semanaInicioISO,
}: {
  childId: string;
  semanaInicioISO: string;
}) {
  const [aberto, setAberto] = useState(false);
  const [nome, setNome] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [categoria, setCategoria] = useState("OUTROS");
  const [salvando, startTransition] = useTransition();
  const nomeRef = useRef<HTMLInputElement>(null);

  function salvar() {
    const limpo = nome.trim();
    if (!limpo) return;
    startTransition(async () => {
      await adicionarItemManual(childId, new Date(semanaInicioISO), limpo, quantidade, categoria);
      setNome("");
      setQuantidade("");
      nomeRef.current?.focus();
    });
  }

  if (!aberto) {
    return (
      <button
        onClick={() => setAberto(true)}
        className="flex w-full items-center justify-center gap-1.5 rounded-2xl border border-dashed border-stone-300 py-3 text-sm font-medium text-stone-500 transition-colors hover:border-orange-300 hover:text-orange-600"
      >
        <Plus size={16} /> Adicionar item à lista
      </button>
    );
  }

  return (
    <Card padding="sm" className="px-4">
      <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-400">
        Novo item
      </h2>
      <div className="space-y-2">
        <input
          ref={nomeRef}
          autoFocus
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") salvar();
          }}
          maxLength={80}
          placeholder="Nome do item (ex.: papel toalha)"
          className="w-full rounded-xl border border-stone-200 px-3 py-2 text-sm outline-none focus:border-orange-300"
        />
        <div className="flex gap-2">
          <input
            value={quantidade}
            onChange={(e) => setQuantidade(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") salvar();
            }}
            maxLength={40}
            placeholder="Quantidade"
            className="w-32 shrink-0 rounded-xl border border-stone-200 px-3 py-2 text-sm outline-none focus:border-orange-300"
          />
          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className="min-w-0 flex-1 rounded-xl border border-stone-200 px-3 py-2 text-sm outline-none focus:border-orange-300"
          >
            {CATEGORIA_INGREDIENTE_ORDEM.map((c) => (
              <option key={c} value={c}>
                {CATEGORIA_INGREDIENTE_LABEL[c] ?? c}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-2 pt-1">
          <button
            onClick={salvar}
            disabled={salvando || !nome.trim()}
            className="flex-1 rounded-xl bg-orange-500 py-2 text-sm font-semibold text-white disabled:opacity-40"
          >
            {salvando ? "Adicionando..." : "Adicionar"}
          </button>
          <button
            onClick={() => setAberto(false)}
            className="rounded-xl bg-stone-100 px-4 py-2 text-sm font-medium text-stone-600"
          >
            Fechar
          </button>
        </div>
      </div>
    </Card>
  );
}
