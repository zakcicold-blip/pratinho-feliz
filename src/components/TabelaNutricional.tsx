import { Info } from "lucide-react";
import type { ResumoNutricional } from "@/lib/nutricao";

const LINHAS: {
  campo: keyof ResumoNutricional["porPorcao"];
  label: string;
  unidade: string;
  destaque?: boolean;
}[] = [
  { campo: "energiaKcal", label: "Energia", unidade: "kcal", destaque: true },
  { campo: "proteinaG", label: "Proteínas", unidade: "g", destaque: true },
  { campo: "carboidratoG", label: "Carboidratos", unidade: "g" },
  { campo: "lipideoG", label: "Gorduras", unidade: "g" },
  { campo: "fibraG", label: "Fibras", unidade: "g" },
  { campo: "ferroMg", label: "Ferro", unidade: "mg", destaque: true },
  { campo: "calcioMg", label: "Cálcio", unidade: "mg" },
  { campo: "zincoMg", label: "Zinco", unidade: "mg" },
  { campo: "vitaminaCMg", label: "Vitamina C", unidade: "mg" },
  { campo: "sodioMg", label: "Sódio", unidade: "mg" },
];

export default function TabelaNutricional({ resumo }: { resumo: ResumoNutricional }) {
  return (
    <div className="mt-5">
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-stone-400">
        Informação nutricional
      </h2>
      <p className="mb-3 text-xs text-stone-400">Valores estimados por porção.</p>

      <div className="overflow-hidden rounded-xl border border-stone-200/70">
        <table className="w-full text-sm">
          <tbody>
            {LINHAS.map(({ campo, label, unidade, destaque }) => (
              <tr key={campo} className="border-b border-stone-100 last:border-0">
                <td
                  className={`px-3 py-2 ${destaque ? "font-semibold text-stone-800" : "text-stone-600"}`}
                >
                  {label}
                </td>
                <td
                  className={`px-3 py-2 text-right tabular-nums ${
                    destaque ? "font-semibold text-stone-800" : "text-stone-600"
                  }`}
                >
                  {resumo.porPorcao[campo]} {unidade}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-2 flex gap-1.5 rounded-xl bg-stone-50 px-3 py-2 text-[11px] leading-relaxed text-stone-500">
        <Info size={13} className="mt-px shrink-0 text-stone-400" />
        <div>
          <p>
            Fonte: {resumo.fonte}. Estimativa a partir das medidas caseiras da receita — não
            substitui orientação de nutricionista.
          </p>
          {!resumo.completo && (
            <p className="mt-1">
              Cálculo parcial: {resumo.ingredientesCalculados} de {resumo.ingredientesTotal}{" "}
              ingredientes. Fora da conta: {resumo.ingredientesIgnorados.join(", ")}.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
