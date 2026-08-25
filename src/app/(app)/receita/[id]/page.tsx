import { notFound } from "next/navigation";
import { getCurrentChild } from "@/lib/currentChild";
import { db } from "@/lib/db";
import TopBar from "@/components/TopBar";
import CapaReceita from "@/components/CapaReceita";
import ModoCozinha from "./ModoCozinha";
import ModoCozinhaBloqueado from "./ModoCozinhaBloqueado";
import { getConta } from "@/lib/currentChild";
import { podeUsar } from "@/lib/plano";
import FavoriteButton from "./FavoriteButton";
import { MEAL_COLOR } from "@/components/mealIcons";
import { TriangleAlert, Leaf } from "lucide-react";
import Card from "@/components/ui/Card";
import TabelaNutricional from "@/components/TabelaNutricional";
import { calcularNutricao } from "@/lib/nutricao";

export default async function ReceitaPage({ params }: { params: Promise<{ id: string }> }) {
  const { conta } = await getConta();
  const cozinhaLiberada = podeUsar("modo_cozinha", conta.subscription);

  const { id } = await params;
  const { child } = await getCurrentChild();

  const recipe = await db.recipe.findUnique({
    where: { id },
    include: { ingredients: { include: { ingredient: true } } },
  });
  if (!recipe) notFound();

  const favorito = await db.favorite.findUnique({
    where: { childProfileId_recipeId: { childProfileId: child.id, recipeId: recipe.id } },
  });

  const passos = recipe.passos.split("\n").filter(Boolean);
  const restricoes = recipe.restricoes.split(",").filter(Boolean);
  const cor = MEAL_COLOR[recipe.tipoRefeicao];
  const nutricao = calcularNutricao(recipe.ingredients, recipe.porcoes);

  return (
    <>
      <TopBar title="Receita" back />
      <div className="px-4 py-4">
        {/* Toda receita tem capa: foto quando existe, capa gerada quando nao. */}
        <CapaReceita
          tipo={recipe.tipoRefeicao}
          nome={recipe.nome}
          imagemUrl={recipe.imagemUrl}
          className="mb-3 h-48 w-full rounded-2xl shadow-card"
          tamanhoIcone={40}
          prioridade
        />

        <div className="mb-3">
          {cozinhaLiberada ? (
          <ModoCozinha
            nome={recipe.nome}
            passos={passos}
            ingredientes={recipe.ingredients.map(
              (ri) => `${ri.ingredient.nome} — ${ri.quantidade}`
            )}
          />
          ) : (
            <ModoCozinhaBloqueado />
          )}
        </div>

        <Card padding="lg">
          <div className="flex items-start justify-between">
            <div className="ml-auto">
              <FavoriteButton childId={child.id} recipeId={recipe.id} favoritoInicial={!!favorito} />
            </div>
          </div>
          <h1 className="mt-3 text-xl font-bold text-stone-900">{recipe.nome}</h1>
          <p className="mt-1 text-sm text-stone-500">{recipe.resumo}</p>

          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <StatBox label="Tempo" value={`${recipe.tempoPreparoMin} min`} />
            <StatBox label="Dificuldade" value={recipe.dificuldade} />
            <StatBox label="Rendimento" value={recipe.rendimento} />
          </div>

          {/*
            A nota qualitativa ("fonte de ferro") só aparece quando não há cálculo real.
            Quando existe composição da TACO, a tabela no fim da página é mais precisa —
            e evita repetir uma alegação nutricional sem os valores que a sustentam.
          */}
          {!nutricao && recipe.nutricao && (
            <div className="mt-3 flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700">
              <Leaf size={14} className="shrink-0" />
              {recipe.nutricao}
            </div>
          )}

          {restricoes.length > 0 && (
            <div className="mt-2 flex items-center gap-1.5 rounded-xl bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700">
              <TriangleAlert size={14} className="shrink-0" />
              Contém: {restricoes.join(", ")}
            </div>
          )}

          <div className="mt-5">
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-stone-400">
              Ingredientes
            </h2>
            <ul className="space-y-1 text-sm text-stone-700">
              {recipe.ingredients.map((ri) => (
                <li key={ri.id} className="flex justify-between border-b border-stone-100 py-1.5 last:border-0">
                  <span>{ri.ingredient.nome}</span>
                  <span className="text-stone-400">{ri.quantidade}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-5">
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-stone-400">
              Modo de preparo
            </h2>
            <ol className="space-y-3 text-sm text-stone-700">
              {passos.map((passo, i) => (
                <li key={i} className="flex gap-3">
                  <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold ${cor.bg}`}>
                    {i + 1}
                  </span>
                  {passo}
                </li>
              ))}
            </ol>
          </div>

          {nutricao && <TabelaNutricional resumo={nutricao} />}
        </Card>
      </div>
    </>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-stone-50 py-2">
      <p className="text-sm font-bold text-stone-800">{value}</p>
      <p className="text-[11px] text-stone-400">{label}</p>
    </div>
  );
}
