"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Check, Plus, Trash2 } from "lucide-react";
import { removerCrianca, selecionarCrianca } from "@/lib/actions/criancas";
import Card from "@/components/ui/Card";
import { cn } from "@/lib/cn";

type Crianca = { id: string; nome: string; faixaEtaria: string };

export default function SeletorCrianca({
  criancas,
  ativaId,
}: {
  criancas: Crianca[];
  ativaId: string;
}) {
  const [pendente, startTransition] = useTransition();
  const [confirmando, setConfirmando] = useState<string | null>(null);

  return (
    <Card padding="sm" className="px-3">
      <h2 className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wide text-stone-400">
        {criancas.length > 1 ? "Suas crianças" : "Sua criança"}
      </h2>

      <div className="space-y-1">
        {criancas.map((c) => {
          const ativa = c.id === ativaId;
          return (
            <div key={c.id} className="flex items-center gap-1">
              <button
                onClick={() => {
                  if (ativa) return;
                  startTransition(async () => {
                    await selecionarCrianca(c.id);
                  });
                }}
                disabled={pendente}
                className={cn(
                  "flex min-w-0 flex-1 items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                  ativa ? "bg-orange-50" : "hover:bg-stone-50"
                )}
              >
                <span
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold",
                    ativa ? "bg-orange-500 text-white" : "bg-stone-100 text-stone-500"
                  )}
                >
                  {c.nome.trim().charAt(0).toUpperCase()}
                </span>
                <span className="min-w-0 flex-1">
                  <span
                    className={cn(
                      "block truncate text-sm font-semibold",
                      ativa ? "text-orange-700" : "text-stone-700"
                    )}
                  >
                    {c.nome}
                  </span>
                  <span className="block truncate text-[11px] text-stone-400">{c.faixaEtaria}</span>
                </span>
                {ativa && <Check size={16} className="shrink-0 text-orange-500" />}
              </button>

              {criancas.length > 1 && (
                <button
                  onClick={() => setConfirmando(c.id)}
                  aria-label={`Remover perfil de ${c.nome}`}
                  className="shrink-0 rounded-full p-2 text-stone-300 hover:bg-stone-100 hover:text-red-500"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {confirmando && (
        <div className="mt-2 rounded-xl bg-red-50 px-3 py-2.5">
          <p className="text-[12px] leading-relaxed text-red-800">
            Remover <strong>{criancas.find((c) => c.id === confirmando)?.nome}</strong> apaga o plano
            de 30 dias, a rotina, as listas e as preferências dessa criança. Não dá para desfazer.
          </p>
          <div className="mt-2 flex gap-2">
            <button
              onClick={() =>
                startTransition(async () => {
                  await removerCrianca(confirmando);
                })
              }
              disabled={pendente}
              className="rounded-lg bg-red-600 px-3 py-1.5 text-[12px] font-semibold text-white disabled:opacity-50"
            >
              {pendente ? "Removendo..." : "Remover mesmo assim"}
            </button>
            <button
              onClick={() => setConfirmando(null)}
              className="rounded-lg bg-white px-3 py-1.5 text-[12px] font-medium text-stone-600"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <Link
        href="/onboarding"
        className="mt-2 flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-stone-300 py-2.5 text-[13px] font-medium text-stone-500 transition-colors hover:border-orange-300 hover:text-orange-600"
      >
        <Plus size={15} /> Adicionar criança
      </Link>
    </Card>
  );
}
