"use client";

import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

// Id público do pixel, injetado no build. Sem ele (ex.: no demo), nada carrega.
const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

function fbq(...args: unknown[]) {
  const fn = (window as unknown as { fbq?: (...a: unknown[]) => void }).fbq;
  if (fn) fn(...args);
}

/**
 * Meta Pixel: carrega o script uma vez, conta PageView a cada troca de tela
 * (SPA) e dispara os eventos de conversão do funil quando a pessoa volta do
 * checkout ou conclui o cadastro — tudo no nosso domínio.
 */
export default function MetaPixel() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const primeiraCarga = useRef(true);
  const conversaoContada = useRef(false);

  // PageView em navegações client-side (a primeira já é disparada pelo script).
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

    // Trial iniciado: volta do checkout para /hoje?assinatura=ok.
    if (pathname === "/hoje" && searchParams.get("assinatura") === "ok") {
      conversaoContada.current = true;
      const valor = searchParams.get("plano") === "TRIMESTRAL" ? 59.9 : 29.9;
      fbq("track", "StartTrial", { value: valor, currency: "BRL", predicted_ltv: valor });
      return;
    }

    // Cadastro concluído: primeira ida ao onboarding após criar a conta.
    if (pathname === "/onboarding" && searchParams.get("novo") === "1") {
      conversaoContada.current = true;
      fbq("track", "CompleteRegistration");
    }
  }, [pathname, searchParams]);

  if (!PIXEL_ID) return null;

  return (
    <>
      <Script id="meta-pixel" strategy="afterInteractive">
        {`!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${PIXEL_ID}');
fbq('track', 'PageView');`}
      </Script>
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          alt=""
          src={`https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1`}
        />
      </noscript>
    </>
  );
}
