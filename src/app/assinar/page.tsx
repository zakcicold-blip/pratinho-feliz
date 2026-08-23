import { redirect } from "next/navigation";
import { Check, ShieldCheck, CalendarClock, CreditCard } from "lucide-react";
import { requireSession } from "@/lib/currentChild";
import { podeAcessarApp, reconciliarAssinatura } from "@/lib/assinatura";
import { DIAS_TESTE_GRATIS } from "@/lib/stripe";
import { signOutAction } from "@/lib/actions/auth-signout";
import IniciarTrialButton from "./IniciarTrialButton";
import PreviaDoPlano from "./PreviaDoPlano";

export default async function AssinarPage({
  searchParams,
}: {
  searchParams: Promise<{
    sucesso?: string;
    cancelado?: string;
    erro?: string;
    plano?: string;
    eid?: string;
  }>;
}) {
  const session = await requireSession();
  const { sucesso, cancelado, erro, plano, eid } = await searchParams;

  // Já tem acesso? Não faz sentido ficar no paywall.
  if (await podeAcessarApp(session.user.id)) redirect("/hoje");

  // Voltou do Checkout: concilia na hora, sem esperar o webhook, e segue para
  // /hoje com o marcador que dispara o StartTrial no Meta Pixel (mesmo event_id
  // do CAPI, para deduplicar).
  if (sucesso) {
    if (await reconciliarAssinatura(session.user.id)) {
      const planoParam = plano === "TRIMESTRAL" ? "TRIMESTRAL" : "MENSAL";
      const eidParam = eid ? `&eid=${encodeURIComponent(eid)}` : "";
      redirect(`/hoje?assinatura=ok&plano=${planoParam}${eidParam}`);
    }
  }

  const beneficios = [
    "Cardápio de 30 dias que se adapta ao sono, à rotina e aos gostos da criança",
    "Troca de qualquer refeição e opções com o que você tem em casa",
    "Lista de compras automática e nutrição real por porção (base TACO)",
    "Vários filhos no mesmo perfil, cada um com seu plano",
  ];

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-lg flex-col justify-center px-5 py-10">
      {/* Mostra o que ja foi montado antes de pedir o cartao. */}
      <PreviaDoPlano userId={session.user.id} />

      <div className="rounded-3xl border border-stone-200/70 bg-white p-6 shadow-card">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-600">
          <CalendarClock size={14} /> {DIAS_TESTE_GRATIS} dias grátis
        </span>

        <h1 className="mt-4 text-2xl font-bold text-stone-800">
          Libere o plano por {DIAS_TESTE_GRATIS} dias grátis
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-stone-500">
          Para abrir o cardápio completo, adicione uma forma de pagamento. Você não é cobrado agora
          — só depois de {DIAS_TESTE_GRATIS} dias, e pode cancelar antes disso quando quiser.
        </p>

        {cancelado && (
          <p className="mt-4 rounded-xl bg-amber-50 px-3 py-2 text-[13px] text-amber-800">
            Você saiu do checkout antes de concluir. Pode tentar de novo quando quiser.
          </p>
        )}
        {sucesso && (
          <p className="mt-4 rounded-xl bg-amber-50 px-3 py-2 text-[13px] text-amber-800">
            Recebemos seu pagamento e estamos confirmando com o Stripe. Se esta tela não avançar em
            alguns segundos, recarregue a página.
          </p>
        )}
        {erro && (
          <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-[13px] text-red-700">{erro}</p>
        )}

        <ul className="mt-5 space-y-2.5">
          {beneficios.map((b) => (
            <li key={b} className="flex items-start gap-2.5 text-sm text-stone-600">
              <Check size={17} className="mt-0.5 shrink-0 text-emerald-500" />
              {b}
            </li>
          ))}
        </ul>

        <div className="mt-6">
          <IniciarTrialButton />
        </div>

        <div className="mt-4 flex items-center justify-center gap-4 text-[11px] text-stone-400">
          <span className="flex items-center gap-1">
            <ShieldCheck size={13} /> Pagamento seguro via Stripe
          </span>
          <span className="flex items-center gap-1">
            <CreditCard size={13} /> Cancele quando quiser
          </span>
        </div>
      </div>

      <form action={signOutAction} className="mt-6 text-center">
        <button type="submit" className="text-sm text-stone-400 underline-offset-2 hover:underline">
          Sair da conta
        </button>
      </form>
    </main>
  );
}
