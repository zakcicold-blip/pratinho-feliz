import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/blog";

/** Áreas logadas e de API — não devem ser rastreadas nem indexadas. */
const PRIVADAS = [
  "/api/",
  "/admin/",
  "/hoje",
  "/plano",
  "/rotina",
  "/receita/",
  "/receitas",
  "/favoritos",
  "/compras",
  "/descobertas",
  "/papinhas",
  "/perfil",
  "/relatorio",
  "/configuracoes",
  "/onboarding",
  "/bem-vindo",
  "/assinar",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: PRIVADAS,
      },
      // Rastreadores de IA liberados de propósito: queremos que o conteúdo do
      // blog seja encontrável por ChatGPT, Claude, Perplexity e afins.
      {
        userAgent: [
          "GPTBot",
          "OAI-SearchBot",
          "ChatGPT-User",
          "ClaudeBot",
          "Claude-User",
          "PerplexityBot",
          "Perplexity-User",
          "Google-Extended",
          "Applebot-Extended",
        ],
        allow: ["/", "/blog/"],
        disallow: PRIVADAS,
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
