"use client";

import { useEffect, useState } from "react";
import Lottie from "lottie-react";

// Renderiza uma animação Lottie a partir de uma URL de .json (ex.: arquivos em
// /public/Lotties/...). Não desenha nada até a animação carregar (sem flash).
export default function LottieBox({
  src,
  className,
  loop = true,
}: {
  src: string;
  className?: string;
  loop?: boolean;
}) {
  const [data, setData] = useState<unknown>(null);

  useEffect(() => {
    let vivo = true;
    fetch(src)
      .then((r) => r.json())
      .then((json) => {
        if (vivo) setData(json);
      })
      .catch(() => {
        /* falha silenciosa — não quebra a tela */
      });
    return () => {
      vivo = false;
    };
  }, [src]);

  if (!data) return null;
  return <Lottie animationData={data} loop={loop} autoplay className={className} />;
}
