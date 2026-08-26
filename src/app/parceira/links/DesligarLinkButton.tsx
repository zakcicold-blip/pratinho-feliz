"use client";

import { useState, useTransition } from "react";
import { Power } from "lucide-react";
import { revogarLink } from "@/lib/actions/parceira";

/**
 * Desligar e uma acao que a parceira nao desfaz sozinha, entao pede
 * confirmacao no proprio lugar — sem modal, que em celular vira ginastica.
 */
export default function DesligarLinkButton({
  linkId,
  rotulo,
}: {
  linkId: string;
  rotulo: string;
}) {
  const [confirmando, setConfirmando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [pendente, iniciar] = useTransition();

  if (!confirmando) {
    return (
      <button
        type="button"
        onClick={() => setConfirmando(true)}
        className="flex items-center gap-1.5 rounded-lg border border-stone-200 px-2.5 py-1.5 text-xs font-semibold text-stone-500 transition hover:bg-stone-50"
      >
        <Power size={13} /> Desligar
      </button>
    );
  }

  return (
    <div className="text-right">
      <p className="text-xs text-stone-500">
        Desligar “{rotulo}”? Para de contar cadastros novos.
      </p>
      <div className="mt-1.5 flex justify-end gap-1.5">
        <button
          type="button"
          onClick={() => setConfirmando(false)}
          className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-stone-500 hover:bg-stone-50"
        >
          Cancelar
        </button>
        <button
          type="button"
          disabled={pendente}
          onClick={() =>
            iniciar(async () => {
              const r = await revogarLink(linkId);
              if (r?.error) setErro(r.error);
            })
          }
          className="rounded-lg bg-rose-500 px-2.5 py-1.5 text-xs font-semibold text-white transition hover:bg-rose-600 disabled:opacity-60"
        >
          {pendente ? "…" : "Desligar"}
        </button>
      </div>
      {erro && <p className="mt-1 text-xs text-rose-600">{erro}</p>}
    </div>
  );
}
