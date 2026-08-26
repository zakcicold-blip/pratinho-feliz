import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { db } from "@/lib/db";
import { getConta } from "@/lib/currentChild";
import { CATEGORIA_INGREDIENTE_ORDEM } from "@/lib/constants";
import BottomNav from "@/components/BottomNav";
import HeatOptOut from "@/components/HeatOptOut";
import OnboardingModal from "./OnboardingModal";

/**
 * O app deixou de ser fechado atras de pagamento.
 *
 * Antes este layout redirecionava para /assinar quem nao pagava, e o produto
 * inteiro ficava invisivel. Agora qualquer conta entra: o que e pago fica
 * bloqueado tela a tela (src/lib/plano.ts), com o cardapio de hoje sempre
 * livre — e ele que mostra que o app funciona.
 *
 * O que continua obrigatorio e o cadastro da crianca: sem filho, nenhuma tela
 * tem conteudo, entao o modal cobre o app ate ser concluido.
 */
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  // Uma consulta so, memoizada por requisicao: as paginas dentro deste layout
  // reaproveitam a mesma conta em vez de consultar sessao, assinatura e
  // perfil de novo.
  const { session, conta } = await getConta();
  const precisaCadastrar = conta.children.length === 0;
  const ehParceira = (session.user as { role?: string }).role === "PARCEIRA";

  // Parceira sem filho cadastrado nao pode cair no modal de onboarding: ela
  // entrou para acompanhar indicacoes, nao para montar cardapio, e o modal
  // nao tem saida. Ela ainda pode usar o app — basta cadastrar uma crianca.
  if (precisaCadastrar && ehParceira) {
    return (
      <main className="mx-auto w-full max-w-md px-6 py-16 text-center">
        <h1 className="text-xl font-bold text-stone-800">Olá!</h1>
        <p className="mt-2 text-sm leading-relaxed text-stone-600">
          Seu painel de parceira tem os links, as indicações e a comissão do mês.
        </p>
        <Link
          href="/parceira"
          className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600"
        >
          Ir para o meu painel <ArrowRight size={15} />
        </Link>
        <p className="mt-6 text-xs leading-relaxed text-stone-400">
          Quer usar o app também? Cadastre uma criança em Configurações e ele abre normalmente.
        </p>
      </main>
    );
  }

  const grupos = precisaCadastrar ? await gruposDeIngredientes() : [];

  // Sem filho, o app nao e renderizado — nem o menu, nem a pagina. Isso nao e
  // so estetica: as telas chamam getCurrentChild, que redireciona para
  // /onboarding quando nao ha crianca. Com a pagina renderizando por baixo do
  // modal, esse redirect entrava em loop com o /onboarding.
  if (precisaCadastrar) {
    return (
      <>
        <HeatOptOut />
        <OnboardingModal
          grupos={grupos}
          userId={conta.id}
          nome={session.user.name ?? "por aqui"}
        />
      </>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <HeatOptOut />
      {ehParceira && (
        <Link
          href="/parceira"
          className="flex items-center justify-center gap-1.5 bg-orange-500 px-4 py-2 text-xs font-semibold text-white"
        >
          Abrir meu painel de parceira <ArrowRight size={13} />
        </Link>
      )}
      <div className="mx-auto w-full max-w-2xl flex-1 pb-4">{children}</div>
      <BottomNav />
    </div>
  );
}

/** Catalogo de ingredientes agrupado, do jeito que o wizard espera. */
async function gruposDeIngredientes() {
  const ingredientes = await db.ingredient.findMany({ orderBy: { nome: "asc" } });
  return CATEGORIA_INGREDIENTE_ORDEM.map((categoria) => ({
    categoria,
    itens: ingredientes.filter((i) => i.categoria === categoria),
  })).filter((g) => g.itens.length > 0);
}
