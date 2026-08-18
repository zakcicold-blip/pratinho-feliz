import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import RecipeForm from "../RecipeForm";

export default async function EditarReceitaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [receita, ingredientes] = await Promise.all([
    db.recipe.findUnique({ where: { id }, include: { ingredients: true } }),
    db.ingredient.findMany({ orderBy: { nome: "asc" } }),
  ]);
  if (!receita) notFound();

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold text-stone-800">Editar receita</h1>
      <RecipeForm
        ingredientesDisponiveis={ingredientes}
        receita={{
          id: receita.id,
          nome: receita.nome,
          resumo: receita.resumo,
          tipoRefeicao: receita.tipoRefeicao,
          tempoPreparoMin: receita.tempoPreparoMin,
          dificuldade: receita.dificuldade,
          rendimento: receita.rendimento,
          passos: receita.passos,
          tags: receita.tags,
          restricoes: receita.restricoes,
          nutricao: receita.nutricao,
          idadeMinimaMeses: receita.idadeMinimaMeses,
          imagemUrl: receita.imagemUrl ?? "",
          fonte: receita.fonte ?? "",
          ingredientes: receita.ingredients.map((i) => ({
            ingredientId: i.ingredientId,
            quantidade: i.quantidade,
          })),
        }}
      />
    </div>
  );
}
