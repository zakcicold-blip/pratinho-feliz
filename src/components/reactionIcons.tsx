import { Laugh, Smile, Meh, Frown, type LucideIcon } from "lucide-react";
import type { EstadoFeedback } from "@prisma/client";

export const REACTION_ICON: Record<EstadoFeedback, LucideIcon> = {
  GOSTOU: Laugh,
  ACEITOU: Smile,
  EXPERIMENTOU: Meh,
  RECUSOU: Frown,
};

export const REACTION_COLOR: Record<EstadoFeedback, string> = {
  GOSTOU: "text-emerald-500",
  ACEITOU: "text-sky-500",
  EXPERIMENTOU: "text-amber-500",
  RECUSOU: "text-rose-500",
};

export const REACTION_ACTIVE_BG: Record<EstadoFeedback, string> = {
  GOSTOU: "bg-emerald-100 ring-2 ring-emerald-300",
  ACEITOU: "bg-sky-100 ring-2 ring-sky-300",
  EXPERIMENTOU: "bg-amber-100 ring-2 ring-amber-300",
  RECUSOU: "bg-rose-100 ring-2 ring-rose-300",
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
  return <Icon size={size} className={active ? REACTION_COLOR[estado] : "text-stone-400"} />;
}
