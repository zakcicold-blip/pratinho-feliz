import Skeleton, { SkeletonTopBar, SkeletonCard } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <>
      <SkeletonTopBar />
      <div className="space-y-4 px-4 py-2">
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-28 w-full rounded-3xl" />
        <SkeletonCard linhas={5} />
      </div>
    </>
  );
}
