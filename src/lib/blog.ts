import type { ComponentType } from "react";
import {
  Apple,
  Baby,
  CalendarClock,
  ChefHat,
  Brain,
  type LucideIcon,
} from "lucide-react";
import { POSTS } from "@/content/blog";

/** Domínio canônico — usado em metadata, sitemap, RSS e JSON-LD. */
export const SITE_URL = "https://www.pratinhofeliz.online";

export const AUTOR = {
  nome: "Equipe Pratinho Feliz",
  bio: "Escrevemos sobre alimentação e rotina infantil com base em fontes públicas de nutrição (TACO/NEPA-UNICAMP, Ministério da Saúde e Sociedade Brasileira de Pediatria) e no que vemos funcionar no dia a dia de quem usa o app.",
};

export type CategoriaSlug =
  | "nutricao"
  | "introducao-alimentar"
  | "rotina"
  | "receitas"
  | "desenvolvimento";

export type Categoria = {
  slug: CategoriaSlug;
  nome: string;
  descricao: string;
  icon: LucideIcon;
  /** Gradiente da capa (classes Tailwind, sem o "bg-gradient-to-br"). */
  gradiente: string;
  /** Cores do chip da categoria. */
  chip: string;
};

export const CATEGORIAS: Categoria[] = [
  {
    slug: "nutricao",
    nome: "Nutrição infantil",
    descricao:
      "O que a criança precisa em cada fase, sem dieta e sem terrorismo nutricional.",
    icon: Apple,
    gradiente: "from-emerald-400 to-teal-500",
    chip: "bg-emerald-50 text-emerald-700",
  },
  {
    slug: "introducao-alimentar",
    nome: "Introdução alimentar",
    descricao: "Os primeiros meses de comida de verdade, do primeiro dia em diante.",
    icon: Baby,
    gradiente: "from-orange-400 to-amber-500",
    chip: "bg-orange-50 text-orange-600",
  },
  {
    slug: "rotina",
    nome: "Rotina e comportamento",
    descricao: "Birra, recusa, tempo de mesa e tudo que acontece na hora da refeição.",
    icon: CalendarClock,
    gradiente: "from-violet-400 to-indigo-500",
    chip: "bg-violet-50 text-violet-700",
  },
  {
    slug: "receitas",
    nome: "Receitas",
    descricao: "Ideias práticas que cabem na semana e a criança realmente come.",
    icon: ChefHat,
    gradiente: "from-rose-400 to-orange-400",
    chip: "bg-rose-50 text-rose-700",
  },
  {
    slug: "desenvolvimento",
    nome: "Desenvolvimento",
    descricao: "Como comer se conecta com sono, humor, energia e aprendizado.",
    icon: Brain,
    gradiente: "from-sky-400 to-blue-500",
    chip: "bg-sky-50 text-sky-700",
  },
];

export type ItemSumario = { id: string; texto: string };
export type ItemFaq = { pergunta: string; resposta: string };

export type PostMeta = {
  slug: string;
  titulo: string;
  /** Aparece no card, na meta description e no lead do artigo. */
  resumo: string;
  categoria: CategoriaSlug;
  /** ISO (YYYY-MM-DD). */
  publicadoEm: string;
  atualizadoEm?: string;
  minutos: number;
  destaque?: boolean;
  tags: string[];
  sumario?: ItemSumario[];
  /** Vira <FAQPage> no JSON-LD — é o que motores de busca e IAs citam. */
  faq?: ItemFaq[];
};

export type Post = PostMeta & { Corpo: ComponentType };

/** Posts publicados, do mais recente para o mais antigo. */
export function listarPosts(): Post[] {
  return [...POSTS].sort((a, b) => b.publicadoEm.localeCompare(a.publicadoEm));
}

export function buscarPost(slug: string): Post | undefined {
  return POSTS.find((p) => p.slug === slug);
}

export function buscarCategoria(slug: string): Categoria | undefined {
  return CATEGORIAS.find((c) => c.slug === slug);
}

export function categoriaDoPost(post: PostMeta): Categoria {
  return buscarCategoria(post.categoria) ?? CATEGORIAS[0];
}

export function listarPorCategoria(slug: CategoriaSlug): Post[] {
  return listarPosts().filter((p) => p.categoria === slug);
}

/** Quantos posts cada categoria tem (para esconder as vazias na navegação). */
export function contarPorCategoria(): Record<CategoriaSlug, number> {
  const contagem = {} as Record<CategoriaSlug, number>;
  for (const c of CATEGORIAS) contagem[c.slug] = 0;
  for (const p of POSTS) contagem[p.categoria] += 1;
  return contagem;
}

/**
 * Relacionados: prioriza mesma categoria, completa com os mais recentes.
 * Manter links internos em todo post ajuda o rastreamento e o tempo de sessão.
 */
export function relacionados(post: PostMeta, quantidade = 2): Post[] {
  const outros = listarPosts().filter((p) => p.slug !== post.slug);
  const mesmaCategoria = outros.filter((p) => p.categoria === post.categoria);
  const resto = outros.filter((p) => p.categoria !== post.categoria);
  return [...mesmaCategoria, ...resto].slice(0, quantidade);
}

export function formatarData(iso: string): string {
  // Data pura (sem fuso) para não escorregar um dia dependendo do servidor.
  const [ano, mes, dia] = iso.split("-").map(Number);
  return new Date(Date.UTC(ano, mes - 1, dia)).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function urlDoPost(slug: string): string {
  return `${SITE_URL}/blog/${slug}`;
}
