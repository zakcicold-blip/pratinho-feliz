import { db } from "@/lib/db";
import Badge from "@/components/ui/Badge";

const STATUS_LABEL: Record<string, string> = {
  TESTE: "Em teste",
  ATIVA: "Ativa",
  CANCELADA: "Cancelada",
  CARENCIA: "Em carência",
};

export default async function AdminUsuariosPage() {
  const usuarios = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    include: { subscription: true, children: true },
  });

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold text-stone-800">Usuários ({usuarios.length})</h1>
      <div className="overflow-hidden rounded-2xl border border-stone-200/70 bg-white shadow-card">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 text-left text-xs uppercase tracking-wide text-stone-400">
            <tr>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">E-mail</th>
              <th className="px-4 py-3">Perfis</th>
              <th className="px-4 py-3">Assinatura</th>
              <th className="px-4 py-3">Criado em</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => {
              const status = u.subscription?.status ?? "TESTE";
              return (
                <tr key={u.id} className="border-t border-stone-100 hover:bg-stone-50/60">
                  <td className="px-4 py-3 font-medium text-stone-800">{u.name}</td>
                  <td className="px-4 py-3 text-stone-500">{u.email}</td>
                  <td className="px-4 py-3 text-stone-500">{u.children.length}</td>
                  <td className="px-4 py-3">
                    <Badge tone={status === "ATIVA" ? "emerald" : "amber"}>
                      {STATUS_LABEL[status]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-stone-400">{u.createdAt.toLocaleDateString("pt-BR")}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
