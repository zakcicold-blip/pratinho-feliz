import { cn } from "@/lib/cn";

export default function ProgressBar({
  value,
  max,
  className,
  barClassName = "bg-orange-500",
}: {
  value: number;
  max: number;
  className?: string;
  barClassName?: string;
}) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;

  return (
    <div className={cn("h-1.5 w-full overflow-hidden rounded-full bg-stone-200/80", className)}>
      <div
        className={cn("h-full rounded-full transition-all duration-500", barClassName)}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
