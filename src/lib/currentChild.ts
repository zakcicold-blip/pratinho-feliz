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
 */
export const COOKIE_CRIANCA = "pf_crianca";

export async function requireSession() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  return session;
}

/** Todos os filhos do responsável, na ordem em que foram cadastrados. */
export async function listarCriancas(userId: string) {
  return db.childProfile.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
    select: { id: true, nome: true, faixaEtaria: true },
  });
}

export async function getCurrentChild() {
  const session = await requireSession();

  const escolhido = (await cookies()).get(COOKIE_CRIANCA)?.value;

  // O id do cookie só vale se o perfil realmente pertencer a quem está logado:
  // cookie é editável pelo usuário, então nunca serve de autorização sozinho.
  const child = escolhido
    ? await db.childProfile.findFirst({
        where: { id: escolhido, userId: session.user.id },
      })
    : null;

  if (child) return { session, child };

  const primeiro = await db.childProfile.findFirst({
    where: { userId: session.user.id },
    orderBy: { createdAt: "asc" },
  });
  if (!primeiro) redirect("/onboarding");

  return { session, child: primeiro };
}

export async function getActiveMealPlan(childId: string) {
  return db.mealPlan.findFirst({
    where: { childProfileId: childId, ativo: true },
    orderBy: { cicloNumero: "desc" },
  });
}
