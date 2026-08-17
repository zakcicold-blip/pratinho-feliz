"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { buscarOuCriarIngrediente } from "@/lib/actions/preferences";

export type IngredienteBasico = { id: string; nome: string; categoria: string };

export default function AddCustomFoodInput({
  onAdded,
}: {
  onAdded: (ingrediente: IngredienteBasico) => void;
}) {
  const [valor, setValor] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function adicionar() {
    if (!valor.trim()) return;
    setPending(true);
    setError(null);
    const result = await buscarOuCriarIngrediente(valor);
    setPending(false);
    if (result.error || !result.ingredient) {
      setError(result.error ?? "Não foi possível adicionar.");
      return;
    }
    onAdded(result.ingredient);
    setValor("");
  }

  return (
    <div className="mt-2">
      <div className="flex gap-2">
        <input
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              adicionar();
            }
          }}
          placeholder="Não achou? Digite um alimento..."
          className="flex-1 rounded-full border border-stone-300 px-3 py-1.5 text-sm outline-none focus:border-orange-400"
        />
        <button
          type="button"
          onClick={adicionar}
          disabled={pending || !valor.trim()}
          className="flex items-center gap-1 rounded-full bg-orange-500 px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          <Plus size={14} /> {pending ? "..." : "Adicionar"}
        </button>
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
