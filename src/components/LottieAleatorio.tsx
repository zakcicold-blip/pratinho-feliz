"use client";

import { useEffect, useState } from "react";
import LottieBox from "./LottieBox";

// Personagens (com pés) usados no card de progresso. A cada montagem da tela
// (ou seja, cada vez que a pessoa sai da Hoje e volta) sorteia um diferente.
const LOTTIES = [
  "/Lotties/LOADINGS/13306664.json",
  "/Lotties/LOADINGS/13306665.json",
  "/Lotties/LOADINGS/13306666.json",
];

export default function LottieAleatorio({
  className,
  preserveAspectRatio,
}: {
  className?: string;
  preserveAspectRatio?: string;
}) {
  const [src, setSrc] = useState<string | null>(null);

  // Sorteia no cliente após montar (evita divergência de hidratação e garante
  // um novo sorteio a cada remontagem da tela — sair da Hoje e voltar).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sorteio client-only intencional no mount
    setSrc(LOTTIES[Math.floor(Math.random() * LOTTIES.length)]);
  }, []);

  if (!src) return null;
  return <LottieBox src={src} className={className} preserveAspectRatio={preserveAspectRatio} />;
}
