"use client";

import { useEffect, useRef, useState } from "react";
import useMenosMovimento from "@/lib/useMenosMovimento";

/**
 * O primitivo de movimento do site.
 *
 * A direcao e uma so, e ela vem do produto: as coisas ASSENTAM. Nada entra
 * voando da lateral, nada quica, nada faz parallax. O app vende alivio de
 * decisao para mae cansada — animacao agitada contradiz a promessa antes de
 * qualquer texto ser lido.
 *
 * Por que IntersectionObserver e transicao de CSS, e nao uma biblioteca:
 * opacity e transform sao as duas unicas propriedades que o navegador anima
 * na GPU sem recalcular layout. O resultado e liso ate em celular fraco, que
 * e o aparelho da maior parte deste publico, e custa zero KB de JavaScript
 * extra.
 *
 * Uma vez so: `once` desligado faria o conteudo piscar toda vez que a pessoa
 * rolasse para cima, que e irritante e nao acrescenta nada.
 */
export default function Revelar({
  children,
  atraso = 0,
  distancia = 14,
  direcao = "cima",
  className,
  as: Tag = "div",
}: {
  children: React.ReactNode;
  /** Milissegundos de espera. Serve para escalonar irmãos. */
  atraso?: number;
  /** Deslocamento inicial em pixels. */
  distancia?: number;
  direcao?: "cima" | "esquerda" | "direita";
  className?: string;
  as?: "div" | "li" | "section" | "span";
}) {
  const ref = useRef<HTMLElement>(null);
  const [entrouNaTela, setEntrouNaTela] = useState(false);
  const menosMovimento = useMenosMovimento();

  // Quem pediu menos movimento recebe o conteúdo pronto, sem transição
  // alguma. Não é um "modo degradado": é a mesma página.
  const visivel = entrouNaTela || menosMovimento;

  useEffect(() => {
    if (menosMovimento) return;
    const alvo = ref.current;
    if (!alvo) return;

    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (!entrada.isIntersecting) return;
        setEntrouNaTela(true);
        observador.disconnect();
      },
      // rootMargin negativo embaixo: o elemento só conta como visto depois de
      // entrar de verdade na tela. Sem isso, a animação dispara ainda fora do
      // campo de visão e a pessoa só vê o conteúdo já parado.
      { threshold: 0.1, rootMargin: "0px 0px -8% 0px" },
    );

    observador.observe(alvo);
    return () => observador.disconnect();
  }, [menosMovimento]);

  const deslocamento = {
    cima: `translateY(${distancia}px)`,
    esquerda: `translateX(-${distancia}px)`,
    direita: `translateX(${distancia}px)`,
  }[direcao];

  return (
    <Tag
      ref={ref as React.Ref<never>}
      className={className}
      style={{
        opacity: visivel ? 1 : 0,
        transform: visivel ? "none" : deslocamento,
        // 0.55s com saída suave: rápido o bastante para não fazer esperar,
        // lento o bastante para o olho perceber que assentou.
        transition: "opacity 0.55s cubic-bezier(0.22, 1, 0.36, 1), transform 0.55s cubic-bezier(0.22, 1, 0.36, 1)",
        transitionDelay: `${atraso}ms`,
        // Sem isto o navegador promove a camada só no primeiro quadro e o
        // início da transição engasga em aparelho fraco.
        willChange: visivel ? "auto" : "opacity, transform",
      }}
    >
      {children}
    </Tag>
  );
}
