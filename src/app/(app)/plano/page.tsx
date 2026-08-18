import Link from "next/link";
import { getCurrentChild } from "@/lib/currentChild";
import { db } from "@/lib/db";
import { addDays, formatDiaMes, formatDiaSemana, sameDay, startOfDay } from "@/lib/dates";
import { TIPO_REFEICAO_LABEL, TIPO_REFEICAO_ORDEM } from "@/lib/constants";
import TopBar from "@/components/TopBar";
import MealCard, { type MealCardData } from "@/components/MealCard";
import EmptyState from "@/components/ui/EmptyState";
import { Heart, CalendarDays } from "lucide-react";
import { cn } from "@/lib/cn";

export default async function PlanoPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; dia?: string }>;
}) {
  const { view = "semana", dia } = await searchParams;
  const { child } = await getCurrentChild();

  const plano = await db.mealPlan.findFirst({
    where: { childProfileId: child.id, ativo: true },
    orderBy: { cicloNumero: "desc" },
  });

  if (!plano) {
    return (
      <>
        <TopBar title="Meu plano" />
        <EmptyState icon={CalendarDays} title="Nenhum plano ativo ainda" />
      </>
    );
  }

  const inicio = startOfDay(plano.dataInicio);
  const diaSelecionado = dia ? Number(dia) : diffDias(inicio, startOfDay(new Date()));
  const diaClamped = Math.min(29, Math.max(0, diaSelecionado));
  const dataSelecionada = addDays(inicio, diaClamped);

  const todosSlots = await db.mealSlot.findMany({
    where: { mealPlanId: plano.id },
    include: { recipe: true, feedback: true },
    orderBy: { data: "asc" },
  });

  const favoritos = await db.favorite.findMany({
    where: { childProfileId: child.id },
  });
  const favoritoIds = new Set(favoritos.map((f) => f.recipeId));

  const slotsPorDia = new Map<number, typeof todosSlots>();
  for (const slot of todosSlots) {
    const idx = diffDias(inicio, startOfDay(slot.data));
    slotsPorDia.set(idx, [...(slotsPorDia.get(idx) ?? []), slot]);
  }

  const slotsDoDia = (slotsPorDia.get(diaClamped) ?? []).sort(
    (a, b) => TIPO_REFEICAO_ORDEM.indexOf(a.tipo) - TIPO_REFEICAO_ORDEM.indexOf(b.tipo),
  );

  const cardsData: MealCardData[] = slotsDoDia.map((slot) => ({
    slotId: slot.id,
    tipo: slot.tipo,
    tipoLabel: TIPO_REFEICAO_LABEL[slot.tipo],
    status: slot.status,
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
  }));

  const semanaInicioIdx = Math.floor(diaClamped / 7) * 7;
  const diasDaSemana = Array.from({ length: 7 }, (_, i) => semanaInicioIdx + i).filter(
    (i) => i < 30,
  );

  return (
    <>
      <TopBar title={`Plano de ${child.nome}`} subtitle={`Ciclo ${plano.cicloNumero} · 30 dias`} />

      <div className="px-4 py-4">
        <div className="mb-4 flex gap-1 rounded-2xl bg-stone-100 p-1 text-sm">
          <Link
            href={`/plano?view=semana&dia=${diaClamped}`}
            className={cn(
              "flex-1 rounded-xl py-1.5 text-center font-semibold transition",
              view === "semana" ? "bg-white text-stone-800 shadow-card" : "text-stone-500",
            )}
          >
            Semana
          </Link>
          <Link
            href={`/plano?view=mes&dia=${diaClamped}`}
            className={cn(
              "flex-1 rounded-xl py-1.5 text-center font-semibold transition",
              view === "mes" ? "bg-white text-stone-800 shadow-card" : "text-stone-500",
            )}
          >
            Mês inteiro
          </Link>
        </div>

        {view === "mes" ? (
          <>
            <div className="mb-2 grid grid-cols-7 gap-1 text-center text-[10px] font-semibold uppercase tracking-wide text-stone-400">
              {["dom", "seg", "ter", "qua", "qui", "sex", "sáb"].map((d) => (
                <span key={d}>{d}</span>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {/* Alinha o dia 1 do ciclo na coluna do dia da semana correto. */}
              {Array.from({ length: inicio.getDay() }, (_, i) => (
                <span key={`vazio-${i}`} />
              ))}

              {Array.from({ length: 30 }, (_, i) => i).map((i) => {
                const data = addDays(inicio, i);
                const slotsDia = slotsPorDia.get(i) ?? [];
                const positivos = slotsDia.filter(
                  (s) =>
                    s.feedback &&
                    (s.feedback.estado === "GOSTOU" || s.feedback.estado === "ACEITOU"),
                ).length;
                const ativo = i === diaClamped;
                const ehHoje = sameDay(data, new Date());
                return (
                  <Link
                    key={i}
                    href={`/plano?view=mes&dia=${i}`}
                    className={cn(
                      "flex aspect-square flex-col items-center justify-center rounded-xl border text-center transition",
                      ativo
                        ? "border-orange-400 bg-orange-500 text-white shadow-card"
                        : ehHoje
                          ? "border-orange-300 bg-orange-50 text-orange-700"
                          : "border-stone-200/70 bg-white text-stone-700 hover:border-stone-300",
                    )}
                  >
                    <span className="text-sm font-bold leading-none">{data.getDate()}</span>
                    <span
                      className={cn(
                        "mt-0.5 text-[9px] leading-none",
                        ativo ? "text-orange-100" : "text-stone-400",
                      )}
                    >
                      dia {i + 1}
                    </span>
                    <span className="mt-1 flex h-1.5 items-center gap-0.5">
                      {positivos > 0 && (
                        <Heart
                          size={8}
                          className={ativo ? "text-white" : "text-emerald-500"}
                          fill="currentColor"
                        />
                      )}
                    </span>
                  </Link>
                );
              })}
            </div>

            <p className="mb-3 mt-5 text-sm font-medium text-stone-500">
              Dia {diaClamped + 1} de 30 · {dataSelecionada.toLocaleDateString("pt-BR")}
            </p>

            <div className="space-y-3">
              {cardsData.map((card) => (
                <MealCard key={card.slotId} data={card} childId={child.id} />
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
              {diasDaSemana.map((i) => {
                const data = addDays(inicio, i);
                const ativo = i === diaClamped;
                return (
                  <Link
                    key={i}
                    href={`/plano?view=semana&dia=${i}`}
                    className={cn(
                      "flex min-w-14 flex-col items-center rounded-xl px-2 py-2 text-center transition",
                      ativo
                        ? "bg-orange-500 text-white shadow-card"
                        : "border border-stone-200/70 bg-white text-stone-600 hover:border-stone-300",
                    )}
                  >
                    <span className="text-[10px] uppercase">{formatDiaSemana(data)}</span>
                    <span className="text-sm font-bold">{formatDiaMes(data)}</span>
                  </Link>
                );
              })}
            </div>

            <p className="mb-3 text-sm font-medium text-stone-500">
              Dia {diaClamped + 1} de 30 · {dataSelecionada.toLocaleDateString("pt-BR")}
            </p>

            <div className="space-y-3">
              {cardsData.map((card) => (
                <MealCard key={card.slotId} data={card} childId={child.id} />
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}

function diffDias(a: Date, b: Date) {
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}
