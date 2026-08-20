import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/cn";

type Tone = "dark" | "accent" | "white" | "light";

const TONES: Record<Tone, string> = {
  dark: "bg-stone-900 text-white",
  accent: "bg-orange-500 text-white",
  white: "bg-white text-stone-900",
  light: "bg-stone-100 text-stone-700",
};

// Botão redondo com seta diagonal — motivo recorrente do novo visual, usado no
// canto dos cards para indicar "abrir / ver mais".
export default function CircleArrow({
  href,
  tone = "light",
  size = 34,
  className,
  "aria-label": ariaLabel = "Abrir",
}: {
  href?: string;
  tone?: Tone;
  size?: number;
  className?: string;
  "aria-label"?: string;
}) {
  const cls = cn(
    "flex shrink-0 items-center justify-center rounded-full transition active:scale-90",
    TONES[tone],
    className,
  );
  const icon = <ArrowUpRight size={Math.round(size * 0.5)} strokeWidth={2.4} />;

  if (href) {
    return (
      <Link href={href} aria-label={ariaLabel} className={cls} style={{ height: size, width: size }}>
        {icon}
      </Link>
    );
  }
  return (
    <span aria-hidden className={cls} style={{ height: size, width: size }}>
      {icon}
    </span>
  );
}
