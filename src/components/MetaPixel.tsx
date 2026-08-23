"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

// O script base do pixel é carregado pelo TrackingHead. Aqui só
// disparamos os eventos do funil conforme a navegação (SPA) e os marcadores de
// URL, chamando o fbq já carregado.
const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

/**
 * Chama o fbq, esperando ele existir se precisar.
 *
 * O script base agora carrega com afterInteractive (antes bloqueava a
 * renderizacao por 2 s). Isso abre uma janela curta em que este componente
 * pode rodar antes de `window.fbq` existir — e a versao anterior descartava
 * a chamada em silencio, o que perderia CompleteRegistration e StartTrial.
 * Aqui a chamada e reagendada por ate 5 segundos.
 */
function fbq(...args: unknown[]) {
  const chamar = () => (window as unknown as { fbq?: (...a: unknown[]) => void }).fbq;

  const pronto = chamar();
  if (pronto) {
    pronto(...args);
    return;
  }

  let tentativas = 0;
  const timer = setInterval(() => {
    const fn = chamar();
    if (fn) {
      clearInterval(timer);
      fn(...args);
      return;
    }
    if (++tentativas > 50) clearInterval(timer); // ~5 s e desiste
  }, 100);
}

export default function MetaPixel() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const primeiraCarga = useRef(true);
  const conversaoContada = useRef(false);

  // PageView em navegações client-side (a primeira já é disparada no <head>).
  useEffect(() => {
    if (!PIXEL_ID) return;
    if (primeiraCarga.current) {
      primeiraCarga.current = false;
      return;
    }
    fbq("track", "PageView");
  }, [pathname]);

  // Eventos de conversão, marcados por parâmetros na URL.
  useEffect(() => {
    if (!PIXEL_ID || conversaoContada.current) return;

    // Trial iniciado: volta do checkout para /hoje?assinatura=ok. O eventID é o
    // mesmo que o CAPI usa no servidor, então a Meta deduplica os dois.
    if (pathname === "/hoje" && searchParams.get("assinatura") === "ok") {
      conversaoContada.current = true;
      const valor = searchParams.get("plano") === "TRIMESTRAL" ? 59.9 : 29.9;
      const eid = searchParams.get("eid") ?? undefined;
      fbq(
        "track",
        "StartTrial",
        { value: valor, currency: "BRL", predicted_ltv: valor },
        eid ? { eventID: eid } : undefined
      );
      return;
    }

    // Cadastro concluído: primeira ida ao onboarding após criar a conta.
    if (pathname === "/onboarding" && searchParams.get("novo") === "1") {
      conversaoContada.current = true;
      fbq("track", "CompleteRegistration");
    }
  }, [pathname, searchParams]);

  return null;
}
