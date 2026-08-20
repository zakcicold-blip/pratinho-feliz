import { getCurrentChild } from "@/lib/currentChild";
import { db } from "@/lib/db";
import { hojeChave, diffDiasChave } from "@/lib/dates";
import { TIPO_REFEICAO_LABEL, TIPO_REFEICAO_ORDEM } from "@/lib/constants";
import TopBar from "@/components/TopBar";
import MealCard, { type MealCardData } from "@/components/MealCard";
import EmptyState from "@/components/ui/EmptyState";
import ProgressBar from "@/components/ui/ProgressBar";
import { CalendarClock, CircleCheck, Clock3, Car } from "lucide-react";
import type { TipoRefeicao } from "@prisma/client";

export default async function RefeicoesHojePage() {
  const { child } = await getCurrentChild();

  const plano = await db.mealPlan.findFirst({
    where: { childProfileId: child.id, ativo: true },
    orderBy: { cicloNumero: "desc" },
  });
  if (!plano) {
    return (
      <>
        <TopBar title="Refeições de hoje" back />
        <EmptyState icon={CalendarClock} title="Nenhum plano ativo ainda" />
      </>
    );
  }

  const hoje = hojeChave();
  const diaDoCiclo = diffDiasChave(plano.dataInicio, hoje) + 1;
  const cicloEncerrado = diaDoCiclo > 30;

  const slots = await db.mealSlot.findMany({
    where: { mealPlanId: plano.id, data: cicloEncerrado ? undefined : hoje },
    include: { recipe: true, feedback: true },
  });
  const favoritos = await db.favorite.findMany({ where: { childProfileId: child.id } });
  const favoritoIds = new Set(favoritos.map((f) => f.recipeId));

  const cards: MealCardData[] = TIPO_REFEICAO_ORDEM.map((tipo): MealCardData | null => {
    const slot = slots.find((s) => s.tipo === tipo);
    if (!slot) return null;
    return {
      slotId: slot.id,
      tipo: tipo as TipoRefeicao,
      tipoLabel: TIPO_REFEICAO_LABEL[tipo],
      status: slot.status as string,
      explicacao: slot.explicacao,
      recipe: slot.recipe
        ? {
            id: slot.recipe.id,
            nome: slot.recipe.nome,
            resumo: slot.recipe.resumo,
            tempoPreparoMin: slot.recipe.tempoPreparoMin,
            dificuldade: slot.recipe.dificuldade,
            imagemUrl: slot.recipe.imagemUrl,
          }
        : null,
      favorito: slot.recipeId ? favoritoIds.has(slot.recipeId) : false,
      feedbackEstado: slot.feedback?.estado ?? null,
    };
  }).filter((c): c is MealCardData => c !== null);

  const registradas = slots.filter((s) => s.feedback).length;
  const foraDeCasa = slots.filter((s) => s.status === "FORA_DE_CASA").length;
  const semTempo = slots.filter((s) => s.status === "SEM_TEMPO").length;
  const pendentes = cards.length - registradas - foraDeCasa - semTempo;

  return (
    <>
      <TopBar title="Refeições de hoje" subtitle={`${child.nome} · Dia ${diaDoCiclo} de 30`} back />

      <div className="space-y-5 px-4 py-4">
        {/* Herói: registradas / total */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500 to-orange-400 p-5 text-white shadow-card-lg">
          <div aria-hidden className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full bg-white/10" />
          <span className="text-xs font-semibold uppercase tracking-wide text-white/80">Registradas hoje</span>
          <p className="font-display mt-3 text-5xl leading-none">
            {registradas}
            <span className="text-2xl font-semibold text-white/60"> / {cards.length}</span>
          </p>
          <p className="mt-1 text-sm text-white/80">refeições com reação marcada</p>
          <ProgressBar value={registradas} max={cards.length} barClassName="bg-white" className="mt-4 h-2 bg-white/25" />
        </div>

        {/* Resumo de status */}
        <div className="grid grid-cols-3 gap-3">
          <ResumoStatus icon={CircleCheck} tone="text-emerald-500" valor={pendentes} label="pendentes" />
          <ResumoStatus icon={Car} tone="text-stone-400" valor={foraDeCasa} label="fora de casa" />
          <ResumoStatus icon={Clock3} tone="text-amber-500" valor={semTempo} label="sem tempo" />
        </div>

        {/* Lista completa */}
        <div className="space-y-3">
          {cards.map((card) => (
            <MealCard key={card.slotId} data={card} childId={child.id} />
          ))}
        </div>
      </div>
    </>
  );
}

function ResumoStatus({
  icon: Icon,
  tone,
  valor,
  label,
}: {
  icon: typeof CircleCheck;
  tone: string;
  valor: number;
  label: string;
}) {
  return (
    <div className="rounded-3xl border border-stone-200/60 bg-white p-4 text-center shadow-card">
      <Icon size={18} className={`mx-auto ${tone}`} />
      <p className="font-display mt-2 text-2xl leading-none text-stone-900">{valor}</p>
      <p className="mt-1 text-[11px] text-stone-400">{label}</p>
    </div>
  );
}
