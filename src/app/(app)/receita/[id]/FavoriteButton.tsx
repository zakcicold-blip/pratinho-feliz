"use client";

import { useState, useTransition } from "react";
import { Star } from "lucide-react";
import { alternarFavorito } from "@/lib/actions/favorites";

export default function FavoriteButton({
  childId,
  recipeId,
  favoritoInicial,
}: {
  childId: string;
  recipeId: string;
  favoritoInicial: boolean;
}) {
  const [favorito, setFavorito] = useState(favoritoInicial);
  const [, startTransition] = useTransition();

  return (
    <button
      onClick={() => {
        setFavorito((f) => !f);
        startTransition(async () => {
          await alternarFavorito(childId, recipeId);
        });
      }}
      className={favorito ? "text-amber-400" : "text-stone-300 hover:text-stone-400"}
      aria-label="Favoritar receita"
    >
      <Star size={26} fill={favorito ? "currentColor" : "none"} />
    </button>
  );
}
