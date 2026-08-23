import Skeleton, { SkeletonTopBar, SkeletonCard } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <>
      <SkeletonTopBar />
      <div className="space-y-4 px-4 py-2">
        <Skeleton className="h-11 w-full rounded-2xl" />
        <SkeletonCard linhas={5} />
        <SkeletonCard linhas={5} />
      </div>
    </>
  );
}
