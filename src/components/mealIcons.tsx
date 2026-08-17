import { Coffee, Soup, Apple, UtensilsCrossed, type LucideIcon } from "lucide-react";
import type { TipoRefeicao } from "@prisma/client";

export const MEAL_ICON: Record<TipoRefeicao, LucideIcon> = {
  CAFE_DA_MANHA: Coffee,
  ALMOCO: UtensilsCrossed,
  LANCHE: Apple,
  JANTAR: Soup,
};

export const MEAL_COLOR: Record<
  TipoRefeicao,
  { text: string; bg: string; accent: string; ring: string }
> = {
  CAFE_DA_MANHA: {
    text: "text-amber-600",
    bg: "bg-amber-50 text-amber-500",
    accent: "border-l-amber-300",
    ring: "ring-amber-200",
  },
  ALMOCO: {
    text: "text-orange-600",
    bg: "bg-orange-50 text-orange-500",
    accent: "border-l-orange-300",
    ring: "ring-orange-200",
  },
  LANCHE: {
    text: "text-emerald-600",
    bg: "bg-emerald-50 text-emerald-500",
    accent: "border-l-emerald-300",
    ring: "ring-emerald-200",
  },
  JANTAR: {
    text: "text-indigo-600",
    bg: "bg-indigo-50 text-indigo-500",
    accent: "border-l-indigo-300",
    ring: "ring-indigo-200",
  },
};

export function MealTypeIcon({
  tipo,
  size = 22,
  className,
}: {
  tipo: TipoRefeicao;
  size?: number;
  className?: string;
}) {
  const Icon = MEAL_ICON[tipo];
  return <Icon size={size} className={className} />;
}
