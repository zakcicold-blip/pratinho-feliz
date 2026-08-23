import Skeleton, { SkeletonTopBar, SkeletonCard } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <>
      <SkeletonTopBar />
      <div className="space-y-4 px-4 py-2">
        <div className="flex gap-2 overflow-hidden">
          {Array.from({ length: 7 }, (_, i) => (
            <Skeleton key={i} className="h-16 w-12 shrink-0 rounded-2xl" />
          ))}
        </div>
        <SkeletonCard linhas={4} />
        <SkeletonCard linhas={4} />
      </div>
    </>
  );
}
