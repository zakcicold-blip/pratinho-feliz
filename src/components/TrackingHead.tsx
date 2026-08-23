import Script from "next/script";
import UtmifyScript from "@/components/UtmifyScript";

// Meta Pixel + Utmify, carregados o mais cedo possível para todo mundo.
//
// Observação técnica: no App Router do Next 16, scripts inline não podem ser
// colocados literalmente dentro do <head> — o framework os injeta no topo do
// <body>. Com strategy="beforeInteractive" eles carregam ANTES de qualquer
// conteúdo/JS do app, então o pixel dispara tão cedo quanto no head. O próprio
// snippet insere o fbevents.js no head do documento.
//
// Sem env, nada é renderizado (demo/dev ficam fora).
const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;
const UTMIFY_ATIVO = process.env.NEXT_PUBLIC_ENABLE_UTMIFY === "1";


export default function TrackingHead() {
  return (
    <>
      {PIXEL_ID && (
        // eslint-disable-next-line @next/next/no-before-interactive-script-outside-document -- App Router: beforeInteractive vai no root layout.
        <Script id="meta-pixel" strategy="beforeInteractive">
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
      )}
      {UTMIFY_ATIVO && <UtmifyScript />}
    </>
  );
}
