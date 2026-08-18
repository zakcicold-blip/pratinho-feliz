"use client";

import { useFormStatus } from "react-dom";
import { ArrowRight } from "lucide-react";
import { irParaCheckout } from "@/lib/actions/billing";

function BotaoPrincipal() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 py-3 text-sm font-semibold text-white transition-colors hover:bg-orange-600 disabled:opacity-60"
    >
      {pending ? "Abrindo checkout..." : "Começar teste grátis de 7 dias"}
      {!pending && <ArrowRight size={16} />}
    </button>
  );
}

function BotaoSecundario() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex w-full flex-col items-center justify-center rounded-xl border border-stone-200 bg-white py-2.5 text-stone-700 transition-colors hover:border-orange-300 disabled:opacity-60"
    >
      <span className="text-sm font-semibold">
        {pending ? "Abrindo checkout..." : "Assinar 3 meses — R$ 59,90"}
      </span>
      <span className="text-[11px] text-stone-400">3 meses pelo preço de 2 · também com 7 dias grátis</span>
    </button>
  );
}

export default function IniciarTrialButton() {
  return (
    <div className="space-y-2.5">
      <form action={irParaCheckout.bind(null, "MENSAL")}>
        <BotaoPrincipal />
      </form>
      <form action={irParaCheckout.bind(null, "TRIMESTRAL")}>
        <BotaoSecundario />
      </form>
    </div>
  );
}
