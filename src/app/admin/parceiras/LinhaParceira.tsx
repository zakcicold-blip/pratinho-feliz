"use client";

import { useActionState, useTransition } from "react";
import { Power } from "lucide-react";
import { ajustarComissao, alternarParceira } from "@/lib/actions/adminParceiras";

/** Os dois controles que o admin usa numa parceira: percentual e liga/desliga. */
export default function LinhaParceira({
  parceiraId,
  comissaoPct,
  ativa,
  nome,
}: {
  parceiraId: string;
  comissaoPct: number;
  ativa: boolean;
  nome: string;
}) {
  const [estado, acao, salvando] = useActionState(ajustarComissao, undefined);
  const [alternando, iniciar] = useTransition();

  return (
    <div className="flex flex-wrap items-center gap-2">
      <form action={acao} className="flex items-center gap-1.5">
        <input type="hidden" name="parceiraId" value={parceiraId} />
        <input
          name="comissaoPct"
          type="number"
          step="1"
          min="0"
          max="80"
          defaultValue={comissaoPct}
          aria-label={`Comissão de ${nome}`}
          className="w-16 rounded-lg border border-stone-200 px-2 py-1.5 text-sm text-stone-800 outline-none focus:border-orange-400"
        />
        <span className="text-sm text-stone-400">%</span>
        <button
          type="submit"
          disabled={salvando}
          className="rounded-lg border border-stone-200 px-2.5 py-1.5 text-xs font-semibold text-stone-600 transition hover:bg-stone-50 disabled:opacity-60"
        >
          {salvando ? "…" : "Salvar"}
        </button>
      </form>

      <button
        type="button"
        disabled={alternando}
        onClick={() => iniciar(async () => void (await alternarParceira(parceiraId)))}
        className="flex items-center gap-1.5 rounded-lg border border-stone-200 px-2.5 py-1.5 text-xs font-semibold text-stone-600 transition hover:bg-stone-50 disabled:opacity-60"
      >
        <Power size={13} /> {ativa ? "Pausar" : "Reativar"}
      </button>

      {estado?.error && <span className="text-xs text-rose-600">{estado.error}</span>}
    </div>
  );
}
