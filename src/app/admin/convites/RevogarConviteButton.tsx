"use client";

import { useState, useTransition } from "react";
import { revogarConvite } from "@/lib/actions/adminConvites";

export default function RevogarConviteButton({
  conviteId,
  rotulo,
}: {
  conviteId: string;
  rotulo: string;
}) {
  const [pendente, iniciar] = useTransition();
  const [erro, setErro] = useState<string | null>(null);

  function revogar() {
    if (!confirm(`Revogar o convite "${rotulo}"? O link para de funcionar; quem já entrou por ele mantém o acesso.`)) {
      return;
    }
    iniciar(async () => {
      const r = await revogarConvite(conviteId);
      setErro(r?.error ?? null);
    });
  }

  return (
    <div>
      <button
        type="button"
        onClick={revogar}
        disabled={pendente}
        className="rounded-lg border border-stone-200 px-2.5 py-1 text-xs font-semibold text-stone-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-60"
      >
        {pendente ? "Revogando…" : "Revogar"}
      </button>
      {erro && <p className="mt-1 text-xs text-rose-600">{erro}</p>}
    </div>
  );
}
