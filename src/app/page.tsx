import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { cn } from "@/lib/cn";
import {
  UtensilsCrossed,
  CalendarDays,
  BrainCircuit,
  UserPlus,
  ClipboardList,
  CalendarCheck,
  Check,
  ArrowRight,
  Moon,
  Zap,
  Wind,
  Salad,
  RefreshCw,
  ShoppingCart,
  Baby,
  ShieldCheck,
  ChevronDown,
  Gift,
  ImageIcon,
  type LucideIcon,
} from "lucide-react";

export default async function LandingPage({
  searchParams,
}: {
  searchParams: Promise<{ site?: string }>;
}) {
  const { site } = await searchParams;
  const session = await auth();

  const logado = !!session?.user;
  if (logado && site !== "1") redirect("/hoje");

  return (
    <main className="flex-1 overflow-x-hidden">
      <header className="sticky top-0 z-10 border-b border-stone-200/60 bg-[#fdfaf6]/85 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2 text-base font-bold text-stone-800">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500 text-white">
              <UtensilsCrossed size={16} />
            </span>
            Pratinho Feliz
          </div>
          <nav className="flex items-center gap-4">
            {logado ? (
              <Link
                href="/hoje"
                className="flex items-center gap-1.5 rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-orange-900/15 transition hover:bg-orange-600"
              >
                Voltar ao app <ArrowRight size={14} />
              </Link>
            ) : (
              <>
                <Link href="/login" className="text-sm font-medium text-stone-600 hover:text-stone-900">
                  Entrar
                </Link>
                <Link
                  href="/cadastro"
                  className="rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-orange-900/15 transition hover:bg-orange-600"
                >
                  Começar grátis
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* HERO */}
      <section className="relative">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 right-[-10%] h-80 w-80 rounded-full bg-orange-200/40 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute top-40 left-[-10%] h-72 w-72 rounded-full bg-emerald-200/30 blur-3xl"
        />

        <div className="relative mx-auto grid w-full max-w-5xl items-center gap-10 px-6 py-16 md:grid-cols-2 md:py-24">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-600">
              <Gift size={13} /> 7 dias grátis
            </span>
            <h1 className="mt-4 text-3xl font-extrabold leading-[1.12] text-stone-900 md:text-[2.75rem]">
              O mês inteiro de comida do seu filho,{" "}
              <span className="text-orange-500">resolvido.</span>
            </h1>
            <p className="mt-4 text-lg text-stone-600">
              Um cardápio de 30 dias sob medida — e a lista de compras junto.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {logado ? (
                <Link
                  href="/hoje"
                  className="flex items-center gap-1.5 rounded-full bg-orange-500 px-6 py-3 font-semibold text-white shadow-sm shadow-orange-900/20 transition hover:bg-orange-600"
                >
                  Ver o plano de hoje <ArrowRight size={16} />
                </Link>
              ) : (
                <>
                  <Link
                    href="/cadastro"
                    className="rounded-full bg-orange-500 px-6 py-3 font-semibold text-white shadow-sm shadow-orange-900/20 transition hover:bg-orange-600"
                  >
                    Montar o plano grátis
                  </Link>
                  <Link
                    href="/login"
                    className="rounded-full border border-stone-300 bg-white px-6 py-3 font-semibold text-stone-700 transition hover:bg-stone-50"
                  >
                    Já tenho conta
                  </Link>
                </>
              )}
            </div>
            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-1.5 text-xs font-medium text-stone-500">
              <span className="flex items-center gap-1">
                <Check size={13} className="text-emerald-500" /> Menos de 5 min
              </span>
              <span className="flex items-center gap-1">
                <Check size={13} className="text-emerald-500" /> Edite tudo depois
              </span>
              <span className="flex items-center gap-1">
                <Check size={13} className="text-emerald-500" /> Cancele quando quiser
              </span>
            </div>
          </div>

          {/* Mockup de celular — troque o ImgSlot por um print real do app */}
          <div className="flex justify-center md:justify-end">
            <div className="w-full max-w-[270px] rounded-[2.5rem] border-[7px] border-stone-900 bg-stone-900 shadow-float">
              <div className="overflow-hidden rounded-[1.9rem] bg-white">
                <ImgSlot label="prévia do app" className="aspect-[9/18]" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section className="mx-auto w-full max-w-5xl px-6 py-12">
        <h2 className="text-center text-2xl font-bold text-stone-900">Como funciona</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <StepCard numero={1} icon={UserPlus} title="Conte sobre a criança" text="Idade, gostos, recusas e restrições." />
          <StepCard numero={2} icon={ClipboardList} title="Receba o plano" text="30 dias de refeições e a lista de compras." />
          <StepCard numero={3} icon={CalendarCheck} title="Ajuste no dia a dia" text="Troque pratos e o mês seguinte melhora." />
        </div>
      </section>

      {/* BENTO — RECURSOS */}
      <section className="mx-auto w-full max-w-5xl px-6 py-12">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-stone-900">Tudo em um só lugar</h2>
          <p className="mt-2 text-sm text-stone-500">Do cardápio à lista de compras, sem improviso.</p>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:auto-rows-[188px]">
          {/* Card grande com imagem */}
          <Bento className="col-span-2 md:row-span-2 flex flex-col">
            <div className="flex items-center gap-2 text-orange-500">
              <CalendarDays size={20} />
              <span className="text-xs font-semibold uppercase tracking-wide">Cardápio</span>
            </div>
            <h3 className="mt-2 text-xl font-bold text-stone-900">30 dias, prontos</h3>
            <p className="mt-1 text-sm text-stone-600">
              Café, almoço, lanche e jantar pela idade do seu filho — de 6 meses a 12 anos.
            </p>
            <ImgSlot label="print do cardápio" className="mt-4 flex-1" />
          </Bento>

          {/* Card largo: rotina */}
          <Bento className="col-span-2 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-indigo-500">
                <Moon size={20} />
                <span className="text-xs font-semibold uppercase tracking-wide">Diferencial</span>
              </div>
              <h3 className="mt-2 text-lg font-bold text-stone-900">A rotina vira cardápio</h3>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Chip icon={Moon} tone="indigo">Sono</Chip>
              <Chip icon={Zap} tone="amber">Disposição</Chip>
              <Chip icon={Wind} tone="emerald">Calma</Chip>
            </div>
          </Bento>

          <Bento>
            <BrainCircuit size={22} className="text-emerald-500" />
            <h3 className="mt-2 font-semibold text-stone-800">Aprende os gostos</h3>
            <p className="mt-1 text-sm text-stone-500">Repete menos o que não funciona.</p>
          </Bento>

          <Bento>
            <Salad size={22} className="text-orange-500" />
            <h3 className="mt-2 font-semibold text-stone-800">Nutrição real</h3>
            <p className="mt-1 text-sm text-stone-500">Valores por porção · base TACO.</p>
          </Bento>

          <Bento>
            <RefreshCw size={22} className="text-blue-500" />
            <h3 className="mt-2 font-semibold text-stone-800">Troca em 1 toque</h3>
            <p className="mt-1 text-sm text-stone-500">Até com o que você tem em casa.</p>
          </Bento>

          <Bento>
            <ShoppingCart size={22} className="text-orange-500" />
            <h3 className="mt-2 font-semibold text-stone-800">Lista de compras</h3>
            <p className="mt-1 text-sm text-stone-500">Automática, semana a semana.</p>
          </Bento>

          {/* Card largo: vários filhos com imagem */}
          <Bento className="col-span-2 flex items-center gap-4">
            <div className="min-w-0">
              <Baby size={22} className="text-emerald-500" />
              <h3 className="mt-2 font-semibold text-stone-800">Vários filhos, um app</h3>
              <p className="mt-1 text-sm text-stone-500">Cada um com seu plano e sua lista.</p>
            </div>
            <ImgSlot label="perfis" className="h-full w-32 shrink-0" />
          </Bento>
        </div>

        {/* Faixa de confiança enxuta */}
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
          <TrustChip icon={ShieldCheck}>Seguro para cada idade</TrustChip>
          <TrustChip icon={Check}>Respeita alergias e restrições</TrustChip>
          <TrustChip icon={CalendarCheck}>Você edita tudo</TrustChip>
        </div>
      </section>

      {/* PREÇO */}
      <section className="mx-auto w-full max-w-5xl px-6 py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-stone-900">7 dias grátis, depois você escolhe</h2>
          <p className="mt-2 text-sm text-stone-500">Só é cobrado após o teste. Cancele quando quiser.</p>
        </div>
        <div className="mx-auto mt-8 grid max-w-2xl gap-4 sm:grid-cols-2">
          <PlanCard nome="Mensal" preco="R$ 29,90" periodo="/mês" destaque={false} />
          <PlanCard
            nome="Trimestral"
            preco="R$ 59,90"
            periodo="/3 meses"
            selo="3 meses pelo preço de 2"
            destaque
          />
        </div>
        <div className="mt-8 text-center">
          <Link
            href={logado ? "/hoje" : "/cadastro"}
            className="inline-flex items-center gap-1.5 rounded-full bg-orange-500 px-6 py-3 font-semibold text-white shadow-sm shadow-orange-900/20 transition hover:bg-orange-600"
          >
            {logado ? "Voltar ao app" : "Começar 7 dias grátis"} <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto w-full max-w-3xl px-6 py-12">
        <h2 className="text-center text-2xl font-bold text-stone-900">Perguntas frequentes</h2>
        <div className="mt-8 space-y-3">
          {FAQ.map((item) => (
            <FaqItem key={item.q} q={item.q} a={item.a} />
          ))}
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="mx-auto w-full max-w-5xl px-6 py-10">
        <div className="rounded-3xl bg-stone-900 px-8 py-12 text-center">
          <h2 className="text-2xl font-bold text-white">
            {logado ? (
              <>
                Seu plano de <span className="text-orange-400">30 dias</span> está te esperando.
              </>
            ) : (
              <>
                Comece hoje, <span className="text-orange-400">grátis por 7 dias.</span>
              </>
            )}
          </h2>
          <Link
            href={logado ? "/hoje" : "/cadastro"}
            className="mt-6 inline-block rounded-full bg-orange-500 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-orange-600"
          >
            {logado ? "Voltar ao app" : "Criar conta grátis"}
          </Link>
        </div>
      </section>

      <footer className="mx-auto w-full max-w-5xl px-6 py-10">
        <div className="flex items-center gap-2 text-sm font-bold text-stone-700">
          <UtensilsCrossed size={16} className="text-orange-500" /> Pratinho Feliz
        </div>
        <p className="mt-3 max-w-2xl text-sm text-stone-400">
          Ferramenta de apoio à rotina alimentar. Não substitui pediatra ou nutricionista. Valores
          nutricionais com base na TACO (NEPA/UNICAMP).
        </p>
        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm">
          {!logado && (
            <>
              <Link href="/cadastro" className="text-stone-500 hover:text-stone-700">
                Criar conta
              </Link>
              <Link href="/login" className="text-stone-500 hover:text-stone-700">
                Entrar
              </Link>
            </>
          )}
          <Link href="/privacidade" className="text-stone-500 hover:text-stone-700">
            Política de privacidade
          </Link>
        </div>
      </footer>
    </main>
  );
}

const FAQ: { q: string; a: string }[] = [
  {
    q: "Como funciona o teste grátis de 7 dias?",
    a: "Você cria a conta, monta o perfil do seu filho e adiciona uma forma de pagamento. Nos primeiros 7 dias usa tudo sem pagar; a cobrança só acontece depois, e dá para cancelar antes.",
  },
  {
    q: "Vou ser cobrado durante o teste?",
    a: "Não. O cartão é pedido para iniciar, mas a primeira cobrança só ocorre quando os 7 dias terminam. Cancelou dentro do período, nada é cobrado.",
  },
  {
    q: "Quanto custa depois?",
    a: "R$ 29,90 por mês, ou R$ 59,90 a cada 3 meses (3 meses pelo preço de 2). Você escolhe ao assinar.",
  },
  {
    q: "Posso cancelar quando quiser?",
    a: "Sim, sem fidelidade. Você cancela a qualquer momento e mantém o acesso até o fim do período já pago.",
  },
  {
    q: "Para qual idade serve?",
    a: "De 6 meses a 12 anos. As receitas e porções seguem a faixa etária, incluindo papinhas de introdução alimentar.",
  },
  {
    q: "As receitas são seguras para a idade?",
    a: "Sim. Há bloqueios por idade — mel só a partir de 1 ano, oleaginosas inteiras a partir dos 3 — seguindo recomendações de alimentação infantil.",
  },
  {
    q: "E se meu filho tem alergia ou restrição?",
    a: "Você informa no início e o cardápio nunca sugere receitas com aqueles ingredientes. Dá para ajustar quando quiser.",
  },
  {
    q: "Meu filho é enjoado. Funciona?",
    a: "Foi feito pensando nisso: você marca o que ele recusa e o app para de insistir. E dá para trocar qualquer refeição em um toque.",
  },
  {
    q: "Substitui o pediatra ou nutricionista?",
    a: "Não. É uma ferramenta de organização e apoio. Para diagnóstico ou dieta específica, procure sempre um profissional.",
  },
];

function ImgSlot({ label, className }: { label?: string; className?: string }) {
  return (
    <div
      className={cn(
        "relative flex items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-orange-50 via-amber-50 to-emerald-50 ring-1 ring-inset ring-stone-200/60",
        className
      )}
    >
      <div className="flex flex-col items-center gap-1 text-stone-300">
        <ImageIcon size={22} />
        {label && (
          <span className="text-[10px] font-medium uppercase tracking-wide">{label}</span>
        )}
      </div>
    </div>
  );
}

function Bento({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("rounded-2xl border border-stone-200/70 bg-white p-5 shadow-card", className)}>
      {children}
    </div>
  );
}

const CHIP_TONES = {
  indigo: "bg-indigo-50 text-indigo-600",
  amber: "bg-amber-50 text-amber-700",
  emerald: "bg-emerald-50 text-emerald-600",
} as const;

function Chip({
  icon: Icon,
  tone,
  children,
}: {
  icon: LucideIcon;
  tone: keyof typeof CHIP_TONES;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold",
        CHIP_TONES[tone]
      )}
    >
      <Icon size={14} /> {children}
    </span>
  );
}

function TrustChip({ icon: Icon, children }: { icon: LucideIcon; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 rounded-2xl border border-stone-200/70 bg-white px-4 py-3 text-sm font-medium text-stone-600 shadow-card">
      <Icon size={17} className="shrink-0 text-emerald-500" />
      {children}
    </div>
  );
}

function StepCard({
  numero,
  icon: Icon,
  title,
  text,
}: {
  numero: number;
  icon: LucideIcon;
  title: string;
  text: string;
}) {
  return (
    <div className="relative rounded-2xl border border-stone-200/70 bg-white p-6 shadow-card">
      <span className="absolute -top-3 -left-3 flex h-7 w-7 items-center justify-center rounded-full bg-stone-900 text-xs font-bold text-white">
        {numero}
      </span>
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
        <Icon size={22} />
      </span>
      <div className="mt-3 font-semibold text-stone-800">{title}</div>
      <div className="mt-1 text-sm text-stone-600">{text}</div>
    </div>
  );
}

function PlanCard({
  nome,
  preco,
  periodo,
  destaque,
  selo,
}: {
  nome: string;
  preco: string;
  periodo: string;
  destaque: boolean;
  selo?: string;
}) {
  return (
    <div
      className={cn(
        "relative rounded-2xl border bg-white p-6 shadow-card",
        destaque ? "border-orange-300 ring-1 ring-orange-200" : "border-stone-200/70"
      )}
    >
      {selo && (
        <span className="absolute -top-3 right-4 rounded-full bg-orange-500 px-3 py-1 text-[11px] font-semibold text-white">
          {selo}
        </span>
      )}
      <div className="text-sm font-semibold text-stone-500">{nome}</div>
      <div className="mt-1 flex items-baseline gap-1">
        <span className="text-3xl font-extrabold text-stone-900">{preco}</span>
        <span className="text-sm text-stone-400">{periodo}</span>
      </div>
      <div className="mt-3 flex items-center gap-1.5 text-sm text-emerald-600">
        <Gift size={15} /> 7 dias grátis
      </div>
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <details className="group rounded-2xl border border-stone-200/70 bg-white px-5 shadow-card">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 py-4 font-semibold text-stone-800 [&::-webkit-details-marker]:hidden">
        {q}
        <ChevronDown
          size={18}
          className="shrink-0 text-stone-400 transition-transform group-open:rotate-180"
        />
      </summary>
      <p className="pb-4 text-sm leading-relaxed text-stone-600">{a}</p>
    </details>
  );
}
