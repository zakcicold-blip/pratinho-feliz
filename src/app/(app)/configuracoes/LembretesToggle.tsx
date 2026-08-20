"use client";

import { useState, useTransition } from "react";
import { alternarLembretes } from "@/lib/actions/settings";

export default function LembretesToggle({ inicial }: { inicial: boolean }) {
  const [ativo, setAtivo] = useState(inicial);
  const [, startTransition] = useTransition();

  return (
    <label className="flex items-center justify-between gap-3 rounded-xl bg-stone-50 px-4 py-3">
      <span className="text-sm text-stone-700">
        Lembretes no app
        <span className="mt-0.5 block text-xs text-stone-400">
          Um aviso na tela de hoje quando faltar registrar as reações das refeições.
        </span>
      </span>
      <input
        type="checkbox"
        checked={ativo}
        onChange={(e) => {
          const checked = e.target.checked;
          setAtivo(checked);
          startTransition(async () => {
            await alternarLembretes(checked);
          });
        }}
        className="h-5 w-9 appearance-none rounded-full bg-stone-300 checked:bg-orange-500 relative transition-colors before:absolute before:left-0.5 before:top-0.5 before:h-4 before:w-4 before:rounded-full before:bg-white before:transition-transform checked:before:translate-x-4"
      />
    </label>
  );
}
