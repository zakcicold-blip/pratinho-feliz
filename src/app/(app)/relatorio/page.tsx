import { getCurrentChild } from "@/lib/currentChild";
import { db } from "@/lib/db";
import { chaveDoDia, hojeChave, diffDiasChave, addDiasChave } from "@/lib/dates";
import { calcularNutricao } from "@/lib/nutricao";
import TopBar from "@/components/TopBar";
import GerarProximoCicloButton from "../hoje/GerarProximoCicloButton";
import Card from "@/components/ui/Card";
import StatCard from "@/components/ui/StatCard";
import EmptyState from "@/components/ui/EmptyState";
import { CalendarCheck, Shuffle, Sparkles, ThumbsUp, TrendingUp, ChartColumn } from "lucide-react";
import NutricaoSemana from "@/components/NutricaoSemana";
import CompartilharResumo from "./CompartilharResumo";
import { calcularCoberturaSemana, NUTRIENTES, type NutrienteChave } from "@/lib/metasNutricionais";
import { faixaEtariaEmMeses } from "@/lib/idade";

export default async function RelatorioPage() {
  const { child } = await getCurrentChild();

  const plano = await db.mealPlan.findFirst({
    where: { childProfileId: child.id, ativo: true },
    orderBy: { cicloNumero: "desc" },
  });

  if (!plano) {
    return (
      <>
        <TopBar title="Relatório" back />
        <EmptyState icon={ChartColumn} title="Nenhum ciclo ativo ainda" />
      </>
    );
  }

  const slots = await db.mealSlot.findMany({
    where: { mealPlanId: plano.id },
    include: { recipe: true, feedback: true },
  });

  // ---- Nutricao dos ultimos 7 dias planejados ----
  const seteDiasAtras = addDiasChave(hojeChave(), -6);
  const slotsSemana = await db.mealSlot.findMany({
    where: {
      mealPlanId: plano.id,
      data: { gte: seteDiasAtras, lte: hojeChave() },
      status: { not: "FORA_DE_CASA" },
      recipeId: { not: null },
    },
    include: {
      recipe: {
        include: { ingredients: { include: { ingredient: true } } },
      },
    },
  });

  const totaisNutri = Object.fromEntries(
    NUTRIENTES.map((n) => [n.chave, 0])
  ) as Record<NutrienteChave, number>;

  let refeicoesParciais = 0;
  const diasDistintos = new Set<string>();

  for (const slot of slotsSemana) {
    if (!slot.recipe) continue;
    diasDistintos.add(slot.data.toISOString());

    const resumo = calcularNutricao(
      slot.recipe.ingredients.map((ri) => ({
        quantidade: ri.quantidade,
        gramas: ri.gramas,
        ingredient: ri.ingredient,
      })),
      slot.recipe.porcoes
    );
    if (!resumo) continue;
    if (!resumo.completo) refeicoesParciais += 1;

    for (const n of NUTRIENTES) totaisNutri[n.chave] += resumo.porPorcao[n.chave];
  }

  const cobertura = calcularCoberturaSemana(
    totaisNutri,
    diasDistintos.size,
    faixaEtariaEmMeses(child.faixaEtaria),
    slotsSemana.length,
    refeicoesParciais
  );

  const diasComFeedback = new Set(
    slots.filter((s) => s.feedback).map((s) => chaveDoDia(s.data).toISOString())
  ).size;

  const receitasDiferentes = new Set(slots.filter((s) => s.recipeId).map((s) => s.recipeId)).size;

  const desejados = await db.foodPreference.findMany({
    where: { childProfileId: child.id, status: "DESEJADA" },
  });
  const journeys = await db.foodJourney.findMany({
    where: { childProfileId: child.id, ingredientId: { in: desejados.map((d) => d.ingredientId) } },
  });
  const apresentados = journeys.filter((j) => j.exposicoes > 0).length;
  const aceitos = journeys.filter(
    (j) => j.ultimoEstado === "GOSTOU" || j.ultimoEstado === "ACEITOU"
  ).length;

  const contagemPorReceita = new Map<string, { nome: string; pontos: number }>();
  for (const s of slots) {
    if (!s.recipe || !s.feedback) continue;
    const pontos = { GOSTOU: 3, ACEITOU: 2, EXPERIMENTOU: 1, RECUSOU: -2 }[s.feedback.estado] ?? 0;
    const atual = contagemPorReceita.get(s.recipeId!) ?? { nome: s.recipe.nome, pontos: 0 };
    atual.pontos += pontos;
    contagemPorReceita.set(s.recipeId!, atual);
  }
  const topFavoritos = Array.from(contagemPorReceita.values())
    .filter((r) => r.pontos > 0)
    .sort((a, b) => b.pontos - a.pontos)
    .slice(0, 5);

  const hoje = hojeChave();
  const diaDoCiclo =
    diffDiasChave(plano.dataInicio, hoje) + 1;
  const cicloConcluido = diaDoCiclo >= 30;

  return (
    <>
      <TopBar title="Relatório" subtitle={`Ciclo ${plano.cicloNumero} de ${child.nome}`} back />

      <div className="space-y-4 px-4 py-4">
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            icon={CalendarCheck}
            tone="orange"
            label="dias acompanhados"
            value={diasComFeedback}
            hint="Rotina"
          />
          <StatCard
            icon={Shuffle}
            tone="emerald"
            label="receitas diferentes"
            value={receitasDiferentes}
            hint="Variedade"
          />
          <StatCard
            icon={Sparkles}
            tone="blue"
            label="alimentos apresentados"
            value={apresentados}
            hint="Descoberta"
          />
          <StatCard
            icon={ThumbsUp}
            tone="amber"
            label="entre os apresentados"
            value={aceitos}
            hint="Aceitos"
          />
        </div>

        <Card>
          <h2 className="mb-1 text-sm font-semibold text-stone-700">Mostre o progresso</h2>
          <p className="mb-3 text-[13px] leading-relaxed text-stone-500">
            Uma imagem com o que {child.nome} conquistou neste ciclo — pronta para guardar ou
            postar.
          </p>
          <CompartilharResumo childId={child.id} nomeCrianca={child.nome} />
        </Card>

        <NutricaoSemana cobertura={cobertura} />

        <Card>
          <h2 className="mb-2 text-sm font-semibold text-stone-700">Favoritos do ciclo</h2>
          {topFavoritos.length === 0 ? (
            <p className="text-sm text-stone-400">
              Ainda sem dados suficientes — registre reações nas refeições para ver aqui.
            </p>
          ) : (
            <ul className="space-y-1 text-sm">
              {topFavoritos.map((r) => (
                <li key={r.nome} className="flex justify-between border-b border-stone-100 py-1.5 last:border-0">
                  <span className="text-stone-700">{r.nome}</span>
                  <span className="font-semibold text-emerald-600">+{r.pontos}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <div className="rounded-2xl border border-orange-200 bg-orange-50 p-5 text-center">
          <TrendingUp className="mx-auto text-orange-500" size={26} />
          <p className="mt-2 font-semibold text-stone-800">
            {cicloConcluido
              ? "Ciclo completo! Hora de gerar o próximo mês."
              : `Faltam ${30 - diaDoCiclo} dias para fechar este ciclo.`}
          </p>
          <p className="mt-1 text-sm text-stone-600">
            Seu próximo mês começa melhor porque o Pratinho Feliz já conhece um pouco mais da rotina.
          </p>
          <div className="mt-4 flex justify-center">
            <GerarProximoCicloButton childId={child.id} label="Gerar próximo ciclo agora" />
          </div>
        </div>
      </div>
    </>
  );
}
