import Skeleton, { SkeletonTopBar, SkeletonCard } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <>
      <SkeletonTopBar />
      <div className="space-y-4 px-4 py-2">
        <Skeleton className="h-10 w-full rounded-2xl" />
        <div className="flex gap-1">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-8 w-8 rounded-full" />
          ))}
        </div>
        <Skeleton className="h-14 w-full rounded-3xl" />
        <SkeletonCard linhas={4} />
        <SkeletonCard linhas={3} />
      </div>
    </>
  );
}
