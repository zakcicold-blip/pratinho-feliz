import Link from "next/link";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { UtensilsCrossed, CircleCheck, Clock } from "lucide-react";
import DefinirSenhaForm from "./DefinirSenhaForm";

export default async function BemVindoPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;

  let sessao: Stripe.Checkout.Session | null = null;
  if (session_id) {
    try {
      sessao = await getStripe().checkout.sessions.retrieve(session_id);
    } catch {
      sessao = null;
    }
  }

  const pago = !!sessao && (sessao.payment_status === "paid" || sessao.status === "complete");
  const email = sessao?.customer_details?.email ?? "";

  return (
    <main className="flex min-h-screen flex-1 flex-col bg-[#fdfaf6]">
      <header className="mx-auto flex w-full max-w-md items-center gap-2 px-6 py-6 text-base font-bold text-stone-800">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500 text-white">
          <UtensilsCrossed size={16} />
        </span>
        Pratinho Feliz
      </header>

      <div className="mx-auto w-full max-w-md flex-1 px-6 pb-16">
        {!session_id || !sessao ? (
          <Estado
            icon={Clock}
            titulo="Página de acesso"
            texto="Não encontramos os dados do pagamento. Se você acabou de pagar, volte pelo link de sucesso do checkout."
          >
            <Link href="/" className="text-sm font-semibold text-orange-600 hover:underline">
              Voltar para a oferta
            </Link>
          </Estado>
        ) : !pago ? (
          <Estado
            icon={Clock}
            titulo="Confirmando seu pagamento…"
            texto="Isso costuma levar só alguns segundos. Recarregue a página em instantes para liberar o acesso."
          />
        ) : (
          <>
            <div className="mb-6 text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <CircleCheck size={28} />
              </span>
              <h1 className="font-display mt-4 text-2xl font-bold text-stone-900">Pagamento confirmado!</h1>
              <p className="mt-2 text-sm text-stone-600">
                Falta só criar sua senha para entrar no app.
              </p>
            </div>
            <DefinirSenhaForm sessionId={session_id} email={email} />
          </>
        )}
      </div>
    </main>
  );
}

function Estado({
  icon: Icon,
  titulo,
  texto,
  children,
}: {
  icon: typeof Clock;
  titulo: string;
  texto: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-stone-200/60 bg-white p-6 text-center shadow-card">
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-stone-100 text-stone-500">
        <Icon size={22} />
      </span>
      <h1 className="font-display mt-3 text-lg font-bold text-stone-900">{titulo}</h1>
      <p className="mt-2 text-sm text-stone-600">{texto}</p>
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}
