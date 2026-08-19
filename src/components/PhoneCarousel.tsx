"use client";

import { useEffect, useState } from "react";
import { CalendarDays, Salad } from "lucide-react";
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
    <div className="flex w-full flex-col items-center gap-4">
      <div className="relative w-full max-w-[280px]">
        {/* Celular */}
        <div className="mx-auto w-full max-w-[270px] rounded-[2.5rem] border-[7px] border-stone-900 bg-stone-900 shadow-float">
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

        {/* Cards flutuantes sobrepondo o celular */}
        <div className="absolute -left-3 top-14 flex items-center gap-2 rounded-2xl border border-stone-200/70 bg-white/95 px-3 py-2 shadow-float backdrop-blur-sm">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
            <CalendarDays size={16} />
          </span>
          <span className="leading-tight">
            <span className="block text-sm font-bold text-stone-800">30 dias</span>
            <span className="block text-[11px] text-stone-400">sob medida</span>
          </span>
        </div>

        <div className="absolute -right-3 bottom-16 flex items-center gap-2 rounded-2xl border border-stone-200/70 bg-white/95 px-3 py-2 shadow-float backdrop-blur-sm">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-500">
            <Salad size={16} />
          </span>
          <span className="leading-tight">
            <span className="block text-sm font-bold text-stone-800">Nutrição real</span>
            <span className="block text-[11px] text-stone-400">base TACO</span>
          </span>
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
