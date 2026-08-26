"use client";

import { useActionState } from "react";
import { UserPlus } from "lucide-react";
import { criarParceira } from "@/lib/actions/adminParceiras";

export default function NovaParceiraForm() {
  const [estado, acao, pendente] = useActionState(criarParceira, undefined);

  return (
    <form action={acao} className="rounded-2xl border border-stone-200/70 bg-white p-5 shadow-card">
      <h2 className="font-semibold text-stone-800">Nova parceira</h2>
      <p className="mt-1 text-sm text-stone-500">
        A conta precisa existir antes: peça para ela se cadastrar normalmente no app e depois
        promova aqui. Assim ninguém define a senha de outra pessoa.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Campo label="E-mail da conta dela" name="email" type="email" required placeholder="marina@email.com" />
        <Campo label="Nome público" name="nome" required placeholder="Marina · Nutri Materna" />
        <Campo label="Código do link (/p/…)" name="codigo" required placeholder="marina" />
        <Campo label="Comissão (%)" name="comissaoPct" type="number" required defaultValue="30" step="1" min="0" max="80" />
      </div>

      <div className="mt-3">
        <Campo label="Observação (opcional)" name="observacao" placeholder="Instagram @marinanutri, combinado em 26/08" />
      </div>

      <button
        type="submit"
        disabled={pendente}
        className="mt-4 flex items-center gap-1.5 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:opacity-60"
      >
        <UserPlus size={15} />
        {pendente ? "Criando…" : "Criar parceira"}
      </button>

      {estado?.error && <p className="mt-2 text-sm text-rose-600">{estado.error}</p>}
      {estado?.ok && <p className="mt-2 text-sm text-emerald-600">{estado.ok}</p>}
    </form>
  );
}

function Campo({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block text-xs font-medium text-stone-500">
      {label}
      <input
        {...props}
        className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm text-stone-800 outline-none transition focus:border-orange-400"
      />
    </label>
  );
}
