import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";

/**
 * Qual criança o responsável está vendo agora.
 *
 * Fica em cookie e não no banco de propósito: é estado de navegação, não dado
 * da família. Assim o pai pode abrir o plano de um filho no celular e o de
 * outro no computador sem um sobrescrever o outro.
 *
 * PERFORMANCE — por que tudo aqui é memoizado com `cache()`:
 *
 * O banco fica em sa-east-1 e cada ida e volta custa ~27 ms. O layout do app
 * e a página dentro dele chamavam as MESMAS consultas de novo a cada
 * navegação: sessão, assinatura e perfil da criança. Eram ~55 ms de custo
 * fixo antes de a página começar a buscar os próprios dados.
 *
 * `cache()` do React memoiza por requisição: layout e página compartilham o
 * mesmo resultado, e as três consultas viram uma só.
 */
export const COOKIE_CRIANCA = "pf_crianca";

/** Sessão do NextAuth, resolvida uma vez por requisição. */
export const getSession = cache(async () => auth());

export async function requireSession() {
  const session = await getSession();
  if (!session?.user?.id) redirect("/login");
  return session;
}

/**
 * Uma consulta só com tudo que o app precisa para montar qualquer tela:
 * assinatura (paywall, no layout) e filhos (perfil em foco, nas páginas).
 */
const carregarContaCompleta = cache(async (userId: string) => {
  return db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      lembretes: true,
      subscription: {
        select: { status: true, stripeSubscriptionId: true, acessoCortesia: true },
      },
      children: { orderBy: { createdAt: "asc" } },
    },
  });
});

export const getConta = cache(async () => {
  const session = await requireSession();
  const conta = await carregarContaCompleta(session.user.id);
  if (!conta) redirect("/login");
  return { session, conta };
});

/** Todos os filhos do responsável, na ordem em que foram cadastrados. */
export async function listarCriancas(userId: string) {
  const conta = await carregarContaCompleta(userId);
  return (conta?.children ?? []).map((c) => ({
    id: c.id,
    nome: c.nome,
    faixaEtaria: c.faixaEtaria,
  }));
}

export const getCurrentChild = cache(async () => {
  const { session, conta } = await getConta();

  const escolhido = (await cookies()).get(COOKIE_CRIANCA)?.value;

  // O id do cookie só vale se o perfil realmente pertencer a quem está logado:
  // cookie é editável pelo usuário, então nunca serve de autorização sozinho.
  // A checagem é feita na lista já carregada — sem nova ida ao banco.
  const child = escolhido ? conta.children.find((c) => c.id === escolhido) : undefined;
  if (child) return { session, child };

  const primeiro = conta.children[0];
  if (!primeiro) redirect("/onboarding");

  return { session, child: primeiro };
});

export const getActiveMealPlan = cache(async (childId: string) => {
  return db.mealPlan.findFirst({
    where: { childProfileId: childId, ativo: true },
    orderBy: { cicloNumero: "desc" },
  });
});
