import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Clock, ListChecks, ShieldCheck, UtensilsCrossed } from "lucide-react";
import PostCard, { Capa, ChipCategoria } from "@/components/blog/PostCard";
import {
  AUTOR,
  SITE_URL,
  buscarPost,
  categoriaDoPost,
  formatarData,
  listarPosts,
  relacionados,
} from "@/lib/blog";

export const dynamicParams = false;

export function generateStaticParams() {
  return listarPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = buscarPost(slug);
  if (!post) return {};

  const url = `${SITE_URL}/blog/${post.slug}`;
  return {
    title: post.titulo,
    description: post.resumo,
    keywords: post.tags,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title: post.titulo,
      description: post.resumo,
      publishedTime: post.publicadoEm,
      modifiedTime: post.atualizadoEm ?? post.publicadoEm,
      authors: [AUTOR.nome],
      tags: post.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: post.titulo,
      description: post.resumo,
    },
  };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = buscarPost(slug);
  if (!post) notFound();

  const categoria = categoriaDoPost(post);
  const Corpo = post.Corpo;
  const url = `${SITE_URL}/blog/${post.slug}`;
  const sugestoes = relacionados(post, 3);

  const jsonLd: Record<string, unknown>[] = [
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.titulo,
      description: post.resumo,
      inLanguage: "pt-BR",
      datePublished: post.publicadoEm,
      dateModified: post.atualizadoEm ?? post.publicadoEm,
      articleSection: categoria.nome,
      keywords: post.tags.join(", "),
      wordCount: post.minutos * 200,
      mainEntityOfPage: { "@type": "WebPage", "@id": url },
      author: { "@type": "Organization", name: AUTOR.nome, url: SITE_URL },
      publisher: {
        "@type": "Organization",
        name: "Pratinho Feliz",
        url: SITE_URL,
        logo: {
          "@type": "ImageObject",
          url: `${SITE_URL}/icons/apple-touch-icon.png`,
        },
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Início", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/blog` },
        {
          "@type": "ListItem",
          position: 3,
          name: categoria.nome,
          item: `${SITE_URL}/blog/categoria/${categoria.slug}`,
        },
        { "@type": "ListItem", position: 4, name: post.titulo, item: url },
      ],
    },
  ];

  if (post.faq?.length) {
    jsonLd.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: post.faq.map((f) => ({
        "@type": "Question",
        name: f.pergunta,
        acceptedAnswer: { "@type": "Answer", text: f.resposta },
      })),
    });
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      <article className="mx-auto w-full max-w-3xl px-6 pt-8 pb-4">
        {/* Trilha de navegação */}
        <nav aria-label="Você está em" className="flex flex-wrap items-center gap-1 text-xs text-stone-400">
          <Link href="/" className="hover:text-stone-600">
            Início
          </Link>
          <ChevronRight size={12} />
          <Link href="/blog" className="hover:text-stone-600">
            Blog
          </Link>
          <ChevronRight size={12} />
          <Link href={`/blog/categoria/${categoria.slug}`} className="hover:text-stone-600">
            {categoria.nome}
          </Link>
        </nav>

        <header className="mt-5">
          <ChipCategoria post={post} />
          <h1 className="font-display mt-3.5 text-[2rem] leading-[1.12] font-extrabold text-balance text-stone-900 md:text-[2.6rem]">
            {post.titulo}
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-stone-600">{post.resumo}</p>

          <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 border-y border-stone-200/70 py-3.5 text-sm text-stone-500">
            <span className="inline-flex items-center gap-2 font-medium text-stone-700">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-500 text-white">
                <UtensilsCrossed size={13} />
              </span>
              {AUTOR.nome}
            </span>
            <time dateTime={post.publicadoEm}>{formatarData(post.publicadoEm)}</time>
            <span className="inline-flex items-center gap-1">
              <Clock size={13} /> {post.minutos} min de leitura
            </span>
          </div>
        </header>

        <Capa post={post} className="mt-7 h-44 rounded-3xl sm:h-56" tamanhoIcone={68} />

        {/* Sumário — ajuda leitor e dá âncoras para os buscadores */}
        {post.sumario?.length ? (
          <nav
            aria-label="Neste artigo"
            className="mt-8 rounded-2xl border border-stone-200/70 bg-white p-5 shadow-card"
          >
            <div className="flex items-center gap-2 text-sm font-bold text-stone-800">
              <ListChecks size={16} className="text-orange-500" /> Neste artigo
            </div>
            <ol className="mt-3 space-y-1.5">
              {post.sumario.map((item, i) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    className="flex gap-2.5 text-[0.94rem] text-stone-600 transition hover:text-orange-600"
                  >
                    <span className="w-4 shrink-0 text-right font-semibold text-stone-300 tabular-nums">
                      {i + 1}
                    </span>
                    {item.texto}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        ) : null}

        {/* Conteúdo */}
        <div className="prose-blog mt-8">
          <Corpo />
        </div>

        {/* Aviso — obrigatório em conteúdo de saúde */}
        <aside className="mt-10 flex gap-3 rounded-2xl border border-stone-200/70 bg-stone-50 p-5">
          <ShieldCheck size={18} className="mt-0.5 shrink-0 text-stone-400" />
          <p className="text-sm leading-relaxed text-stone-500">
            Este conteúdo tem caráter educativo e não substitui a avaliação do pediatra ou do
            nutricionista que acompanha a sua criança. Cada criança tem um histórico próprio — em
            caso de dúvida sobre crescimento, alergias ou carências nutricionais, procure orientação
            profissional.
          </p>
        </aside>

        {/* FAQ */}
        {post.faq?.length ? (
          <section className="mt-12">
            <h2 className="font-display text-2xl font-extrabold text-stone-900">
              Perguntas frequentes
            </h2>
            <div className="mt-4 space-y-3">
              {post.faq.map((f) => (
                <details
                  key={f.pergunta}
                  className="group rounded-2xl border border-stone-200/70 bg-white px-5 shadow-card"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 py-4 font-semibold text-stone-800 [&::-webkit-details-marker]:hidden">
                    {f.pergunta}
                    <ChevronRight
                      size={17}
                      className="shrink-0 text-stone-400 transition-transform group-open:rotate-90"
                    />
                  </summary>
                  <p className="pb-4 text-[0.95rem] leading-relaxed text-stone-600">{f.resposta}</p>
                </details>
              ))}
            </div>
          </section>
        ) : null}

        {/* Assinatura do autor */}
        <section className="mt-12 flex gap-4 rounded-3xl border border-stone-200/70 bg-white p-6 shadow-card">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-500 text-white">
            <UtensilsCrossed size={22} />
          </span>
          <div>
            <div className="font-semibold text-stone-800">{AUTOR.nome}</div>
            <p className="mt-1 text-sm leading-relaxed text-stone-500">{AUTOR.bio}</p>
          </div>
        </section>

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-500"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </article>

      {/* Relacionados */}
      {sugestoes.length > 0 && (
        <section className="mx-auto w-full max-w-5xl px-6 pt-10">
          <h2 className="font-display mb-5 text-xl font-extrabold text-stone-900">
            Continue lendo
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {sugestoes.map((p) => (
              <PostCard key={p.slug} post={p} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
