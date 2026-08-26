import type { NextConfig } from "next";

/**
 * Cabecalhos de seguranca.
 *
 * Cada um fecha um ataque concreto, e nao ha nenhum aqui "por precaucao":
 *
 * - HSTS: o primeiro acesso digitado sem https pode ser interceptado. Depois
 *   dele, o navegador se recusa a usar http neste dominio por um ano.
 * - X-Frame-Options / frame-ancestors: impede que o app seja carregado dentro
 *   de um iframe em outro site, que e como clickjacking rouba um clique de
 *   "excluir conta" ou de pagamento.
 * - X-Content-Type-Options: impede o navegador de adivinhar o tipo de um
 *   arquivo enviado — um .txt com HTML dentro deixa de virar pagina.
 * - Referrer-Policy: nao vaza o caminho completo (que pode conter id) para
 *   sites de terceiros nos links de saida.
 * - Permissions-Policy: o app nao usa camera, microfone nem geolocalizacao;
 *   declarar isso impede que um script de terceiro comprometido peca.
 *
 * CSP nao entra aqui ainda de proposito: o Pixel da Meta, o Google Fonts e o
 * proprio Next injetam script inline, e uma politica escrita as pressas
 * quebra a pagina de vendas em silencio. Ela merece uma passada dedicada, em
 * Report-Only primeiro.
 */
const cabecalhosDeSeguranca = [
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains; preload",
  },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
  },
  // Alguns navegadores ainda respeitam; nao substitui CSP, mas nao custa.
  { key: "X-DNS-Prefetch-Control", value: "on" },
];

const nextConfig: NextConfig = {
  // Oculta o indicador/barra de dev do Next (não deve aparecer em prints).
  devIndicators: false,
  // O cabeçalho revela a stack para quem varre alvos. Não é segurança de
  // verdade, mas não há razão para anunciar.
  poweredByHeader: false,
  images: {
    // Fotos de receita vêm de URLs externas cadastradas no backoffice.
    // Só https, e a otimização do Next reprocessa a imagem antes de servir.
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  async headers() {
    return [
      { source: "/:path*", headers: cabecalhosDeSeguranca },
      {
        // Nenhuma resposta de API deve ficar em cache de CDN ou de navegador:
        // várias carregam dado de conta.
        source: "/api/:path*",
        headers: [
          ...cabecalhosDeSeguranca,
          { key: "Cache-Control", value: "no-store, max-age=0" },
        ],
      },
    ];
  },
};

export default nextConfig;
