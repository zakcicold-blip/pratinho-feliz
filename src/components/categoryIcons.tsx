import { Carrot, Beef, Milk, ShoppingBasket, Package, type LucideIcon } from "lucide-react";

export const CATEGORIA_ICON: Record<string, LucideIcon> = {
  HORTIFRUTI: Carrot,
  PROTEINA: Beef,
  LATICINIOS: Milk,
  MERCEARIA: ShoppingBasket,
  OUTROS: Package,
};

export function CategoriaIcon({
  categoria,
  size = 14,
  className,
}: {
  categoria: string;
  size?: number;
  className?: string;
}) {
  const Icon = CATEGORIA_ICON[categoria] ?? Package;
  return <Icon size={size} className={className} />;
}
