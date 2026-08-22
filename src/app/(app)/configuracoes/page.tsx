import Link from "next/link";
import { requireSession } from "@/lib/currentChild";
import { db } from "@/lib/db";
import TopBar from "@/components/TopBar";
import LembretesToggle from "./LembretesToggle";
import AccountActions from "./AccountActions";
import CancelamentoCard from "./CancelamentoCard";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { CreditCard, Bell, ShieldCheck, ArrowRight } from "lucide-react";

const PLANO_LABEL: Record<string, string> = { ESSENCIAL: "Essencial", FAMILIA: "Família" };
const STATUS_LABEL: Record<string, string> = {
  TESTE: "Em teste",
  ATIVA: "Ativa",
  CANCELADA: "Cancelada",
  CARENCIA: "Em carência",
};

export default async function ConfiguracoesPage() {
  const session = await requireSession();
  const user = await db.user.findUniqueOrThrow({
    where: { id: session.user.id },
    include: { subscription: true },
  });

  const statusAtual = user.subscription?.status ?? "TESTE";
  // Cortesia: acesso liberado pela equipe, sem cobrança e sem nada a cancelar.
  const cortesia = user.subscription?.acessoCortesia ?? false;

  const cancelamentoPendente = await db.solicitacaoCancelamento.findFirst({
    where: { userId: user.id, status: "PENDENTE" },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <TopBar title="Configurações" back />
      <div className="space-y-4 px-4 py-4">
        <Card className="flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-600">
            {user.name.charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="truncate font-semibold text-stone-800">{user.name}</p>
            <p className="truncate text-sm text-stone-500">{user.email}</p>
          </div>
        </Card>

        <Card>
          <h2 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-stone-400">
            <CreditCard size={13} /> Assinatura
          </h2>
          {cortesia ? (
            <>
              <p className="flex items-center gap-2 text-sm text-stone-700">
                Plano <strong>{PLANO_LABEL[user.subscription?.plano ?? "ESSENCIAL"]}</strong>
                <Badge tone="indigo">Acesso liberado</Badge>
              </p>
              <p className="mt-2 text-xs text-stone-500">
                Seu acesso foi liberado pela equipe do Pratinho Feliz. Você usa o app completo sem
                nenhuma cobrança — não há assinatura ativa nem cartão cadastrado.
              </p>
            </>
          ) : (
            <>
              <p className="flex items-center gap-2 text-sm text-stone-700">
                Plano <strong>{PLANO_LABEL[user.subscription?.plano ?? "ESSENCIAL"]}</strong>
                <Badge tone={statusAtual === "ATIVA" ? "emerald" : "amber"}>
                  {STATUS_LABEL[statusAtual]}
                </Badge>
              </p>
              {user.subscription?.cancelAtPeriodEnd && (
                <p className="mt-2 text-xs text-amber-700">
                  Cancelamento agendado — o acesso segue até o fim do período já pago.
                </p>
              )}
              <div className="mt-3 border-t border-stone-100 pt-3">
                <CancelamentoCard
                  pendente={
                    cancelamentoPendente
                      ? {
                          status: cancelamentoPendente.status,
                          createdAt: cancelamentoPendente.createdAt.toISOString(),
                        }
                      : null
                  }
                />
              </div>
            </>
          )}
        </Card>

        <Card>
          <h2 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-stone-400">
            <Bell size={13} /> Preferências
          </h2>
          <LembretesToggle inicial={user.lembretes} />
        </Card>

        <Card>
          <h2 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-stone-400">
            <ShieldCheck size={13} /> Privacidade
          </h2>
          <Link
            href="/privacidade"
            className="flex items-center gap-1 text-sm font-medium text-orange-600 hover:underline"
          >
            Ver política de privacidade <ArrowRight size={13} />
          </Link>
        </Card>

        <AccountActions />
      </div>
    </>
  );
}
