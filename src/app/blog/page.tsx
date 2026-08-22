import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import PostCard, { PostDestaque } from "@/components/blog/PostCard";
import { CATEGORIAS, SITE_URL, contarPorCategoria, listarPosts } from "@/lib/blog";

const TITULO = "Blog do Pratinho Feliz";
const DESCRICAO =
  "Conteúdo prático sobre nutrição infantil, introdução alimentar, rotina, receitas e desenvolvimento — para quem alimenta uma criança todo dia.";

export const metadata: Metadata = {
  title: { absolute: TITULO },
  description: DESCRICAO,
  alternates: { canonical: `${SITE_URL}/blog` },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/blog`,
    title: TITULO,
    description: DESCRICAO,
  },
};

export default function BlogIndexPage() {
  const posts = listarPosts();
  const destaque = posts.find((p) => p.destaque) ?? posts[0];
  const demais = posts.filter((p) => p.slug !== destaque?.slug);
  const contagem = contarPorCategoria();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: TITULO,
    description: DESCRICAO,
    url: `${SITE_URL}/blog`,
    inLanguage: "pt-BR",
    publisher: {
      "@type": "Organization",
      name: "Pratinho Feliz",
      url: SITE_URL,
    },
    blogPost: posts.map((p) => ({
      "@type": "BlogPosting",
      headline: p.titulo,
      description: p.resumo,
      datePublished: p.publicadoEm,
      url: `${SITE_URL}/blog/${p.slug}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-28 right-[-8%] h-72 w-72 rounded-full bg-orange-200/40 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute top-20 left-[-10%] h-64 w-64 rounded-full bg-emerald-200/30 blur-3xl"
        />
        <div className="relative mx-auto w-full max-w-5xl px-6 pt-14 pb-10 text-center">
          <span className="inline-flex items-center rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-600">
            Conteúdo gratuito
          </span>
          <h1 className="font-display mx-auto mt-4 max-w-3xl text-[2.1rem] leading-[1.08] font-extrabold text-balance text-stone-900 md:text-[3rem]">
            Alimentação infantil sem culpa e{" "}
            <span className="text-orange-500">sem achismo.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-stone-600">
            Nutrição, introdução alimentar, rotina, receitas e desenvolvimento — explicados de forma
            direta, para aplicar na próxima refeição.
          </p>
        </div>
      </section>

      {/* DESTAQUE */}
      {destaque && (
        <section className="mx-auto w-full max-w-5xl px-6 pb-12">
          <PostDestaque post={destaque} />
        </section>
      )}

      {/* GRADE */}
      {demais.length > 0 && (
        <section className="mx-auto w-full max-w-5xl px-6 pb-14">
          <h2 className="font-display mb-5 text-xl font-extrabold text-stone-900">
            Publicados recentemente
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {demais.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        </section>
      )}

      {/* CATEGORIAS */}
      <section className="mx-auto w-full max-w-5xl px-6 pb-6">
        <h2 className="font-display mb-5 text-xl font-extrabold text-stone-900">Navegue por tema</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {CATEGORIAS.map((c) => {
            const total = contagem[c.slug];
            const Icon = c.icon;
            return (
              <Link
                key={c.slug}
                href={`/blog/categoria/${c.slug}`}
                className="group flex items-start gap-4 rounded-2xl border border-stone-200/70 bg-white p-5 shadow-card transition hover:-translate-y-0.5 hover:shadow-card-lg"
              >
                <span
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${c.gradiente} text-white`}
                >
                  <Icon size={20} strokeWidth={1.8} />
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 font-semibold text-stone-800">
                    {c.nome}
                    <ArrowRight
                      size={14}
                      className="text-stone-300 transition group-hover:translate-x-0.5 group-hover:text-orange-500"
                    />
                  </div>
                  <p className="mt-0.5 text-sm leading-relaxed text-stone-500">{c.descricao}</p>
                  <p className="mt-1.5 text-xs font-medium text-stone-400">
                    {total === 0
                      ? "Em breve"
                      : `${total} ${total === 1 ? "artigo" : "artigos"}`}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </>
  );
}
