"use client";

import { useActionState } from "react";
import Link from "next/link";
import { UtensilsCrossed, ArrowRight } from "lucide-react";
import { loginAction } from "@/lib/actions/auth";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, undefined);

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
          <h1 className="font-display text-3xl font-extrabold leading-tight text-stone-900">
            Bem-vindo de volta
          </h1>
          <p className="mt-2 text-sm text-stone-500">Entre para ver o plano de hoje.</p>
        </div>

        <form
          action={formAction}
          className="space-y-4 rounded-3xl border border-stone-200/60 bg-white p-6 shadow-card"
        >
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
            <label className="mb-1 block text-sm font-medium text-stone-700">Senha</label>
            <input
              type="password"
              name="password"
              required
              autoComplete="current-password"
              className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-orange-400"
              placeholder="Sua senha"
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
            {pending ? "Entrando…" : "Entrar"} <ArrowRight size={16} />
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-stone-500">
          Ainda não tem conta?{" "}
          <Link href="/cadastro" className="font-semibold text-orange-600 hover:underline">
            Criar conta
          </Link>
        </p>
      </div>
    </main>
  );
}
