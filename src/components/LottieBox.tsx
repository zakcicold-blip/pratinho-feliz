"use client";

import { useEffect, useState } from "react";
import Lottie from "lottie-react";
import pulse from "./lottie/pulse.json";

// Wrapper de Lottie. Por padrão usa a animação local `pulse.json`.
// Para testar QUALQUER animação, passe `src` com a URL de um .json de Lottie
// (ex.: do LottieFiles / lottie.host) — ela é baixada no cliente.
export default function LottieBox({
  src,
  className,
  loop = true,
}: {
  src?: string;
  className?: string;
  loop?: boolean;
}) {
  const [data, setData] = useState<unknown>(pulse);

  useEffect(() => {
    if (!src) return;
    let vivo = true;
    fetch(src)
      .then((r) => r.json())
      .then((json) => {
        if (vivo) setData(json);
      })
      .catch(() => {
        /* mantém o placeholder se falhar */
      });
    return () => {
      vivo = false;
    };
  }, [src]);

  return <Lottie animationData={data} loop={loop} autoplay className={className} />;
}
