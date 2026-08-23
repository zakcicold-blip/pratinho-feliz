"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { Settings, Home, LogOut, EllipsisVertical } from "lucide-react";
import { signOutAction } from "@/lib/actions/auth-signout";
import { limparCacheDoApp } from "@/components/RegistrarServiceWorker";

export default function UserMenu() {
  const [aberto, setAberto] = useState(false);
  const [pending, startTransition] = useTransition();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!aberto) return;

    function onPointerDown(e: MouseEvent | TouchEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setAberto(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setAberto(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [aberto]);

  return (
    <div className="relative shrink-0" ref={ref}>
      <button
        onClick={() => setAberto((v) => !v)}
        aria-label="Menu da conta"
        aria-expanded={aberto}
        className="flex h-9 w-9 items-center justify-center rounded-xl border border-stone-200/70 bg-white text-stone-500 transition hover:text-stone-800 active:scale-95"
      >
        <EllipsisVertical size={17} />
      </button>

      {aberto && (
        <div className="animate-fade-in absolute right-0 z-30 mt-1.5 w-52 rounded-xl border border-stone-200 bg-white p-1 shadow-card-lg">
          <Link
            href="/configuracoes"
            onClick={() => setAberto(false)}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-stone-700 hover:bg-stone-50"
          >
            <Settings size={15} className="text-stone-400" /> Configurações
          </Link>
          <Link
            href="/?site=1"
            onClick={() => setAberto(false)}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-stone-700 hover:bg-stone-50"
          >
            <Home size={15} className="text-stone-400" /> Página inicial
          </Link>
          <div className="my-1 border-t border-stone-100" />
          <button
            onClick={() => {
              setAberto(false);
              limparCacheDoApp();
              startTransition(() => signOutAction());
            }}
            disabled={pending}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
          >
            <LogOut size={15} /> {pending ? "Saindo..." : "Sair da conta"}
          </button>
        </div>
      )}
    </div>
  );
}
