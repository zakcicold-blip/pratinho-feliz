import Link from "next/link";
import { UtensilsCrossed, type LucideIcon } from "lucide-react";

/**
 * Tela cheia de erro/404, no visual do app.
 * Serve tanto para o site público quanto para as áreas logadas — por isso não
 * depende de sessão nem de perfil de criança.
 */
export default function TelaDeAviso({
  icon: Icon,
  titulo,
  texto,
  children,
}: {
  icon: LucideIcon;
  titulo: string;
  texto: string;
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#fdfaf6] px-6 py-12 text-center">
      <div className="flex items-center gap-2 text-base font-bold text-stone-800">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500 text-white">
          <UtensilsCrossed size={16} />
        </span>
        Pratinho Feliz
      </div>

      <span className="mt-10 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
        <Icon size={30} strokeWidth={1.7} />
      </span>

      <h1 className="font-display mt-5 max-w-sm text-2xl leading-tight font-extrabold text-balance text-stone-900">
        {titulo}
      </h1>
      <p className="mt-3 max-w-sm text-[0.97rem] leading-relaxed text-stone-600">{texto}</p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">{children}</div>

      <p className="mt-10 max-w-xs text-xs leading-relaxed text-stone-400">
        Se continuar acontecendo, fale com a gente — a gente resolve.
      </p>
    </main>
  );
}

export function BotaoPrimario({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-sm shadow-orange-900/20 transition hover:bg-orange-600"
    >
      {children}
    </Link>
  );
}

export function BotaoSecundario({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-full border border-stone-200 bg-white px-6 py-3 text-sm font-semibold text-stone-600 transition hover:border-stone-300 hover:text-stone-800"
    >
      {children}
    </Link>
  );
}
