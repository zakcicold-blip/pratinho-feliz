"use client";

import { useRef } from "react";
import { useFormStatus } from "react-dom";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/cn";
import { trackPixel } from "@/lib/fbpixel";

/**
 * Botao que leva ao Stripe — e o ponto onde nasce o InitiateCheckout.
 *
 * O envio do formulario e uma server action que redireciona para fora do site,
 * entao o evento precisa sair ANTES da navegacao. O mesmo eventId vai no campo
 * escondido: o servidor manda o gemeo pela Conversions API e a Meta junta os
 * dois pelo id, em vez de contar dois checkouts.
 */
export default function BotaoAssinar({
  plano,
  valor,
  destaque,
}: {
  plano: "MENSAL" | "TRIMESTRAL";
  valor: number;
  destaque: boolean;
}) {
  const campoEventId = useRef<HTMLInputElement>(null);
  const { pending } = useFormStatus();

  function aoClicar() {
    const eventId = crypto.randomUUID();
    if (campoEventId.current) campoEventId.current.value = eventId;
    trackPixel(
      "InitiateCheckout",
      { value: valor, currency: "BRL", content_name: `Plano ${plano}` },
      { eventID: eventId },
    );
  }

  return (
    <>
      <input ref={campoEventId} type="hidden" name="eventId" />
      <button
        type="submit"
        onClick={aoClicar}
        disabled={pending}
        className={cn(
          "mt-5 flex items-center justify-center gap-2 rounded-full py-3.5 text-sm font-semibold transition active:scale-[0.98] disabled:opacity-70",
          destaque
            ? "bg-orange-500 text-white hover:bg-orange-600"
            : "bg-stone-900 text-white hover:bg-stone-800",
        )}
      >
        {pending ? "Abrindo o pagamento…" : "Assinar e acessar"}
        {!pending && <ArrowRight size={16} />}
      </button>
    </>
  );
}
