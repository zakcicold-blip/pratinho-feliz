import Link from "next/link";
import { requireSession } from "@/lib/currentChild";
import { db } from "@/lib/db";
import TopBar from "@/components/TopBar";
import LembretesToggle from "./LembretesToggle";
import AccountActions from "./AccountActions";
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

  return (
    <>
      <TopBar title="Configurações" />
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
          <p className="flex items-center gap-2 text-sm text-stone-700">
            Plano <strong>{PLANO_LABEL[user.subscription?.plano ?? "ESSENCIAL"]}</strong>
            <Badge tone={statusAtual === "ATIVA" ? "emerald" : "amber"}>
              {STATUS_LABEL[statusAtual]}
            </Badge>
          </p>
          <p className="mt-2 text-xs text-stone-400">
            Cobrança recorrente não incluída nesta versão MVP — estrutura de dados já preparada.
          </p>
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
