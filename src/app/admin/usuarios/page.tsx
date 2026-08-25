import { db } from "@/lib/db";
import Badge from "@/components/ui/Badge";
import DeletarUsuarioButton from "./DeletarUsuarioButton";
import CortesiaButton from "./CortesiaButton";
import { Gift } from "lucide-react";
import { dataBR } from "@/lib/dates";

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
              <th className="px-4 py-3">WhatsApp</th>
              <th className="px-4 py-3">Perfis</th>
              <th className="px-4 py-3">Assinatura</th>
              <th className="px-4 py-3">Criado em</th>
              <th className="px-4 py-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => {
              const status = u.subscription?.status ?? "TESTE";
              const cortesia = u.subscription?.acessoCortesia ?? false;
              return (
                <tr key={u.id} className="border-t border-stone-100 hover:bg-stone-50/60">
                  <td className="px-4 py-3 font-medium text-stone-800">{u.name}</td>
                  <td className="px-4 py-3 text-stone-500">{u.email}</td>
                  <td className="px-4 py-3">
                    {u.telefone ? (
                      <a
                        href={`https://wa.me/${(() => {
                          const d = u.telefone.replace(/\D/g, "");
                          return d.startsWith("55") ? d : `55${d}`;
                        })()}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-emerald-600 hover:underline"
                      >
                        {u.telefone}
                      </a>
                    ) : (
                      <span className="text-stone-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-stone-500">{u.children.length}</td>
                  <td className="px-4 py-3">
                    {cortesia ? (
                      <span className="flex flex-col items-start gap-1">
                        <Badge tone="indigo">
                          <Gift size={11} /> Cortesia
                        </Badge>
                        {u.subscription?.cortesiaMotivo && (
                          <span className="text-[11px] text-stone-400">
                            {u.subscription.cortesiaMotivo}
                          </span>
                        )}
                      </span>
                    ) : (
                      <Badge tone={status === "ATIVA" ? "emerald" : "amber"}>
                        {STATUS_LABEL[status]}
                      </Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-stone-400">{dataBR(u.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-x-1 gap-y-1.5">
                      <CortesiaButton userId={u.id} nome={u.name} liberado={cortesia} />
                      <DeletarUsuarioButton userId={u.id} nome={u.name} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
