import { redirect } from "next/navigation";
import { Check, ShieldCheck, CalendarClock, CreditCard, Lock, PartyPopper } from "lucide-react";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/currentChild";
import { podeAcessarApp, reconciliarAssinatura } from "@/lib/assinatura";
import { DIAS_TESTE_GRATIS } from "@/lib/stripe";
import { signOutAction } from "@/lib/actions/auth-signout";
import { registrarEtapa } from "@/lib/funil";
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

  // Escrito na chave do que a pessoa ja montou no onboarding — nesta altura o
  // plano dela existe, e o cartao so destrava o que ela ja viu.
  void registrarEtapa("paywall_visto", { userId: session.user.id, path: "/assinar" });

  const crianca = await db.childProfile.findFirst({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: { nome: true },
  });
  const primeiroNome = crianca?.nome.trim().split(" ")[0];

  const beneficios = [
    "Cardápio de 30 dias que se adapta ao sono, à rotina e aos gostos da criança",
    "Troca de qualquer refeição e opções com o que você tem em casa",
    "Lista de compras automática e nutrição real por porção (base TACO)",
    "Vários filhos no mesmo perfil, cada um com seu plano",
  ];

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-lg flex-col justify-center px-5 py-10">
      <div className="rounded-3xl border border-stone-200/70 bg-white p-6 shadow-card">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            <PartyPopper size={14} /> Último passo
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-600">
            <CalendarClock size={14} /> {DIAS_TESTE_GRATIS} dias grátis
          </span>
        </div>

        <h1 className="mt-4 text-2xl font-bold text-stone-800">
          {primeiroNome ? `Falta um passo para o cardápio de ${primeiroNome}` : "Falta um passo para abrir seu cardápio"}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-stone-500">
          O plano já está montado e esperando por você. Confirme uma forma de pagamento para abrir
          os 30 dias completos: <strong className="font-semibold text-stone-700">hoje você paga
          R$ 0,00</strong> — o teste roda por {DIAS_TESTE_GRATIS} dias e você decide depois.
        </p>

        {/* As tres duvidas que travam a pessoa nesta tela, respondidas antes do botao. */}
        <ul className="mt-4 space-y-2 rounded-2xl bg-[#fdfaf6] p-4">
          <li className="flex items-start gap-2.5 text-[13px] leading-snug text-stone-600">
            <CalendarClock size={15} className="mt-0.5 shrink-0 text-orange-500" />
            <span>
              <strong className="font-semibold text-stone-800">Nada é cobrado agora.</strong> A
              primeira cobrança só acontece no {DIAS_TESTE_GRATIS}º dia, se você não cancelar antes.
            </span>
          </li>
          <li className="flex items-start gap-2.5 text-[13px] leading-snug text-stone-600">
            <CreditCard size={15} className="mt-0.5 shrink-0 text-orange-500" />
            <span>
              <strong className="font-semibold text-stone-800">Você cancela pelo próprio app</strong>,
              em Configurações, quando quiser — sem ligação e sem falar com vendedor.
            </span>
          </li>
          <li className="flex items-start gap-2.5 text-[13px] leading-snug text-stone-600">
            <ShieldCheck size={15} className="mt-0.5 shrink-0 text-orange-500" />
            <span>
              <strong className="font-semibold text-stone-800">Quem processa é o Stripe</strong>, o
              mesmo sistema de pagamento usado por Amazon e Uber. O cartão é digitado no ambiente
              deles — não passa por nós.
            </span>
          </li>
        </ul>

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

        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-[11px] text-stone-400">
          <span className="flex items-center gap-1">
            <Lock size={13} /> Conexão criptografada
          </span>
          <span className="flex items-center gap-1">
            <ShieldCheck size={13} /> Processado pelo Stripe
          </span>
          <span className="flex items-center gap-1">
            <CreditCard size={13} /> Sem fidelidade
          </span>
        </div>
        <p className="mt-3 text-center text-[11px] leading-snug text-stone-400">
          Pedindo o cancelamento durante o teste, você não é cobrado e mantém o acesso até o fim dos{" "}
          {DIAS_TESTE_GRATIS} dias.
        </p>
      </div>

      {/* Lembrete do que esta do outro lado do cartao. */}
      <div className="mt-6">
        <p className="mb-2.5 text-center text-[13px] font-medium text-stone-500">
          O que já está montado esperando você:
        </p>
        <PreviaDoPlano userId={session.user.id} />
      </div>

      <form action={signOutAction} className="mt-2 text-center">
        <button type="submit" className="text-sm text-stone-400 underline-offset-2 hover:underline">
          Sair da conta
        </button>
      </form>
    </main>
  );
}
