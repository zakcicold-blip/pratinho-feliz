import { getCurrentChild } from "@/lib/currentChild";
import { db } from "@/lib/db";
import { startOfDay } from "@/lib/dates";
import TopBar from "@/components/TopBar";
import GerarProximoCicloButton from "../hoje/GerarProximoCicloButton";
import Card from "@/components/ui/Card";
import StatCard from "@/components/ui/StatCard";
import EmptyState from "@/components/ui/EmptyState";
import { CalendarCheck, Shuffle, Sparkles, ThumbsUp, TrendingUp, ChartColumn } from "lucide-react";

export default async function RelatorioPage() {
  const { child } = await getCurrentChild();

  const plano = await db.mealPlan.findFirst({
    where: { childProfileId: child.id, ativo: true },
    orderBy: { cicloNumero: "desc" },
  });

  if (!plano) {
    return (
      <>
        <TopBar title="Relatório" />
        <EmptyState icon={ChartColumn} title="Nenhum ciclo ativo ainda" />
      </>
    );
  }

  const slots = await db.mealSlot.findMany({
    where: { mealPlanId: plano.id },
    include: { recipe: true, feedback: true },
  });

  const diasComFeedback = new Set(
    slots.filter((s) => s.feedback).map((s) => startOfDay(s.data).toISOString())
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

  const hoje = startOfDay(new Date());
  const diaDoCiclo =
    Math.floor((hoje.getTime() - startOfDay(plano.dataInicio).getTime()) / 86400000) + 1;
  const cicloConcluido = diaDoCiclo >= 30;

  return (
    <>
      <TopBar title="Relatório" subtitle={`Ciclo ${plano.cicloNumero} de ${child.nome}`} />

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
