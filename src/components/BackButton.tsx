"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

/** Volta para a tela anterior. Some no primeiro carregamento sem histórico. */
export default function BackButton({ fallback = "/hoje" }: { fallback?: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      aria-label="Voltar"
      onClick={() => {
        if (window.history.length > 1) router.back();
        else router.push(fallback);
      }}
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-stone-200 bg-white text-stone-600 transition active:scale-95 hover:bg-stone-50"
    >
      <ChevronLeft size={18} />
    </button>
  );
}
