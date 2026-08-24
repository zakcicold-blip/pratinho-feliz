"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/cn";
import { trackPixel } from "@/lib/fbpixel";
import { registrarInicioCheckout } from "@/lib/actions/checkoutDireto";
import { CHECKOUT_CAKTO, VALOR_PLANO, type PlanoCheckout } from "@/lib/checkoutLinks";

/**
 * Botao que leva ao checkout da Cakto.
 *
 * O checkout mora fora do nosso dominio, entao o InitiateCheckout precisa sair
 * antes da navegacao. Sai em duas vias com o mesmo eventId — pixel aqui e
 * Conversions API no servidor — porque a via do navegador se perde com
 * bloqueador de anuncio ou quando a aba troca rapido demais.
 */
export default function BotaoAssinar({
  plano,
  destaque,
}: {
  plano: PlanoCheckout;
  destaque: boolean;
}) {
  const [saindo, setSaindo] = useState(false);

  async function irParaCheckout() {
    if (saindo) return;
    setSaindo(true);

    const eventId = crypto.randomUUID();
    trackPixel(
      "InitiateCheckout",
      { value: VALOR_PLANO[plano], currency: "BRL", content_name: `Plano ${plano}` },
      { eventID: eventId },
    );
    // Não trava a ida ao checkout se o evento do servidor demorar.
    void registrarInicioCheckout(plano, eventId);

    window.location.href = CHECKOUT_CAKTO[plano];
  }

  return (
    <button
      type="button"
      onClick={irParaCheckout}
      disabled={saindo}
      className={cn(
        "mt-5 flex items-center justify-center gap-2 rounded-full py-3.5 text-sm font-semibold transition active:scale-[0.98] disabled:opacity-70",
        destaque
          ? "bg-orange-500 text-white hover:bg-orange-600"
          : "bg-stone-900 text-white hover:bg-stone-800",
      )}
    >
      {saindo ? "Abrindo o pagamento…" : "Assinar e acessar"}
      {!saindo && <ArrowRight size={16} />}
    </button>
  );
}
