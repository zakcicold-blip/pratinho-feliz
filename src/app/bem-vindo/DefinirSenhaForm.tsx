"use client";

import { useActionState } from "react";
import { provisionarAcesso } from "@/lib/actions/checkoutDireto";
import { ArrowRight } from "lucide-react";

export default function DefinirSenhaForm({
  sessionId,
  email,
}: {
  sessionId: string;
  email: string;
}) {
  const [state, action, pending] = useActionState(
    provisionarAcesso.bind(null, sessionId),
    undefined,
  );

  return (
    <form action={action} className="space-y-4 rounded-3xl border border-stone-200/60 bg-white p-6 shadow-card">
      <div>
        <label className="mb-1 block text-xs font-semibold text-stone-500">E-mail da conta</label>
        <input
          type="email"
          value={email}
          readOnly
          className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-600"
        />
      </div>
      <div>
        <label htmlFor="senha" className="mb-1 block text-xs font-semibold text-stone-500">
          Crie sua senha
        </label>
        <input
          id="senha"
          name="senha"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          placeholder="Mínimo 8 caracteres"
          className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-800 outline-none focus:border-orange-400"
        />
      </div>

      {state?.error && (
        <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-orange-500 py-3.5 text-sm font-semibold text-white transition active:scale-[0.98] hover:bg-orange-600 disabled:opacity-60"
      >
        {pending ? "Liberando acesso…" : "Entrar no app"} <ArrowRight size={16} />
      </button>
    </form>
  );
}
