"use client";

import { useActionState } from "react";
import { Plus } from "lucide-react";
import { criarLink } from "@/lib/actions/parceira";

export default function NovoLinkForm() {
  const [estado, acao, pendente] = useActionState(criarLink, undefined);

  return (
    <form action={acao} className="rounded-2xl border border-stone-200/70 bg-white p-5 shadow-card">
      <h2 className="font-semibold text-stone-800">Criar um link</h2>
      <p className="mt-1 text-sm text-stone-500">
        Dê um nome que só você vê, para reconhecer depois de onde veio cada cadastro.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
        <label className="block text-xs font-medium text-stone-500">
          Onde vai divulgar
          <input
            name="rotulo"
            required
            maxLength={60}
            placeholder="Ex.: Bio do Instagram"
            className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm text-stone-800 outline-none transition focus:border-orange-400"
          />
        </label>

        <label className="block text-xs font-medium text-stone-500">
          Final do link <span className="font-normal text-stone-400">(opcional)</span>
          <input
            name="sufixo"
            maxLength={40}
            placeholder="bio"
            className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm text-stone-800 outline-none transition focus:border-orange-400"
          />
        </label>

        <button
          type="submit"
          disabled={pendente}
          className="flex items-center justify-center gap-1.5 self-end rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:opacity-60"
        >
          <Plus size={15} />
          {pendente ? "Criando…" : "Criar"}
        </button>
      </div>

      {estado?.error && <p className="mt-2 text-sm text-rose-600">{estado.error}</p>}
      {estado?.ok && <p className="mt-2 text-sm text-emerald-600">{estado.ok}</p>}
    </form>
  );
}
