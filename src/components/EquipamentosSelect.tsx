"use client";

import { EQUIPAMENTOS_COMUNS } from "@/lib/constants";
import { cn } from "@/lib/cn";

/**
 * Seleção de equipamentos que a família tem em casa. Guarda os ids separados
 * por vírgula (ex.: "AIR_FRYER,LIQUIDIFICADOR") no mesmo campo de texto que já
 * existia — por isso o valor entra e sai como string.
 */
export default function EquipamentosSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const selecionados = new Set(
    value
      .split(",")
      .map((v) => v.trim().toUpperCase())
      .filter(Boolean)
  );

  function toggle(id: string) {
    const proximo = new Set(selecionados);
    if (proximo.has(id)) proximo.delete(id);
    else proximo.add(id);
    onChange(Array.from(proximo).join(","));
  }

  return (
    <div className="flex flex-wrap gap-2">
      {EQUIPAMENTOS_COMUNS.map((eq) => {
        const ativo = selecionados.has(eq.id);
        return (
          <button
            key={eq.id}
            type="button"
            onClick={() => toggle(eq.id)}
            aria-pressed={ativo}
            className={cn(
              "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
              ativo
                ? "border-orange-400 bg-orange-500 text-white"
                : "border-stone-200 bg-white text-stone-600 hover:border-stone-300"
            )}
          >
            {eq.label}
          </button>
        );
      })}
    </div>
  );
}
