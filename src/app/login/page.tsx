"use client";

import { useActionState } from "react";
import Link from "next/link";
import { UtensilsCrossed } from "lucide-react";
import { loginAction } from "@/lib/actions/auth";
import Button from "@/components/ui/Button";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, undefined);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-10">
      <div className="mb-8 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
          <UtensilsCrossed size={28} />
        </span>
        <h1 className="mt-3 text-2xl font-bold text-stone-800">Bem-vindo de volta</h1>
        <p className="mt-1 text-sm text-stone-500">Entre para ver o plano de hoje.</p>
      </div>

      <form action={formAction} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-stone-700">E-mail</label>
          <input
            type="email"
            name="email"
            required
            className="w-full rounded-xl border border-stone-300 px-4 py-2.5 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
            placeholder="voce@email.com"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-stone-700">Senha</label>
          <input
            type="password"
            name="password"
            required
            className="w-full rounded-xl border border-stone-300 px-4 py-2.5 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
            placeholder="Sua senha"
          />
        </div>

        {state?.error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{state.error}</p>
        )}

        <Button type="submit" disabled={pending} size="lg" className="w-full">
          {pending ? "Entrando..." : "Entrar"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-stone-500">
        Ainda não tem conta?{" "}
        <Link href="/cadastro" className="font-medium text-orange-600 hover:underline">
          Criar conta
        </Link>
      </p>
    </main>
  );
}
