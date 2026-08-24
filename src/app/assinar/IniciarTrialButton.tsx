"use client";

import { useRef } from "react";
import { useFormStatus } from "react-dom";
import { ArrowRight, Lock } from "lucide-react";
import { irParaCheckout } from "@/lib/actions/billing";
import { trackPixel } from "@/lib/fbpixel";

function BotaoPrincipal() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-orange-600 disabled:opacity-60"
    >
      {pending ? "Abrindo o ambiente seguro..." : "Começar os 7 dias grátis"}
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
        {pending ? "Abrindo o ambiente seguro..." : "Prefiro o trimestral — R$ 59,90"}
      </span>
      <span className="text-[11px] text-stone-400">3 meses pelo preço de 2 · também com 7 dias grátis</span>
    </button>
  );
}

/**
 * Os dois caminhos para o checkout do teste gratis.
 *
 * O InitiateCheckout sai em duas vias: aqui no navegador e, no servidor, dentro
 * da propria action — as duas com o mesmo eventId, que a Meta usa para
 * deduplicar. Antes so existia a via do navegador, e ela se perdia quando o
 * pixel ainda nao tinha carregado no momento do clique.
 */
export default function IniciarTrialButton() {
  const eventoMensal = useRef<HTMLInputElement>(null);
  const eventoTrimestral = useRef<HTMLInputElement>(null);

  function marcarInicio(campo: React.RefObject<HTMLInputElement | null>, valor: number, plano: string) {
    const eventId = crypto.randomUUID();
    if (campo.current) campo.current.value = eventId;
    trackPixel(
      "InitiateCheckout",
      { value: valor, currency: "BRL", content_name: `Teste 7 dias · ${plano}` },
      { eventID: eventId },
    );
  }

  return (
    <div className="space-y-2.5">
      <form
        action={irParaCheckout.bind(null, "MENSAL")}
        onSubmit={() => marcarInicio(eventoMensal, 29.9, "MENSAL")}
      >
        <input ref={eventoMensal} type="hidden" name="eventId" />
        <BotaoPrincipal />
      </form>
      <form
        action={irParaCheckout.bind(null, "TRIMESTRAL")}
        onSubmit={() => marcarInicio(eventoTrimestral, 59.9, "TRIMESTRAL")}
      >
        <input ref={eventoTrimestral} type="hidden" name="eventId" />
        <BotaoSecundario />
      </form>
      <p className="flex items-center justify-center gap-1.5 pt-1 text-center text-[11px] text-stone-400">
        <Lock size={12} /> Seus dados de pagamento vão direto para o Stripe. Nós não vemos e não
        guardamos o número do seu cartão.
      </p>
    </div>
  );
}
