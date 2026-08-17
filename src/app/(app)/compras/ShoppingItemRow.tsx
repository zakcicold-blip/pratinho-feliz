"use client";

import { useState, useTransition } from "react";
import { marcarComprado, alternarDespensa } from "@/lib/actions/pantry";

export default function ShoppingItemRow({
  childId,
  semanaInicioISO,
  ingredientId,
  nome,
  detalhe,
  compradoInicial,
}: {
  childId: string;
  semanaInicioISO: string;
  ingredientId: string;
  nome: string;
  detalhe: string;
  compradoInicial: boolean;
}) {
  const [comprado, setComprado] = useState(compradoInicial);
  const [ocultar, setOcultar] = useState(false);
  const [, startTransition] = useTransition();

  if (ocultar) return null;

  return (
    <div className="flex items-center justify-between gap-2 py-2">
      <label className="flex min-w-0 flex-1 items-center gap-3">
        <input
          type="checkbox"
          checked={comprado}
          onChange={(e) => {
            const checked = e.target.checked;
            setComprado(checked);
            startTransition(async () => {
              await marcarComprado(childId, new Date(semanaInicioISO), ingredientId, checked);
            });
          }}
          className="h-4 w-4 shrink-0 rounded border-stone-300 text-orange-500"
        />
        <span className="min-w-0 flex-1 truncate">
          <span className={comprado ? "text-stone-400 line-through" : "text-stone-700"}>{nome}</span>
          <span className="ml-1 text-xs text-stone-400">{detalhe}</span>
        </span>
      </label>
      <button
        onClick={() => {
          setOcultar(true);
          startTransition(async () => {
            await alternarDespensa(childId, ingredientId);
          });
        }}
        className="shrink-0 rounded-full bg-stone-100 px-2 py-1 text-[11px] font-medium text-stone-500 hover:bg-stone-200"
      >
        Já tenho
      </button>
    </div>
  );
}
