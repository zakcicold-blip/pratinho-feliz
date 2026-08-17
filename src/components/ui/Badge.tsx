import { cn } from "@/lib/cn";

type Tone = "neutral" | "orange" | "emerald" | "amber" | "red" | "blue" | "indigo";

const TONES: Record<Tone, string> = {
  neutral: "bg-stone-100 text-stone-600",
  orange: "bg-orange-50 text-orange-600",
  emerald: "bg-emerald-50 text-emerald-600",
  amber: "bg-amber-50 text-amber-700",
  red: "bg-red-50 text-red-600",
  blue: "bg-blue-50 text-blue-600",
  indigo: "bg-indigo-50 text-indigo-600",
};

export default function Badge({
  tone = "neutral",
  className,
  children,
}: {
  tone?: Tone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold",
        TONES[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
