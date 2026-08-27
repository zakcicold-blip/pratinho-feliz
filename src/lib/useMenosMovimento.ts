"use client";

import { useSyncExternalStore } from "react";

const CONSULTA = "(prefers-reduced-motion: reduce)";

function assinar(aoMudar: () => void): () => void {
  const mq = window.matchMedia(CONSULTA);
  mq.addEventListener("change", aoMudar);
  return () => mq.removeEventListener("change", aoMudar);
}

function ler(): boolean {
  return window.matchMedia(CONSULTA).matches;
}

/**
 * Se a pessoa pediu menos movimento no sistema.
 *
 * useSyncExternalStore e nao useState+useEffect por duas razoes. A pratica:
 * ler a preferencia dentro de um efeito e chamar setState em seguida faz o
 * componente renderizar duas vezes, e no primeiro quadro a animacao chega a
 * comecar antes de ser desligada — quem pediu para nao ver movimento ve um
 * lampejo dele. E a formal: e exatamente o caso para que este hook existe,
 * um valor que vive fora do React e pode mudar sozinho (a pessoa altera a
 * preferencia com a aba aberta, e a pagina acompanha).
 *
 * O terceiro argumento e o valor no servidor: `false`, porque no HTML inicial
 * nao ha animacao rodando para desligar.
 */
/*
 * O nome comeca com "use" mesmo num codigo em portugues: a regra
 * rules-of-hooks do ESLint identifica hook pelo prefixo, e renomear para
 * "usaMenosMovimento" faria o lint parar de conferir as regras de hook aqui
 * dentro — perder a checagem para ganhar consistencia de idioma e mau
 * negocio.
 */
export default function useMenosMovimento(): boolean {
  return useSyncExternalStore(assinar, ler, () => false);
}
