import Link from "next/link";
import { getCurrentChild } from "@/lib/currentChild";
import { db } from "@/lib/db";
import { addDiasChave, hojeChave, diffDiasChave, horaSaoPaulo } from "@/lib/dates";
import { TIPO_REFEICAO_LABEL, TIPO_REFEICAO_ORDEM } from "@/lib/constants";
import TopBar from "@/components/TopBar";
import MealCard, { type MealCardData } from "@/components/MealCard";
import GerarProximoCicloButton from "./GerarProximoCicloButton";
import { PartyPopper, ArrowRight, CalendarClock } from "lucide-react";
import { MealTypeIcon, MEAL_COLOR } from "@/components/mealIcons";
import Card from "@/components/ui/Card";
import ProgressBar from "@/components/ui/ProgressBar";
import EmptyState from "@/components/ui/EmptyState";
import type { TipoRefeicao } from "@prisma/client";

function saudacao(hora: number) {
  if (hora < 12) return "Bom dia";
  if (hora < 18) return "Boa tarde";
  return "Boa noite";
}

export default async function HojePage() {
  const { child } = await getCurrentChild();

  const plano = await db.mealPlan.findFirst({
    where: { childProfileId: child.id, ativo: true },
    orderBy: { cicloNumero: "desc" },
  });

  if (!plano) {
    return (
      <>
        <TopBar title={`Olá! Vamos montar o plano de ${child.nome}?`} />
        <EmptyState
          icon={CalendarClock}
          title="Nenhum plano ativo ainda"
          description="Gere os primeiros 30 dias personalizados com base no perfil que você preencheu."
          action={<GerarProximoCicloButton childId={child.id} label="Gerar plano de 30 dias" />}
        />
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

  const cardsData: MealCardData[] = TIPO_REFEICAO_ORDEM.map((tipo): MealCardData | null => {
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

  const resolvidas = cardsData.filter(
    (c) => c.feedbackEstado || c.status === "FORA_DE_CASA"
  ).length;

  const amanha = await db.mealSlot.findMany({
    where: { mealPlanId: plano.id, data: addDiasChave(hoje, 1) },
    include: { recipe: true },
    orderBy: { tipo: "asc" },
  });

  return (
    <>
      <TopBar
        title={cicloEncerrado ? `Hoje de ${child.nome}` : `${saudacao(horaSaoPaulo())}!`}
        subtitle={cicloEncerrado ? "Ciclo de 30 dias concluído" : `${child.nome} · Dia ${diaDoCiclo} de 30`}
      />

      <div className="space-y-3 px-4 py-4">
        {cicloEncerrado ? (
          <Card className="text-center" padding="lg">
            <PartyPopper className="mx-auto text-orange-500" size={28} />
            <p className="mt-2 font-semibold text-stone-800">
              {child.nome} completou os 30 dias!
            </p>
            <p className="mt-1 text-sm text-stone-600">
              Gere o próximo ciclo usando tudo que já aprendemos sobre a rotina.
            </p>
            <div className="mt-4 flex justify-center">
              <GerarProximoCicloButton childId={child.id} label="Gerar próximo ciclo" />
            </div>
          </Card>
        ) : (
          <>
            <Card padding="sm" className="flex items-center gap-3 px-4">
              <div className="flex-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-stone-600">Refeições de hoje</span>
                  <span className="text-stone-400">
                    {resolvidas}/{cardsData.length}
                  </span>
                </div>
                <ProgressBar value={resolvidas} max={cardsData.length} className="mt-1.5" />
              </div>
            </Card>

            {cardsData.map((card) => (
              <MealCard key={card.slotId} data={card} childId={child.id} />
            ))}
          </>
        )}

        {!cicloEncerrado && amanha.length > 0 && (
          <Card padding="sm">
            <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-stone-400">
              Amanhã
            </p>
            <ul className="divide-y divide-stone-100">
              {amanha.map((s) => (
                <li key={s.id} className="flex items-center gap-2 px-1 py-1.5 text-sm">
                  <span className={`shrink-0 ${MEAL_COLOR[s.tipo].text}`}>
                    <MealTypeIcon tipo={s.tipo} size={14} />
                  </span>
                  <span className="text-stone-500">{TIPO_REFEICAO_LABEL[s.tipo]}</span>
                  <span className="ml-auto truncate font-medium text-stone-800">
                    {s.recipe ? s.recipe.nome : "—"}
                  </span>
                </li>
              ))}
            </ul>
            <Link
              href="/plano"
              className="mt-2 flex items-center gap-1 px-1 text-xs font-semibold text-orange-600 hover:underline"
            >
              Ver plano completo <ArrowRight size={12} />
            </Link>
          </Card>
        )}
      </div>
    </>
  );
}
