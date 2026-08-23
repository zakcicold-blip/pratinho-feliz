import Skeleton, { SkeletonTopBar, SkeletonCard } from "@/components/ui/Skeleton";

/**
 * Estado de carregamento padrao das telas do app.
 *
 * Antes era um spinner centralizado que apagava a tela toda — o que dava
 * exatamente a sensacao de "carregando entre uma secao e outra". O esqueleto
 * mantem a estrutura no lugar, entao a troca de tela parece instantanea.
 */
export default function Loading() {
  return (
    <>
      <SkeletonTopBar />
      <div className="space-y-4 px-4 py-2">
        <Skeleton className="h-24 w-full rounded-3xl" />
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-20 rounded-2xl" />
          <Skeleton className="h-20 rounded-2xl" />
        </div>
        <SkeletonCard linhas={3} />
        <SkeletonCard linhas={2} />
      </div>
    </>
  );
}
