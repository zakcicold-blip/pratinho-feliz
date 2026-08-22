"use client";

import { useState, useTransition } from "react";
import { Gift, X } from "lucide-react";
import { alternarCortesia } from "@/lib/actions/adminUsuarios";

/**
 * Liga/desliga o acesso de cortesia direto na linha do usuário.
 * Ao liberar, permite anotar o motivo (parceria, convidado, imprensa…) —
 * é o que aparece depois na coluna Assinatura e no log de auditoria.
 */
export default function CortesiaButton({
  userId,
  nome,
  liberado,
}: {
  userId: string;
  nome: string;
  liberado: boolean;
}) {
  const [pending, start] = useTransition();
  const [abrindo, setAbrindo] = useState(false);
  const [motivo, setMotivo] = useState("");
  const [erro, setErro] = useState<string | null>(null);

  function aplicar(liberar: boolean) {
    setErro(null);
    start(async () => {
      const r = await alternarCortesia(userId, liberar, motivo);
      if (r?.error) setErro(r.error);
      else {
        setAbrindo(false);
        setMotivo("");
      }
    });
  }

  if (liberado) {
    return (
      <span className="flex items-center gap-2">
        <button
          onClick={() => aplicar(false)}
          disabled={pending}
          className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-stone-500 transition hover:bg-stone-100 disabled:opacity-60"
          title={`Voltar a cobrar de ${nome}`}
        >
          <X size={13} /> {pending ? "Removendo…" : "Remover cortesia"}
        </button>
        {erro && <span className="text-[11px] text-rose-500">{erro}</span>}
      </span>
    );
  }

  if (abrindo) {
    return (
      <span className="flex flex-wrap items-center gap-1.5">
        <input
          autoFocus
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && aplicar(true)}
          maxLength={120}
          placeholder="Motivo (opcional)"
          className="w-36 rounded-lg border border-stone-200 px-2 py-1 text-xs outline-none focus:border-emerald-400"
        />
        <button
          onClick={() => aplicar(true)}
          disabled={pending}
          className="rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
        >
          {pending ? "Liberando…" : "Liberar"}
        </button>
        <button
          onClick={() => {
            setAbrindo(false);
            setErro(null);
          }}
          className="rounded-lg px-2 py-1 text-xs text-stone-500 hover:bg-stone-100"
        >
          Cancelar
        </button>
        {erro && <span className="w-full text-[11px] text-rose-500">{erro}</span>}
      </span>
    );
  }

  return (
    <button
      onClick={() => setAbrindo(true)}
      className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-emerald-700 transition hover:bg-emerald-50"
      title={`Liberar o app para ${nome} sem cobrança`}
    >
      <Gift size={13} /> Liberar acesso
    </button>
  );
}
