import Image from "next/image";
import CapaReceita from "@/components/CapaReceita";
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

  // Sem foto: capa gerada, mesma identidade da tela da receita.
  return (
    <CapaReceita
      tipo={tipo}
      nome={nome}
      imagemUrl={null}
      tamanhoIcone={Math.round(size * 0.45)}
      className={cn("shrink-0 rounded-xl", className)}
    />
  );
}
