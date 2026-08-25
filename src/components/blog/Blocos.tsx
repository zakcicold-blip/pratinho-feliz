import { Lightbulb, CircleAlert, Info, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import BotaoCheckoutDireto from "@/components/BotaoCheckoutDireto";

type TomDestaque = "dica" | "atencao" | "info";

const TONS: Record<TomDestaque, { icon: LucideIcon; caixa: string; icone: string; titulo: string }> =
  {
    dica: {
      icon: Lightbulb,
      caixa: "border-emerald-200/70 bg-emerald-50/60",
      icone: "bg-emerald-100 text-emerald-700",
      titulo: "text-emerald-900",
    },
    atencao: {
      icon: CircleAlert,
      caixa: "border-amber-200/70 bg-amber-50/60",
      icone: "bg-amber-100 text-amber-700",
      titulo: "text-amber-900",
    },
    info: {
      icon: Info,
      caixa: "border-sky-200/70 bg-sky-50/60",
      icone: "bg-sky-100 text-sky-700",
      titulo: "text-sky-900",
    },
  };

/** Caixa de apoio no meio do texto (dica prática, alerta, contexto). */
export function Destaque({
  tom = "dica",
  titulo,
  children,
}: {
  tom?: TomDestaque;
  titulo: string;
  children: React.ReactNode;
}) {
  const t = TONS[tom];
  const Icon = t.icon;
  return (
    <aside className={cn("not-prose my-7 rounded-2xl border p-5", t.caixa)}>
      <div className="flex items-center gap-2.5">
        <span className={cn("flex h-8 w-8 items-center justify-center rounded-lg", t.icone)}>
          <Icon size={16} />
        </span>
        <strong className={cn("text-sm font-bold", t.titulo)}>{titulo}</strong>
      </div>
      <div className="mt-2.5 space-y-2 text-[0.95rem] leading-relaxed text-stone-700">{children}</div>
    </aside>
  );
}

/** Chamada para o app no meio do artigo — o conteúdo puxa o produto. */
export function CTAInline({
  titulo = "Quer isso resolvido sem planilha?",
  texto,
}: {
  titulo?: string;
  texto: string;
}) {
  return (
    <div className="not-prose my-8 overflow-hidden rounded-3xl border border-orange-200/70 bg-gradient-to-br from-orange-50 to-amber-50/60 p-6">
      <div className="font-display text-lg font-extrabold text-stone-900">{titulo}</div>
      <p className="mt-1.5 text-[0.95rem] leading-relaxed text-stone-600">{texto}</p>
      <div className="mt-4">
        <BotaoCheckoutDireto rotulo="Assinar por R$ 29,90" className="px-5 py-2.5 text-sm" />
      </div>
    </div>
  );
}

/** Lista numerada com passos — visual mais forte que um <ol> simples. */
export function Passos({ itens }: { itens: { titulo: string; texto: string }[] }) {
  return (
    <ol className="not-prose my-7 space-y-3">
      {itens.map((item, i) => (
        <li
          key={item.titulo}
          className="flex gap-3.5 rounded-2xl border border-stone-200/70 bg-white p-4 shadow-card"
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-stone-900 text-xs font-bold text-white">
            {i + 1}
          </span>
          <div>
            <div className="font-semibold text-stone-800">{item.titulo}</div>
            <p className="mt-0.5 text-[0.95rem] leading-relaxed text-stone-600">{item.texto}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

/** Tabela sempre rolável na horizontal — nunca empurra a página no celular. */
export function Tabela({ children }: { children: React.ReactNode }) {
  return (
    <div className="not-prose my-7 overflow-x-auto rounded-2xl border border-stone-200/70 bg-white shadow-card">
      <table className="w-full min-w-[30rem] text-left text-sm">{children}</table>
    </div>
  );
}
