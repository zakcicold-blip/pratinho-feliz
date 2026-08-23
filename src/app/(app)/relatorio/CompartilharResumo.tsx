"use client";

import { useState } from "react";
import { Share2, Download, Loader2 } from "lucide-react";

/**
 * Baixa (ou abre a folha de compartilhamento) a imagem do resumo do ciclo.
 *
 * Usa a Web Share API quando o aparelho suporta compartilhar arquivo — é o
 * caminho natural no celular, que é onde a pessoa vai postar. Cai em download
 * no desktop.
 */
export default function CompartilharResumo({
  childId,
  nomeCrianca,
}: {
  childId: string;
  nomeCrianca: string;
}) {
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function gerar() {
    setCarregando(true);
    setErro(null);
    try {
      const resposta = await fetch(`/api/resumo/${childId}`);
      if (!resposta.ok) throw new Error("Não foi possível gerar a imagem.");
      const blob = await resposta.blob();
      const arquivo = new File([blob], `pratinho-feliz-${nomeCrianca}.png`, { type: "image/png" });

      if (navigator.canShare?.({ files: [arquivo] })) {
        await navigator.share({ files: [arquivo], title: `O mês de ${nomeCrianca}` });
        return;
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = arquivo.name;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      // Cancelar o compartilhamento dispara AbortError — não é erro para o usuário.
      if (e instanceof Error && e.name === "AbortError") return;
      setErro("Não deu para gerar agora. Tente de novo.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div>
      <button
        onClick={gerar}
        disabled={carregando}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-stone-900 py-3 text-sm font-semibold text-white transition active:scale-[0.99] hover:bg-stone-800 disabled:opacity-60"
      >
        {carregando ? (
          <>
            <Loader2 size={15} className="animate-spin" /> Gerando imagem…
          </>
        ) : (
          <>
            <Share2 size={15} /> Compartilhar o mês de {nomeCrianca}
          </>
        )}
      </button>
      <p className="mt-2 flex items-center justify-center gap-1 text-[11px] text-stone-400">
        <Download size={11} /> Gera uma imagem pronta para story
      </p>
      {erro && <p className="mt-1 text-center text-[11px] text-rose-500">{erro}</p>}
    </div>
  );
}
