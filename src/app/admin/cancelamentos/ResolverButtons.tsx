"use client";

import { useState, useTransition } from "react";
import { Check, X } from "lucide-react";
import { resolverCancelamento } from "@/lib/actions/suporte";

export default function ResolverButtons({ id }: { id: string }) {
  const [resposta, setResposta] = useState("");
  const [salvando, startTransition] = useTransition();

  function resolver(aprovar: boolean) {
    startTransition(async () => {
      await resolverCancelamento(id, aprovar, resposta);
    });
  }

  return (
    <div className="mt-3 space-y-2">
      <input
        value={resposta}
        onChange={(e) => setResposta(e.target.value)}
        maxLength={1000}
        placeholder="Resposta interna (opcional)"
        className="w-full rounded-lg border border-stone-200 px-3 py-1.5 text-sm outline-none focus:border-orange-300"
      />
      <div className="flex gap-2">
        <button
          onClick={() => resolver(true)}
          disabled={salvando}
          className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-40"
        >
          <Check size={15} /> Aprovar e agendar cancelamento no Stripe
        </button>
        <button
          onClick={() => resolver(false)}
          disabled={salvando}
          className="flex items-center gap-1.5 rounded-lg bg-stone-100 px-3 py-1.5 text-sm font-medium text-stone-600 disabled:opacity-40"
        >
          <X size={15} /> Recusar
        </button>
      </div>
    </div>
  );
}
