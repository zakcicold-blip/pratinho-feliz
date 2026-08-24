"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

const ITEMS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/receitas", label: "Receitas" },
  { href: "/admin/ingredientes", label: "Ingredientes" },
  { href: "/admin/usuarios", label: "Usuários" },
  { href: "/admin/cancelamentos", label: "Cancelamentos" },
  { href: "/admin/convites", label: "Convites" },
  { href: "/admin/videos", label: "Vídeos" },
  { href: "/admin/heatmap", label: "Mapa de calor" },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 text-sm font-medium text-stone-600">
      {ITEMS.map((item) => {
        const active = item.href === "/admin" ? pathname === "/admin" : pathname?.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "rounded-lg px-3 py-1.5 transition",
              active ? "bg-orange-50 text-orange-600" : "hover:bg-stone-100"
            )}
          >
            {item.label}
          </Link>
        );
      })}
      <Link href="/hoje" className="rounded-lg px-3 py-1.5 text-stone-400 hover:bg-stone-100">
        Voltar ao app
      </Link>
    </nav>
  );
}
