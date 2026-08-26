import Link from "next/link";
import { UtensilsCrossed } from "lucide-react";
import { requireParceira } from "@/lib/parceiraSessao";
import ParceiraNav from "./ParceiraNav";

/**
 * Casca do painel da parceira.
 *
 * Visual proximo do backoffice de proposito — e o mesmo tipo de tela, de
 * trabalho — mas com a marca dela em cima e sem nenhum atalho para o admin.
 */
export const metadata = { title: "Painel da parceira" };

export default async function ParceiraLayout({ children }: { children: React.ReactNode }) {
  const { parceira } = await requireParceira();

  return (
    <div className="min-h-screen bg-stone-100">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-6 py-4">
          <Link href="/parceira" className="flex items-center gap-2 font-bold text-stone-800">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-500 text-white">
              <UtensilsCrossed size={14} />
            </span>
            Parceiras · {parceira.nome}
          </Link>
          <ParceiraNav />
        </div>
      </header>

      {!parceira.ativa && (
        <div className="border-b border-amber-200 bg-amber-50">
          <p className="mx-auto max-w-5xl px-6 py-3 text-sm text-amber-800">
            Sua parceria está pausada. Os links existentes pararam de contar indicações novas — o
            que já foi indicado continua valendo. Fale com a gente para reativar.
          </p>
        </div>
      )}

      <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
    </div>
  );
}
