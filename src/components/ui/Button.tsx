import Link from "next/link";
import { cn } from "@/lib/cn";

type Variant = "primary" | "dark" | "secondary" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const BASE =
  "inline-flex items-center justify-center gap-1.5 font-semibold transition-all active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-orange-500 text-white hover:bg-orange-600 shadow-sm shadow-orange-900/15",
  dark: "bg-stone-900 text-white hover:bg-stone-800 shadow-sm shadow-stone-900/20",
  secondary: "bg-stone-100 text-stone-700 hover:bg-stone-200",
  outline: "border border-stone-300 text-stone-700 hover:bg-stone-50 bg-white",
  ghost: "text-stone-500 hover:text-stone-800 hover:bg-stone-100",
  danger: "bg-red-50 text-red-600 hover:bg-red-100",
};

// Cantos em pílula (rounded-full) alinhados ao novo visual.
const SIZES: Record<Size, string> = {
  sm: "h-8 px-3.5 text-xs rounded-full",
  md: "h-10 px-5 text-sm rounded-full",
  lg: "h-[52px] px-6 text-[15px] rounded-full",
};

type Props = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
  href?: string;
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "className">;

export default function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  href,
  ...rest
}: Props) {
  const classes = cn(BASE, VARIANTS[variant], SIZES[size], className);

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  );
}
