"use client";

import { useState } from "react";

export default function CopiarListaButton({ texto }: { texto: string }) {
  const [copiado, setCopiado] = useState(false);

  return (
    <button
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(texto);
          setCopiado(true);
          setTimeout(() => setCopiado(false), 2000);
        } catch {
          // clipboard indisponível
        }
      }}
      className="rounded-full bg-stone-100 px-3 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-200"
    >
      {copiado ? "Copiado!" : "Copiar lista"}
    </button>
  );
}
