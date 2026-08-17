import { cn } from "@/lib/cn";

export default function Card({
  className,
  padding = "md",
  children,
  ...rest
}: {
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>) {
  const paddings = {
    none: "",
    sm: "p-3",
    md: "p-4",
    lg: "p-5",
  };

  return (
    <div
      className={cn(
        "rounded-2xl border border-stone-200/70 bg-white shadow-card",
        paddings[padding],
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
