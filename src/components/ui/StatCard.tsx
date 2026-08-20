import { cn } from "@/lib/cn";
import type { LucideIcon } from "lucide-react";

type Tone = "orange" | "emerald" | "blue" | "indigo" | "amber" | "red";

const TONE_BG: Record<Tone, string> = {
  orange: "bg-orange-50 text-orange-500",
  emerald: "bg-emerald-50 text-emerald-500",
  blue: "bg-blue-50 text-blue-500",
  indigo: "bg-indigo-50 text-indigo-500",
  amber: "bg-amber-50 text-amber-600",
  red: "bg-red-50 text-red-500",
};

export default function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  tone = "orange",
  className,
}: {
  icon?: LucideIcon;
  label: string;
  value: string | number;
  hint?: string;
  tone?: Tone;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-stone-200/60 bg-white p-4 shadow-card",
        className
      )}
    >
      {Icon && (
        <span
          className={cn(
            "inline-flex h-9 w-9 items-center justify-center rounded-xl",
            TONE_BG[tone]
          )}
        >
          <Icon size={18} />
        </span>
      )}
      <p className={cn("font-bold text-stone-800", Icon ? "mt-2 text-xl" : "text-xl")}>{value}</p>
      <p className="text-xs font-medium text-stone-500">{label}</p>
      {hint && <p className="text-[11px] text-stone-400">{hint}</p>}
    </div>
  );
}
