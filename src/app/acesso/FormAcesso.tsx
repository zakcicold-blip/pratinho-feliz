"use client";

import { useActionState } from "react";
import { ArrowRight } from "lucide-react";
import { liberarAcessoCakto } from "@/lib/actions/acessoCakto";

export default function FormAcesso() {
  const [state, formAction, pending] = useActionState(liberarAcessoCakto, undefined);

  return (
    <form
      action={formAction}
      className="space-y-4 rounded-3xl border border-stone-200/60 bg-white p-6 shadow-card"
    >
      <div>
        <label className="mb-1 block text-sm font-medium text-stone-700">
          E-mail usado no pagamento
        </label>
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-orange-400"
          placeholder="voce@email.com"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-stone-700">
          4 últimos dígitos do CPF
        </label>
        <input
          name="documento"
          required
          inputMode="numeric"
          maxLength={4}
          pattern="[0-9]{4}"
          className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-orange-400"
          placeholder="0000"
        />
        <p className="mt-1 text-[11px] text-stone-400">
          Só para confirmar que a compra é sua. Não guardamos o CPF completo.
        </p>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-stone-700">Seu nome</label>
        <input
          name="nome"
          required
          className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-orange-400"
          placeholder="Como podemos te chamar?"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-stone-700">Crie uma senha</label>
        <input
          type="password"
          name="senha"
          required
          minLength={8}
          autoComplete="new-password"
          className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-orange-400"
          placeholder="Mínimo 8 caracteres"
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
        className="flex w-full items-center justify-center gap-2 rounded-full bg-orange-500 py-3.5 text-sm font-semibold text-white shadow-sm shadow-orange-900/20 transition active:scale-[0.98] hover:bg-orange-600 disabled:opacity-60"
      >
        {pending ? "Liberando acesso…" : "Criar conta e entrar"} <ArrowRight size={16} />
      </button>
    </form>
  );
}
