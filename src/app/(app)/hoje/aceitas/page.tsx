import { getCurrentChild } from "@/lib/currentChild";
import { db } from "@/lib/db";
import { hojeChave, diffDiasChave } from "@/lib/dates";
import { ESTADO_FEEDBACK_LABEL, TIPO_REFEICAO_LABEL, TIPO_REFEICAO_ORDEM } from "@/lib/constants";
import TopBar from "@/components/TopBar";
import EmptyState from "@/components/ui/EmptyState";
import ProgressBar from "@/components/ui/ProgressBar";
import { ReactionIcon, REACTION_COLOR } from "@/components/reactionIcons";
import { MealTypeIcon, MEAL_COLOR } from "@/components/mealIcons";
import { CalendarClock } from "lucide-react";
import type { EstadoFeedback, TipoRefeicao } from "@prisma/client";
import { cn } from "@/lib/cn";

const ORDEM_ESTADO: EstadoFeedback[] = ["GOSTOU", "ACEITOU", "EXPERIMENTOU", "RECUSOU"];
const POSITIVO = new Set(["GOSTOU", "ACEITOU"]);

export default async function AceitasHojePage() {
  const { child } = await getCurrentChild();

  const plano = await db.mealPlan.findFirst({
    where: { childProfileId: child.id, ativo: true },
    orderBy: { cicloNumero: "desc" },
  });
  if (!plano) {
    return (
      <>
        <TopBar title="Aceitação de hoje" back />
        <EmptyState icon={CalendarClock} title="Nenhum plano ativo ainda" />
      </>
    );
  }

  const hoje = hojeChave();
  const diaDoCiclo = diffDiasChave(plano.dataInicio, hoje) + 1;
  const cicloEncerrado = diaDoCiclo > 30;

  const [slotsHoje, slotsCiclo] = await Promise.all([
    db.mealSlot.findMany({
      where: { mealPlanId: plano.id, data: cicloEncerrado ? undefined : hoje },
      include: { recipe: true, feedback: true },
    }),
    db.mealSlot.findMany({
      where: { mealPlanId: plano.id },
      include: { feedback: true },
    }),
  ]);

  const contar = (slots: { feedback: { estado: EstadoFeedback } | null }[]) => {
    const c: Record<EstadoFeedback, number> = { GOSTOU: 0, ACEITOU: 0, EXPERIMENTOU: 0, RECUSOU: 0 };
    for (const s of slots) if (s.feedback) c[s.feedback.estado]++;
    return c;
  };
  const hojeC = contar(slotsHoje);
  const cicloC = contar(slotsCiclo);

  const registradasHoje = ORDEM_ESTADO.reduce((a, e) => a + hojeC[e], 0);
  const aceitasHoje = hojeC.GOSTOU + hojeC.ACEITOU;
  const recusadasHoje = hojeC.RECUSOU;

  // Reação por refeição de hoje.
  const porRefeicao = TIPO_REFEICAO_ORDEM.map((tipo) => {
    const slot = slotsHoje.find((s) => s.tipo === tipo);
    return slot ? { tipo: tipo as TipoRefeicao, estado: slot.feedback?.estado ?? null } : null;
  }).filter((x): x is { tipo: TipoRefeicao; estado: EstadoFeedback | null } => x !== null);

  return (
    <>
      <TopBar title="Aceitação de hoje" subtitle={`${child.nome} · Dia ${diaDoCiclo} de 30`} back />

      <div className="space-y-5 px-4 py-4">
        {/* Herói: aceitas hoje */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 to-emerald-400 p-5 text-white shadow-card-lg">
          <div aria-hidden className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full bg-white/10" />
          <span className="text-xs font-semibold uppercase tracking-wide text-white/80">Aceitas hoje</span>
          <p className="font-display mt-3 text-5xl leading-none">
            {aceitasHoje}
            <span className="text-2xl font-semibold text-white/60"> / {registradasHoje || 0}</span>
          </p>
          <p className="mt-1 text-sm text-white/80">
            {recusadasHoje > 0 ? `${recusadasHoje} recusada${recusadasHoje > 1 ? "s" : ""} hoje` : "gostou ou aceitou"}
          </p>
          <ProgressBar value={aceitasHoje} max={registradasHoje || 1} barClassName="bg-white" className="mt-4 h-2 bg-white/25" />
        </div>

        {/* Reações de hoje */}
        <section>
          <h2 className="font-display mb-3 px-1 text-base font-semibold text-stone-800">Reações de hoje</h2>
          <div className="grid grid-cols-4 gap-2">
            {ORDEM_ESTADO.map((estado) => (
              <ReacaoTile key={estado} estado={estado} valor={hojeC[estado]} />
            ))}
          </div>
        </section>

        {/* Por refeição */}
        <section>
          <h2 className="font-display mb-3 px-1 text-base font-semibold text-stone-800">Por refeição</h2>
          <div className="rounded-3xl border border-stone-200/60 bg-white shadow-card">
            <ul className="divide-y divide-stone-100">
              {porRefeicao.map(({ tipo, estado }) => (
                <li key={tipo} className="flex items-center gap-3 px-4 py-3 text-sm">
                  <span className={cn("shrink-0", MEAL_COLOR[tipo].text)}>
                    <MealTypeIcon tipo={tipo} size={16} />
                  </span>
                  <span className="text-stone-600">{TIPO_REFEICAO_LABEL[tipo]}</span>
                  <span className="ml-auto flex items-center gap-1.5">
                    {estado ? (
                      <>
                        <ReactionIcon estado={estado} active size={16} />
                        <span className={cn("font-medium", REACTION_COLOR[estado])}>
                          {ESTADO_FEEDBACK_LABEL[estado]}
                        </span>
                      </>
                    ) : (
                      <span className="text-stone-300">sem reação</span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* No ciclo inteiro */}
        <section>
          <h2 className="font-display mb-3 px-1 text-base font-semibold text-stone-800">No ciclo inteiro</h2>
          <div className="grid grid-cols-4 gap-2">
            {ORDEM_ESTADO.map((estado) => (
              <ReacaoTile key={estado} estado={estado} valor={cicloC[estado]} />
            ))}
          </div>
        </section>
      </div>
    </>
  );
}

function ReacaoTile({ estado, valor }: { estado: EstadoFeedback; valor: number }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-stone-200/60 bg-white p-3 text-center shadow-card",
        POSITIVO.has(estado) && valor > 0 && "border-emerald-100 bg-emerald-50/40",
      )}
    >
      <span className="flex justify-center">
        <ReactionIcon estado={estado} active={valor > 0} size={18} />
      </span>
      <p className="font-display mt-1.5 text-xl leading-none text-stone-900">{valor}</p>
      <p className="mt-1 text-[10px] leading-tight text-stone-400">{ESTADO_FEEDBACK_LABEL[estado]}</p>
    </div>
  );
}
