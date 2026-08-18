"use client";

import { useFormStatus } from "react-dom";
import { ArrowRight } from "lucide-react";
import { irParaCheckout } from "@/lib/actions/billing";

function Botao() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 py-3 text-sm font-semibold text-white transition-colors hover:bg-orange-600 disabled:opacity-60"
    >
      {pending ? "Abrindo checkout..." : "Adicionar forma de pagamento"}
      {!pending && <ArrowRight size={16} />}
    </button>
  );
}

export default function IniciarTrialButton() {
  return (
    <form action={irParaCheckout}>
      <Botao />
    </form>
  );
}
