import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Oculta o indicador/barra de dev do Next (não deve aparecer em prints).
  devIndicators: false,
  images: {
    // Fotos de receita vêm de URLs externas cadastradas no backoffice.
    // Só https, e a otimização do Next reprocessa a imagem antes de servir.
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

export default nextConfig;
