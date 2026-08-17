"use client";

import { useState, useTransition } from "react";
import { atualizarHorariosHabituais } from "@/lib/actions/routine";

export default function HorariosForm({
  childId,
  dormirInicial,
  acordarInicial,
}: {
  childId: string;
  dormirInicial: string;
  acordarInicial: string;
}) {
  const [dormir, setDormir] = useState(dormirInicial);
  const [acordar, setAcordar] = useState(acordarInicial);
  const [, startTransition] = useTransition();

  function salvar(novoDormir: string, novoAcordar: string) {
    startTransition(async () => {
      await atualizarHorariosHabituais(childId, novoDormir, novoAcordar);
    });
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      <div>
        <label className="mb-1 block text-xs text-stone-500">Costuma dormir às</label>
        <input
          type="time"
          value={dormir}
          onChange={(e) => {
            setDormir(e.target.value);
            salvar(e.target.value, acordar);
          }}
          className="w-full rounded-xl border border-stone-300 px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs text-stone-500">Costuma acordar às</label>
        <input
          type="time"
          value={acordar}
          onChange={(e) => {
            setAcordar(e.target.value);
            salvar(dormir, e.target.value);
          }}
          className="w-full rounded-xl border border-stone-300 px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
        />
      </div>
    </div>
  );
}
