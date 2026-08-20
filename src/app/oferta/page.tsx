import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { irParaCheckoutDireto } from "@/lib/actions/checkoutDireto";
import { UtensilsCrossed, Check, ArrowRight, ShieldCheck, Zap } from "lucide-react";

export default async function OfertaPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string; cancelado?: string }>;
}) {
  const { erro, cancelado } = await searchParams;
  const session = await auth();
  if (session?.user) redirect("/hoje");

  return (
    <main className="flex-1 overflow-x-hidden bg-[#fdfaf6]">
      <header className="mx-auto flex w-full max-w-3xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2 text-base font-bold text-stone-800">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500 text-white">
            <UtensilsCrossed size={16} />
          </span>
          Pratinho Feliz
        </div>
        <Link href="/login" className="text-sm font-medium text-stone-600 hover:text-stone-900">
          Já sou membro
        </Link>
      </header>

      <div className="mx-auto w-full max-w-3xl px-6 pb-16 pt-6">
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-600">
            <Zap size={13} /> Acesso imediato
          </span>
          <h1 className="font-display mt-4 text-[2rem] font-extrabold leading-[1.1] text-stone-900 md:text-[2.75rem]">
            Pague e libere o app do seu filho <span className="text-orange-500">na hora.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-stone-600">
            30 dias de refeições pela idade, nutrição e lista de compras — sem espera. Assine, defina
            sua senha e comece a usar em minutos.
          </p>
        </div>

        {(erro || cancelado) && (
          <p className="mx-auto mt-6 max-w-md rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm text-amber-800">
            {cancelado ? "Pagamento não concluído. Você pode tentar de novo quando quiser." : erro}
          </p>
        )}

        {/* Planos */}
        <div className="mx-auto mt-10 grid max-w-2xl gap-4 sm:grid-cols-2">
          <PlanoCard
            nome="Mensal"
            preco="R$ 29,90"
            periodo="por mês"
            plano="MENSAL"
            destaque={false}
          />
          <PlanoCard
            nome="Trimestral"
            preco="R$ 59,90"
            periodo="a cada 3 meses"
            selo="3 meses pelo preço de 2"
            plano="TRIMESTRAL"
            destaque
          />
        </div>

        {/* Reforços */}
        <ul className="mx-auto mt-8 flex max-w-xl flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-stone-500">
          <li className="flex items-center gap-1.5"><Check size={15} className="text-emerald-500" /> Acesso liberado após o pagamento</li>
          <li className="flex items-center gap-1.5"><Check size={15} className="text-emerald-500" /> Cancele quando quiser</li>
          <li className="flex items-center gap-1.5"><ShieldCheck size={15} className="text-emerald-500" /> Pagamento seguro via Stripe</li>
        </ul>

        <p className="mt-8 text-center text-xs text-stone-400">
          Prefere testar antes?{" "}
          <Link href="/cadastro" className="font-semibold text-orange-600 hover:underline">
            Comece com 7 dias grátis
          </Link>
          .
        </p>
      </div>
    </main>
  );
}

function PlanoCard({
  nome,
  preco,
  periodo,
  selo,
  plano,
  destaque,
}: {
  nome: string;
  preco: string;
  periodo: string;
  selo?: string;
  plano: "MENSAL" | "TRIMESTRAL";
  destaque: boolean;
}) {
  return (
    <form
      action={irParaCheckoutDireto.bind(null, plano)}
      className={`relative flex flex-col rounded-3xl border bg-white p-6 shadow-card ${
        destaque ? "border-orange-300 ring-1 ring-orange-200" : "border-stone-200/60"
      }`}
    >
      {selo && (
        <span className="absolute -top-3 right-5 rounded-full bg-orange-500 px-3 py-1 text-[11px] font-semibold text-white">
          {selo}
        </span>
      )}
      <div className="text-sm font-semibold text-stone-500">{nome}</div>
      <div className="mt-1 flex items-baseline gap-1">
        <span className="font-display text-3xl font-extrabold text-stone-900">{preco}</span>
        <span className="text-sm text-stone-400">{periodo}</span>
      </div>
      <button
        type="submit"
        className={`mt-5 flex items-center justify-center gap-2 rounded-full py-3.5 text-sm font-semibold transition active:scale-[0.98] ${
          destaque
            ? "bg-orange-500 text-white hover:bg-orange-600"
            : "bg-stone-900 text-white hover:bg-stone-800"
        }`}
      >
        Assinar e acessar <ArrowRight size={16} />
      </button>
    </form>
  );
}
