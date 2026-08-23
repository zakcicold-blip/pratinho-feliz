import { cn } from "@/lib/cn";

/**
 * Esqueleto de carregamento.
 *
 * Substitui o spinner de tela cheia. A diferença não é estética: o spinner
 * apaga a tela inteira e a navegação parece travar, enquanto o esqueleto
 * mantém a estrutura no lugar e a troca de tela parece instantânea — o
 * conteúdo só "preenche" o que já estava desenhado.
 */
export default function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-xl bg-stone-200/60", className)} />;
}

/** Barra de título, igual à do TopBar real. */
export function SkeletonTopBar() {
  return (
    <div className="flex items-center gap-3 px-4 py-4">
      <Skeleton className="h-9 w-9 rounded-full" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  );
}

/** Linha de lista com miniatura — usada em receitas, compras e cardápio. */
export function SkeletonLinha() {
  return (
    <div className="flex items-center gap-3 py-2.5">
      <Skeleton className="h-10 w-10 shrink-0" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-3.5 w-2/3" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    </div>
  );
}

/** Cartão do tamanho de um Card do app. */
export function SkeletonCard({ linhas = 3 }: { linhas?: number }) {
  return (
    <div className="rounded-3xl border border-stone-200/60 bg-white p-4 shadow-card">
      <Skeleton className="mb-3 h-3 w-28" />
      <div className="divide-y divide-stone-100">
        {Array.from({ length: linhas }, (_, i) => (
          <SkeletonLinha key={i} />
        ))}
      </div>
    </div>
  );
}
