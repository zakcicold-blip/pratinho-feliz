import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import {
  UtensilsCrossed,
  CalendarDays,
  BrainCircuit,
  ListChecks,
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
  HeartHandshake,
  ChevronDown,
  Gift,
  type LucideIcon,
} from "lucide-react";

export default async function LandingPage({
  searchParams,
}: {
  searchParams: Promise<{ site?: string }>;
}) {
  const { site } = await searchParams;
  const session = await auth();

  // Quem já está logado vai direto para o app, a menos que peça explicitamente
  // para ver a página inicial (link "Página inicial" no menu da conta).
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
                <Link
                  href="/login"
                  className="text-sm font-medium text-stone-600 hover:text-stone-900"
                >
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

        <div className="relative mx-auto grid w-full max-w-5xl gap-10 px-6 py-16 md:grid-cols-2 md:items-center md:py-24">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-600">
              <Gift size={13} /> 7 dias grátis para testar
            </span>
            <h1 className="mt-4 text-3xl font-extrabold leading-[1.15] text-stone-900 md:text-[2.75rem]">
              30 dias sem precisar pensar{" "}
              <span className="text-orange-500">no que seu filho vai comer.</span>
            </h1>
            <p className="mt-4 text-lg text-stone-600">
              O Pratinho Feliz monta um cardápio de um mês inteiro sob medida para a idade, os gostos
              e a rotina do seu filho — e ainda gera a lista de compras. Você entra sem saber o que
              oferecer e sai com o mês organizado.
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
                    Montar o plano do meu filho
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
                <Check size={13} className="text-emerald-500" /> Leva menos de 5 minutos
              </span>
              <span className="flex items-center gap-1">
                <Check size={13} className="text-emerald-500" /> Você edita tudo depois
              </span>
              <span className="flex items-center gap-1">
                <Check size={13} className="text-emerald-500" /> Cancele quando quiser
              </span>
            </div>
          </div>
          <div className="grid gap-4">
            <FeatureCard
              icon={CalendarDays}
              title="30 dias"
              text="Plano alimentar personalizado e editável."
              bg="bg-orange-50"
              iconColor="text-orange-500"
            />
            <FeatureCard
              icon={BrainCircuit}
              title="Aprende com o uso"
              text="Gostou, aceitou, experimentou ou recusou."
              bg="bg-emerald-50"
              iconColor="text-emerald-500"
            />
            <FeatureCard
              icon={ListChecks}
              title="Menos decisões"
              text="Receita, troca, compra e rotina no mesmo lugar."
              bg="bg-blue-50"
              iconColor="text-blue-500"
            />
          </div>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section className="mx-auto w-full max-w-5xl px-6 py-14">
        <h2 className="text-center text-2xl font-bold text-stone-900">Como funciona</h2>
        <p className="mx-auto mt-2 max-w-md text-center text-sm text-stone-500">
          Três passos entre você e um mês inteiro de refeições organizadas.
        </p>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <StepCard
            numero={1}
            icon={UserPlus}
            title="Conte sobre a criança"
            text="Idade, preferências, recusas, restrições e o tempo que a família tem para cozinhar."
          />
          <StepCard
            numero={2}
            icon={ClipboardList}
            title="Receba o plano"
            text="30 dias de café, almoço, lanche e jantar já organizados, com a lista de compras pronta."
          />
          <StepCard
            numero={3}
            icon={CalendarCheck}
            title="Ajuste no dia a dia"
            text="Troque refeições, registre as reações e veja o próximo mês ficar cada vez mais a cara do seu filho."
          />
        </div>
      </section>

      {/* O QUE O APP FAZ */}
      <section className="mx-auto w-full max-w-5xl px-6 py-14">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-stone-900">Tudo em um só lugar</h2>
          <p className="mx-auto mt-2 max-w-lg text-sm text-stone-500">
            O Pratinho Feliz resolve as decisões da alimentação da criança de ponta a ponta — do
            cardápio à lista de compras.
          </p>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <DetailCard
            icon={CalendarDays}
            title="Cardápio de 30 dias sob medida"
            text="Café, almoço, lanche e jantar escolhidos pela idade do seu filho — de 6 meses a 12 anos — e pelo que a família consegue preparar."
          />
          <DetailCard
            icon={BrainCircuit}
            title="Aprende os gostos do seu filho"
            text="A cada refeição você marca gostou, aceitou, experimentou ou recusou. O mês seguinte usa isso para acertar mais e repetir menos o que não funciona."
          />
          <DetailCard
            icon={Moon}
            title="A rotina vira cardápio"
            text="Registre sono, atividade física e disposição da criança e o app prioriza receitas que ajudam justamente naquele ponto, respeitando a idade."
          />
          <DetailCard
            icon={Salad}
            title="Nutrição de verdade"
            text="Os valores por porção vêm da TACO, a Tabela Brasileira de Composição de Alimentos (NEPA/UNICAMP) — nada de números inventados."
          />
          <DetailCard
            icon={RefreshCw}
            title="Trocar é um toque"
            text="Não curtiu um prato? Troque por outra sugestão — inclusive por opções feitas com o que você já tem em casa."
          />
          <DetailCard
            icon={ShoppingCart}
            title="Lista de compras automática"
            text="Cada semana já vem com a lista organizada por seção. Dá para marcar o que já tem em casa e adicionar itens à mão."
          />
        </div>
      </section>

      {/* DIFERENCIAL: ROTINA -> CARDÁPIO */}
      <section className="mx-auto w-full max-w-5xl px-6 py-10">
        <div className="rounded-3xl border border-stone-200/70 bg-white p-8 shadow-card md:p-10">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-600">
            O diferencial
          </span>
          <h2 className="mt-3 text-2xl font-bold text-stone-900">
            A comida acompanha o dia do seu filho
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-stone-600">
            O que a criança come ao longo do dia faz diferença. O Pratinho Feliz lê três sinais da
            rotina e ajusta as sugestões do cardápio — sempre como apoio à alimentação, nunca como
            tratamento.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <PillarCard
              icon={Moon}
              tone="indigo"
              title="Sono"
              text="Dormiu mal? O cardápio favorece preparos mais leves e alimentos com magnésio, cálcio e carboidratos de digestão lenta."
            />
            <PillarCard
              icon={Zap}
              tone="amber"
              title="Disposição"
              text="Sem energia? Prioriza ferro, proteína e vitaminas do complexo B, que participam do transporte de oxigênio e do metabolismo."
            />
            <PillarCard
              icon={Wind}
              tone="emerald"
              title="Agitação"
              text="Muito agitado? Puxa refeições mais leves, com fibras e absorção lenta, evitando pratos pesados demais."
            />
          </div>
          <p className="mt-5 text-xs leading-relaxed text-stone-400">
            Respondeu só um dos três? Tudo bem — o app usa o que existe. Sugestões alimentares não
            substituem a orientação de um pediatra ou nutricionista.
          </p>
        </div>
      </section>

      {/* CONFIANÇA / SEGURANÇA */}
      <section className="mx-auto w-full max-w-5xl px-6 py-10">
        <div className="grid gap-4 md:grid-cols-3">
          <TrustCard
            icon={ShieldCheck}
            title="Seguro para cada idade"
            text="As receitas respeitam bloqueios de segurança: mel só a partir de 1 ano, oleaginosas inteiras a partir dos 3, e assim por diante."
          />
          <TrustCard
            icon={HeartHandshake}
            title="Respeita restrições"
            text="Você informa alergias e restrições no começo, e o cardápio nunca sugere o que a criança não pode comer."
          />
          <TrustCard
            icon={Baby}
            title="Vários filhos, um app"
            text="Cada criança tem o próprio plano, lista de compras e rotina. Troque de filho quando quiser, no mesmo perfil."
          />
        </div>
      </section>

      {/* PREÇO / TESTE GRÁTIS */}
      <section className="mx-auto w-full max-w-5xl px-6 py-14">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-stone-900">Comece com 7 dias grátis</h2>
          <p className="mx-auto mt-2 max-w-lg text-sm text-stone-500">
            Você adiciona uma forma de pagamento e testa tudo por 7 dias. Só é cobrado depois — e
            pode cancelar a qualquer momento antes disso.
          </p>
        </div>
        <div className="mx-auto mt-8 grid max-w-2xl gap-4 sm:grid-cols-2">
          <PlanCard
            nome="Mensal"
            preco="R$ 29,90"
            periodo="por mês"
            destaque={false}
            itens={["7 dias grátis para testar", "Cancele quando quiser", "Todos os recursos incluídos"]}
          />
          <PlanCard
            nome="Trimestral"
            preco="R$ 59,90"
            periodo="a cada 3 meses"
            selo="3 meses pelo preço de 2"
            destaque
            itens={["7 dias grátis para testar", "Economize a cada trimestre", "Todos os recursos incluídos"]}
          />
        </div>
        <div className="mt-8 text-center">
          <Link
            href={logado ? "/hoje" : "/cadastro"}
            className="inline-flex items-center gap-1.5 rounded-full bg-orange-500 px-6 py-3 font-semibold text-white shadow-sm shadow-orange-900/20 transition hover:bg-orange-600"
          >
            {logado ? "Voltar ao app" : "Começar meus 7 dias grátis"} <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto w-full max-w-3xl px-6 py-14">
        <h2 className="text-center text-2xl font-bold text-stone-900">Perguntas frequentes</h2>
        <p className="mx-auto mt-2 max-w-md text-center text-sm text-stone-500">
          Tudo o que costumam perguntar antes de começar.
        </p>
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
                Comece o primeiro plano de <span className="text-orange-400">30 dias</span> hoje.
              </>
            )}
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-stone-300">
            Sem planilhas, sem grupo de WhatsApp de receitas perdidas. Só a rotina organizada — com 7
            dias grátis para experimentar.
          </p>
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
          O Pratinho Feliz é uma ferramenta de organização e apoio à rotina alimentar da criança. As
          sugestões não substituem a orientação de um pediatra ou nutricionista. Valores nutricionais
          com base na TACO (NEPA/UNICAMP).
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
    a: "Você cria a conta, monta o perfil do seu filho e adiciona uma forma de pagamento para liberar o app. Nos primeiros 7 dias você usa tudo sem pagar nada. A cobrança só acontece depois desse período, e você pode cancelar antes para não ser cobrado.",
  },
  {
    q: "Vou ser cobrado durante o teste?",
    a: "Não. O cartão é pedido para iniciar o teste, mas a primeira cobrança só ocorre quando os 7 dias terminam. Se cancelar dentro do período de teste, nada é cobrado.",
  },
  {
    q: "Quanto custa depois do teste?",
    a: "R$ 29,90 por mês no plano mensal, ou R$ 59,90 a cada 3 meses no plano trimestral (3 meses pelo preço de 2). Você escolhe na hora de assinar.",
  },
  {
    q: "Posso cancelar quando quiser?",
    a: "Sim. Não há fidelidade — você cancela a assinatura a qualquer momento e continua com acesso até o fim do período já pago.",
  },
  {
    q: "Para qual idade o app serve?",
    a: "De 6 meses a 12 anos. As receitas e as porções são escolhidas de acordo com a faixa etária da criança, incluindo papinhas de introdução alimentar para os menores.",
  },
  {
    q: "As receitas são seguras para a idade do meu filho?",
    a: "Sim. O app aplica bloqueios de segurança por idade — por exemplo, mel só a partir de 1 ano (risco de botulismo) e oleaginosas inteiras a partir dos 3 anos (risco de engasgo) — seguindo recomendações de alimentação infantil.",
  },
  {
    q: "E se meu filho tem alergia ou restrição alimentar?",
    a: "Você informa as restrições no início e o cardápio nunca sugere receitas com aqueles ingredientes. Dá para ajustar isso a qualquer momento no perfil da criança.",
  },
  {
    q: "Meu filho é enjoado para comer. Funciona mesmo assim?",
    a: "Foi feito pensando nisso. Você marca o que a criança recusa, e o app deixa de insistir no que não funciona. Também dá para trocar qualquer refeição em um toque, inclusive por opções com o que você já tem em casa.",
  },
  {
    q: "Preciso seguir o cardápio à risca?",
    a: "Não. O plano é um ponto de partida editável. Você troca refeições, marca dias fora de casa e adapta como quiser — e o app aprende com esses ajustes.",
  },
  {
    q: "O Pratinho Feliz substitui o pediatra ou o nutricionista?",
    a: "Não. É uma ferramenta de organização e apoio à rotina alimentar. Para diagnóstico, dietas específicas ou qualquer questão de saúde, procure sempre um profissional.",
  },
];

function FeatureCard({
  icon: Icon,
  title,
  text,
  bg,
  iconColor,
}: {
  icon: LucideIcon;
  title: string;
  text: string;
  bg: string;
  iconColor: string;
}) {
  return (
    <div className={`rounded-2xl ${bg} p-5 shadow-card`}>
      <Icon className={iconColor} size={24} />
      <div className="mt-2 font-semibold text-stone-800">{title}</div>
      <div className="mt-1 text-sm text-stone-600">{text}</div>
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

function DetailCard({ icon: Icon, title, text }: { icon: LucideIcon; title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-stone-200/70 bg-white p-6 shadow-card">
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
        <Icon size={22} />
      </span>
      <div className="mt-3 font-semibold text-stone-800">{title}</div>
      <div className="mt-1.5 text-sm leading-relaxed text-stone-600">{text}</div>
    </div>
  );
}

const PILLAR_TONES = {
  indigo: "bg-indigo-50 text-indigo-500",
  amber: "bg-amber-50 text-amber-600",
  emerald: "bg-emerald-50 text-emerald-500",
} as const;

function PillarCard({
  icon: Icon,
  tone,
  title,
  text,
}: {
  icon: LucideIcon;
  tone: keyof typeof PILLAR_TONES;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl bg-stone-50 p-5">
      <span
        className={`flex h-10 w-10 items-center justify-center rounded-xl ${PILLAR_TONES[tone]}`}
      >
        <Icon size={20} />
      </span>
      <div className="mt-3 font-semibold text-stone-800">{title}</div>
      <div className="mt-1 text-sm leading-relaxed text-stone-600">{text}</div>
    </div>
  );
}

function TrustCard({ icon: Icon, title, text }: { icon: LucideIcon; title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-stone-200/70 bg-white p-5 shadow-card">
      <Icon size={22} className="text-emerald-500" />
      <div className="mt-2 font-semibold text-stone-800">{title}</div>
      <div className="mt-1 text-sm leading-relaxed text-stone-600">{text}</div>
    </div>
  );
}

function PlanCard({
  nome,
  preco,
  periodo,
  itens,
  destaque,
  selo,
}: {
  nome: string;
  preco: string;
  periodo: string;
  itens: string[];
  destaque: boolean;
  selo?: string;
}) {
  return (
    <div
      className={`relative rounded-2xl border bg-white p-6 shadow-card ${
        destaque ? "border-orange-300 ring-1 ring-orange-200" : "border-stone-200/70"
      }`}
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
      <ul className="mt-4 space-y-2">
        {itens.map((i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-stone-600">
            <Check size={16} className="mt-0.5 shrink-0 text-emerald-500" />
            {i}
          </li>
        ))}
      </ul>
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
