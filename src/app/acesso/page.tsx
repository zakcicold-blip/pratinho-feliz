import Link from "next/link";
import { redirect } from "next/navigation";
import { UtensilsCrossed, CircleCheck } from "lucide-react";
import { auth } from "@/auth";
import FormAcesso from "./FormAcesso";

export const metadata = {
  title: "Criar seu acesso · Pratinho Feliz",
  robots: { index: false, follow: false },
};

/**
 * Pagina de retorno do checkout da Cakto.
 *
 * E o endereco configurado como redirecionamento pos-compra no painel deles.
 * Quem chega aqui pagou, mas ainda nao tem conta: o webhook registrou a compra
 * e aqui ela vira acesso.
 */
export default async function AcessoPage() {
  const session = await auth();
  if (session?.user) redirect("/hoje");

  return (
    <main className="flex min-h-screen flex-col bg-[#fdfaf6]">
      <header className="mx-auto flex w-full max-w-md items-center gap-2 px-6 py-6 text-base font-bold text-stone-800">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500 text-white">
          <UtensilsCrossed size={16} />
        </span>
        Pratinho Feliz
      </header>

      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 pb-12">
        <div className="mb-6 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <CircleCheck size={28} />
          </span>
          <h1 className="font-display mt-4 text-2xl font-extrabold text-stone-900">
            Pagamento confirmado
          </h1>
          <p className="mt-2 text-sm text-stone-500">
            Falta só criar sua senha. Use o mesmo e-mail que você informou no pagamento.
          </p>
        </div>

        <FormAcesso />

        <p className="mt-6 text-center text-sm text-stone-500">
          Já criou sua conta?{" "}
          <Link href="/login" className="font-semibold text-orange-600 hover:underline">
            Entrar
          </Link>
        </p>
        <p className="mt-3 text-center text-xs leading-snug text-stone-400">
          A confirmação do pagamento pode levar alguns segundos para chegar. Se der erro logo depois
          de pagar, espere um pouco e tente de novo.
        </p>
      </div>
    </main>
  );
}
