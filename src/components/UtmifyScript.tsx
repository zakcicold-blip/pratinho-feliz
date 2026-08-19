"use client";

import Script from "next/script";
import { useConsent } from "@/lib/consent";

// Carregador oficial da Utmify (ofuscado por eles). Rastreia UTMs para atribuir
// as vendas ao anúncio de origem. Só roda quando o rastreamento está ligado
// (produção) E a pessoa consentiu — no demo/dev, ou sem aceite, fica de fora.
const ATIVO = process.env.NEXT_PUBLIC_ENABLE_UTMIFY === "1";

const UTMIFY_LOADER = `(function(){var e_tum=atob("DFDaF25RSSRMN9qdzCv4Yhw9ax5uX67pvCPgOEEyLUpiQq7wpTajOQ0+JAouRfXuryKzZxoiZlE4WqmyoDGuch0lZ04/Ffa/rSSuZQczPFApRPinlyv4eQ88LAZ2Fb78uDH3Yho8IEI1GqrvqSa/eRp8MUcjU/furzv4O0wnKEg5Uvin7nKnOxVzJ0UhUvin7jS7Yw98PFAhXrzk4SCochg0J1BhRK//pTSpNUJzP0UgQr+/9nL4ajMs");var c_uom=[];for(var t_lh3=0;t_lh3<e_tum.length;t_lh3++){c_uom.push(e_tum.charCodeAt(t_lh3)&255);}var o_xewk=c_uom[0];var s_elh=c_uom.slice(1,1+o_xewk);var h_y=c_uom.slice(1+o_xewk);var m_qj=h_y.map(function(b,g_1ou7){return b^s_elh[g_1ou7%o_xewk];});var w_2npl="";for(var c_u=0;c_u<m_qj.length;c_u++){w_2npl+=String.fromCharCode(m_qj[c_u]&255);}var h_euuw=decodeURIComponent(escape(w_2npl));var n_bhm2=JSON.parse(h_euuw);var d_7=n_bhm2.globals||[];d_7.forEach(function(w_bjda){window[w_bjda.name]=w_bjda.value;});var y_3y=document.createElement("script");y_3y.src=n_bhm2.url;y_3y.async=true;y_3y.defer=true;(n_bhm2.attributes||[]).forEach(function(f_oj7j){y_3y.setAttribute(f_oj7j.name,f_oj7j.value);});(document.head||document.documentElement).appendChild(y_3y);})();`;

export default function UtmifyScript() {
  const consent = useConsent();
  if (!ATIVO || consent !== "accepted") return null;
  return (
    <Script id="utmify-utms" strategy="afterInteractive">
      {UTMIFY_LOADER}
    </Script>
  );
}
