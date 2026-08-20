import Link from "next/link";
import { getCurrentChild } from "@/lib/currentChild";
import { db } from "@/lib/db";
import { addDiasChave, hojeChave, diffDiasChave, horaSaoPaulo } from "@/lib/dates";
import { TIPO_REFEICAO_LABEL, TIPO_REFEICAO_ORDEM } from "@/lib/constants";
import TopBar from "@/components/TopBar";
import type { MealCardData } from "@/components/MealCard";
import RefeicoesComFiltro from "./RefeicoesComFiltro";
import GerarProximoCicloButton from "./GerarProximoCicloButton";
import { PartyPopper, CalendarClock, Search, Bell } from "lucide-react";
import { MealTypeIcon, MEAL_COLOR } from "@/components/mealIcons";
import Card from "@/components/ui/Card";
import CircleArrow from "@/components/ui/CircleArrow";
import LottieAleatorio from "@/components/LottieAleatorio";
import SectionHeader from "@/components/ui/SectionHeader";
import ProgressBar from "@/components/ui/ProgressBar";
import EmptyState from "@/components/ui/EmptyState";
import { cn } from "@/lib/cn";
import type { TipoRefeicao } from "@prisma/client";

function saudacao(hora: number) {
  if (hora < 12) return "Bom dia";
  if (hora < 18) return "Boa tarde";
  return "Boa noite";
}

export default async function HojePage() {
  const { session, child } = await getCurrentChild();

  const [plano, usuario] = await Promise.all([
    db.mealPlan.findFirst({
      where: { childProfileId: child.id, ativo: true },
      orderBy: { cicloNumero: "desc" },
    }),
    db.user.findUnique({ where: { id: session.user.id }, select: { lembretes: true } }),
  ]);

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

  const nome = session.user.name?.split(" ")[0] ?? child.nome;
  const inicial = (nome[0] ?? "?").toUpperCase();
  const aceitasHoje = cardsData.filter(
    (c) => c.feedbackEstado === "GOSTOU" || c.feedbackEstado === "ACEITOU",
  ).length;

  return (
    <div className="space-y-5 px-4 pb-4 pt-5">
      {/* Saudação + avatar */}
      <header className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-stone-500">{saudacao(horaSaoPaulo())},</p>
          <h1 className="font-display truncate text-[27px] leading-tight text-stone-900">
            {nome}!
          </h1>
        </div>
        <div className="flex shrink-0 items-center gap-2.5">
          <Link
            href="/configuracoes"
            aria-label="Lembretes"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-stone-200/70 bg-white text-stone-600 transition active:scale-95"
          >
            <Bell size={18} />
          </Link>
          <Link
            href="/perfil"
            aria-label="Perfil"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-stone-900 text-base font-bold text-white transition active:scale-95"
          >
            {inicial}
          </Link>
        </div>
      </header>

      {/* CTA preto — ação principal */}
      {!cicloEncerrado && (
        <Link
          href="/receitas"
          className="flex w-full items-center justify-center gap-2 rounded-full bg-stone-900 py-4 text-sm font-semibold text-white shadow-sm shadow-stone-900/25 transition active:scale-[0.98]"
        >
          <Search size={17} /> Buscar receitas
        </Link>
      )}

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
          {/* Resumo de hoje — trio de cards (card-herói + dois menores) */}
          <section>
            <SectionHeader title="Resumo de hoje" href="/plano" action="Ver tudo" />

            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500 to-orange-400 p-5 text-white shadow-card-lg">
              <div aria-hidden className="pointer-events-none absolute -right-10 -top-12 h-44 w-44 rounded-full bg-white/10" />
              <div aria-hidden className="pointer-events-none absolute -bottom-16 -left-8 h-44 w-44 rounded-full bg-black/5" />
              {/* Personagem sorteado a cada visita, "pisando" na barra de
                  progresso (base alinhada logo acima dela). */}
              <LottieAleatorio
                preserveAspectRatio="xMidYMax meet"
                className="pointer-events-none absolute bottom-6 right-2 h-40 w-44"
              />
              <div className="relative flex items-start justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-white/80">
                  Progresso do ciclo
                </span>
                <CircleArrow href="/plano" tone="white" aria-label="Ver plano completo" />
              </div>
              <p className="font-display relative mt-4 text-5xl leading-none">
                {diaDoCiclo}
                <span className="text-2xl font-semibold text-white/60"> / 30</span>
              </p>
              <p className="relative mt-1 text-sm text-white/80">dia do plano de {child.nome}</p>
              <ProgressBar
                value={diaDoCiclo}
                max={30}
                barClassName="bg-white"
                className="relative mt-4 h-2 bg-white/25"
              />
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3">
              <StatMini
                tint="bg-orange-50"
                label="Refeições hoje"
                valor={resolvidas}
                sub={`de ${cardsData.length} registradas`}
              />
              <StatMini
                tint="bg-white"
                label="Aceitas hoje"
                valor={aceitasHoje}
                sub="gostou / aceitou"
              />
            </div>
          </section>

          {/* Lembrete */}
          {usuario?.lembretes && resolvidas === 0 && cardsData.length > 0 && (
            <div className="flex items-start gap-2.5 rounded-2xl border border-orange-200/70 bg-orange-50 px-4 py-3 text-[13px] text-orange-800">
              <Bell size={16} className="mt-0.5 shrink-0" />
              <span>
                Toque em <strong>Gostou / Aceitou / Experimentou / Recusou</strong> em cada refeição
                para o cardápio do próximo mês ficar cada vez mais a cara de {child.nome}.
              </span>
            </div>
          )}

          {/* Cardápio de hoje + filtro por refeição */}
          <section>
            <SectionHeader title="Cardápio de hoje" />
            <RefeicoesComFiltro cards={cardsData} childId={child.id} />
          </section>
        </>
      )}

      {/* Amanhã */}
      {!cicloEncerrado && amanha.length > 0 && (
        <section>
          <SectionHeader title="Amanhã" href="/plano" action="Ver plano" />
          <Card padding="sm">
            <ul className="divide-y divide-stone-100">
              {amanha.map((s) => (
                <li key={s.id} className="flex items-center gap-2 px-1 py-2 text-sm">
                  <span className={`shrink-0 ${MEAL_COLOR[s.tipo].text}`}>
                    <MealTypeIcon tipo={s.tipo} size={15} />
                  </span>
                  <span className="text-stone-500">{TIPO_REFEICAO_LABEL[s.tipo]}</span>
                  <span className="ml-auto truncate font-medium text-stone-800">
                    {s.recipe ? s.recipe.nome : "—"}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </section>
      )}
    </div>
  );
}

function StatMini({
  tint,
  label,
  valor,
  sub,
}: {
  tint: string;
  label: string;
  valor: number;
  sub: string;
}) {
  return (
    <div className={cn("rounded-3xl border border-stone-200/60 p-4 shadow-card", tint)}>
      <div className="flex items-start justify-between">
        <span className="text-xs font-semibold text-stone-500">{label}</span>
        <CircleArrow tone="light" size={28} />
      </div>
      <p className="font-display mt-3 text-3xl leading-none text-stone-900">{valor}</p>
      <p className="mt-1.5 text-[11px] text-stone-400">{sub}</p>
    </div>
  );
}
