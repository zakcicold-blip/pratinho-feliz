"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

/** Mostra o link e copia com um clique — e o que o admin faz o tempo todo aqui. */
export default function LinkConvite({ url }: { url: string }) {
  const [copiado, setCopiado] = useState(false);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(url);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // Sem permissao de clipboard: o link fica visivel para copiar na mao.
    }
  }

  return (
    <div className="flex items-center gap-2">
      <code className="max-w-[22ch] truncate rounded-lg bg-stone-100 px-2 py-1 text-xs text-stone-600">
        {url}
      </code>
      <button
        type="button"
        onClick={copiar}
        title="Copiar link"
        className="flex items-center gap-1 rounded-lg border border-stone-200 px-2 py-1 text-xs font-semibold text-stone-600 transition hover:bg-stone-50"
      >
        {copiado ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
        {copiado ? "Copiado" : "Copiar"}
      </button>
    </div>
  );
}
