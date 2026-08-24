"use client";

import { useActionState } from "react";
import { Gift } from "lucide-react";
import { criarConvite } from "@/lib/actions/adminConvites";

export default function NovoConviteForm() {
  const [state, formAction, pending] = useActionState(criarConvite, undefined);

  return (
    <form
      action={formAction}
      className="rounded-2xl border border-stone-200/70 bg-white p-5 shadow-card"
    >
      <div className="flex items-center gap-2 text-sm font-semibold text-stone-800">
        <Gift size={16} className="text-orange-500" /> Novo convite
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-4">
        <label className="sm:col-span-2 text-xs font-medium text-stone-500">
          Para quem
          <input
            name="rotulo"
            required
            maxLength={80}
            placeholder="Ex.: Ana, do @maternar"
            className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-sm text-stone-800 outline-none transition focus:border-orange-400"
          />
        </label>
        <label className="text-xs font-medium text-stone-500">
          Usos
          <input
            name="maxUsos"
            type="number"
            min={1}
            max={500}
            defaultValue={1}
            className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-sm text-stone-800 outline-none transition focus:border-orange-400"
          />
        </label>
        <label className="text-xs font-medium text-stone-500">
          Validade
          <select
            name="validadeDias"
            defaultValue={30}
            className="mt-1 w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm text-stone-800 outline-none transition focus:border-orange-400"
          >
            <option value={7}>7 dias</option>
            <option value={30}>30 dias</option>
            <option value={90}>90 dias</option>
            <option value={0}>Sem validade</option>
          </select>
        </label>
        <label className="sm:col-span-4 text-xs font-medium text-stone-500">
          Motivo <span className="font-normal text-stone-400">(opcional, fica no registro)</span>
          <input
            name="motivo"
            maxLength={120}
            placeholder="Ex.: parceria de divulgação"
            className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-sm text-stone-800 outline-none transition focus:border-orange-400"
          />
        </label>
      </div>

      {state?.error && (
        <p className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-4 rounded-full bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:opacity-60"
      >
        {pending ? "Gerando…" : "Gerar link"}
      </button>
    </form>
  );
}
