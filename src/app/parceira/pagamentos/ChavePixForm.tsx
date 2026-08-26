"use client";

import { useActionState } from "react";
import { salvarChavePix } from "@/lib/actions/parceira";

/**
 * A chave de repasse.
 *
 * Campo vazio apaga de verdade: e dado pessoal dela, e a LGPD da a ela o
 * direito de retirar. Um formulario que "salva" mas nunca remove seria a
 * forma mais silenciosa de descumprir isso.
 */
export default function ChavePixForm({ chaveAtual }: { chaveAtual: string }) {
  const [estado, acao, pendente] = useActionState(salvarChavePix, undefined);

  return (
    <form action={acao} className="rounded-2xl border border-stone-200/70 bg-white p-5 shadow-card">
      <h2 className="font-semibold text-stone-800">Chave PIX para receber</h2>
      <p className="mt-1 text-sm text-stone-500">
        Guardamos só isto para conseguir te pagar. Apague quando quiser: salvar em branco remove a
        chave do nosso banco.
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        <input
          name="chavePix"
          defaultValue={chaveAtual}
          maxLength={140}
          placeholder="CPF, e-mail, telefone ou chave aleatória"
          className="min-w-0 flex-1 rounded-xl border border-stone-200 px-3 py-2.5 text-sm text-stone-800 outline-none transition focus:border-orange-400"
        />
        <button
          type="submit"
          disabled={pendente}
          className="rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:opacity-60"
        >
          {pendente ? "Salvando…" : "Salvar"}
        </button>
      </div>

      {estado?.error && <p className="mt-2 text-sm text-rose-600">{estado.error}</p>}
      {estado?.ok && <p className="mt-2 text-sm text-emerald-600">{estado.ok}</p>}
    </form>
  );
}
