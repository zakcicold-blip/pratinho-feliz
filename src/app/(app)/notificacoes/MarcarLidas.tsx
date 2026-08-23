"use client";

import { useTransition } from "react";
import { CheckCheck } from "lucide-react";
import { marcarTodasComoLidas } from "@/lib/actions/notificacoes";

export default function MarcarLidas() {
  const [pendente, iniciar] = useTransition();

  return (
    <button
      onClick={() => iniciar(async () => { await marcarTodasComoLidas(); })}
      disabled={pendente}
      className="flex w-full items-center justify-center gap-1.5 rounded-full border border-stone-200 bg-white py-2.5 text-[13px] font-semibold text-stone-600 transition hover:border-stone-300 disabled:opacity-60"
    >
      <CheckCheck size={14} /> {pendente ? "Marcando…" : "Marcar todas como lidas"}
    </button>
  );
}
