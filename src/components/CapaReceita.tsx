import Image from "next/image";
import { MealTypeIcon } from "@/components/mealIcons";
import { cn } from "@/lib/cn";
import type { TipoRefeicao } from "@prisma/client";

/**
 * Capa da receita.
 *
 * Quando existe foto, mostra a foto. Quando não existe — hoje a maioria do
 * catálogo — desenha uma capa gerada em vez de deixar um espaço vazio ou um
 * ícone solto: gradiente derivado do nome (sempre o mesmo para a mesma
 * receita), ícone do tipo de refeição e a inicial do prato.
 *
 * Não é foto e não finge ser: é identidade visual até a foto real existir.
 */

/** Paletas por tipo de refeição — cada uma com 3 variações, escolhidas pelo nome. */
const PALETAS: Record<TipoRefeicao, string[]> = {
  CAFE_DA_MANHA: [
    "from-amber-300 to-orange-400",
    "from-orange-300 to-rose-400",
    "from-yellow-300 to-amber-500",
  ],
  ALMOCO: [
    "from-emerald-400 to-teal-500",
    "from-lime-400 to-emerald-500",
    "from-teal-400 to-cyan-500",
  ],
  LANCHE: [
    "from-rose-300 to-orange-400",
    "from-fuchsia-300 to-rose-400",
    "from-pink-300 to-rose-500",
  ],
  JANTAR: [
    "from-violet-400 to-indigo-500",
    "from-indigo-400 to-blue-500",
    "from-sky-400 to-indigo-500",
  ],
};

/** Hash estável: a mesma receita cai sempre na mesma paleta. */
function indiceEstavel(texto: string, total: number): number {
  let h = 0;
  for (let i = 0; i < texto.length; i++) h = (h * 31 + texto.charCodeAt(i)) >>> 0;
  return h % total;
}

export default function CapaReceita({
  tipo,
  nome,
  imagemUrl,
  className,
  tamanhoIcone = 56,
  mostrarInicial = true,
  prioridade = false,
}: {
  tipo: TipoRefeicao;
  nome: string;
  imagemUrl: string | null;
  className?: string;
  tamanhoIcone?: number;
  mostrarInicial?: boolean;
  prioridade?: boolean;
}) {
  if (imagemUrl) {
    return (
      <div className={cn("relative overflow-hidden bg-stone-100", className)}>
        <Image
          src={imagemUrl}
          alt={nome}
          fill
          sizes="(max-width: 672px) 100vw, 672px"
          className="object-cover"
          priority={prioridade}
        />
      </div>
    );
  }

  const paletas = PALETAS[tipo] ?? PALETAS.ALMOCO;
  const gradiente = paletas[indiceEstavel(nome, paletas.length)];
  const inicial = nome.trim().charAt(0).toUpperCase();

  return (
    <div
      aria-hidden
      className={cn(
        "relative flex items-center justify-center overflow-hidden bg-gradient-to-br",
        gradiente,
        className
      )}
    >
      {/* Formas de fundo: posição também derivada do nome, para não ficarem todas iguais. */}
      <span
        className="absolute h-32 w-32 rounded-full bg-white/15"
        style={{
          top: `${-20 + indiceEstavel(nome + "a", 30)}%`,
          left: `${-15 + indiceEstavel(nome + "b", 40)}%`,
        }}
      />
      <span
        className="absolute h-40 w-40 rounded-full bg-black/10"
        style={{
          bottom: `${-25 + indiceEstavel(nome + "c", 25)}%`,
          right: `${-20 + indiceEstavel(nome + "d", 35)}%`,
        }}
      />

      <div className="relative flex flex-col items-center gap-1 text-white/90">
        <MealTypeIcon tipo={tipo} size={tamanhoIcone} />
        {mostrarInicial && (
          <span
            className="font-display leading-none font-extrabold text-white/25"
            style={{ fontSize: tamanhoIcone * 1.6 }}
          >
            {inicial}
          </span>
        )}
      </div>
    </div>
  );
}
