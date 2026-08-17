"use client";

import { useState, useTransition } from "react";
import { alternarAtivoReceita } from "@/lib/actions/admin";

export default function ToggleAtivoButton({ id, ativoInicial }: { id: string; ativoInicial: boolean }) {
  const [ativo, setAtivo] = useState(ativoInicial);
  const [, startTransition] = useTransition();

  return (
    <button
      onClick={() => {
        setAtivo((v) => !v);
        startTransition(async () => {
          await alternarAtivoReceita(id);
        });
      }}
      className={`rounded-full px-3 py-1 text-xs font-semibold ${
        ativo ? "bg-emerald-100 text-emerald-700" : "bg-stone-200 text-stone-500"
      }`}
    >
      {ativo ? "Ativa" : "Desativada"}
    </button>
  );
}
