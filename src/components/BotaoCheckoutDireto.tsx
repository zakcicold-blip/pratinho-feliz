"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/cn";
import { trackPixel } from "@/lib/fbpixel";
import { registrarInicioCheckout } from "@/lib/actions/checkoutDireto";
import { CHECKOUT_CAKTO, VALOR_PLANO, type PlanoCheckout } from "@/lib/checkoutLinks";

/**
 * CTA que sai do site direto para o checkout da Cakto.
 *
 * Existe separado do botao dos cards de plano porque aparece em contexto
 * variado — hero, fechamento, blog — e precisa de tamanhos e cores diferentes.
 * O que os dois tem em comum, e o que importa aqui, e disparar o
 * InitiateCheckout (pixel + Conversions API, mesmo eventId) ANTES de navegar:
 * depois do window.location a pagina ja e da Cakto e nao da mais para medir.
 */
export default function BotaoCheckoutDireto({
  rotulo,
  plano = "MENSAL",
  variante = "principal",
  className,
  comSeta = true,
}: {
  rotulo: string;
  plano?: PlanoCheckout;
  variante?: "principal" | "contorno" | "claro";
  className?: string;
  comSeta?: boolean;
}) {
  const [saindo, setSaindo] = useState(false);

  function ir() {
    if (saindo) return;
    setSaindo(true);

    const eventId = crypto.randomUUID();
    trackPixel(
      "InitiateCheckout",
      { value: VALOR_PLANO[plano], currency: "BRL", content_name: `Plano ${plano}` },
      { eventID: eventId },
    );
    void registrarInicioCheckout(plano, eventId);

    window.location.href = CHECKOUT_CAKTO[plano];
  }

  const estilos = {
    principal:
      "bg-orange-500 text-white shadow-sm shadow-orange-900/20 hover:bg-orange-600",
    contorno:
      "border border-stone-300 bg-white/70 text-stone-700 hover:border-stone-400 hover:bg-white",
    claro: "border border-white/25 text-white hover:bg-white/10",
  }[variante];

  return (
    <button
      type="button"
      onClick={ir}
      disabled={saindo}
      className={cn(
        "flex items-center gap-1.5 rounded-full px-6 py-3.5 font-semibold transition disabled:opacity-70",
        estilos,
        className,
      )}
    >
      {saindo ? "Abrindo o pagamento…" : rotulo}
      {!saindo && comSeta && <ArrowRight size={16} />}
    </button>
  );
}
