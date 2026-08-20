import Link from "next/link";
import { UtensilsCrossed } from "lucide-react";
import UserMenu from "@/components/UserMenu";
import BackButton from "@/components/BackButton";

export default function TopBar({
  title,
  subtitle,
  right,
  back = false,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  /** Mostra o botão "voltar" no lugar do atalho de início (telas de detalhe). */
  back?: boolean;
}) {
  return (
    <header className="sticky top-0 z-10 bg-[#fdfaf6]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 pb-3 pt-4">
        {back ? (
          <BackButton />
        ) : (
          <Link
            href="/hoje"
            aria-label="Início"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-500 text-white shadow-sm shadow-orange-900/20 transition active:scale-95"
          >
            <UtensilsCrossed size={17} />
          </Link>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="font-display truncate text-xl font-semibold leading-tight text-stone-900">
            {title}
          </h1>
          {subtitle && <p className="truncate text-xs text-stone-500">{subtitle}</p>}
        </div>
        {right}
        <UserMenu />
      </div>
    </header>
  );
}
