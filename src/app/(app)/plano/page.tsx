import Link from "next/link";
import { getCurrentChild } from "@/lib/currentChild";
import { db } from "@/lib/db";
import {
  addDiasChave,
  diffDiasChave,
  formatDiaSemana,
  hojeChave,
} from "@/lib/dates";
import {
  ESTADO_FEEDBACK_LABEL,
  TIPO_REFEICAO_LABEL,
  TIPO_REFEICAO_ORDEM,
} from "@/lib/constants";
import TopBar from "@/components/TopBar";
import MealCard, { type MealCardData } from "@/components/MealCard";
import EmptyState from "@/components/ui/EmptyState";
import ProgressBar from "@/components/ui/ProgressBar";
import GerarProximoCicloButton from "../hoje/GerarProximoCicloButton";
import { MealTypeIcon, MEAL_COLOR } from "@/components/mealIcons";
import { ReactionIcon } from "@/components/reactionIcons";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Heart,
  Shuffle,
  Sparkles,
  ThumbsUp,
  TrendingUp,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/cn";
import type { EstadoFeedback, TipoRefeicao } from "@prisma/client";

const POSITIVO = new Set(["GOSTOU", "ACEITOU"]);

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

  const inicio = plano.dataInicio;
  const hoje = hojeChave();
  const diaHojeNoCiclo = diffDiasChave(inicio, hoje) + 1; // 1..30 (ou fora)
  const diaHojeClamp = Math.min(30, Math.max(1, diaHojeNoCiclo));
  const cicloEncerrado = diaHojeNoCiclo > 30;

  const diaSelecionado = dia ? Number(dia) : diaHojeNoCiclo - 1;
  const diaClamped = Math.min(29, Math.max(0, diaSelecionado));

  const [todosSlots, favoritos] = await Promise.all([
    db.mealSlot.findMany({
      where: { mealPlanId: plano.id },
      include: { recipe: true, feedback: true },
      orderBy: { data: "asc" },
    }),
    db.favorite.findMany({ where: { childProfileId: child.id } }),
  ]);
  const favoritoIds = new Set(favoritos.map((f) => f.recipeId));

  const slotsPorDia = new Map<number, typeof todosSlots>();
  for (const slot of todosSlots) {
    const idx = diffDiasChave(inicio, slot.data);
    slotsPorDia.set(idx, [...(slotsPorDia.get(idx) ?? []), slot]);
  }
  const ordenar = (arr: typeof todosSlots) =>
    [...arr].sort(
      (a, b) => TIPO_REFEICAO_ORDEM.indexOf(a.tipo) - TIPO_REFEICAO_ORDEM.indexOf(b.tipo),
    );

  const toCardData = (slot: (typeof todosSlots)[number]): MealCardData => ({
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
  });

  // ---- Estatísticas do ciclo (resumo no topo + insights) --------------------
  const diasComFeedback = new Set(
    todosSlots.filter((s) => s.feedback).map((s) => diffDiasChave(inicio, s.data)),
  ).size;
  const receitasDiferentes = new Set(
    todosSlots.filter((s) => s.recipeId).map((s) => s.recipeId),
  ).size;

  const contagemPorReceita = new Map<string, { nome: string; pontos: number }>();
  for (const s of todosSlots) {
    if (!s.recipe || !s.feedback) continue;
    const pontos =
      { GOSTOU: 3, ACEITOU: 2, EXPERIMENTOU: 1, RECUSOU: -2 }[s.feedback.estado] ?? 0;
    const atual = contagemPorReceita.get(s.recipeId!) ?? { nome: s.recipe.nome, pontos: 0 };
    atual.pontos += pontos;
    contagemPorReceita.set(s.recipeId!, atual);
  }
  const topFavoritos = Array.from(contagemPorReceita.values())
    .filter((r) => r.pontos > 0)
    .sort((a, b) => b.pontos - a.pontos)
    .slice(0, 4);

  const desejados = await db.foodPreference.findMany({
    where: { childProfileId: child.id, status: "DESEJADA" },
  });
  const journeys = await db.foodJourney.findMany({
    where: {
      childProfileId: child.id,
      ingredientId: { in: desejados.map((d) => d.ingredientId) },
    },
  });
  const apresentados = journeys.filter((j) => j.exposicoes > 0).length;
  const aceitos = journeys.filter(
    (j) => j.ultimoEstado === "GOSTOU" || j.ultimoEstado === "ACEITOU",
  ).length;

  // ---- Semana selecionada ---------------------------------------------------
  const semanaInicioIdx = Math.floor(diaClamped / 7) * 7;
  const semanaNum = Math.floor(diaClamped / 7) + 1;
  const totalSemanas = Math.ceil(30 / 7);
  const diasDaSemana = Array.from({ length: 7 }, (_, i) => semanaInicioIdx + i).filter(
    (i) => i < 30,
  );

  const registradasDoDia = (slots: typeof todosSlots) =>
    slots.filter((s) => s.feedback || s.status === "FORA_DE_CASA" || s.status === "SEM_TEMPO")
      .length;

  const dataDoDia = (i: number) => addDiasChave(inicio, i);

  return (
    <>
      <TopBar
        title={`Plano de ${child.nome}`}
        subtitle={`Ciclo ${plano.cicloNumero} · 30 dias`}
        right={
          <Link
            href="/relatorio"
            aria-label="Relatório completo"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-stone-200 bg-white text-stone-600 transition active:scale-95 hover:bg-stone-50"
          >
            <BarChart3 size={17} />
          </Link>
        }
      />

      <div className="space-y-4 px-4 py-4">
        {/* Cabeçalho do ciclo: progresso + números */}
        <div className="overflow-hidden rounded-3xl border border-orange-100 bg-gradient-to-br from-orange-50 to-white p-5 shadow-card">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-orange-500">
                {cicloEncerrado ? "Ciclo concluído" : "Progresso do ciclo"}
              </p>
              <p className="font-display text-3xl font-semibold leading-none text-stone-900">
                Dia {diaHojeClamp}
                <span className="text-lg font-medium text-stone-400"> / 30</span>
              </p>
            </div>
            <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-orange-600 ring-1 ring-orange-100">
              {Math.round((diaHojeClamp / 30) * 100)}%
            </span>
          </div>
          <ProgressBar value={diaHojeClamp} max={30} className="mt-3 h-2" />

          <div className="mt-4 grid grid-cols-3 gap-2">
            <MiniStat icon={CalendarDays} valor={diasComFeedback} rotulo="dias acompanhados" />
            <MiniStat icon={Shuffle} valor={receitasDiferentes} rotulo="receitas diferentes" />
            <MiniStat icon={Sparkles} valor={aceitos} rotulo="alimentos aceitos" />
          </div>
        </div>

        {/* Alternador Semana | Mês */}
        <div className="flex gap-1 rounded-2xl bg-stone-100 p-1 text-sm">
          <TabLink href={`/plano?view=semana&dia=${diaClamped}`} ativo={view !== "mes"}>
            Semana
          </TabLink>
          <TabLink href={`/plano?view=mes&dia=${diaClamped}`} ativo={view === "mes"}>
            Mês inteiro
          </TabLink>
        </div>

        {view === "mes" ? (
          <>
            {/* Calendário / heatmap do mês */}
            <div className="rounded-3xl border border-stone-200/70 bg-white p-4 shadow-card">
              <div className="mb-2 grid grid-cols-7 gap-1 text-center text-[10px] font-semibold uppercase tracking-wide text-stone-400">
                {["dom", "seg", "ter", "qua", "qui", "sex", "sáb"].map((d) => (
                  <span key={d}>{d}</span>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: inicio.getUTCDay() }, (_, i) => (
                  <span key={`vazio-${i}`} />
                ))}

                {Array.from({ length: 30 }, (_, i) => i).map((i) => {
                  const data = dataDoDia(i);
                  const slotsDia = slotsPorDia.get(i) ?? [];
                  const positivos = slotsDia.filter(
                    (s) => s.feedback && POSITIVO.has(s.feedback.estado),
                  ).length;
                  const ativo = i === diaClamped;
                  const ehHoje = diffDiasChave(data, hoje) === 0;
                  // Intensidade do "calor" por reações positivas no dia.
                  const heat =
                    positivos >= 3
                      ? "bg-emerald-500 text-white border-emerald-500"
                      : positivos === 2
                        ? "bg-emerald-200 text-emerald-800 border-emerald-200"
                        : positivos === 1
                          ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                          : "bg-white text-stone-600 border-stone-200/70 hover:border-stone-300";
                  return (
                    <Link
                      key={i}
                      href={`/plano?view=mes&dia=${i}`}
                      className={cn(
                        "flex aspect-square flex-col items-center justify-center rounded-xl border text-center transition",
                        ativo
                          ? "border-orange-400 bg-orange-500 text-white shadow-card"
                          : heat,
                        !ativo && ehHoje && "ring-2 ring-orange-300",
                      )}
                    >
                      <span className="text-sm font-bold leading-none">{data.getUTCDate()}</span>
                      <span
                        className={cn(
                          "mt-0.5 text-[9px] leading-none",
                          ativo ? "text-orange-100" : "opacity-60",
                        )}
                      >
                        dia {i + 1}
                      </span>
                    </Link>
                  );
                })}
              </div>

              <div className="mt-3 flex items-center gap-3 border-t border-stone-100 pt-3 text-[10px] text-stone-400">
                <span className="flex items-center gap-1">
                  <span className="h-2.5 w-2.5 rounded bg-emerald-500" /> muito aceito
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2.5 w-2.5 rounded bg-emerald-100" /> algum registro
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2.5 w-2.5 rounded ring-2 ring-orange-300" /> hoje
                </span>
              </div>
            </div>

            <DiaSelecionadoHeader indice={diaClamped} data={dataDoDia(diaClamped)} hoje={hoje} />
            <div className="space-y-3">
              {ordenar(slotsPorDia.get(diaClamped) ?? []).map((slot) => (
                <MealCard key={slot.id} data={toCardData(slot)} childId={child.id} />
              ))}
            </div>
          </>
        ) : (
          <>
            {/* Navegação de semanas */}
            <div className="flex items-center justify-between px-1">
              <NavSemana
                href={
                  semanaNum > 1
                    ? `/plano?view=semana&dia=${Math.max(0, semanaInicioIdx - 7)}`
                    : null
                }
                dir="prev"
              />
              <span className="font-display text-sm font-semibold text-stone-700">
                Semana {semanaNum} de {totalSemanas}
              </span>
              <NavSemana
                href={
                  semanaNum < totalSemanas
                    ? `/plano?view=semana&dia=${Math.min(29, semanaInicioIdx + 7)}`
                    : null
                }
                dir="next"
              />
            </div>

            {/* Agenda: todos os dias da semana de uma vez */}
            <div className="space-y-3">
              {diasDaSemana.map((i) => {
                const data = dataDoDia(i);
                const slots = ordenar(slotsPorDia.get(i) ?? []);
                const selecionado = i === diaClamped;
                const ehHoje = diffDiasChave(data, hoje) === 0;
                const registradas = registradasDoDia(slots);

                if (selecionado) {
                  return (
                    <div key={i} className="space-y-3">
                      <DiaSelecionadoHeader indice={i} data={data} hoje={hoje} />
                      {slots.map((slot) => (
                        <MealCard key={slot.id} data={toCardData(slot)} childId={child.id} />
                      ))}
                    </div>
                  );
                }

                return (
                  <Link
                    key={i}
                    href={`/plano?view=semana&dia=${i}`}
                    className="block rounded-2xl border border-stone-200/70 bg-white p-4 shadow-card transition hover:border-orange-200"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span className="flex items-center gap-2 text-sm font-semibold text-stone-700">
                        <span
                          className={cn(
                            "flex h-7 w-9 flex-col items-center justify-center rounded-lg text-center leading-none",
                            ehHoje ? "bg-orange-100 text-orange-700" : "bg-stone-100 text-stone-500",
                          )}
                        >
                          <span className="text-[9px] uppercase">{formatDiaSemana(data)}</span>
                          <span className="text-xs font-bold">{data.getUTCDate()}</span>
                        </span>
                        {ehHoje ? "Hoje" : `Dia ${i + 1}`}
                      </span>
                      {registradas > 0 && (
                        <span className="text-[11px] font-medium text-emerald-600">
                          {registradas}/{slots.length} registradas
                        </span>
                      )}
                    </div>
                    <ul className="space-y-1.5">
                      {slots.map((slot) => (
                        <li key={slot.id} className="flex items-center gap-2 text-sm">
                          <span className={cn("shrink-0", MEAL_COLOR[slot.tipo as TipoRefeicao].text)}>
                            <MealTypeIcon tipo={slot.tipo as TipoRefeicao} size={14} />
                          </span>
                          <span className="w-16 shrink-0 text-xs text-stone-400">
                            {TIPO_REFEICAO_LABEL[slot.tipo]}
                          </span>
                          <span className="min-w-0 flex-1 truncate text-stone-700">
                            {slot.recipe ? slot.recipe.nome : "—"}
                          </span>
                          {slot.feedback && (
                            <span
                              className="shrink-0"
                              title={ESTADO_FEEDBACK_LABEL[slot.feedback.estado]}
                            >
                              <ReactionIcon
                                estado={slot.feedback.estado as EstadoFeedback}
                                active
                                size={15}
                              />
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </Link>
                );
              })}
            </div>
          </>
        )}

        {/* Insights do ciclo */}
        <section className="space-y-3 pt-1">
          <h2 className="font-display px-1 text-base font-semibold text-stone-800">
            Como está indo
          </h2>

          <div className="rounded-2xl border border-stone-200/70 bg-white p-4 shadow-card">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-stone-700">
              <Heart size={15} className="text-emerald-500" fill="currentColor" />
              Favoritos do ciclo
            </div>
            {topFavoritos.length === 0 ? (
              <p className="text-sm text-stone-400">
                Registre as reações nas refeições e os campeões aparecem aqui.
              </p>
            ) : (
              <ul className="space-y-1 text-sm">
                {topFavoritos.map((r) => (
                  <li
                    key={r.nome}
                    className="flex items-center justify-between border-b border-stone-100 py-1.5 last:border-0"
                  >
                    <span className="min-w-0 truncate pr-2 text-stone-700">{r.nome}</span>
                    <span className="flex shrink-0 items-center gap-1 text-xs font-semibold text-emerald-600">
                      <ThumbsUp size={12} /> {r.pontos}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {apresentados > 0 && (
            <div className="flex items-center gap-3 rounded-2xl border border-sky-100 bg-sky-50/60 p-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-sky-500 shadow-card">
                <Sparkles size={18} />
              </span>
              <p className="text-sm text-stone-700">
                <strong className="text-stone-900">
                  {aceitos} de {apresentados}
                </strong>{" "}
                alimentos novos apresentados já foram aceitos por {child.nome}.
              </p>
            </div>
          )}

          {(cicloEncerrado || diaHojeNoCiclo >= 27) && (
            <div className="rounded-2xl border border-orange-200 bg-orange-50 p-5 text-center">
              <TrendingUp className="mx-auto text-orange-500" size={24} />
              <p className="mt-2 font-semibold text-stone-800">
                {cicloEncerrado
                  ? "Ciclo completo! Hora de gerar o próximo mês."
                  : `Faltam ${30 - diaHojeClamp} dias para fechar este ciclo.`}
              </p>
              <p className="mt-1 text-sm text-stone-600">
                O próximo mês já começa melhor: o Pratinho Feliz aprendeu com tudo que você registrou.
              </p>
              <div className="mt-4 flex justify-center">
                <GerarProximoCicloButton childId={child.id} label="Gerar próximo ciclo" />
              </div>
            </div>
          )}
        </section>
      </div>
    </>
  );
}

function MiniStat({
  icon: Icon,
  valor,
  rotulo,
}: {
  icon: typeof CalendarDays;
  valor: number;
  rotulo: string;
}) {
  return (
    <div className="rounded-2xl bg-white/70 p-2.5 text-center ring-1 ring-orange-100/60">
      <Icon size={15} className="mx-auto text-orange-400" />
      <p className="font-display mt-1 text-lg font-semibold leading-none text-stone-900">{valor}</p>
      <p className="mt-0.5 text-[10px] leading-tight text-stone-500">{rotulo}</p>
    </div>
  );
}

function TabLink({
  href,
  ativo,
  children,
}: {
  href: string;
  ativo: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex-1 rounded-xl py-1.5 text-center font-semibold transition",
        ativo ? "bg-white text-stone-800 shadow-card" : "text-stone-500",
      )}
    >
      {children}
    </Link>
  );
}

function NavSemana({ href, dir }: { href: string | null; dir: "prev" | "next" }) {
  const Icon = dir === "prev" ? ChevronLeft : ChevronRight;
  if (!href) {
    return <span className="flex h-8 w-8 items-center justify-center text-stone-300"><Icon size={18} /></span>;
  }
  return (
    <Link
      href={href}
      className="flex h-8 w-8 items-center justify-center rounded-lg border border-stone-200 bg-white text-stone-600 transition active:scale-95 hover:bg-stone-50"
    >
      <Icon size={18} />
    </Link>
  );
}

function DiaSelecionadoHeader({
  indice,
  data,
  hoje,
}: {
  indice: number;
  data: Date;
  hoje: Date;
}) {
  const ehHoje = diffDiasChave(data, hoje) === 0;
  return (
    <div className="flex items-center gap-2 px-1 pt-1">
      <span className="h-4 w-1 rounded-full bg-orange-400" />
      <p className="font-display text-sm font-semibold text-stone-800">
        {ehHoje ? "Hoje" : `Dia ${indice + 1}`}
      </p>
      <p className="text-xs text-stone-400">
        {data.toLocaleDateString("pt-BR", {
          weekday: "long",
          day: "2-digit",
          month: "long",
          timeZone: "UTC",
        })}
      </p>
    </div>
  );
}
