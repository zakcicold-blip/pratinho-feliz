import Script from "next/script";
import UtmifyScript from "@/components/UtmifyScript";

// Meta Pixel + Utmify.
//
// O pixel usava strategy="beforeInteractive" para disparar o mais cedo
// possível. O custo medido em producao foi alto demais:
//
//   first-paint = first-contentful-paint = 2156 ms
//
// Ou seja, a tela ficava EM BRANCO por mais de dois segundos esperando o
// fbevents.js do Facebook — mesmo com o HTML em 106 ms e a fonte em 142 ms.
// beforeInteractive bloqueia a renderizacao do conteudo.
//
// afterInteractive (a estrategia que o proprio Next recomenda para
// analytics) dispara logo apos a hidratacao. O PageView chega alguns
// milissegundos depois; em troca, a pessoa ve a pagina na hora. Tela branca
// de 2 s custa muito mais conversao do que um evento levemente atrasado.
//
// Sem env, nada é renderizado (demo/dev ficam fora).
const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;
const UTMIFY_ATIVO = process.env.NEXT_PUBLIC_ENABLE_UTMIFY === "1";


export default function TrackingHead() {
  return (
    <>
      {PIXEL_ID && (
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
      )}
      {UTMIFY_ATIVO && <UtmifyScript />}
    </>
  );
}
