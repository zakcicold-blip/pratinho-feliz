"use client";

import { useState } from "react";
import MealCard, { type MealCardData } from "@/components/MealCard";
import { cn } from "@/lib/cn";

const FILTROS = [
  { id: "all", label: "Tudo" },
  { id: "CAFE_DA_MANHA", label: "Café" },
  { id: "ALMOCO", label: "Almoço" },
  { id: "LANCHE", label: "Lanche" },
  { id: "JANTAR", label: "Jantar" },
];

export default function RefeicoesComFiltro({
  cards,
  childId,
}: {
  cards: MealCardData[];
  childId: string;
}) {
  const [ativo, setAtivo] = useState("all");
  const presentes = new Set(cards.map((c) => c.tipo));
  const filtros = FILTROS.filter((f) => f.id === "all" || presentes.has(f.id as MealCardData["tipo"]));
  const visiveis = ativo === "all" ? cards : cards.filter((c) => c.tipo === ativo);

  return (
    <>
      <div className="scrollbar-none -mx-1 mb-3 flex gap-2 overflow-x-auto px-1 pb-1">
        {filtros.map((f) => (
          <button
            key={f.id}
            onClick={() => setAtivo(f.id)}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition active:scale-95",
              ativo === f.id
                ? "bg-stone-900 text-white"
                : "border border-stone-200/70 bg-white text-stone-500",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>
      <div className="space-y-3">
        {visiveis.map((card) => (
          <MealCard key={card.slotId} data={card} childId={childId} />
        ))}
      </div>
    </>
  );
}
