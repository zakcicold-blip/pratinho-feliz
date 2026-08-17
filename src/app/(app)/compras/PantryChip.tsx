"use client";

import { useState, useTransition } from "react";
import { Check } from "lucide-react";
import { alternarDespensa } from "@/lib/actions/pantry";

export default function PantryChip({
  childId,
  ingredientId,
  nome,
}: {
  childId: string;
  ingredientId: string;
  nome: string;
}) {
  const [removido, setRemovido] = useState(false);
  const [, startTransition] = useTransition();

  if (removido) return null;

  return (
    <button
      onClick={() => {
        setRemovido(true);
        startTransition(async () => {
          await alternarDespensa(childId, ingredientId);
        });
      }}
      className="flex items-center gap-1 rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-sm text-emerald-700"
      title="Toque para voltar à lista de compras"
    >
      <Check size={13} /> {nome}
    </button>
  );
}
