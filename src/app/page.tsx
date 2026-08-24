import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { irParaCheckoutDireto } from "@/lib/actions/checkoutDireto";
import PhoneCarousel from "@/components/PhoneCarousel";
import BotaoAssinar from "@/components/BotaoAssinar";
import GaleriaDoApp from "@/components/GaleriaDoApp";
import FotoDoSite from "@/components/FotoDoSite";
import { FOTOS_CRIANCAS, FOTO_MESA, FOTO_ROTINA, algumaPublicada } from "@/lib/fotosSite";
import {
  UtensilsCrossed,
  Check,
  ArrowRight,
  ShieldCheck,
  Zap,
  CalendarDays,
  Salad,
  ShoppingCart,
  RefreshCw,
  Moon,
  BrainCircuit,
  Baby,
  Clock,
  Lock,
  ChevronDown,
  type LucideIcon,
} from "lucide-react";

export const metadata = {
  title: "Pratinho Feliz — o cardápio do seu filho, resolvido",
  description:
    "Assine e destrave na hora: 30 dias de refeições pela idade da criança, nutrição com base na TACO e lista de compras pronta.",
  alternates: { canonical: "https://www.pratinhofeliz.online" },
};

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string; cancelado?: string; site?: string }>;
}) {
  const { erro, cancelado, site } = await searchParams;
  const session = await auth();
  // Quem já assinou vai direto para o app. ?site=1 permite ver a página de
  // vendas mesmo logado — útil para conferir a oferta sem sair da conta.
  if (session?.user && site !== "1") redirect("/hoje");

  // Em desenvolvimento os espacos de foto aparecem como placeholder, para dar
  // para ver onde as imagens entram. Em producao, so quando existirem mesmo.
  const mostrandoEspacos = process.env.NODE_ENV !== "production";
  const mostraFotoRotina = FOTO_ROTINA.arquivo !== null || mostrandoEspacos;
  const mostraFotosCriancas = algumaPublicada(FOTOS_CRIANCAS) || mostrandoEspacos;
  const mostraFotoMesa = FOTO_MESA.arquivo !== null || mostrandoEspacos;

  return (
    <main className="flex-1 overflow-x-hidden bg-[#fdfaf6]">
      <header className="sticky top-0 z-10 border-b border-stone-200/60 bg-[#fdfaf6]/85 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2 text-base font-bold text-stone-800">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500 text-white">
              <UtensilsCrossed size={16} />
            </span>
            Pratinho Feliz
          </div>
          {/*
            Tres portas no topo, na ordem de compromisso: entrar, testar de
            graca, assinar. Os rotulos encurtam no celular para os tres caberem
            lado a lado em 375px sem quebrar linha.
          */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/login"
              className="px-1 text-[13px] font-medium text-stone-600 hover:text-stone-900 sm:text-sm"
            >
              Entrar
            </Link>
            <Link
              href="/cadastro"
              className="rounded-full border border-stone-300 px-3 py-2 text-[13px] font-semibold whitespace-nowrap text-stone-700 transition hover:border-stone-400 hover:bg-white sm:px-4 sm:text-sm"
            >
              Criar conta
            </Link>
            <a
              href="#planos"
              className="rounded-full bg-orange-500 px-3 py-2 text-[13px] font-semibold whitespace-nowrap text-white shadow-sm shadow-orange-900/15 transition hover:bg-orange-600 sm:px-4 sm:text-sm"
            >
              Assinar
            </a>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative">
        <div aria-hidden className="pointer-events-none absolute -top-24 right-[-10%] h-80 w-80 rounded-full bg-orange-200/40 blur-3xl" />
        <div className="relative mx-auto grid w-full max-w-5xl items-center gap-10 px-6 py-14 md:grid-cols-2 md:py-20">
          <div className="text-center md:text-left">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-600">
              <Zap size={13} /> Acesso imediato · sem espera
            </span>
            <h1 className="font-display mt-4 text-[2.1rem] font-extrabold leading-[1.08] text-stone-900 md:text-[3rem]">
              O cardápio do seu filho, <span className="text-orange-500">resolvido hoje.</span>
            </h1>
            <p className="mt-4 text-lg text-stone-600">
              30 dias de refeições pela idade da criança, nutrição de verdade e a lista de compras
              pronta. Sem cozinhar no improviso.
            </p>
            <p className="mt-3 rounded-2xl border border-orange-200/70 bg-orange-50/70 px-4 py-3 text-sm font-medium text-stone-700">
              <Zap size={14} className="mr-1.5 inline align--2 text-orange-500" />
              Você escolhe por onde começar: assine e entre na hora, ou crie sua conta e teste 7
              dias antes de decidir.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3 md:justify-start">
              <a
                href="#planos"
                className="flex items-center gap-1.5 rounded-full bg-orange-500 px-6 py-3.5 font-semibold text-white shadow-sm shadow-orange-900/20 transition hover:bg-orange-600"
              >
                Assinar e acessar <ArrowRight size={16} />
              </a>
              <Link
                href="/cadastro"
                className="flex items-center gap-1.5 rounded-full border border-stone-300 bg-white/70 px-6 py-3.5 font-semibold text-stone-700 transition hover:border-stone-400 hover:bg-white"
              >
                Testar 7 dias grátis
              </Link>
            </div>
            <div className="mt-5 flex flex-wrap justify-center gap-x-5 gap-y-1.5 text-xs font-medium text-stone-500 md:justify-start">
              <span className="flex items-center gap-1"><Check size={13} className="text-emerald-500" /> Acesso na hora ao assinar</span>
              <span className="flex items-center gap-1"><Check size={13} className="text-emerald-500" /> Cancele quando quiser</span>
              <span className="flex items-center gap-1"><Lock size={13} className="text-emerald-500" /> Pagamento seguro</span>
            </div>
          </div>
          <div className="flex justify-center md:justify-end">
            <PhoneCarousel />
          </div>
        </div>
      </section>

      {(erro || cancelado) && (
        <div className="mx-auto max-w-5xl px-6">
          <p className="mx-auto max-w-md rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm text-amber-800">
            {cancelado ? "Pagamento não concluído. Você pode tentar de novo quando quiser." : erro}
          </p>
        </div>
      )}

      {/* O QUE VOCÊ RECEBE */}
      <section className="bg-white">
        <div className="mx-auto w-full max-w-5xl px-6 py-14">
          <div className="mb-10 text-center">
            <h2 className="font-display text-2xl font-bold text-stone-900 md:text-3xl">Tudo que você recebe</h2>
            <p className="mt-2 text-sm text-stone-500">Do cardápio à lista de compras, num app só.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            <Beneficio icon={CalendarDays} tone="text-orange-500 bg-orange-50" titulo="30 dias prontos" texto="Café, almoço, lanche e jantar pela idade — de 6 meses a 12 anos." />
            <Beneficio icon={Salad} tone="text-emerald-500 bg-emerald-50" titulo="Nutrição de verdade" texto="Valores por porção com base na TACO (NEPA/UNICAMP)." />
            <Beneficio icon={ShoppingCart} tone="text-orange-500 bg-orange-50" titulo="Lista de compras" texto="Automática, semana a semana. Chega de esquecer item." />
            <Beneficio icon={BrainCircuit} tone="text-sky-500 bg-sky-50" titulo="Aprende os gostos" texto="Você marca o que a criança aceita e recusa; o mês seguinte melhora." />
            <Beneficio icon={Moon} tone="text-indigo-500 bg-indigo-50" titulo="Guiado pela rotina" texto="Cardápio que considera sono e disposição do seu filho." />
            <Beneficio icon={RefreshCw} tone="text-blue-500 bg-blue-50" titulo="Troca em 1 toque" texto="Não curtiu o prato? Troque na hora, até com o que tem em casa." />
          </div>
        </div>
      </section>

      {/* POR DENTRO DO APP — prints reais */}
      <section className="mx-auto w-full max-w-5xl px-6 py-14">
        <div className="mb-8 text-center">
          <h2 className="font-display text-2xl font-bold text-stone-900 md:text-3xl">Por dentro do app</h2>
          <p className="mt-2 text-sm text-stone-500">
            Telas de verdade — é exatamente isso que você abre no celular.
          </p>
        </div>
        <GaleriaDoApp />
      </section>

      {/* COMO FUNCIONA */}
      <section className="bg-white">
        <div className="mx-auto w-full max-w-5xl px-6 py-14">
          <div className="mb-10 text-center">
            <h2 className="font-display text-2xl font-bold text-stone-900 md:text-3xl">Como funciona</h2>
            <p className="mt-2 text-sm text-stone-500">Da entrada ao primeiro cardápio em minutos.</p>
          </div>
          {/*
            Sem a foto publicada o espaco nao existe, e a coluna vazia deixaria
            os passos espremidos na metade da largura — por isso a grade de
            duas colunas so entra quando ha o que colocar na segunda.
          */}
          <div className={mostraFotoRotina ? "grid items-center gap-8 md:grid-cols-[1fr_0.8fr]" : ""}>
            <div className={mostraFotoRotina ? "grid gap-6 sm:grid-cols-3 md:grid-cols-1" : "grid gap-6 md:grid-cols-3"}>
              <Passo numero={1} titulo="Entre por onde preferir" texto="Assine e acesse na hora, ou crie a conta e teste 7 dias." />
              <Passo numero={2} titulo="Conte sobre a criança" texto="Idade, gostos, recusas e restrições — leva menos de 5 minutos." />
              <Passo numero={3} titulo="Receba o plano" texto="30 dias de refeições e a lista de compras, prontos pra usar." />
            </div>
            {mostraFotoRotina && <FotoDoSite foto={FOTO_ROTINA} sizes="(min-width: 768px) 40vw, 100vw" />}
          </div>
        </div>
      </section>

      {/* FOTOS REAIS — como fica na mesa */}
      {mostraFotosCriancas && (
        <section className="mx-auto w-full max-w-5xl px-6 py-14">
          <div className="mb-8 text-center">
            <h2 className="font-display text-2xl font-bold text-stone-900 md:text-3xl">
              Como fica na mesa
            </h2>
            <p className="mt-2 text-sm text-stone-500">
              Refeições montadas pelo plano, na casa de quem já usa.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {FOTOS_CRIANCAS.map((foto, i) => (
              <FotoDoSite key={i} foto={foto} sizes="(min-width: 640px) 33vw, 100vw" />
            ))}
          </div>
        </section>
      )}

      {/* SEGURANÇA */}
      <section className="bg-white">
        <div className="mx-auto w-full max-w-5xl px-6 py-14">
          <div className="mb-10 text-center">
            <h2 className="font-display text-2xl font-bold text-stone-900 md:text-3xl">Feito com segurança para cada idade</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Confianca icon={Baby} texto="Receitas e porções pela faixa etária, incluindo papinhas de introdução alimentar." />
            <Confianca icon={ShieldCheck} texto="Bloqueios por idade — mel só após 1 ano, oleaginosas inteiras após os 3." />
            <Confianca icon={Check} texto="Respeita alergias e restrições: o cardápio nunca sugere o que você vetou." />
          </div>
          <p className="mt-6 text-center text-xs text-stone-400">
            Ferramenta de apoio à rotina alimentar. Não substitui pediatra ou nutricionista.
          </p>
        </div>
      </section>

      {/* FAIXA LARGA — foto da semana montada */}
      {mostraFotoMesa && (
        <section className="mx-auto w-full max-w-5xl px-6 pb-4">
          <FotoDoSite foto={FOTO_MESA} sizes="(min-width: 1024px) 1024px, 100vw" />
        </section>
      )}

      {/* PLANOS */}
      <section id="planos" className="mx-auto w-full max-w-5xl scroll-mt-20 px-6 py-14">
        <div className="text-center">
          <h2 className="font-display text-2xl font-bold text-stone-900 md:text-3xl">Escolha seu plano</h2>
          <p className="mt-2 text-sm text-stone-500">
            Assinando, o app abre na hora. Prefere experimentar antes?{" "}
            <Link href="/cadastro" className="font-semibold text-orange-600 hover:underline">
              Comece pelos 7 dias grátis
            </Link>
            .
          </p>
        </div>
        <div className="mx-auto mt-8 grid max-w-2xl gap-4 sm:grid-cols-2">
          <PlanoCard nome="Mensal" preco="R$ 29,90" periodo="por mês" plano="MENSAL" destaque={false} />
          <PlanoCard nome="Trimestral" preco="R$ 59,90" periodo="a cada 3 meses" selo="3 meses pelo preço de 2" plano="TRIMESTRAL" destaque />
        </div>
        <ul className="mx-auto mt-8 flex max-w-xl flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-stone-500">
          <li className="flex items-center gap-1.5"><Clock size={15} className="text-emerald-500" /> Acesso imediato após pagar</li>
          <li className="flex items-center gap-1.5"><Check size={15} className="text-emerald-500" /> Sem fidelidade — cancele quando quiser</li>
          <li className="flex items-center gap-1.5"><Lock size={15} className="text-emerald-500" /> Pagamento seguro via Stripe</li>
        </ul>
        <p className="mt-8 text-center text-xs text-stone-400">
          Assinatura recorrente, cobrada pelo Stripe. Você cancela a qualquer momento pelo próprio
          app e mantém o acesso até o fim do período já pago.
        </p>
      </section>

      {/* FAQ */}
      <section className="mx-auto w-full max-w-3xl px-6 py-14">
        <h2 className="font-display text-center text-2xl font-bold text-stone-900">Perguntas frequentes</h2>
        <div className="mt-8 space-y-3">
          {FAQ.map((f) => (
            <Faq key={f.q} q={f.q} a={f.a} />
          ))}
        </div>
      </section>

      <footer className="mx-auto w-full max-w-5xl px-6 py-10">
        <div className="flex items-center gap-2 text-sm font-bold text-stone-700">
          <UtensilsCrossed size={16} className="text-orange-500" /> Pratinho Feliz
        </div>
        <p className="mt-3 max-w-2xl text-sm text-stone-400">
          Valores nutricionais com base na TACO (NEPA/UNICAMP). Ferramenta de apoio à rotina
          alimentar — não substitui pediatra ou nutricionista.
        </p>
        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm">
          <Link href="/login" className="text-stone-500 hover:text-stone-700">Entrar</Link>
          <Link href="/privacidade" className="text-stone-500 hover:text-stone-700">Política de privacidade</Link>
        </div>
      </footer>
    </main>
  );
}

const FAQ = [
  { q: "Quando eu recebo o acesso?", a: "Na hora. Se você assinar, define sua senha logo após o pagamento e já entra. Se preferir testar antes, cria a conta e usa 7 dias grátis." },
  { q: "Posso cancelar quando quiser?", a: "Sim, sem fidelidade. Você cancela a qualquer momento e mantém o acesso até o fim do período já pago." },
  { q: "Para qual idade serve?", a: "De 6 meses a 12 anos. As receitas e porções seguem a faixa etária, incluindo papinhas de introdução alimentar." },
  { q: "E se meu filho tem alergia ou restrição?", a: "Você informa no início e o cardápio nunca sugere receitas com aqueles ingredientes. Dá para ajustar quando quiser." },
  { q: "Meu filho é enjoado. Funciona?", a: "Foi feito pensando nisso: você marca o que ele recusa e o app para de insistir. E dá para trocar qualquer refeição em um toque." },
];

function Beneficio({ icon: Icon, tone, titulo, texto }: { icon: LucideIcon; tone: string; titulo: string; texto: string }) {
  return (
    <div className="rounded-3xl border border-stone-200/60 bg-white p-5 shadow-card">
      <span className={`flex h-11 w-11 items-center justify-center rounded-2xl ${tone}`}>
        <Icon size={20} />
      </span>
      <h3 className="mt-3 font-semibold text-stone-800">{titulo}</h3>
      <p className="mt-1 text-sm text-stone-500">{texto}</p>
    </div>
  );
}

function Passo({ numero, titulo, texto }: { numero: number; titulo: string; texto: string }) {
  return (
    <div className="relative rounded-3xl border border-stone-200/60 bg-white p-6 shadow-card">
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-stone-900 text-sm font-bold text-white">
        {numero}
      </span>
      <h3 className="mt-3 font-semibold text-stone-800">{titulo}</h3>
      <p className="mt-1 text-sm text-stone-600">{texto}</p>
    </div>
  );
}

function Confianca({ icon: Icon, texto }: { icon: LucideIcon; texto: string }) {
  return (
    <div className="flex items-start gap-3 rounded-3xl border border-stone-200/60 bg-[#fdfaf6] p-5">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-500">
        <Icon size={18} />
      </span>
      <p className="text-sm text-stone-600">{texto}</p>
    </div>
  );
}

function Faq({ q, a }: { q: string; a: string }) {
  return (
    <details className="group rounded-2xl border border-stone-200/60 bg-white px-5 shadow-card">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 py-4 font-semibold text-stone-800 [&::-webkit-details-marker]:hidden">
        {q}
        <ChevronDown size={18} className="shrink-0 text-stone-400 transition-transform group-open:rotate-180" />
      </summary>
      <p className="pb-4 text-sm leading-relaxed text-stone-600">{a}</p>
    </details>
  );
}

function PlanoCard({
  nome,
  preco,
  periodo,
  selo,
  plano,
  destaque,
}: {
  nome: string;
  preco: string;
  periodo: string;
  selo?: string;
  plano: "MENSAL" | "TRIMESTRAL";
  destaque: boolean;
}) {
  return (
    <form
      action={irParaCheckoutDireto.bind(null, plano)}
      className={`relative flex flex-col rounded-3xl border bg-white p-6 shadow-card ${
        destaque ? "border-orange-300 ring-1 ring-orange-200" : "border-stone-200/60"
      }`}
    >
      {selo && (
        <span className="absolute -top-3 right-5 rounded-full bg-orange-500 px-3 py-1 text-[11px] font-semibold text-white">
          {selo}
        </span>
      )}
      <div className="text-sm font-semibold text-stone-500">{nome}</div>
      <div className="mt-1 flex items-baseline gap-1">
        <span className="font-display text-3xl font-extrabold text-stone-900">{preco}</span>
        <span className="text-sm text-stone-400">{periodo}</span>
      </div>
      <BotaoAssinar plano={plano} valor={plano === "TRIMESTRAL" ? 59.9 : 29.9} destaque={destaque} />
    </form>
  );
}
