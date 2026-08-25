import Link from "next/link";
import { UtensilsCrossed, Rss } from "lucide-react";
import { CATEGORIAS, contarPorCategoria } from "@/lib/blog";
import BotaoCheckoutDireto from "@/components/BotaoCheckoutDireto";

export function BlogHeader() {
  const contagem = contarPorCategoria();
  const comPosts = CATEGORIAS.filter((c) => contagem[c.slug] > 0);

  return (
    <header className="sticky top-0 z-20 border-b border-stone-200/60 bg-[#fdfaf6]/85 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-6 py-4">
        <Link href="/blog" className="flex items-center gap-2 text-base font-bold text-stone-800">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500 text-white">
            <UtensilsCrossed size={16} />
          </span>
          Pratinho Feliz
          <span className="ml-0.5 rounded-md bg-stone-900 px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-white uppercase">
            Blog
          </span>
        </Link>
        <nav className="flex items-center gap-4">
          <Link
            href="/"
            className="hidden text-sm font-medium text-stone-600 hover:text-stone-900 sm:block"
          >
            Conheça o app
          </Link>
          <BotaoCheckoutDireto
            rotulo="Assinar"
            comSeta={false}
            className="px-4 py-2 text-sm"
          />
        </nav>
      </div>

      {/* Trilha de categorias — rola na horizontal no celular. */}
      <div className="scrollbar-none overflow-x-auto border-t border-stone-200/50">
        <div className="mx-auto flex w-full max-w-5xl items-center gap-1 px-6 py-2">
          <Link
            href="/blog"
            className="shrink-0 rounded-full px-3 py-1.5 text-[13px] font-medium text-stone-500 transition hover:bg-stone-100 hover:text-stone-800"
          >
            Todos
          </Link>
          {comPosts.map((c) => (
            <Link
              key={c.slug}
              href={`/blog/categoria/${c.slug}`}
              className="shrink-0 rounded-full px-3 py-1.5 text-[13px] font-medium whitespace-nowrap text-stone-500 transition hover:bg-stone-100 hover:text-stone-800"
            >
              {c.nome}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}

/** Faixa de conversão usada no fim das páginas do blog. */
export function BlogCTA() {
  return (
    <section className="mx-auto w-full max-w-5xl px-6 py-12">
      <div className="relative overflow-hidden rounded-3xl border border-stone-200/70 bg-gradient-to-br from-stone-900 to-stone-800 px-7 py-10 text-center shadow-card-lg sm:px-12">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-16 -right-10 h-56 w-56 rounded-full bg-orange-500/20 blur-3xl"
        />
        <div className="relative">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-orange-200">
            Acesso imediato
          </span>
          <h2 className="font-display mt-4 text-2xl font-extrabold text-white sm:text-3xl">
            Ler é fácil. Fazer todo dia é que cansa.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-[0.97rem] leading-relaxed text-stone-300">
            O Pratinho Feliz monta o mês inteiro de refeições do seu filho, aprende o que ele aceita
            e ainda gera a lista de compras. Você só serve.
          </p>
          <div className="mt-7 flex justify-center">
            <BotaoCheckoutDireto rotulo="Assinar por R$ 29,90" className="px-7" />
          </div>
        </div>
      </div>
    </section>
  );
}

export function BlogFooter() {
  return (
    <footer className="border-t border-stone-200/60">
      <div className="mx-auto w-full max-w-5xl px-6 py-10">
        <div className="flex items-center gap-2 text-sm font-bold text-stone-700">
          <UtensilsCrossed size={16} className="text-orange-500" /> Pratinho Feliz
        </div>
        <p className="mt-3 max-w-2xl text-sm text-stone-400">
          Conteúdo educativo sobre alimentação e rotina infantil. Não substitui a orientação do
          pediatra ou do nutricionista que acompanha a sua criança. Valores nutricionais com base na
          TACO (NEPA/UNICAMP).
        </p>
        <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm">
          <Link href="/blog" className="text-stone-500 hover:text-stone-700">
            Blog
          </Link>
          <Link href="/" className="text-stone-500 hover:text-stone-700">
            O app
          </Link>
          <Link href="/#planos" className="text-stone-500 hover:text-stone-700">
            Assinar
          </Link>
          <Link href="/login" className="text-stone-500 hover:text-stone-700">
            Entrar
          </Link>
          <Link href="/privacidade" className="text-stone-500 hover:text-stone-700">
            Política de privacidade
          </Link>
          <a
            href="/blog/rss.xml"
            className="inline-flex items-center gap-1.5 text-stone-500 hover:text-stone-700"
          >
            <Rss size={13} /> RSS
          </a>
        </div>
        <p className="mt-6 text-xs text-stone-400">
          © {new Date().getFullYear()} Pratinho Feliz. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}
