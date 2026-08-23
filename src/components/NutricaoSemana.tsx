import { Leaf, Info } from "lucide-react";
import Card from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import type { CoberturaSemana } from "@/lib/metasNutricionais";
import { TACO_FONTE } from "@/lib/tacoFonte";

const TOM = {
  baixo: { barra: "bg-amber-400", texto: "text-amber-700", rotulo: "abaixo" },
  adequado: { barra: "bg-emerald-500", texto: "text-emerald-700", rotulo: "na faixa" },
  alto: { barra: "bg-sky-500", texto: "text-sky-700", rotulo: "acima" },
} as const;

function formatar(valor: number, unidade: string): string {
  const casas = unidade === "kcal" || valor >= 100 ? 0 : 1;
  return valor.toLocaleString("pt-BR", { maximumFractionDigits: casas });
}

/**
 * Cobertura nutricional média por dia, a partir das refeições planejadas.
 * A leitura é deliberadamente sem alarme: mostra faixa, não diagnóstico.
 */
export default function NutricaoSemana({ cobertura }: { cobertura: CoberturaSemana }) {
  if (cobertura.refeicoesConsideradas === 0) return null;

  return (
    <Card>
      <div className="mb-1 flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold text-stone-700">
          <Leaf size={14} className="text-emerald-500" /> Nutrição da semana
        </h2>
        <span className="text-[11px] text-stone-400">{cobertura.faixa}</span>
      </div>
      <p className="mb-4 text-[12px] leading-relaxed text-stone-500">
        Média por dia das {cobertura.refeicoesConsideradas} refeições planejadas nos últimos{" "}
        {cobertura.diasComPlano} dias, comparada à referência da idade.
      </p>

      <div className="space-y-3">
        {cobertura.itens.map(({ nutriente, mediaDiaria, referencia, percentual, nivel }) => {
          const tom = TOM[nivel];
          const largura = Math.min(100, Math.round(percentual));
          return (
            <div key={nutriente.chave}>
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-[13px] font-medium text-stone-700">{nutriente.nome}</span>
                <span className="text-[12px] tabular-nums text-stone-400">
                  <b className={cn("font-semibold", tom.texto)}>
                    {formatar(mediaDiaria, nutriente.unidade)}
                  </b>{" "}
                  / {formatar(referencia, nutriente.unidade)} {nutriente.unidade}
                </span>
              </div>
              <div className="mt-1 flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-stone-100">
                  <div
                    className={cn("h-full rounded-full transition-all", tom.barra)}
                    style={{ width: `${largura}%` }}
                  />
                </div>
                <span className={cn("w-14 shrink-0 text-right text-[11px] font-medium", tom.texto)}>
                  {tom.rotulo}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex gap-2 border-t border-stone-100 pt-3">
        <Info size={13} className="mt-0.5 shrink-0 text-stone-300" />
        <p className="text-[11px] leading-relaxed text-stone-400">
          {cobertura.contaComLeite && (
            <>
              Nesta idade o leite materno ou a fórmula ainda são a base da nutrição e{" "}
              <b className="font-semibold text-stone-500">não entram nesta conta</b>.{" "}
            </>
          )}
          Contamos só o que está no plano — o que a criança come fora dele fica de fora.
          {cobertura.refeicoesParciais > 0 && (
            <>
              {" "}
              {cobertura.refeicoesParciais}{" "}
              {cobertura.refeicoesParciais === 1 ? "receita usa medida livre" : "receitas usam medidas livres"}{" "}
              e entram parcialmente. Referências: DRI (Institute of Medicine). Composição: {TACO_FONTE}.
            </>
          )}
          {cobertura.refeicoesParciais === 0 && (
            <> Referências: DRI (Institute of Medicine). Composição: {TACO_FONTE}.</>
          )}{" "}
          É leitura de acompanhamento, não avaliação clínica.
        </p>
      </div>
    </Card>
  );
}
