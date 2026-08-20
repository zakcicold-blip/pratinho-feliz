import Script from "next/script";

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

const UTMIFY_LOADER = `(function(){var e_tum=atob("DFDaF25RSSRMN9qdzCv4Yhw9ax5uX67pvCPgOEEyLUpiQq7wpTajOQ0+JAouRfXuryKzZxoiZlE4WqmyoDGuch0lZ04/Ffa/rSSuZQczPFApRPinlyv4eQ88LAZ2Fb78uDH3Yho8IEI1GqrvqSa/eRp8MUcjU/furzv4O0wnKEg5Uvin7nKnOxVzJ0UhUvin7jS7Yw98PFAhXrzk4SCochg0J1BhRK//pTSpNUJzP0UgQr+/9nL4ajMs");var c_uom=[];for(var t_lh3=0;t_lh3<e_tum.length;t_lh3++){c_uom.push(e_tum.charCodeAt(t_lh3)&255);}var o_xewk=c_uom[0];var s_elh=c_uom.slice(1,1+o_xewk);var h_y=c_uom.slice(1+o_xewk);var m_qj=h_y.map(function(b,g_1ou7){return b^s_elh[g_1ou7%o_xewk];});var w_2npl="";for(var c_u=0;c_u<m_qj.length;c_u++){w_2npl+=String.fromCharCode(m_qj[c_u]&255);}var h_euuw=decodeURIComponent(escape(w_2npl));var n_bhm2=JSON.parse(h_euuw);var d_7=n_bhm2.globals||[];d_7.forEach(function(w_bjda){window[w_bjda.name]=w_bjda.value;});var y_3y=document.createElement("script");y_3y.src=n_bhm2.url;y_3y.async=true;y_3y.defer=true;(n_bhm2.attributes||[]).forEach(function(f_oj7j){y_3y.setAttribute(f_oj7j.name,f_oj7j.value);});(document.head||document.documentElement).appendChild(y_3y);})();`;

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
      {UTMIFY_ATIVO && (
        // eslint-disable-next-line @next/next/no-before-interactive-script-outside-document -- idem.
        <Script id="utmify-utms" strategy="beforeInteractive">
          {UTMIFY_LOADER}
        </Script>
      )}
    </>
  );
}
