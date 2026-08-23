"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

/**
 * Personagens (com pés) usados no card de progresso. A cada montagem da tela
 * (ou seja, cada vez que a pessoa sai da Hoje e volta) sorteia um diferente.
 */
const LOTTIES = [
  "/Lotties/LOADINGS/13306664.json",
  "/Lotties/LOADINGS/13306665.json",
  "/Lotties/LOADINGS/13306666.json",
];

/**
 * A biblioteca do Lottie sozinha pesa ~300 KB e vinha no mesmo pacote da tela
 * inicial — ou seja, o app esperava por ela para ficar interativo, por causa
 * de uma animação decorativa. Carregada sob demanda, ela sai do caminho
 * crítico: a tela abre primeiro, o personagem aparece logo depois.
 */
const LottieBox = dynamic(() => import("./LottieBox"), { ssr: false });

export default function LottieAleatorio({
  className,
  preserveAspectRatio,
}: {
  className?: string;
  preserveAspectRatio?: string;
}) {
  const [src, setSrc] = useState<string | null>(null);

  // Espera o navegador ficar OCIOSO antes de sequer escolher a animacao.
  //
  // Carregar sob demanda ja tirava a biblioteca do pacote inicial, mas o
  // download comecava logo apos a hidratacao e disputava a linha principal
  // justamente na hora em que a tela deveria terminar de pintar. Sao ~300 KB
  // de biblioteca mais ~150 KB de JSON por causa de uma animacao decorativa.
  // Em requestIdleCallback, ela so entra quando nada mais importa.
  useEffect(() => {
    const escolher = () => setSrc(LOTTIES[Math.floor(Math.random() * LOTTIES.length)]);

    const janela = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };

    if (janela.requestIdleCallback) {
      const id = janela.requestIdleCallback(escolher, { timeout: 3000 });
      return () => janela.cancelIdleCallback?.(id);
    }
    // Safari antigo nao tem requestIdleCallback: espera um tempo fixo.
    const timer = setTimeout(escolher, 1500);
    return () => clearTimeout(timer);
  }, []);

  if (!src) return null;
  return <LottieBox src={src} className={className} preserveAspectRatio={preserveAspectRatio} />;
}
