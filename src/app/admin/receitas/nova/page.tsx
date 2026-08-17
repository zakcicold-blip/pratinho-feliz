import { db } from "@/lib/db";
import RecipeForm from "../RecipeForm";

export default async function NovaReceitaPage() {
  const ingredientes = await db.ingredient.findMany({ orderBy: { nome: "asc" } });

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold text-stone-800">Nova receita</h1>
      <RecipeForm ingredientesDisponiveis={ingredientes} />
    </div>
  );
}
