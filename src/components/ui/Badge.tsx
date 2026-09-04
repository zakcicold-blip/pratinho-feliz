import { cn } from "@/lib/cn";

type Tone = "neutral" | "orange" | "emerald" | "amber" | "red" | "blue" | "indigo";

const TONES: Record<Tone, string> = {
  neutral: "bg-stone-100 text-stone-600",
  // A marca virou duas cores (azul + rosa). O slot "orange" agora e o rosa —
  // "blue" ja era usado como tom semantico separado em varias telas (paginas
  // lado a lado com StatCard tone="orange" e tone="blue"), e mapear os dois
  // para a mesma cor faria elas ficarem indistinguiveis.
  orange: "bg-pink-50 text-pink-600",
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
