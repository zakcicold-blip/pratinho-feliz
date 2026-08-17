"use client";

import { useState, useTransition } from "react";
import { adicionarDesejado } from "@/lib/actions/preferences";
import Button from "@/components/ui/Button";

export default function AddDesejadoForm({
  childId,
  opcoes,
}: {
  childId: string;
  opcoes: { id: string; nome: string }[];
}) {
  const [selecionado, setSelecionado] = useState("");
  const [pending, startTransition] = useTransition();

  if (opcoes.length === 0) return null;

  return (
    <form
      className="flex gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        if (!selecionado) return;
        startTransition(async () => {
          await adicionarDesejado(childId, selecionado);
          setSelecionado("");
        });
      }}
    >
      <select
        value={selecionado}
        onChange={(e) => setSelecionado(e.target.value)}
        className="flex-1 rounded-xl border border-stone-300 px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
      >
        <option value="">Escolha um alimento para apresentar...</option>
        {opcoes.map((o) => (
          <option key={o.id} value={o.id}>
            {o.nome}
          </option>
        ))}
      </select>
      <Button type="submit" disabled={!selecionado || pending}>
        Adicionar
      </Button>
    </form>
  );
}
