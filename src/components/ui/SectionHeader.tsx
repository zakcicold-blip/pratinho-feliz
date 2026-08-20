import Link from "next/link";

// Cabeçalho de seção: título em display + ação opcional à direita ("Ver todos").
export default function SectionHeader({
  title,
  href,
  action = "Ver todos",
  right,
}: {
  title: string;
  href?: string;
  action?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <h2 className="font-display text-lg font-semibold text-stone-900">{title}</h2>
      {right ??
        (href ? (
          <Link href={href} className="text-xs font-semibold text-orange-600 hover:underline">
            {action}
          </Link>
        ) : null)}
    </div>
  );
}
