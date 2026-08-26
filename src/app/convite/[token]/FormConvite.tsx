"use client";

import { useActionState } from "react";
import { Check, ArrowRight } from "lucide-react";
import { registerComConvite } from "@/lib/actions/auth";

/**
 * Mesmo formulario do cadastro comum, com o token amarrado na action. A pessoa
 * nao digita o token e nao da para trocar por outro: ele vem do link e e
 * revalidado no servidor antes de criar a conta.
 */
export default function FormConvite({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState(
    registerComConvite.bind(null, token),
    undefined,
  );

  return (
    <form
      action={formAction}
      className="space-y-4 rounded-3xl border border-stone-200/60 bg-white p-6 shadow-card"
    >
      <div>
        <label className="mb-1 block text-sm font-medium text-stone-700">Seu nome</label>
        <input
          name="name"
          required
          className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-orange-400"
          placeholder="Como podemos te chamar?"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-stone-700">E-mail</label>
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
          WhatsApp <span className="font-normal text-stone-400">(opcional)</span>
        </label>
        <input
          type="tel"
          name="telefone"
          inputMode="tel"
          autoComplete="tel"
          className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-orange-400"
          placeholder="(11) 99999-9999"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-stone-700">Senha</label>
        <input
          type="password"
          name="password"
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
        {pending ? "Criando conta…" : "Criar conta e entrar"} <ArrowRight size={16} />
      </button>

      <ul className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 pt-1 text-[11px] font-medium text-stone-400">
        <li className="flex items-center gap-1"><Check size={12} className="text-emerald-500" /> Sem cartão</li>
        <li className="flex items-center gap-1"><Check size={12} className="text-emerald-500" /> Sem cobrança</li>
        <li className="flex items-center gap-1"><Check size={12} className="text-emerald-500" /> Acesso completo</li>
      </ul>
    </form>
  );
}
