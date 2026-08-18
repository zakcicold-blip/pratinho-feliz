import Link from "next/link";
import { Star } from "lucide-react";
import { getCurrentChild } from "@/lib/currentChild";
import { db } from "@/lib/db";
import TopBar from "@/components/TopBar";
import RecipeThumb from "@/components/RecipeThumb";
import EmptyState from "@/components/ui/EmptyState";

export default async function FavoritosPage() {
  const { child } = await getCurrentChild();

  const favoritos = await db.favorite.findMany({
    where: { childProfileId: child.id },
    include: { recipe: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <TopBar title="Favoritos" subtitle={`Receitas que funcionam bem com ${child.nome}`} />
      <div className="px-4 py-4">
        {favoritos.length === 0 ? (
          <EmptyState
            icon={Star}
            title="Ainda não há favoritos"
            description="Toque na estrela em qualquer receita para salvar aqui."
          />
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {favoritos.map((f) => (
              <Link
                key={f.id}
                href={`/receita/${f.recipeId}`}
                className="rounded-2xl border border-stone-200/70 bg-white p-4 shadow-card transition hover:border-orange-200"
              >
                <RecipeThumb
                  tipo={f.recipe.tipoRefeicao}
                  imagemUrl={f.recipe.imagemUrl}
                  nome={f.recipe.nome}
                  size={40}
                />
                <p className="mt-2 text-sm font-semibold text-stone-800">{f.recipe.nome}</p>
                <p className="text-xs text-stone-400">
                  {f.recipe.tempoPreparoMin} min · {f.recipe.dificuldade}
                </p>
                {f.origem === "manual" && (
                  <span className="mt-1 flex items-center gap-0.5 text-[10px] font-medium text-amber-500">
                    <Star size={10} fill="currentColor" /> favorito
                  </span>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
