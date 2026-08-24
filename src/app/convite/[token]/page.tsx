import Link from "next/link";
import { redirect } from "next/navigation";
import { UtensilsCrossed, Gift, TriangleAlert } from "lucide-react";
import { auth } from "@/auth";
import { buscarConvite, RECUSA_LABEL } from "@/lib/convites";
import FormConvite from "./FormConvite";

export const metadata = {
  title: "Seu convite · Pratinho Feliz",
  // Convite e link privado: nao deve aparecer em busca nem ser rastreado.
  robots: { index: false, follow: false },
};

export default async function ConvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const session = await auth();
  if (session?.user) redirect("/hoje");

  const validacao = await buscarConvite(token);

  return (
    <main className="flex min-h-screen flex-col bg-[#fdfaf6]">
      <header className="mx-auto flex w-full max-w-md items-center gap-2 px-6 py-6 text-base font-bold text-stone-800">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500 text-white">
          <UtensilsCrossed size={16} />
        </span>
        Pratinho Feliz
      </header>

      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 pb-12">
        {!validacao.ok ? (
          <div className="rounded-3xl border border-stone-200/60 bg-white p-6 text-center shadow-card">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-600">
              <TriangleAlert size={22} />
            </span>
            <h1 className="font-display mt-3 text-xl font-bold text-stone-900">Convite indisponível</h1>
            <p className="mt-2 text-sm text-stone-600">{RECUSA_LABEL[validacao.motivo]}</p>
            <Link
              href="/"
              className="mt-5 inline-block text-sm font-semibold text-orange-600 hover:underline"
            >
              Conhecer o Pratinho Feliz
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-6 text-center">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                <Gift size={13} /> Acesso de cortesia
              </span>
              <h1 className="font-display mt-3 text-3xl font-extrabold leading-tight text-stone-900">
                Seu acesso está liberado
              </h1>
              <p className="mt-2 text-sm text-stone-500">
                Crie sua conta abaixo. Não pedimos cartão e não há cobrança.
              </p>
            </div>
            <FormConvite token={validacao.convite.token} />
            <p className="mt-6 text-center text-sm text-stone-500">
              Já tem conta?{" "}
              <Link href="/login" className="font-semibold text-orange-600 hover:underline">
                Entrar
              </Link>
            </p>
          </>
        )}
      </div>
    </main>
  );
}
