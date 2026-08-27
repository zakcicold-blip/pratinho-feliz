"use client";

import { useEffect, useRef, useState } from "react";
import useMenosMovimento from "@/lib/useMenosMovimento";

/**
 * O fio que liga as quatro cenas de "Um dia comum".
 *
 * Esta e a unica animacao ambiciosa do site, e ela existe por um motivo: a
 * secao diz que as quatro cenas sao UM DIA, e quatro blocos empilhados nao
 * dizem isso sozinhos. O fio que se preenche conforme a pessoa rola
 * transforma a lista numa passagem de tempo — a forma passa a repetir o que
 * o texto afirma.
 *
 * Como funciona: um trilho cinza fixo e, por cima, um trilho laranja com
 * `scaleY` de 0 a 1 conforme a secao atravessa a tela. `scaleY` roda na GPU;
 * animar `height` obrigaria o navegador a refazer o layout a cada quadro de
 * rolagem, que e exatamente o jeito de travar a pagina no celular.
 *
 * O calculo fica dentro de requestAnimationFrame: o evento de scroll dispara
 * dezenas de vezes por segundo e ler `getBoundingClientRect` em todas elas
 * forca recalculo de estilo fora de hora.
 */
export default function LinhaDoDia({ children }: { children: React.ReactNode }) {
  const secao = useRef<HTMLDivElement>(null);
  const [rolagem, setRolagem] = useState(0);
  const semMovimento = useMenosMovimento();

  // Sem movimento: fio inteiro, parado. A informação continua lá — o dia é
  // um só —, apenas não acompanha a rolagem.
  const progresso = semMovimento ? 1 : rolagem;

  useEffect(() => {
    if (semMovimento) return;

    let pendente = false;

    function medir() {
      const alvo = secao.current;
      if (!alvo) return;

      const caixa = alvo.getBoundingClientRect();
      const altura = window.innerHeight;

      // 0 quando o topo da seção chega ao meio da tela; 1 quando o fim dela
      // passa por lá. O fio acompanha a leitura, não a rolagem bruta.
      const inicio = altura * 0.5;
      const percorrido = inicio - caixa.top;
      const total = caixa.height - altura * 0.3;

      setRolagem(Math.min(1, Math.max(0, percorrido / Math.max(total, 1))));
    }

    function aoRolar() {
      if (pendente) return;
      pendente = true;
      requestAnimationFrame(() => {
        medir();
        pendente = false;
      });
    }

    medir();
    window.addEventListener("scroll", aoRolar, { passive: true });
    window.addEventListener("resize", aoRolar);
    return () => {
      window.removeEventListener("scroll", aoRolar);
      window.removeEventListener("resize", aoRolar);
    };
  }, [semMovimento]);

  return (
    <div ref={secao} className="relative">
      {/*
        O fio só aparece no desktop, onde há margem lateral sobrando. No
        celular ele roubaria largura de leitura para virar enfeite.
      */}
      <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 hidden w-px lg:block">
        <div className="absolute inset-0 bg-stone-200" />
        <div
          className="absolute inset-x-0 top-0 origin-top bg-gradient-to-b from-orange-400 to-orange-300"
          style={{
            height: "100%",
            transform: `scaleY(${progresso})`,
            transition: semMovimento ? "none" : "transform 0.12s linear",
          }}
        />
        {/* A marca que desce junto, mostrando onde a leitura está. */}
        {!semMovimento && (
          <span
            className="absolute -left-[3px] h-1.5 w-1.5 rounded-full bg-orange-500 shadow-[0_0_0_3px_rgba(255,255,255,0.9)]"
            style={{
              top: `${progresso * 100}%`,
              transition: "top 0.12s linear",
              opacity: progresso > 0.01 && progresso < 0.99 ? 1 : 0,
            }}
          />
        )}
      </div>

      <div className="lg:pl-10">{children}</div>
    </div>
  );
}
