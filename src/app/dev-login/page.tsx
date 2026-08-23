import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { signIn } from "@/auth";

/**
 * Tela de acesso rapido para desenvolvimento — lista as contas do banco e
 * entra em qualquer uma com um clique, sem senha.
 *
 * Some por completo em producao: `notFound()` na primeira linha, alem de o
 * provedor "dev" nem existir na lista de autenticacao la.
 */
export default async function DevLoginPage() {
  if (process.env.NODE_ENV === "production" || process.env.DEV_LOGIN !== "1") notFound();

  const usuarios = await db.user.findMany({
    orderBy: [{ role: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      subscription: { select: { status: true, acessoCortesia: true } },
      children: { select: { nome: true } },
    },
  });

  return (
    <main className="mx-auto w-full max-w-lg px-6 py-12">
      <div className="rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-[13px] text-amber-900">
        <strong>Ambiente de desenvolvimento.</strong> Esta tela nao existe em producao e
        so aparece com DEV_LOGIN=1 no .env local.
      </div>

      <h1 className="font-display mt-6 text-2xl font-extrabold text-stone-900">
        Entrar como
      </h1>
      <p className="mt-1 text-sm text-stone-500">
        {usuarios.length} contas no banco. Um clique entra sem senha.
      </p>

      <div className="mt-5 space-y-2">
        {usuarios.map((u) => (
          <form
            key={u.id}
            action={async () => {
              "use server";
              await signIn("dev", { email: u.email, redirectTo: "/hoje" });
            }}
          >
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-2xl border border-stone-200 bg-white p-4 text-left transition hover:border-orange-300 hover:bg-orange-50/40"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-stone-900 text-sm font-bold text-white">
                {u.name.charAt(0).toUpperCase()}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-stone-800">
                  {u.name}
                  {u.role === "ADMIN" && (
                    <span className="ml-2 rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-600">
                      ADMIN
                    </span>
                  )}
                </span>
                <span className="block truncate text-xs text-stone-400">{u.email}</span>
                <span className="block truncate text-[11px] text-stone-400">
                  {u.subscription?.acessoCortesia
                    ? "cortesia"
                    : (u.subscription?.status ?? "sem assinatura")}
                  {u.children.length > 0 && ` · ${u.children.map((c) => c.nome).join(", ")}`}
                </span>
              </span>
            </button>
          </form>
        ))}
      </div>
    </main>
  );
}
