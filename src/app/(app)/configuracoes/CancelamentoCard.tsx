"use client";

import { useState, useTransition } from "react";
import { LifeBuoy, Check } from "lucide-react";
import { solicitarCancelamento } from "@/lib/actions/suporte";

type Pendente = { status: string; createdAt: string } | null;

export default function CancelamentoCard({ pendente }: { pendente: Pendente }) {
  const [aberto, setAberto] = useState(false);
  const [motivo, setMotivo] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviado, setEnviado] = useState(false);
  const [salvando, startTransition] = useTransition();

  if (pendente || enviado) {
    return (
      <div className="flex items-start gap-2.5 rounded-xl bg-amber-50 px-3 py-2.5 text-[13px] text-amber-800">
        <Check size={16} className="mt-0.5 shrink-0" />
        <span>
          Sua solicitação de cancelamento foi enviada e está <strong>em análise</strong>. Nossa
          equipe entra em contato. Você continua com acesso até a conclusão.
        </span>
      </div>
    );
  }

  function enviar() {
    setErro(null);
    startTransition(async () => {
      const r = await solicitarCancelamento(motivo);
      if (r?.error) setErro(r.error);
      else setEnviado(true);
    });
  }

  if (!aberto) {
    return (
      <button
        onClick={() => setAberto(true)}
        className="flex items-center gap-1.5 text-sm font-medium text-stone-500 hover:text-stone-700"
      >
        <LifeBuoy size={15} /> Solicitar cancelamento
      </button>
    );
  }

  return (
    <div>
      <p className="mb-2 text-sm text-stone-600">
        Conte o motivo do cancelamento. Nossa equipe analisa e conclui para você.
      </p>
      <textarea
        autoFocus
        value={motivo}
        onChange={(e) => setMotivo(e.target.value)}
        maxLength={1000}
        rows={3}
        placeholder="Ex.: meu filho mudou de rotina, preço, não usei tanto…"
        className="w-full resize-none rounded-xl border border-stone-200 px-3 py-2 text-sm outline-none focus:border-orange-300"
      />
      {erro && <p className="mt-1 text-xs text-red-600">{erro}</p>}
      <div className="mt-2 flex gap-2">
        <button
          onClick={enviar}
          disabled={salvando || motivo.trim().length < 3}
          className="rounded-xl bg-stone-800 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
        >
          {salvando ? "Enviando…" : "Enviar solicitação"}
        </button>
        <button
          onClick={() => setAberto(false)}
          className="rounded-xl bg-stone-100 px-4 py-2 text-sm font-medium text-stone-600"
        >
          Voltar
        </button>
      </div>
    </div>
  );
}
