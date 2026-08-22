import type { MetadataRoute } from "next";
import { CATEGORIAS, SITE_URL, contarPorCategoria, listarPosts } from "@/lib/blog";

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = listarPosts();
  const contagem = contarPorCategoria();
  const maisRecente = posts[0]?.publicadoEm ?? new Date().toISOString();

  const paginas: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    {
      url: `${SITE_URL}/blog`,
      lastModified: new Date(maisRecente),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    { url: `${SITE_URL}/cadastro`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/privacidade`, changeFrequency: "yearly", priority: 0.2 },
  ];

  // Só entram categorias que já têm conteúdo — página vazia no sitemap é ruído.
  const categorias: MetadataRoute.Sitemap = CATEGORIAS.filter(
    (c) => contagem[c.slug] > 0
  ).map((c) => ({
    url: `${SITE_URL}/blog/categoria/${c.slug}`,
    lastModified: new Date(maisRecente),
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  const artigos: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.atualizadoEm ?? post.publicadoEm),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [...paginas, ...categorias, ...artigos];
}
