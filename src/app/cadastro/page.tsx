"use client";

import { useActionState } from "react";
import Link from "next/link";
import { UtensilsCrossed, Gift, Check, ArrowRight } from "lucide-react";
import { registerAction } from "@/lib/actions/auth";

export default function CadastroPage() {
  const [state, formAction, pending] = useActionState(registerAction, undefined);

  return (
    <main className="flex min-h-screen flex-col bg-[#fdfaf6]">
      <header className="mx-auto flex w-full max-w-md items-center gap-2 px-6 py-6 text-base font-bold text-stone-800">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500 text-white">
          <UtensilsCrossed size={16} />
        </span>
        Pratinho Feliz
      </header>

      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 pb-12">
        <div className="mb-6 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-600">
            <Gift size={13} /> 7 dias grátis
          </span>
          <h1 className="font-display mt-3 text-3xl font-extrabold leading-tight text-stone-900">
            Crie sua conta
          </h1>
          <p className="mt-2 text-sm text-stone-500">
            Em poucos minutos você monta o primeiro plano do seu filho.
          </p>
        </div>

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
            <p className="mt-1 text-[11px] text-stone-400">
              Só usamos para falar com você sobre o app, se precisar. Nunca compartilhamos.
            </p>
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
            {pending ? "Criando conta…" : "Criar conta e começar"} <ArrowRight size={16} />
          </button>

          {/*
            Aceite no ato do envio, e nao numa caixa a marcar. A LGPD exige
            destaque para o consentimento dos dados da CRIANCA — e esse vem
            depois, no cadastro do perfil dela. Aqui e contrato de servico, e
            o que a lei pede e que a pessoa saiba a que esta aderindo e consiga
            ler antes.
          */}
          <p className="text-center text-[11px] leading-relaxed text-stone-400">
            Ao criar a conta você concorda com os{" "}
            <Link href="/termos" className="underline hover:text-stone-600">
              Termos de uso
            </Link>{" "}
            e com a{" "}
            <Link href="/privacidade" className="underline hover:text-stone-600">
              Política de privacidade
            </Link>
            .
          </p>

          <ul className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 pt-1 text-[11px] font-medium text-stone-400">
            <li className="flex items-center gap-1"><Check size={12} className="text-emerald-500" /> Menos de 5 min</li>
            <li className="flex items-center gap-1"><Check size={12} className="text-emerald-500" /> Edite tudo depois</li>
            <li className="flex items-center gap-1"><Check size={12} className="text-emerald-500" /> Cancele quando quiser</li>
          </ul>
        </form>

        <p className="mt-6 text-center text-sm text-stone-500">
          Já tem conta?{" "}
          <Link href="/login" className="font-semibold text-orange-600 hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </main>
  );
}
