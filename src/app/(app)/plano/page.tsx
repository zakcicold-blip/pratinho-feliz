import Link from "next/link";
import { getCurrentChild } from "@/lib/currentChild";
import { db } from "@/lib/db";
import { addDiasChave, diffDiasChave, formatDiaSemana, hojeChave } from "@/lib/dates";
import { ESTADO_FEEDBACK_LABEL, TIPO_REFEICAO_LABEL, TIPO_REFEICAO_ORDEM } from "@/lib/constants";
import { calcularNutricao } from "@/lib/nutricao";
import TopBar from "@/components/TopBar";
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
  ShoppingCart,
  Flame,
  ChevronRight as ChevRight,
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
  const diaHojeNoCiclo = diffDiasChave(inicio, hoje) + 1;
  const diaHojeClamp = Math.min(30, Math.max(1, diaHojeNoCiclo));
  const cicloEncerrado = diaHojeNoCiclo > 30;

  const diaSelecionado = dia ? Number(dia) : diaHojeNoCiclo - 1;
  const diaClamped = Math.min(29, Math.max(0, diaSelecionado));

  const semanaInicioIdx = Math.floor(diaClamped / 7) * 7;
  const semanaNum = Math.floor(diaClamped / 7) + 1;
  const totalSemanas = Math.ceil(30 / 7);
  const diasDaSemana = Array.from({ length: 7 }, (_, i) => semanaInicioIdx + i).filter((i) => i < 30);
  const datasSemana = diasDaSemana.map((i) => addDiasChave(inicio, i));

  const [todosSlots, slotsSemana] = await Promise.all([
    // Visao do mes inteiro: 120 slots. Com `include: { recipe: true }` vinha a
    // receita completa de cada um — passos, nutricao, tags, restricoes — para
    // mostrar so o nome no calendario. Agora vem so o que a tela desenha.
    db.mealSlot.findMany({
      where: { mealPlanId: plano.id },
      select: {
        id: true,
        data: true,
        tipo: true,
        status: true,
        recipeId: true,
        recipe: { select: { id: true, nome: true, tipoRefeicao: true, imagemUrl: true } },
        feedback: { select: { estado: true } },
      },
      orderBy: { data: "asc" },
    }),
    db.mealSlot.findMany({
      where: { mealPlanId: plano.id, data: { in: datasSemana } },
      include: { recipe: { include: { ingredients: { include: { ingredient: true } } } } },
    }),
  ]);

  const slotsPorDia = new Map<number, typeof todosSlots>();
  for (const slot of todosSlots) {
    const idx = diffDiasChave(inicio, slot.data);
    slotsPorDia.set(idx, [...(slotsPorDia.get(idx) ?? []), slot]);
  }
  const ordenar = (arr: typeof todosSlots) =>
    [...arr].sort((a, b) => TIPO_REFEICAO_ORDEM.indexOf(a.tipo) - TIPO_REFEICAO_ORDEM.indexOf(b.tipo));

  // ---- Estatísticas do ciclo ------------------------------------------------
  const diasComFeedback = new Set(
    todosSlots.filter((s) => s.feedback).map((s) => diffDiasChave(inicio, s.data)),
  ).size;
  const receitasDiferentes = new Set(todosSlots.filter((s) => s.recipeId).map((s) => s.recipeId)).size;

  const contagemPorReceita = new Map<string, { nome: string; pontos: number }>();
  for (const s of todosSlots) {
    if (!s.recipe || !s.feedback) continue;
    const pontos = { GOSTOU: 3, ACEITOU: 2, EXPERIMENTOU: 1, RECUSOU: -2 }[s.feedback.estado] ?? 0;
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
    where: { childProfileId: child.id, ingredientId: { in: desejados.map((d) => d.ingredientId) } },
  });
  const apresentados = journeys.filter((j) => j.exposicoes > 0).length;
  const aceitos = journeys.filter((j) => j.ultimoEstado === "GOSTOU" || j.ultimoEstado === "ACEITOU").length;

  // ---- Nutrição da semana selecionada --------------------------------------
  const nutSemana = { kcal: 0, prot: 0, carb: 0, gord: 0 };
  for (const s of slotsSemana) {
    if (!s.recipe) continue;
    const r = calcularNutricao(s.recipe.ingredients, s.recipe.porcoes);
    if (r) {
      nutSemana.kcal += r.porPorcao.energiaKcal;
      nutSemana.prot += r.porPorcao.proteinaG;
      nutSemana.carb += r.porPorcao.carboidratoG;
      nutSemana.gord += r.porPorcao.lipideoG;
    }
  }
  const nd = diasDaSemana.length || 1;
  const kcalDia = Math.round(nutSemana.kcal / nd);
  const protDia = Math.round(nutSemana.prot / nd);
  const carbDia = Math.round(nutSemana.carb / nd);
  const gordDia = Math.round(nutSemana.gord / nd);
  const kMac = protDia * 4 + carbDia * 4 + gordDia * 9 || 1;

  // ---- Aceitação por semana (tendência) ------------------------------------
  const aceitacaoSemanas = Array.from({ length: totalSemanas }, (_, w) => {
    const comFb = todosSlots.filter((s) => {
      const idx = diffDiasChave(inicio, s.data);
      return idx >= 0 && idx < 30 && Math.floor(idx / 7) === w && s.feedback;
    });
    const pos = comFb.filter((s) => s.feedback && POSITIVO.has(s.feedback.estado)).length;
    return { w, pct: comFb.length ? Math.round((pos / comFb.length) * 100) : 0, registros: comFb.length };
  });

  const registradasDoDia = (slots: typeof todosSlots) =>
    slots.filter((s) => s.feedback || s.status === "FORA_DE_CASA" || s.status === "SEM_TEMPO").length;
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
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-stone-200/70 bg-white text-stone-600 transition active:scale-95 hover:bg-stone-50"
          >
            <BarChart3 size={17} />
          </Link>
        }
      />

      <div className="space-y-5 px-4 py-4">
        {/* Herói: progresso do ciclo */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500 to-orange-400 p-5 text-white shadow-card-lg">
          <div aria-hidden className="pointer-events-none absolute -right-10 -top-12 h-44 w-44 rounded-full bg-white/10" />
          <div className="relative flex items-start justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wide text-white/80">
                {cicloEncerrado ? "Ciclo concluído" : "Progresso do ciclo"}
              </span>
              <p className="font-display mt-2 text-4xl leading-none">
                Dia {diaHojeClamp}
                <span className="text-xl font-semibold text-white/60"> / 30</span>
              </p>
            </div>
            <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white">
              {Math.round((diaHojeClamp / 30) * 100)}%
            </span>
          </div>
          <ProgressBar value={diaHojeClamp} max={30} barClassName="bg-white" className="relative mt-4 h-2 bg-white/25" />
          <div className="relative mt-4 grid grid-cols-3 gap-2">
            <HeroStat icon={CalendarDays} valor={diasComFeedback} rotulo="dias acompanhados" />
            <HeroStat icon={Shuffle} valor={receitasDiferentes} rotulo="receitas diferentes" />
            <HeroStat icon={Sparkles} valor={aceitos} rotulo="alimentos aceitos" />
          </div>
        </div>

        {/* Atalhos — mais funções */}
        <div className="grid grid-cols-3 gap-3">
          <Atalho href="/compras" icon={ShoppingCart} tone="text-orange-500 bg-orange-50" label="Lista de compras" />
          <Atalho href="/descobertas" icon={Sparkles} tone="text-sky-500 bg-sky-50" label="Descobertas" />
          <Atalho href="/relatorio" icon={BarChart3} tone="text-emerald-500 bg-emerald-50" label="Relatório" />
        </div>

        {/* Alternador Semana | Mês */}
        <div className="flex gap-1 rounded-2xl bg-stone-100 p-1 text-sm">
          <TabLink href={`/plano?view=semana&dia=${diaClamped}`} ativo={view !== "mes"}>Semana</TabLink>
          <TabLink href={`/plano?view=mes&dia=${diaClamped}`} ativo={view === "mes"}>Mês inteiro</TabLink>
        </div>

        {view === "mes" ? (
          <>
            {/* Heatmap do mês */}
            <div className="rounded-3xl border border-stone-200/60 bg-white p-4 shadow-card">
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
                  const positivos = (slotsPorDia.get(i) ?? []).filter(
                    (s) => s.feedback && POSITIVO.has(s.feedback.estado),
                  ).length;
                  const ativo = i === diaClamped;
                  const ehHoje = diffDiasChave(data, hoje) === 0;
                  const heat =
                    positivos >= 3
                      ? "bg-emerald-500 text-white border-emerald-500"
                      : positivos === 2
                        ? "bg-emerald-200 text-emerald-800 border-emerald-200"
                        : positivos === 1
                          ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                          : "bg-white text-stone-600 border-stone-200/70";
                  return (
                    <Link
                      key={i}
                      href={`/plano?view=mes&dia=${i}`}
                      className={cn(
                        "flex aspect-square flex-col items-center justify-center rounded-xl border text-center transition",
                        ativo ? "border-orange-400 bg-orange-500 text-white shadow-card" : heat,
                        !ativo && ehHoje && "ring-2 ring-orange-300",
                      )}
                    >
                      <span className="text-sm font-bold leading-none">{data.getUTCDate()}</span>
                      <span className={cn("mt-0.5 text-[9px] leading-none", ativo ? "text-orange-100" : "opacity-60")}>
                        dia {i + 1}
                      </span>
                    </Link>
                  );
                })}
              </div>
              <div className="mt-3 flex items-center gap-3 border-t border-stone-100 pt-3 text-[10px] text-stone-400">
                <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded bg-emerald-500" /> muito aceito</span>
                <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded bg-emerald-100" /> algum registro</span>
                <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded ring-2 ring-orange-300" /> hoje</span>
              </div>
            </div>

            <DiaCompacto indice={diaClamped} data={dataDoDia(diaClamped)} hoje={hoje} slots={ordenar(slotsPorDia.get(diaClamped) ?? [])} />
          </>
        ) : (
          <>
            {/* Nutrição da semana */}
            <section>
              <h2 className="font-display mb-3 flex items-center gap-2 px-1 text-base font-semibold text-stone-800">
                <Flame size={16} className="text-orange-500" /> Nutrição da semana
              </h2>
              <div className="rounded-3xl border border-stone-200/60 bg-white p-5 shadow-card">
                {kcalDia === 0 ? (
                  <p className="text-sm text-stone-400">Sem dados nutricionais para esta semana.</p>
                ) : (
                  <>
                    <p className="font-display text-3xl leading-none text-stone-900">
                      {kcalDia}
                      <span className="ml-1 text-base font-semibold text-stone-400">kcal/dia</span>
                    </p>
                    <p className="mt-1 text-xs text-stone-400">média por dia · estimativa base TACO</p>
                    <div className="mt-4 flex h-2.5 overflow-hidden rounded-full bg-stone-100">
                      <div className="bg-sky-400" style={{ width: `${Math.round(((protDia * 4) / kMac) * 100)}%` }} />
                      <div className="bg-amber-400" style={{ width: `${Math.round(((carbDia * 4) / kMac) * 100)}%` }} />
                      <div className="bg-rose-400" style={{ width: `${Math.round(((gordDia * 9) / kMac) * 100)}%` }} />
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                      <Macro cor="text-sky-500" label="Proteína/dia" valor={`${protDia}g`} />
                      <Macro cor="text-amber-500" label="Carbo/dia" valor={`${carbDia}g`} />
                      <Macro cor="text-rose-500" label="Gordura/dia" valor={`${gordDia}g`} />
                    </div>
                  </>
                )}
              </div>
            </section>

            {/* Tendência de aceitação por semana */}
            <section>
              <h2 className="font-display mb-3 flex items-center gap-2 px-1 text-base font-semibold text-stone-800">
                <TrendingUp size={16} className="text-emerald-500" /> Aceitação por semana
              </h2>
              <div className="rounded-3xl border border-stone-200/60 bg-white p-5 shadow-card">
                <div className="flex items-end justify-between gap-2" style={{ height: 96 }}>
                  {aceitacaoSemanas.map((s) => (
                    <div key={s.w} className="flex flex-1 flex-col items-center justify-end gap-1">
                      <span className="text-[10px] font-semibold text-stone-500">{s.registros > 0 ? `${s.pct}%` : "—"}</span>
                      <div
                        className={cn(
                          "w-full rounded-lg transition-all",
                          s.registros === 0 ? "bg-stone-100" : s.pct >= 60 ? "bg-emerald-400" : s.pct >= 30 ? "bg-amber-400" : "bg-rose-300",
                        )}
                        style={{ height: `${Math.max(6, (s.registros > 0 ? s.pct : 0) * 0.7)}px` }}
                      />
                      <span className={cn("text-[10px]", semanaNum === s.w + 1 ? "font-bold text-orange-600" : "text-stone-400")}>
                        S{s.w + 1}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="mt-3 border-t border-stone-100 pt-2 text-[10px] text-stone-400">
                  % de refeições com reação positiva (gostou/aceitou) em cada semana do ciclo.
                </p>
              </div>
            </section>

            {/* Navegação de semanas */}
            <div className="flex items-center justify-between px-1">
              <NavSemana href={semanaNum > 1 ? `/plano?view=semana&dia=${Math.max(0, semanaInicioIdx - 7)}` : null} dir="prev" />
              <span className="font-display text-sm font-semibold text-stone-700">Semana {semanaNum} de {totalSemanas}</span>
              <NavSemana href={semanaNum < totalSemanas ? `/plano?view=semana&dia=${Math.min(29, semanaInicioIdx + 7)}` : null} dir="next" />
            </div>

            {/* Agenda compacta da semana */}
            <div className="space-y-3">
              {diasDaSemana.map((i) => (
                <DiaCompacto
                  key={i}
                  indice={i}
                  data={dataDoDia(i)}
                  hoje={hoje}
                  slots={ordenar(slotsPorDia.get(i) ?? [])}
                  registradas={registradasDoDia(slotsPorDia.get(i) ?? [])}
                />
              ))}
            </div>
          </>
        )}

        {/* Insights do ciclo */}
        <section className="space-y-3 pt-1">
          <h2 className="font-display px-1 text-base font-semibold text-stone-800">Como está indo</h2>
          <div className="rounded-3xl border border-stone-200/60 bg-white p-4 shadow-card">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-stone-700">
              <Heart size={15} className="text-emerald-500" fill="currentColor" /> Favoritos do ciclo
            </div>
            {topFavoritos.length === 0 ? (
              <p className="text-sm text-stone-400">Registre as reações nas refeições e os campeões aparecem aqui.</p>
            ) : (
              <ul className="space-y-1 text-sm">
                {topFavoritos.map((r) => (
                  <li key={r.nome} className="flex items-center justify-between border-b border-stone-100 py-1.5 last:border-0">
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
            <Link href="/descobertas" className="flex items-center gap-3 rounded-3xl border border-sky-100 bg-sky-50/60 p-4 transition active:scale-[0.99]">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-sky-500 shadow-card">
                <Sparkles size={18} />
              </span>
              <p className="flex-1 text-sm text-stone-700">
                <strong className="text-stone-900">{aceitos} de {apresentados}</strong> alimentos novos apresentados já foram aceitos por {child.nome}.
              </p>
              <ChevRight size={16} className="shrink-0 text-sky-400" />
            </Link>
          )}

          {(cicloEncerrado || diaHojeNoCiclo >= 27) && (
            <div className="rounded-3xl border border-orange-200 bg-orange-50 p-5 text-center">
              <TrendingUp className="mx-auto text-orange-500" size={24} />
              <p className="mt-2 font-semibold text-stone-800">
                {cicloEncerrado ? "Ciclo completo! Hora de gerar o próximo mês." : `Faltam ${30 - diaHojeClamp} dias para fechar este ciclo.`}
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

function HeroStat({ icon: Icon, valor, rotulo }: { icon: typeof CalendarDays; valor: number; rotulo: string }) {
  return (
    <div className="rounded-2xl bg-white/15 p-2.5 text-center">
      <Icon size={15} className="mx-auto text-white/90" />
      <p className="font-display mt-1 text-lg leading-none text-white">{valor}</p>
      <p className="mt-0.5 text-[10px] leading-tight text-white/70">{rotulo}</p>
    </div>
  );
}

function Atalho({ href, icon: Icon, tone, label }: { href: string; icon: typeof CalendarDays; tone: string; label: string }) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center gap-2 rounded-3xl border border-stone-200/60 bg-white p-3 text-center shadow-card transition active:scale-95"
    >
      <span className={cn("flex h-10 w-10 items-center justify-center rounded-2xl", tone)}>
        <Icon size={18} />
      </span>
      <span className="text-[11px] font-medium leading-tight text-stone-600">{label}</span>
    </Link>
  );
}

function Macro({ cor, label, valor }: { cor: string; label: string; valor: string }) {
  return (
    <div>
      <p className={cn("font-display text-lg leading-none", cor)}>{valor}</p>
      <p className="mt-1 text-[10px] text-stone-400">{label}</p>
    </div>
  );
}

function TabLink({ href, ativo, children }: { href: string; ativo: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={cn("flex-1 rounded-xl py-1.5 text-center font-semibold transition", ativo ? "bg-white text-stone-800 shadow-card" : "text-stone-500")}
    >
      {children}
    </Link>
  );
}

function NavSemana({ href, dir }: { href: string | null; dir: "prev" | "next" }) {
  const Icon = dir === "prev" ? ChevronLeft : ChevronRight;
  if (!href) return <span className="flex h-8 w-8 items-center justify-center text-stone-300"><Icon size={18} /></span>;
  return (
    <Link href={href} className="flex h-8 w-8 items-center justify-center rounded-lg border border-stone-200 bg-white text-stone-600 transition active:scale-95 hover:bg-stone-50">
      <Icon size={18} />
    </Link>
  );
}

// Bloco compacto de um dia: cabeçalho + refeições (cada uma toca para a receita).
function DiaCompacto({
  indice,
  data,
  hoje,
  slots,
  registradas,
}: {
  indice: number;
  data: Date;
  hoje: Date;
  slots: { id: string; tipo: string; recipe: { id: string; nome: string } | null; feedback: { estado: EstadoFeedback } | null }[];
  registradas?: number;
}) {
  const ehHoje = diffDiasChave(data, hoje) === 0;
  return (
    <div className={cn("rounded-3xl border bg-white p-4 shadow-card", ehHoje ? "border-orange-200" : "border-stone-200/60")}>
      <div className="mb-2 flex items-center justify-between">
        <span className="flex items-center gap-2 text-sm font-semibold text-stone-700">
          <span className={cn("flex h-8 w-10 flex-col items-center justify-center rounded-lg text-center leading-none", ehHoje ? "bg-orange-100 text-orange-700" : "bg-stone-100 text-stone-500")}>
            <span className="text-[9px] uppercase">{formatDiaSemana(data)}</span>
            <span className="text-xs font-bold">{data.getUTCDate()}</span>
          </span>
          {ehHoje ? "Hoje" : `Dia ${indice + 1}`}
        </span>
        {registradas != null && registradas > 0 && (
          <span className="text-[11px] font-medium text-emerald-600">{registradas}/{slots.length} registradas</span>
        )}
      </div>
      <ul className="divide-y divide-stone-100">
        {slots.map((slot) => {
          const conteudo = (
            <>
              <span className={cn("shrink-0", MEAL_COLOR[slot.tipo as TipoRefeicao].text)}>
                <MealTypeIcon tipo={slot.tipo as TipoRefeicao} size={14} />
              </span>
              <span className="w-16 shrink-0 text-xs text-stone-400">{TIPO_REFEICAO_LABEL[slot.tipo]}</span>
              <span className="min-w-0 flex-1 truncate text-sm text-stone-700">{slot.recipe ? slot.recipe.nome : "—"}</span>
              {slot.feedback ? (
                <span className="shrink-0" title={ESTADO_FEEDBACK_LABEL[slot.feedback.estado]}>
                  <ReactionIcon estado={slot.feedback.estado} active size={15} />
                </span>
              ) : (
                <ChevRight size={14} className="shrink-0 text-stone-300" />
              )}
            </>
          );
          return (
            <li key={slot.id}>
              {slot.recipe ? (
                <Link href={`/receita/${slot.recipe.id}`} className="flex items-center gap-2 py-2 transition active:opacity-60">
                  {conteudo}
                </Link>
              ) : (
                <div className="flex items-center gap-2 py-2">{conteudo}</div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
