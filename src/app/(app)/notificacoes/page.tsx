import Link from "next/link";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/currentChild";
import TopBar from "@/components/TopBar";
import EmptyState from "@/components/ui/EmptyState";
import AtivarNotificacoes from "./AtivarNotificacoes";
import MarcarLidas from "./MarcarLidas";
import { cn } from "@/lib/cn";
import {
  Bell,
  CalendarDays,
  Lightbulb,
  UtensilsCrossed,
  Info,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";

export const metadata = { title: "Notificações" };

const ESTILO: Record<string, { Icon: LucideIcon; cor: string }> = {
  PLANO: { Icon: CalendarDays, cor: "bg-orange-50 text-orange-600" },
  LEMBRETE: { Icon: UtensilsCrossed, cor: "bg-emerald-50 text-emerald-600" },
  DICA: { Icon: Lightbulb, cor: "bg-amber-50 text-amber-700" },
  SISTEMA: { Icon: Info, cor: "bg-stone-100 text-stone-500" },
};

function quandoFoi(data: Date): string {
  const minutos = Math.floor((Date.now() - data.getTime()) / 60000);
  if (minutos < 1) return "agora";
  if (minutos < 60) return `há ${minutos} min`;
  const horas = Math.floor(minutos / 60);
  if (horas < 24) return `há ${horas} h`;
  const dias = Math.floor(horas / 24);
  if (dias === 1) return "ontem";
  if (dias < 7) return `há ${dias} dias`;
  return data.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

export default async function NotificacoesPage() {
  const session = await requireSession();

  const [notificacoes, naoLidas] = await Promise.all([
    db.notificacao.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    db.notificacao.count({ where: { userId: session.user.id, lida: false } }),
  ]);

  return (
    <>
      <TopBar
        title="Notificações"
        subtitle={naoLidas > 0 ? `${naoLidas} não lida${naoLidas === 1 ? "" : "s"}` : "Tudo em dia"}
        back
      />

      <div className="space-y-4 px-4 py-4">
        <AtivarNotificacoes chavePublica={process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? null} />

        {naoLidas > 0 && <MarcarLidas />}

        {notificacoes.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="Nenhuma notificação ainda"
            description="Quando o plano mudar ou o cardápio do dia estiver pronto, o aviso aparece aqui."
          />
        ) : (
          <div className="space-y-2">
            {notificacoes.map((n) => {
              const estilo = ESTILO[n.tipo] ?? ESTILO.SISTEMA;
              const Icon = estilo.Icon;

              const conteudo = (
                <div
                  className={cn(
                    "flex items-start gap-3 rounded-2xl border p-4 transition",
                    n.lida
                      ? "border-stone-200/60 bg-white"
                      : "border-orange-200/70 bg-orange-50/40 shadow-card"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                      estilo.cor
                    )}
                  >
                    <Icon size={17} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <p
                        className={cn(
                          "text-sm",
                          n.lida ? "font-medium text-stone-700" : "font-bold text-stone-900"
                        )}
                      >
                        {n.titulo}
                      </p>
                      <span className="shrink-0 text-[11px] text-stone-400">
                        {quandoFoi(n.createdAt)}
                      </span>
                    </div>
                    <p className="mt-0.5 text-[13px] leading-relaxed text-stone-600">{n.corpo}</p>
                  </div>
                  {n.link && (
                    <ChevronRight size={16} className="mt-1 shrink-0 self-center text-stone-300" />
                  )}
                </div>
              );

              return n.link ? (
                <Link key={n.id} href={n.link} className="block active:opacity-70">
                  {conteudo}
                </Link>
              ) : (
                <div key={n.id}>{conteudo}</div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
