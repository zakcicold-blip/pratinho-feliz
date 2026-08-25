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
