"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { marcarExtraComprado, removerItemManual } from "@/lib/actions/pantry";

export default function ExtraItemRow({
  extraId,
  nome,
  quantidade,
  compradoInicial,
}: {
  extraId: string;
  nome: string;
  quantidade: string | null;
  compradoInicial: boolean;
}) {
  const [comprado, setComprado] = useState(compradoInicial);
  const [removido, setRemovido] = useState(false);
  const [, startTransition] = useTransition();

  if (removido) return null;

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
              await marcarExtraComprado(extraId, checked);
            });
          }}
          className="h-4 w-4 shrink-0 rounded border-stone-300 text-orange-500"
        />
        <span className="min-w-0 flex-1 truncate">
          <span className={comprado ? "text-stone-400 line-through" : "text-stone-700"}>{nome}</span>
          {quantidade && <span className="ml-1 text-xs text-stone-400">{quantidade}</span>}
        </span>
      </label>
      <button
        onClick={() => {
          setRemovido(true);
          startTransition(async () => {
            await removerItemManual(extraId);
          });
        }}
        aria-label={`Remover ${nome}`}
        className="shrink-0 rounded-full p-1.5 text-stone-400 hover:bg-stone-100 hover:text-red-500"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}
