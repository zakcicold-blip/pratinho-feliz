import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import PostCard from "@/components/blog/PostCard";
import {
  CATEGORIAS,
  SITE_URL,
  buscarCategoria,
  listarPorCategoria,
  type CategoriaSlug,
} from "@/lib/blog";

export const dynamicParams = false;

export function generateStaticParams() {
  return CATEGORIAS.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const categoria = buscarCategoria(slug);
  if (!categoria) return {};

  const titulo = `${categoria.nome} — artigos e guias`;
  return {
    title: titulo,
    description: categoria.descricao,
    alternates: { canonical: `${SITE_URL}/blog/categoria/${categoria.slug}` },
    openGraph: {
      type: "website",
      url: `${SITE_URL}/blog/categoria/${categoria.slug}`,
      title: titulo,
      description: categoria.descricao,
    },
  };
}

export default async function CategoriaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const categoria = buscarCategoria(slug);
  if (!categoria) notFound();

  const posts = listarPorCategoria(categoria.slug as CategoriaSlug);
  const Icon = categoria.icon;

  return (
    <>
      <section className="mx-auto w-full max-w-5xl px-6 pt-8">
        <nav aria-label="Você está em" className="flex items-center gap-1 text-xs text-stone-400">
          <Link href="/blog" className="hover:text-stone-600">
            Blog
          </Link>
          <ChevronRight size={12} />
          <span className="text-stone-500">{categoria.nome}</span>
        </nav>

        <div className="mt-6 flex items-start gap-4">
          <span
            className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${categoria.gradiente} text-white shadow-card`}
          >
            <Icon size={26} strokeWidth={1.7} />
          </span>
          <div>
            <h1 className="font-display text-[1.9rem] leading-tight font-extrabold text-stone-900 md:text-[2.4rem]">
              {categoria.nome}
            </h1>
            <p className="mt-1.5 max-w-xl text-[1.02rem] leading-relaxed text-stone-600">
              {categoria.descricao}
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl px-6 pt-9 pb-6">
        {posts.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-stone-300 bg-white/60 px-6 py-14 text-center">
            <p className="font-semibold text-stone-700">Ainda não há artigos por aqui.</p>
            <p className="mx-auto mt-1.5 max-w-sm text-sm text-stone-500">
              Estamos preparando o conteúdo desta seção. Enquanto isso, dá uma olhada nos outros
              temas do blog.
            </p>
            <Link
              href="/blog"
              className="mt-6 inline-flex rounded-full bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-stone-800"
            >
              Ver todos os artigos
            </Link>
          </div>
        ) : (
          <>
            <p className="mb-5 text-sm font-medium text-stone-400">
              {posts.length} {posts.length === 1 ? "artigo" : "artigos"}
            </p>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <PostCard key={post.slug} post={post} />
              ))}
            </div>
          </>
        )}
      </section>
    </>
  );
}
