"use client";

import { useState, useTransition } from "react";
import { deletarUsuario } from "@/lib/actions/adminUsuarios";
import { Trash2 } from "lucide-react";

export default function DeletarUsuarioButton({ userId, nome }: { userId: string; nome: string }) {
  const [pending, start] = useTransition();
  const [confirmando, setConfirmando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  function excluir() {
    setErro(null);
    start(async () => {
      const r = await deletarUsuario(userId);
      if (r?.error) {
        setErro(r.error);
        setConfirmando(false);
      }
    });
  }

  if (confirmando) {
    return (
      <span className="flex items-center gap-1.5">
        <button
          onClick={excluir}
          disabled={pending}
          className="rounded-lg bg-rose-600 px-2.5 py-1 text-xs font-semibold text-white transition hover:bg-rose-700 disabled:opacity-60"
        >
          {pending ? "Excluindo…" : `Excluir ${nome}`}
        </button>
        <button
          onClick={() => setConfirmando(false)}
          className="rounded-lg px-2 py-1 text-xs text-stone-500 hover:bg-stone-100"
        >
          Cancelar
        </button>
      </span>
    );
  }

  return (
    <span className="flex items-center gap-2">
      <button
        onClick={() => setConfirmando(true)}
        className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-rose-600 transition hover:bg-rose-50"
      >
        <Trash2 size={13} /> Excluir
      </button>
      {erro && <span className="text-[11px] text-rose-500">{erro}</span>}
    </span>
  );
}
