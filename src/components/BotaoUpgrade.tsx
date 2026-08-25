"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/cn";
import { trackPixel } from "@/lib/fbpixel";
import { registrarInicioCheckout } from "@/lib/actions/checkoutDireto";
import { VALOR_PLANO, type PlanoCheckout } from "@/lib/checkoutLinks";

/**
 * Botao de upgrade de dentro do app.
 *
 * Recebe a URL pronta (montada no servidor por linkDeUpgrade, com e-mail e
 * nome da conta ja preenchidos) porque e isso que faz o webhook reconhecer a
 * compra: ele casa pagamento e conta pelo e-mail.
 */
export default function BotaoUpgrade({
  url,
  plano = "MENSAL",
  rotulo = "Liberar tudo por R$ 29,90",
  variante = "principal",
  className,
}: {
  url: string;
  plano?: PlanoCheckout;
  rotulo?: string;
  variante?: "principal" | "discreto";
  className?: string;
}) {
  const [saindo, setSaindo] = useState(false);

  function ir() {
    if (saindo) return;
    setSaindo(true);

    const eventId = crypto.randomUUID();
    trackPixel(
      "InitiateCheckout",
      { value: VALOR_PLANO[plano], currency: "BRL", content_name: `Upgrade ${plano}` },
      { eventID: eventId },
    );
    void registrarInicioCheckout(plano, eventId);

    window.location.href = url;
  }

  return (
    <button
      type="button"
      onClick={ir}
      disabled={saindo}
      className={cn(
        "flex items-center justify-center gap-2 rounded-full font-semibold transition active:scale-[0.98] disabled:opacity-70",
        variante === "principal"
          ? "bg-orange-500 px-6 py-3.5 text-sm text-white shadow-sm shadow-orange-900/20 hover:bg-orange-600"
          : "border border-stone-300 px-5 py-2.5 text-sm text-stone-700 hover:bg-stone-50",
        className,
      )}
    >
      {saindo ? "Abrindo o pagamento…" : rotulo}
      {!saindo && variante === "principal" && <ArrowRight size={16} />}
    </button>
  );
}
