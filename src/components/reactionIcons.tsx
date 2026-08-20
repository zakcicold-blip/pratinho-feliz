import { Heart, ThumbsUp, Utensils, ThumbsDown, type LucideIcon } from "lucide-react";
import type { EstadoFeedback } from "@prisma/client";

// Ícones simbólicos (não "carinhas") formando uma escala clara de aceitação:
// amou → aceitou → só provou → recusou.
export const REACTION_ICON: Record<EstadoFeedback, LucideIcon> = {
  GOSTOU: Heart,
  ACEITOU: ThumbsUp,
  EXPERIMENTOU: Utensils,
  RECUSOU: ThumbsDown,
};

export const REACTION_COLOR: Record<EstadoFeedback, string> = {
  GOSTOU: "text-emerald-600",
  ACEITOU: "text-sky-600",
  EXPERIMENTOU: "text-amber-600",
  RECUSOU: "text-rose-500",
};

export const REACTION_ACTIVE_BG: Record<EstadoFeedback, string> = {
  GOSTOU: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  ACEITOU: "bg-sky-50 text-sky-700 ring-1 ring-sky-200",
  EXPERIMENTOU: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  RECUSOU: "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
};

export function ReactionIcon({
  estado,
  size = 18,
  active,
}: {
  estado: EstadoFeedback;
  size?: number;
  active?: boolean;
}) {
  const Icon = REACTION_ICON[estado];
  const fill = active && estado === "GOSTOU" ? "currentColor" : "none";
  return (
    <Icon
      size={size}
      fill={fill}
      className={active ? REACTION_COLOR[estado] : "text-stone-400"}
    />
  );
}
