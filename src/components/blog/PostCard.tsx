import Link from "next/link";
import { Clock, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/cn";
import { categoriaDoPost, formatarData, type PostMeta } from "@/lib/blog";

/**
 * Capa gerada: gradiente da categoria + ícone.
 * Evita banco de imagens genérico e mantém o blog coerente com o app.
 */
export function Capa({
  post,
  className,
  tamanhoIcone = 56,
}: {
  post: PostMeta;
  className?: string;
  tamanhoIcone?: number;
}) {
  const categoria = categoriaDoPost(post);
  const Icon = categoria.icon;
  return (
    <div
      aria-hidden
      className={cn(
        "relative flex items-center justify-center overflow-hidden bg-gradient-to-br",
        categoria.gradiente,
        className
      )}
    >
      <span className="absolute -top-8 -left-6 h-28 w-28 rounded-full bg-white/15" />
      <span className="absolute -right-10 -bottom-12 h-40 w-40 rounded-full bg-black/10" />
      <Icon size={tamanhoIcone} strokeWidth={1.5} className="relative text-white/90" />
    </div>
  );
}

export function ChipCategoria({ post }: { post: PostMeta }) {
  const categoria = categoriaDoPost(post);
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wide uppercase",
        categoria.chip
      )}
    >
      {categoria.nome}
    </span>
  );
}

export function MetaPost({ post }: { post: PostMeta }) {
  return (
    <div className="flex items-center gap-2 text-xs text-stone-400">
      <time dateTime={post.publicadoEm}>{formatarData(post.publicadoEm)}</time>
      <span aria-hidden>·</span>
      <span className="inline-flex items-center gap-1">
        <Clock size={12} /> {post.minutos} min
      </span>
    </div>
  );
}

/** Card padrão da grade. */
export default function PostCard({ post }: { post: PostMeta }) {
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-3xl border border-stone-200/70 bg-white shadow-card transition duration-200 hover:-translate-y-0.5 hover:shadow-card-lg">
      <Capa post={post} className="h-36" tamanhoIcone={44} />
      <div className="flex flex-1 flex-col p-5">
        <ChipCategoria post={post} />
        <h3 className="font-display mt-3 text-[1.12rem] leading-snug font-extrabold text-balance text-stone-900">
          <Link href={`/blog/${post.slug}`} className="before:absolute before:inset-0">
            {post.titulo}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-stone-600">{post.resumo}</p>
        <div className="mt-4 flex items-center justify-between border-t border-stone-100 pt-3">
          <MetaPost post={post} />
          <ArrowUpRight
            size={16}
            className="text-stone-300 transition group-hover:text-orange-500"
          />
        </div>
      </div>
    </article>
  );
}

/** Card grande do post em destaque, no topo da home do blog. */
export function PostDestaque({ post }: { post: PostMeta }) {
  return (
    <article className="group relative grid overflow-hidden rounded-3xl border border-stone-200/70 bg-white shadow-card transition duration-200 hover:shadow-card-lg md:grid-cols-2">
      <Capa post={post} className="h-48 md:h-full md:min-h-[19rem]" tamanhoIcone={72} />
      <div className="flex flex-col justify-center p-7 md:p-9">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-stone-900 px-2.5 py-1 text-[11px] font-bold tracking-wide text-white uppercase">
            Em destaque
          </span>
          <ChipCategoria post={post} />
        </div>
        <h2 className="font-display mt-4 text-2xl leading-[1.15] font-extrabold text-balance text-stone-900 md:text-[2rem]">
          <Link href={`/blog/${post.slug}`} className="before:absolute before:inset-0">
            {post.titulo}
          </Link>
        </h2>
        <p className="mt-3 text-[0.97rem] leading-relaxed text-stone-600">{post.resumo}</p>
        <div className="mt-5 flex items-center gap-3">
          <MetaPost post={post} />
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-orange-600">
            Ler artigo <ArrowUpRight size={15} />
          </span>
        </div>
      </div>
    </article>
  );
}
