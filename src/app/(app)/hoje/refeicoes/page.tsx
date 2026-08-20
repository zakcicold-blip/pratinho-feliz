import Link from "next/link";
import { getCurrentChild } from "@/lib/currentChild";
import { db } from "@/lib/db";
import { hojeChave, diffDiasChave } from "@/lib/dates";
import { TIPO_REFEICAO_LABEL, TIPO_REFEICAO_ORDEM, STATUS_SLOT_LABEL } from "@/lib/constants";
import { calcularNutricao } from "@/lib/nutricao";
import TopBar from "@/components/TopBar";
import EmptyState from "@/components/ui/EmptyState";
import ProgressBar from "@/components/ui/ProgressBar";
import { MealTypeIcon, MEAL_COLOR } from "@/components/mealIcons";
import { ReactionIcon } from "@/components/reactionIcons";
import {
  CalendarClock,
  Clock3,
  Car,
  CircleCheck,
  Flame,
  Timer,
  ShoppingBasket,
  Moon,
  Zap,
  Wind,
} from "lucide-react";
import type { EstadoFeedback, TipoRefeicao } from "@prisma/client";
import { cn } from "@/lib/cn";

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

  const slotsRaw = await db.mealSlot.findMany({
    where: { mealPlanId: plano.id, data: cicloEncerrado ? undefined : hoje },
    include: {
      recipe: { include: { ingredients: { include: { ingredient: true } } } },
      feedback: true,
    },
  });
  const slots = TIPO_REFEICAO_ORDEM.map((t) => slotsRaw.find((s) => s.tipo === t)).filter(
    (s): s is (typeof slotsRaw)[number] => !!s,
  );

  // ---- Métricas do dia --------------------------------------------------
  const nut = { kcal: 0, prot: 0, carb: 0, gord: 0, fibra: 0 };
  let refeicoesComNutricao = 0;
  let tempoTotal = 0;
  let faceis = 0;
  const ingredientes = new Set<string>();
  const scores = { sono: [] as number[], energia: [] as number[], calma: [] as number[] };

  for (const s of slots) {
    if (!s.recipe) continue;
    tempoTotal += s.recipe.tempoPreparoMin;
    if (s.recipe.dificuldade.toLowerCase().includes("fácil")) faceis++;
    for (const ri of s.recipe.ingredients) ingredientes.add(ri.ingredient.nome);
    if (s.recipe.scoreSono != null) scores.sono.push(s.recipe.scoreSono);
    if (s.recipe.scoreEnergia != null) scores.energia.push(s.recipe.scoreEnergia);
    if (s.recipe.scoreCalma != null) scores.calma.push(s.recipe.scoreCalma);

    const r = calcularNutricao(s.recipe.ingredients, s.recipe.porcoes);
    if (r) {
      refeicoesComNutricao++;
      nut.kcal += r.porPorcao.energiaKcal;
      nut.prot += r.porPorcao.proteinaG;
      nut.carb += r.porPorcao.carboidratoG;
      nut.gord += r.porPorcao.lipideoG;
      nut.fibra += r.porPorcao.fibraG;
    }
  }
  nut.kcal = Math.round(nut.kcal);
  nut.prot = Math.round(nut.prot);
  nut.carb = Math.round(nut.carb);
  nut.gord = Math.round(nut.gord);
  nut.fibra = Math.round(nut.fibra);

  // Barra de macros por contribuição calórica (proteína/carbo 4, gordura 9).
  const kProt = nut.prot * 4;
  const kCarb = nut.carb * 4;
  const kGord = nut.gord * 9;
  const kMacros = kProt + kCarb + kGord || 1;
  const pct = (v: number) => Math.round((v / kMacros) * 100);

  const media = (a: number[]) => (a.length ? Math.round(a.reduce((x, y) => x + y, 0) / a.length) : 0);
  const foco = { sono: media(scores.sono), energia: media(scores.energia), calma: media(scores.calma) };
  const temFoco = scores.sono.length + scores.energia.length + scores.calma.length > 0;

  const registradas = slots.filter((s) => s.feedback).length;
  const foraDeCasa = slots.filter((s) => s.status === "FORA_DE_CASA").length;
  const semTempo = slots.filter((s) => s.status === "SEM_TEMPO").length;
  const pendentes = slots.length - registradas - foraDeCasa - semTempo;

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
            <span className="text-2xl font-semibold text-white/60"> / {slots.length}</span>
          </p>
          <p className="mt-1 text-sm text-white/80">refeições com reação marcada</p>
          <ProgressBar value={registradas} max={slots.length || 1} barClassName="bg-white" className="mt-4 h-2 bg-white/25" />
        </div>

        {/* Nutrição do dia */}
        <section>
          <h2 className="font-display mb-3 flex items-center gap-2 px-1 text-base font-semibold text-stone-800">
            <Flame size={16} className="text-orange-500" /> Nutrição do dia
          </h2>
          <div className="rounded-3xl border border-stone-200/60 bg-white p-5 shadow-card">
            {refeicoesComNutricao === 0 ? (
              <p className="text-sm text-stone-400">Sem dados nutricionais para as receitas de hoje.</p>
            ) : (
              <>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="font-display text-4xl leading-none text-stone-900">
                      {nut.kcal}
                      <span className="ml-1 text-base font-semibold text-stone-400">kcal</span>
                    </p>
                    <p className="mt-1 text-xs text-stone-400">somando as {refeicoesComNutricao} refeições do dia</p>
                  </div>
                </div>

                {/* Barra de macros */}
                <div className="mt-4 flex h-2.5 overflow-hidden rounded-full bg-stone-100">
                  <div className="bg-sky-400" style={{ width: `${pct(kProt)}%` }} />
                  <div className="bg-amber-400" style={{ width: `${pct(kCarb)}%` }} />
                  <div className="bg-rose-400" style={{ width: `${pct(kGord)}%` }} />
                </div>
                <div className="mt-3 grid grid-cols-4 gap-2 text-center">
                  <Macro cor="text-sky-500" label="Proteína" valor={`${nut.prot}g`} />
                  <Macro cor="text-amber-500" label="Carbo" valor={`${nut.carb}g`} />
                  <Macro cor="text-rose-500" label="Gordura" valor={`${nut.gord}g`} />
                  <Macro cor="text-emerald-500" label="Fibra" valor={`${nut.fibra}g`} />
                </div>
                <p className="mt-3 border-t border-stone-100 pt-2 text-[10px] text-stone-400">
                  Estimativa por porção · base TACO. Pode ser parcial quando falta dado de algum ingrediente.
                </p>
              </>
            )}
          </div>
        </section>

        {/* O dia em números */}
        <section>
          <h2 className="font-display mb-3 px-1 text-base font-semibold text-stone-800">O dia em números</h2>
          <div className="grid grid-cols-3 gap-3">
            <NumeroTile icon={Timer} tone="text-indigo-500" valor={`${tempoTotal}`} unidade="min" label="preparo total" />
            <NumeroTile icon={CircleCheck} tone="text-emerald-500" valor={`${faceis}`} unidade={`/${slots.length}`} label="fáceis" />
            <Link href="/compras" className="block">
              <NumeroTile icon={ShoppingBasket} tone="text-orange-500" valor={`${ingredientes.size}`} label="ingredientes" />
            </Link>
          </div>
        </section>

        {/* Foco da rotina */}
        {temFoco && (
          <section>
            <h2 className="font-display mb-3 px-1 text-base font-semibold text-stone-800">Foco da rotina</h2>
            <div className="space-y-3 rounded-3xl border border-stone-200/60 bg-white p-5 shadow-card">
              <FocoBar icon={Moon} cor="bg-indigo-400" label="Apoio ao sono" valor={foco.sono} />
              <FocoBar icon={Zap} cor="bg-amber-400" label="Disposição" valor={foco.energia} />
              <FocoBar icon={Wind} cor="bg-emerald-400" label="Calma" valor={foco.calma} />
              <p className="text-[10px] text-stone-400">Média das receitas de hoje (0–100).</p>
            </div>
          </section>
        )}

        {/* Status */}
        <section>
          <h2 className="font-display mb-3 px-1 text-base font-semibold text-stone-800">Status</h2>
          <div className="grid grid-cols-3 gap-3">
            <NumeroTile icon={Clock3} tone="text-stone-400" valor={`${pendentes}`} label="pendentes" />
            <NumeroTile icon={Car} tone="text-stone-400" valor={`${foraDeCasa}`} label="fora de casa" />
            <NumeroTile icon={Clock3} tone="text-amber-500" valor={`${semTempo}`} label="sem tempo" />
          </div>
        </section>

        {/* Refeições (resumo por prato, tocável) */}
        <section>
          <h2 className="font-display mb-3 px-1 text-base font-semibold text-stone-800">As refeições</h2>
          <div className="overflow-hidden rounded-3xl border border-stone-200/60 bg-white shadow-card">
            <ul className="divide-y divide-stone-100">
              {slots.map((s) => {
                const r = s.recipe ? calcularNutricao(s.recipe.ingredients, s.recipe.porcoes) : null;
                const linha = (
                  <>
                    <span className={cn("shrink-0", MEAL_COLOR[s.tipo as TipoRefeicao].text)}>
                      <MealTypeIcon tipo={s.tipo as TipoRefeicao} size={16} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] text-stone-400">{TIPO_REFEICAO_LABEL[s.tipo]}</p>
                      <p className="truncate text-sm font-medium text-stone-800">
                        {s.recipe ? s.recipe.nome : "—"}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-0.5">
                      {r && <span className="text-xs font-semibold text-stone-500">{r.porPorcao.energiaKcal} kcal</span>}
                      {s.feedback ? (
                        <ReactionIcon estado={s.feedback.estado as EstadoFeedback} active size={15} />
                      ) : s.status !== "PLANEJADO" ? (
                        <span className="text-[10px] text-stone-400">{STATUS_SLOT_LABEL[s.status]}</span>
                      ) : null}
                    </div>
                  </>
                );
                return (
                  <li key={s.id}>
                    {s.recipe ? (
                      <Link href={`/receita/${s.recipe.id}`} className="flex items-center gap-3 px-4 py-3 transition active:bg-stone-50">
                        {linha}
                      </Link>
                    ) : (
                      <div className="flex items-center gap-3 px-4 py-3">{linha}</div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      </div>
    </>
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

function NumeroTile({
  icon: Icon,
  tone,
  valor,
  unidade,
  label,
}: {
  icon: typeof Timer;
  tone: string;
  valor: string;
  unidade?: string;
  label: string;
}) {
  return (
    <div className="rounded-3xl border border-stone-200/60 bg-white p-4 text-center shadow-card">
      <Icon size={18} className={`mx-auto ${tone}`} />
      <p className="font-display mt-2 text-2xl leading-none text-stone-900">
        {valor}
        {unidade && <span className="text-sm font-semibold text-stone-400">{unidade}</span>}
      </p>
      <p className="mt-1 text-[11px] text-stone-400">{label}</p>
    </div>
  );
}

function FocoBar({
  icon: Icon,
  cor,
  label,
  valor,
}: {
  icon: typeof Moon;
  cor: string;
  label: string;
  valor: number;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex w-28 shrink-0 items-center gap-1.5 text-xs text-stone-600">
        <Icon size={14} className="text-stone-400" /> {label}
      </span>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-stone-100">
        <div className={cn("h-full rounded-full", cor)} style={{ width: `${valor}%` }} />
      </div>
      <span className="w-8 shrink-0 text-right text-[11px] font-semibold tabular-nums text-stone-500">{valor}</span>
    </div>
  );
}
