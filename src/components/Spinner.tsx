import { cn } from "@/lib/cn";

/** Spinner circular simples, na cor da marca. */
export default function Spinner({ size = 28, className }: { size?: number; className?: string }) {
  return (
    <span
      role="status"
      aria-label="Carregando"
      className={cn(
        "inline-block animate-spin rounded-full border-orange-500 border-t-transparent",
        className
      )}
      style={{ width: size, height: size, borderWidth: Math.max(2, Math.round(size / 10)) }}
    />
  );
}
