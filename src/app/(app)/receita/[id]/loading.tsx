import Skeleton, { SkeletonTopBar } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <>
      <SkeletonTopBar />
      <div className="space-y-3 px-4 py-2">
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-12 w-full rounded-full" />
        <div className="rounded-3xl border border-stone-200/60 bg-white p-5 shadow-card">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="mt-2 h-3 w-1/2" />
          <div className="mt-4 grid grid-cols-3 gap-2">
            <Skeleton className="h-14 rounded-xl" />
            <Skeleton className="h-14 rounded-xl" />
            <Skeleton className="h-14 rounded-xl" />
          </div>
        </div>
      </div>
    </>
  );
}
