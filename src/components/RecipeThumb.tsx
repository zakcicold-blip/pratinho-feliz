import Image from "next/image";
import { MealTypeIcon, MEAL_COLOR } from "@/components/mealIcons";
import { cn } from "@/lib/cn";
import type { TipoRefeicao } from "@prisma/client";

/**
 * Miniatura da receita: usa a foto quando existe e cai no ícone do tipo de
 * refeição quando não existe, mantendo o mesmo espaço nos dois casos.
 */
export default function RecipeThumb({
  tipo,
  imagemUrl,
  nome,
  size = 44,
  className,
}: {
  tipo: TipoRefeicao;
  imagemUrl: string | null;
  nome: string;
  size?: number;
  className?: string;
}) {
  const cor = MEAL_COLOR[tipo];

  if (imagemUrl) {
    return (
      <span
        className={cn("relative shrink-0 overflow-hidden rounded-xl bg-stone-100", className)}
        style={{ width: size, height: size }}
      >
        <Image
          src={imagemUrl}
          alt={nome}
          fill
          sizes={`${size}px`}
          className="object-cover"
          unoptimized={false}
        />
      </span>
    );
  }

  return (
    <span
      className={cn("flex shrink-0 items-center justify-center rounded-xl", cor.bg, className)}
      style={{ width: size, height: size }}
    >
      <MealTypeIcon tipo={tipo} size={Math.round(size * 0.5)} />
    </span>
  );
}
