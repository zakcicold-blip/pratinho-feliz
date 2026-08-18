"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, CalendarDays, Moon, Star, Baby } from "lucide-react";
import { cn } from "@/lib/cn";

const ITEMS = [
  { href: "/hoje", label: "Hoje", Icon: Home },
  { href: "/plano", label: "Plano", Icon: CalendarDays },
  { href: "/rotina", label: "Rotina", Icon: Moon },
  { href: "/favoritos", label: "Favoritos", Icon: Star },
  { href: "/perfil", label: "Perfil", Icon: Baby },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="sticky bottom-0 z-20 px-3 pb-[calc(env(safe-area-inset-bottom)+0.625rem)] pt-1.5">
      <div className="mx-auto flex max-w-2xl items-center justify-between gap-1 rounded-2xl border border-stone-200/70 bg-white/95 p-1.5 shadow-float backdrop-blur-md">
        {ITEMS.map(({ href, label, Icon }) => {
          const active = pathname?.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-1 flex-col items-center gap-0.5 rounded-xl py-1.5 text-[11px] font-medium transition-colors",
                active ? "bg-orange-50 text-orange-600" : "text-stone-400 hover:text-stone-600"
              )}
            >
              <Icon size={19} strokeWidth={active ? 2.3 : 2} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
