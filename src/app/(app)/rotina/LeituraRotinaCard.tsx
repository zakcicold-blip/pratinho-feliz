import Link from "next/link";
import { Moon, Zap, Wind, Scale, Info, ChevronRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { TIPO_REFEICAO_LABEL } from "@/lib/constants";
import type { LeituraRotina, ObjetivoRotina } from "@/lib/objetivosRotina";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import GerarProximoCicloButton from "../hoje/GerarProximoCicloButton";

type Sugestao = {
  tipo: string;
  recipeId: string;
  nome: string;
  tempoPreparoMin: number;
  aderencia: number | null;
};

const APRESENTACAO: Record<
  ObjetivoRotina,
  { titulo: string; texto: string; Icon: LucideIcon; tone: "indigo" | "amber" | "emerald" | "blue" }
> = {
  SONO: {
    titulo: "Cardápio voltado para o sono",
    texto:
      "Priorizamos preparos mais leves no fim do dia e alimentos com magnésio, cálcio e carboidratos de digestão lenta.",
    Icon: Moon,
    tone: "indigo",
  },
  ENERGIA: {
    titulo: "Cardápio voltado para disposição",
    texto:
      "Priorizamos ferro, proteína e vitaminas do complexo B, que participam do transporte de oxigênio e do metabolismo de energia.",
    Icon: Zap,
    tone: "amber",
  },
  CALMA: {
    titulo: "Cardápio voltado para regular o dia",
    texto:
      "Priorizamos refeições mais leves, com fibras e carboidratos de absorção lenta, evitando pratos muito pesados.",
    Icon: Wind,
    tone: "emerald",
  },
  EQUILIBRIO: {
    titulo: "Cardápio equilibrado",
    texto:
      "Sono, atividade e disposição estão dentro do esperado — o plano segue focado em variedade.",
    Icon: Scale,
    tone: "blue",
  },
};

export default function LeituraRotinaCard({
  childId,
  leitura,
  sugestoes,
}: {
  childId: string;
  leitura: LeituraRotina;
  sugestoes: Sugestao[];
}) {
  const { titulo, texto, Icon, tone } = APRESENTACAO[leitura.objetivo];

  if (leitura.semDados) {
    return (
      <Card className="border-dashed">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 rounded-xl bg-stone-100 p-2 text-stone-400">
            <Info size={18} />
          </span>
          <div>
            <h2 className="text-sm font-semibold text-stone-700">
              Preencha a rotina para ajustar o cardápio
            </h2>
            <p className="mt-1 text-[13px] leading-relaxed text-stone-500">
              Assim que você registrar sono, atividade física ou disposição, usamos essas respostas
              para escolher receitas que ajudem justamente nesse ponto. Pode responder só um deles.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-start gap-3">
        <span className="mt-0.5 rounded-xl bg-stone-100 p-2 text-stone-600">
          <Icon size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-sm font-semibold text-stone-800">{titulo}</h2>
            <Badge tone={tone}>últimos 7 dias</Badge>
          </div>

          {leitura.motivos.length > 0 && (
            <p className="mt-1 text-[13px] leading-relaxed text-stone-600">
              Porque {leitura.motivos.join(", ")}.
            </p>
          )}
          <p className="mt-1 text-[13px] leading-relaxed text-stone-500">{texto}</p>
        </div>
      </div>

      {leitura.pilaresFaltando.length > 0 && (
        <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-[12px] leading-relaxed text-amber-800">
          A leitura fica mais precisa preenchendo também: {leitura.pilaresFaltando.join(", ")}.
        </p>
      )}

      {sugestoes.length > 0 && (
        <div className="mt-4">
          <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-stone-400">
            Receitas indicadas hoje
          </h3>
          <div className="space-y-1">
            {sugestoes.map((s) => (
              <Link
                key={s.tipo}
                href={`/receita/${s.recipeId}`}
                className="flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-stone-50"
              >
                <span className="w-24 shrink-0 text-[11px] font-medium uppercase tracking-wide text-stone-400">
                  {TIPO_REFEICAO_LABEL[s.tipo] ?? s.tipo}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-stone-700">
                  {s.nome}
                </span>
                <span className="shrink-0 text-[11px] text-stone-400">{s.tempoPreparoMin} min</span>
                <ChevronRight size={15} className="shrink-0 text-stone-300" />
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 border-t border-stone-100 pt-3">
        <p className="mb-2 text-[12px] leading-relaxed text-stone-500">
          O plano já em andamento não muda sozinho. Gere um novo ciclo para aplicar esta leitura aos
          próximos 30 dias.
        </p>
        <GerarProximoCicloButton childId={childId} label="Aplicar ao cardápio" />
      </div>

      <p className="mt-3 text-[11px] leading-relaxed text-stone-400">
        Sugestões alimentares, não tratamento. Sono, agitação ou cansaço persistentes merecem
        conversa com o pediatra.
      </p>
    </Card>
  );
}
