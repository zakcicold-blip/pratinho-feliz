"use client";

import { useEffect, useRef, useState } from "react";
import { Check, X } from "lucide-react";
import useMenosMovimento from "@/lib/useMenosMovimento";

/**
 * A lista do "antes e depois", item por item.
 *
 * A seção compara duas colunas: como o dia costuma ser e como fica com o app.
 * Estáticas, as duas são só listas — o olho lê a da esquerda, lê a da direita
 * e não sente diferença nenhuma entre elas.
 *
 * Em cascata, cada linha da coluna "depois" chega com o seu confere, e a
 * coluna inteira se monta na frente da pessoa. É a mesma informação, com o
 * peso que ela deveria ter: alguma coisa está sendo resolvida.
 *
 * A coluna "antes" usa cascata mais rápida e sem destaque. Ela não deve ser
 * agradável de ver — é o problema.
 */
export default function ListaQueEntra({
  itens,
  tipo,
}: {
  itens: string[];
  tipo: "antes" | "depois";
}) {
  const ref = useRef<HTMLUListElement>(null);
  const [entrouNaTela, setEntrouNaTela] = useState(false);
  const menosMovimento = useMenosMovimento();
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
      { threshold: 0.25 },
    );

    observador.observe(alvo);
    return () => observador.disconnect();
  }, [menosMovimento]);

  const ehDepois = tipo === "depois";
  // 90ms entre itens no "depois" e 45ms no "antes": a coluna que resolve
  // merece ser vista uma linha por vez; a que descreve o problema não.
  const passo = ehDepois ? 90 : 45;

  return (
    <ul ref={ref} className="mt-4 space-y-3">
      {itens.map((texto, i) => (
        <li
          key={texto}
          className={`flex items-start gap-2.5 text-sm ${
            ehDepois ? "text-stone-700" : "text-stone-500"
          }`}
          style={{
            opacity: visivel ? 1 : 0,
            transform: visivel ? "none" : "translateY(6px)",
            transition:
              "opacity 0.45s cubic-bezier(0.22, 1, 0.36, 1), transform 0.45s cubic-bezier(0.22, 1, 0.36, 1)",
            transitionDelay: `${i * passo}ms`,
          }}
        >
          <span
            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
              ehDepois ? "bg-emerald-50 text-emerald-600" : "bg-stone-100 text-stone-400"
            }`}
            style={{
              // O símbolo cresce um pouco depois da linha aparecer. É o
              // detalhe que faz a marca parecer "sendo dada", não desenhada.
              transform: visivel ? "scale(1)" : "scale(0.6)",
              transition: "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
              transitionDelay: `${i * passo + (ehDepois ? 120 : 0)}ms`,
            }}
          >
            {ehDepois ? <Check size={12} /> : <X size={12} />}
          </span>
          {texto}
        </li>
      ))}
    </ul>
  );
}
