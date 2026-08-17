import { db } from "@/lib/db";
import StatCard from "@/components/ui/StatCard";
import Card from "@/components/ui/Card";
import { Users, Baby, CalendarCheck, ChefHat, ThumbsUp, Activity } from "lucide-react";

export default async function AdminDashboard() {
  // eslint-disable-next-line react-hooks/purity -- server component: avaliado uma vez por requisição, não é uma renderização de UI
  const seteDiasAtras = new Date(Date.now() - 7 * 86400000);
  const [totalUsuarios, totalCriancas, totalReceitas, receitasAtivas, planosAtivos, feedbacks7d, logs] =
    await Promise.all([
      db.user.count(),
      db.childProfile.count(),
      db.recipe.count(),
      db.recipe.count({ where: { ativo: true } }),
      db.mealPlan.count({ where: { ativo: true } }),
      db.mealFeedback.count({
        where: { createdAt: { gte: seteDiasAtras } },
      }),
      db.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 15, include: { user: true } }),
    ]);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-stone-800">Visão geral</h1>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatCard icon={Users} tone="orange" label="Usuários" value={totalUsuarios} />
        <StatCard icon={Baby} tone="blue" label="Perfis infantis" value={totalCriancas} />
        <StatCard icon={CalendarCheck} tone="emerald" label="Planos ativos" value={planosAtivos} />
        <StatCard
          icon={ChefHat}
          tone="amber"
          label="Receitas"
          value={`${receitasAtivas} / ${totalReceitas}`}
          hint="ativas / total"
        />
        <StatCard icon={ThumbsUp} tone="indigo" label="Feedbacks (7 dias)" value={feedbacks7d} />
      </div>

      <Card padding="lg">
        <h2 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-stone-700">
          <Activity size={15} className="text-stone-400" /> Eventos recentes
        </h2>
        {logs.length === 0 ? (
          <p className="text-sm text-stone-400">Nenhum evento registrado ainda.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {logs.map((log) => (
              <li key={log.id} className="flex justify-between border-b border-stone-100 py-1.5 last:border-0">
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
