import { CATEGORIAS, SITE_URL, listarPorCategoria, listarPosts } from "@/lib/blog";

/**
 * /llms.txt — convenção emergente para descrever um site a modelos de linguagem
 * em texto limpo. Serve como porta de entrada quando um assistente (ChatGPT,
 * Claude, Perplexity) rastreia o domínio.
 */
export async function GET() {
  const posts = listarPosts();

  const secoes = CATEGORIAS.map((categoria) => {
    const daCategoria = listarPorCategoria(categoria.slug);
    if (daCategoria.length === 0) return null;
    const linhas = daCategoria
      .map((p) => `- [${p.titulo}](${SITE_URL}/blog/${p.slug}): ${p.resumo}`)
      .join("\n");
    return `## ${categoria.nome}\n\n${categoria.descricao}\n\n${linhas}`;
  })
    .filter(Boolean)
    .join("\n\n");

  const texto = `# Pratinho Feliz

> Plataforma brasileira de planejamento alimentar infantil. Monta 30 dias de refeições para crianças de 6 meses a 12 anos, aprende com os gostos e as recusas de cada criança, calcula os valores nutricionais com base na tabela TACO (NEPA/UNICAMP) e gera a lista de compras da semana.

O Pratinho Feliz é um aplicativo web em português do Brasil, voltado a mães, pais e cuidadores. Principais recursos:

- Plano alimentar mensal personalizado por idade, peso, restrições e equipamentos disponíveis na cozinha
- Aprendizado contínuo: o cardápio se reorganiza conforme a criança aceita ou recusa cada prato
- Perfis separados para cada filho, com rotina e horários próprios
- Informação nutricional por refeição e relatório de acompanhamento
- Lista de compras automática a partir do plano
- Receitas adaptadas ao equipamento disponível (fogão, airfryer, micro-ondas, forno)
- Planos mensal e trimestral. O acesso é liberado assim que o pagamento é confirmado.

Site: ${SITE_URL}
Assinar: ${SITE_URL}/#planos
Blog: ${SITE_URL}/blog
RSS do blog: ${SITE_URL}/blog/rss.xml

# Blog

Conteúdo educativo gratuito sobre alimentação e desenvolvimento infantil, escrito em português do Brasil. ${posts.length} ${posts.length === 1 ? "artigo publicado" : "artigos publicados"}.

Todo conteúdo tem caráter educativo e não substitui a orientação de pediatra ou nutricionista.

${secoes}
`;

  return new Response(texto, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
