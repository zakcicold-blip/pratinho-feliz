"use client";

import { useEffect, useState } from "react";
import Lottie from "lottie-react";

// Todas as animações disponíveis em public/Lotties/LOADINGS.
// O caminho respeita maiúsculas/minúsculas (produção é Linux).
const ANIMACOES = [
  "/Lotties/LOADINGS/13306660.json",
  "/Lotties/LOADINGS/13306661.json",
  "/Lotties/LOADINGS/13306664.json",
  "/Lotties/LOADINGS/13306665.json",
  "/Lotties/LOADINGS/13306666.json",
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- JSON de animação Lottie, sem tipo estrito
type LottieData = any;

/** Tela cheia de progresso enquanto o plano é montado, com uma Lottie sorteada. */
export default function PlanoLoading({ nome }: { nome?: string }) {
  const [data, setData] = useState<LottieData | null>(null);

  useEffect(() => {
    // Sorteia no cliente (evita divergência de hidratação) uma animação sem padrão.
    const escolhida = ANIMACOES[Math.floor(Math.random() * ANIMACOES.length)];
    let vivo = true;
    fetch(escolhida)
      .then((r) => r.json())
      .then((json) => {
        if (vivo) setData(json);
      })
      .catch(() => {
        // Se a animação falhar, a tela ainda mostra o texto de progresso.
      });
    return () => {
      vivo = false;
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-white px-6 text-center">
      <div className="flex h-56 w-56 items-center justify-center">
        {data ? (
          <Lottie animationData={data} loop autoplay style={{ width: "100%", height: "100%" }} />
        ) : (
          <span
            className="inline-block animate-spin rounded-full border-4 border-orange-500 border-t-transparent"
            style={{ width: 40, height: 40 }}
          />
        )}
      </div>
      <div>
        <h2 className="text-lg font-bold text-stone-800">Montando o cardápio de 30 dias…</h2>
        <p className="mt-1 text-sm text-stone-500">
          Estamos escolhendo as receitas certas para {nome || "sua criança"} com base no que você
          respondeu.
        </p>
      </div>
    </div>
  );
}
