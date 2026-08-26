"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

const ITEMS = [
  { href: "/parceira", label: "Painel" },
  { href: "/parceira/links", label: "Meus links" },
  { href: "/parceira/indicacoes", label: "Indicações" },
  { href: "/parceira/pagamentos", label: "Pagamentos" },
];

export default function ParceiraNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 text-sm font-medium text-stone-600">
      {ITEMS.map((item) => {
        const ativo =
          item.href === "/parceira" ? pathname === "/parceira" : pathname?.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "rounded-lg px-3 py-1.5 transition",
              ativo ? "bg-orange-50 text-orange-600" : "hover:bg-stone-100",
            )}
          >
            {item.label}
          </Link>
        );
      })}
      <Link href="/hoje" className="rounded-lg px-3 py-1.5 text-stone-400 hover:bg-stone-100">
        Ir ao app
      </Link>
    </nav>
  );
}
