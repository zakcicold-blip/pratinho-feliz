import { db } from "@/lib/db";
import StatCard from "@/components/ui/StatCard";
import Card from "@/components/ui/Card";
import {
  Users,
  Baby,
  CalendarCheck,
  ChefHat,
  ThumbsUp,
  Activity,
  BadgeCheck,
  Hourglass,
  CalendarRange,
  CalendarDays,
  XCircle,
  Wallet,
} from "lucide-react";

export default async function AdminDashboard() {
  // eslint-disable-next-line react-hooks/purity -- server component: avaliado uma vez por requisição, não é uma renderização de UI
  const agora = Date.now();
  const seteDiasAtras = new Date(agora - 7 * 86400000);

  const precoMensalId = process.env.STRIPE_PRICE_ID ?? "";
  const precoTrimestralId = process.env.STRIPE_PRICE_ID_TRIMESTRAL ?? "";

  const [
    totalUsuarios,
    totalCriancas,
    totalReceitas,
    receitasAtivas,
    planosAtivos,
    feedbacks7d,
    logs,
    // Assinaturas
    ativas,
    emTeste,
    canceladas,
    carencia,
    assinaturasReais,
    logsSemana,
  ] = await Promise.all([
    db.user.count(),
    db.childProfile.count(),
    db.recipe.count(),
    db.recipe.count({ where: { ativo: true } }),
    db.mealPlan.count({ where: { ativo: true } }),
    db.mealFeedback.count({ where: { createdAt: { gte: seteDiasAtras } } }),
    db.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 15, include: { user: true } }),
    db.subscription.count({ where: { status: "ATIVA" } }),
    db.subscription.count({ where: { status: "TESTE", stripeSubscriptionId: { not: null } } }),
    db.subscription.count({ where: { status: "CANCELADA" } }),
    db.subscription.count({ where: { status: "CARENCIA" } }),
    // Assinaturas com vínculo real no Stripe (ativa ou em teste), para separar por plano.
    db.subscription.findMany({
      where: { stripeSubscriptionId: { not: null }, status: { in: ["ATIVA", "TESTE"] } },
      select: { stripePriceId: true, status: true },
    }),
    // Contas com alguma atividade registrada nos últimos 7 dias (proxy de uso).
    db.auditLog.findMany({
      where: { createdAt: { gte: seteDiasAtras }, userId: { not: null } },
      select: { userId: true },
    }),
  ]);

  const mensais = assinaturasReais.filter((s) => s.stripePriceId === precoMensalId).length;
  const trimestrais = assinaturasReais.filter((s) => s.stripePriceId === precoTrimestralId).length;
  const outrosPlanos = assinaturasReais.length - mensais - trimestrais;

  const contasAtivas7d = new Set(logsSemana.map((l) => l.userId)).size;

  // Receita recorrente estimada (só das ATIVAS pagantes, normalizada por mês).
  const ativasMensais = assinaturasReais.filter(
    (s) => s.status === "ATIVA" && s.stripePriceId === precoMensalId
  ).length;
  const ativasTrimestrais = assinaturasReais.filter(
    (s) => s.status === "ATIVA" && s.stripePriceId === precoTrimestralId
  ).length;
  const mrrEstimado = ativasMensais * 29.9 + ativasTrimestrais * (59.9 / 3);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-stone-800">Visão geral</h1>

      <section>
        <h2 className="mb-2 text-sm font-semibold text-stone-700">Assinaturas</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <StatCard icon={BadgeCheck} tone="emerald" label="Ativas (pagando)" value={ativas} />
          <StatCard icon={Hourglass} tone="amber" label="Em teste (7 dias)" value={emTeste} />
          <StatCard icon={CalendarDays} tone="blue" label="Plano mensal" value={mensais} />
          <StatCard icon={CalendarRange} tone="indigo" label="Plano trimestral" value={trimestrais} />
          <StatCard icon={XCircle} tone="red" label="Canceladas" value={canceladas} />
          <StatCard
            icon={Wallet}
            tone="emerald"
            label="Receita recorrente est./mês"
            value={`R$ ${mrrEstimado.toFixed(2).replace(".", ",")}`}
            hint="só das ativas pagantes"
          />
        </div>
        {(carencia > 0 || outrosPlanos > 0) && (
          <p className="mt-2 text-xs text-stone-400">
            {carencia > 0 && `${carencia} em carência (pagamento pendente). `}
            {outrosPlanos > 0 && `${outrosPlanos} em plano não reconhecido.`}
          </p>
        )}
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold text-stone-700">Uso</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <StatCard icon={Users} tone="orange" label="Contas totais" value={totalUsuarios} />
          <StatCard icon={Activity} tone="orange" label="Ativas (7 dias)" value={contasAtivas7d} />
          <StatCard icon={Baby} tone="blue" label="Perfis infantis" value={totalCriancas} />
          <StatCard icon={CalendarCheck} tone="emerald" label="Planos ativos" value={planosAtivos} />
          <StatCard icon={ThumbsUp} tone="indigo" label="Feedbacks (7 dias)" value={feedbacks7d} />
          <StatCard
            icon={ChefHat}
            tone="amber"
            label="Receitas"
            value={`${receitasAtivas} / ${totalReceitas}`}
            hint="ativas / total"
          />
        </div>
      </section>

      <Card padding="lg">
        <h2 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-stone-700">
          <Activity size={15} className="text-stone-400" /> Eventos recentes
        </h2>
        {logs.length === 0 ? (
          <p className="text-sm text-stone-400">Nenhum evento registrado ainda.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {logs.map((log) => (
              <li
                key={log.id}
                className="flex justify-between border-b border-stone-100 py-1.5 last:border-0"
              >
                <span className="text-stone-600">
                  {log.evento} {log.user ? `· ${log.user.name}` : ""}
                </span>
                <span className="text-xs text-stone-400">
                  {log.createdAt.toLocaleString("pt-BR")}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
