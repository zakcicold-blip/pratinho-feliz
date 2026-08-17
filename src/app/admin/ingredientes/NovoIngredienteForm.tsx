"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { criarIngrediente } from "@/lib/actions/admin";
import { CATEGORIA_INGREDIENTE_LABEL } from "@/lib/constants";
import Button from "@/components/ui/Button";
import { Plus } from "lucide-react";

export default function NovoIngredienteForm() {
  const [nome, setNome] = useState("");
  const [categoria, setCategoria] = useState("HORTIFRUTI");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  return (
    <form
      className="flex flex-wrap items-end gap-2"
      onSubmit={async (e) => {
        e.preventDefault();
        const result = await criarIngrediente(nome, categoria);
        if (result?.error) {
          setError(result.error);
          return;
        }
        setNome("");
        setError(null);
        router.refresh();
      }}
    >
      <div>
        <label className="mb-1 block text-xs text-stone-500">Nome</label>
        <input
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="rounded-xl border border-stone-300 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs text-stone-500">Categoria</label>
        <select
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          className="rounded-xl border border-stone-300 px-3 py-2 text-sm"
        >
          {Object.entries(CATEGORIA_INGREDIENTE_LABEL).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
      <Button type="submit">
        <Plus size={14} /> Adicionar
      </Button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </form>
  );
}
