import { cn } from "@/lib/cn";
import type { LucideIcon } from "lucide-react";

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center px-6 py-12 text-center", className)}>
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-orange-400">
        <Icon size={26} strokeWidth={1.75} />
      </span>
      <p className="mt-4 font-semibold text-stone-700">{title}</p>
      {description && <p className="mt-1 max-w-xs text-sm text-stone-500">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
