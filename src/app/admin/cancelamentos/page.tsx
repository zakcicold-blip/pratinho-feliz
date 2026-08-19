import { db } from "@/lib/db";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { LifeBuoy } from "lucide-react";
import ResolverButtons from "./ResolverButtons";

const STATUS_TONE = { PENDENTE: "amber", APROVADO: "emerald", RECUSADO: "red" } as const;
const STATUS_LABEL = { PENDENTE: "Pendente", APROVADO: "Aprovado", RECUSADO: "Recusado" } as const;
const PLANO_LABEL: Record<string, string> = {
  price_1U5vkyR2fzAoD77YUX3sMiRs: "Mensal",
  price_1U5wGRR2fzAoD77Yjy56V436: "Trimestral",
};

export default async function CancelamentosPage() {
  const solicitacoes = await db.solicitacaoCancelamento.findMany({
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    include: { user: { include: { subscription: true } } },
    take: 100,
  });

  const pendentes = solicitacoes.filter((s) => s.status === "PENDENTE");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-xl font-bold text-stone-800">
          <LifeBuoy size={20} className="text-orange-500" /> Cancelamentos
        </h1>
        <p className="mt-1 text-sm text-stone-500">
          {pendentes.length} pendente{pendentes.length === 1 ? "" : "s"} de análise. Aprovar agenda
          o cancelamento no Stripe ao fim do período já pago.
        </p>
      </div>

      {solicitacoes.length === 0 ? (
        <Card padding="lg">
          <p className="text-sm text-stone-400">Nenhuma solicitação de cancelamento até agora.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {solicitacoes.map((s) => {
            const priceId = s.user.subscription?.stripePriceId ?? "";
            return (
              <Card key={s.id} padding="lg">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-stone-800">{s.user.name}</p>
                    <p className="truncate text-sm text-stone-500">{s.user.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {PLANO_LABEL[priceId] && (
                      <span className="text-xs text-stone-400">{PLANO_LABEL[priceId]}</span>
                    )}
                    <Badge tone={STATUS_TONE[s.status]}>{STATUS_LABEL[s.status]}</Badge>
                  </div>
                </div>

                <p className="mt-3 rounded-xl bg-stone-50 px-3 py-2 text-sm text-stone-700">
                  “{s.motivo}”
                </p>

                <p className="mt-2 text-xs text-stone-400">
                  Enviado em {s.createdAt.toLocaleString("pt-BR")}
                  {s.resolvidoEm && ` · resolvido em ${s.resolvidoEm.toLocaleString("pt-BR")}`}
                  {!s.user.subscription?.stripeSubscriptionId && s.status === "PENDENTE" && (
                    <span className="text-amber-600"> · sem assinatura Stripe ativa</span>
                  )}
                </p>

                {s.respostaAdmin && (
                  <p className="mt-1 text-xs text-stone-500">Resposta: {s.respostaAdmin}</p>
                )}

                {s.status === "PENDENTE" && <ResolverButtons id={s.id} />}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
