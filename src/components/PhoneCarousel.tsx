"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

// Prints reais do app (public/screens). Para trocar/adicionar telas, gere de
// novo com: npm run screens
const SCREENS = [
  { src: "/screens/hoje.png", alt: "Refeições de hoje" },
  { src: "/screens/plano.png", alt: "Calendário do mês" },
  { src: "/screens/rotina.png", alt: "Cardápio guiado pela rotina" },
  { src: "/screens/compras.png", alt: "Lista de compras automática" },
];

export default function PhoneCarousel() {
  const [i, setI] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % SCREENS.length), 2800);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="flex w-full flex-col items-center gap-3">
      <div className="w-full max-w-[270px] rounded-[2.5rem] border-[7px] border-stone-900 bg-stone-900 shadow-float">
        <div className="relative aspect-[9/18] overflow-hidden rounded-[1.9rem] bg-white">
          <div
            className="flex h-full transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${i * 100}%)` }}
          >
            {SCREENS.map((s) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={s.src}
                src={s.src}
                alt={s.alt}
                draggable={false}
                className="h-full w-full shrink-0 object-cover object-top select-none"
              />
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        {SCREENS.map((s, idx) => (
          <button
            key={s.src}
            type="button"
            aria-label={`Ver ${s.alt}`}
            onClick={() => setI(idx)}
            className={cn(
              "h-1.5 rounded-full transition-all",
              idx === i ? "w-5 bg-orange-500" : "w-1.5 bg-stone-300 hover:bg-stone-400"
            )}
          />
        ))}
      </div>
    </div>
  );
}
