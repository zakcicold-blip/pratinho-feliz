"use client";

import { useEffect } from "react";
import { CloudOff, RotateCcw } from "lucide-react";
import TelaDeAviso, { BotaoSecundario } from "@/components/ui/TelaDeAviso";

export default function Erro({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Fica no log do servidor/Vercel com o digest, para dar para rastrear depois.
    console.error("Erro na rota:", error.digest ?? error.message);
  }, [error]);

  return (
    <TelaDeAviso
      icon={CloudOff}
      titulo="Algo deu errado aqui"
      texto="Tivemos um problema para carregar esta tela. Seus dados estão salvos — normalmente tentar de novo resolve."
    >
      <button
        onClick={reset}
        className="flex items-center gap-2 rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-sm shadow-orange-900/20 transition hover:bg-orange-600"
      >
        <RotateCcw size={15} /> Tentar de novo
      </button>
      <BotaoSecundario href="/hoje">Voltar ao início</BotaoSecundario>
    </TelaDeAviso>
  );
}
