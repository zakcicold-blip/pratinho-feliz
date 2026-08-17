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
  Quote,
  type LucideIcon,
} from "lucide-react";

export default async function LandingPage() {
  const session = await auth();
  if (session?.user) redirect("/hoje");

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
            <Link href="/login" className="text-sm font-medium text-stone-600 hover:text-stone-900">
              Entrar
            </Link>
            <Link
              href="/cadastro"
              className="rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-orange-900/15 transition hover:bg-orange-600"
            >
              Começar grátis
            </Link>
          </nav>
        </div>
      </header>

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
              Alimentação infantil sem improviso
            </span>
            <h1 className="mt-4 text-3xl font-extrabold leading-[1.15] text-stone-900 md:text-[2.75rem]">
              30 dias sem precisar pensar{" "}
              <span className="text-orange-500">no que seu filho vai comer.</span>
            </h1>
            <p className="mt-4 text-lg text-stone-600">
              A mãe entra sem saber o que oferecer ao filho e sai com a alimentação do mês
              organizada, adaptável e cada vez mais personalizada conforme o uso.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
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
            </div>
            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-1.5 text-xs font-medium text-stone-500">
              <span className="flex items-center gap-1">
                <Check size={13} className="text-emerald-500" /> Leva menos de 5 minutos
              </span>
              <span className="flex items-center gap-1">
                <Check size={13} className="text-emerald-500" /> Você edita tudo depois
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

      <section className="mx-auto w-full max-w-5xl px-6 py-14">
        <h2 className="text-center text-2xl font-bold text-stone-900">Como funciona</h2>
        <p className="mx-auto mt-2 max-w-md text-center text-sm text-stone-500">
          Três passos entre você e um mês inteiro de refeições organizadas.
        </p>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <StepCard
            numero={1}
            icon={UserPlus}
            title="Conte sobre a rotina"
            text="Preferências, recusas, restrições e tempo disponível da família."
          />
          <StepCard
            numero={2}
            icon={ClipboardList}
            title="Receba o plano"
            text="30 dias de café, almoço, lanche e jantar já organizados."
          />
          <StepCard
            numero={3}
            icon={CalendarCheck}
            title="Ajuste no dia a dia"
            text="Troque refeições, registre reações e veja o próximo mês melhorar."
          />
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl px-6 py-10">
        <div className="grid gap-4 md:grid-cols-3">
          <AngleCard
            title="Praticidade"
            text="30 dias sem precisar pensar no que seu filho vai comer."
          />
          <AngleCard
            title="Descoberta"
            text="Ajude seu filho a descobrir novos alimentos sem transformar cada refeição em um projeto."
          />
          <AngleCard
            title="Personalização"
            text="Um cardápio que aprende os gostos do seu filho."
          />
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl px-6 py-10">
        <div className="rounded-3xl bg-stone-900 px-8 py-12 text-center">
          <h2 className="text-2xl font-bold text-white">
            Comece o primeiro plano de {" "}
            <span className="text-orange-400">30 dias</span> hoje.
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-stone-300">
            Sem planilhas, sem grupo de WhatsApp de receitas perdidas. Só a rotina organizada.
          </p>
          <Link
            href="/cadastro"
            className="mt-6 inline-block rounded-full bg-orange-500 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-orange-600"
          >
            Criar conta grátis
          </Link>
        </div>
      </section>

      <footer className="mx-auto w-full max-w-5xl px-6 py-10">
        <div className="flex items-center gap-2 text-sm font-bold text-stone-700">
          <UtensilsCrossed size={16} className="text-orange-500" /> Pratinho Feliz
        </div>
        <p className="mt-3 text-sm text-stone-400">
          O Pratinho Feliz é uma ferramenta de organização e apoio à rotina — não substitui
          orientação de pediatra ou nutricionista.
        </p>
        <p className="mt-2 text-sm">
          <Link href="/privacidade" className="text-stone-500 underline hover:text-stone-700">
            Política de privacidade
          </Link>
        </p>
      </footer>
    </main>
  );
}

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

function AngleCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-stone-200/70 bg-white p-5 shadow-card">
      <Quote size={18} className="text-orange-300" />
      <div className="mt-2 font-semibold text-stone-800">{title}</div>
      <div className="mt-1 text-sm text-stone-600">{text}</div>
    </div>
  );
}
