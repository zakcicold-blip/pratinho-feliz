"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

/**
 * O link, grande e copiavel.
 *
 * Maior que o do backoffice de proposito: aqui e o produto de trabalho da
 * parceira, e ela vai copiar isso toda semana no celular.
 */
export default function CopiarLink({ url, compacto = false }: { url: string; compacto?: boolean }) {
  const [copiado, setCopiado] = useState(false);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(url);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // Sem permissao de clipboard: o link continua visivel para copiar na mao.
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <code
        className={`min-w-0 flex-1 truncate rounded-xl bg-stone-100 px-3 py-2 text-stone-700 ${
          compacto ? "text-xs" : "text-sm"
        }`}
      >
        {url}
      </code>
      <button
        type="button"
        onClick={copiar}
        className="flex shrink-0 items-center gap-1.5 rounded-xl bg-orange-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-orange-600"
      >
        {copiado ? <Check size={14} /> : <Copy size={14} />}
        {copiado ? "Copiado" : "Copiar"}
      </button>
    </div>
  );
}
