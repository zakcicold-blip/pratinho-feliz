import Link from "next/link";
import { UtensilsCrossed } from "lucide-react";
import UserMenu from "@/components/UserMenu";

export default function TopBar({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}) {
  return (
    <header className="sticky top-0 z-10 bg-[#fdfaf6]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 pb-3 pt-4">
        <Link
          href="/hoje"
          aria-label="Início"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-500 text-white shadow-sm shadow-orange-900/20 transition active:scale-95"
        >
          <UtensilsCrossed size={16} />
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-bold leading-tight text-stone-900">{title}</h1>
          {subtitle && <p className="truncate text-xs text-stone-500">{subtitle}</p>}
        </div>
        {right}
        <UserMenu />
      </div>
    </header>
  );
}
