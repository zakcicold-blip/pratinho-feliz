import { SITE_URL, listarPosts } from "@/lib/blog";

function escapar(texto: string): string {
  return texto
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function GET() {
  const posts = listarPosts();

  const itens = posts
    .map((post) => {
      const url = `${SITE_URL}/blog/${post.slug}`;
      const data = new Date(`${post.publicadoEm}T12:00:00Z`).toUTCString();
      return `    <item>
      <title>${escapar(post.titulo)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${escapar(post.resumo)}</description>
      <pubDate>${data}</pubDate>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Blog do Pratinho Feliz</title>
    <link>${SITE_URL}/blog</link>
    <description>Nutrição infantil, introdução alimentar, rotina e receitas para quem alimenta uma criança todo dia.</description>
    <language>pt-BR</language>
    <atom:link href="${SITE_URL}/blog/rss.xml" rel="self" type="application/rss+xml" />
${itens}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
