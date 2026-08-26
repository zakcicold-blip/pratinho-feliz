import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";

/**
 * Quem pode abrir /parceira.
 *
 * A checagem e por REGISTRO, nao so por papel: mesmo que o papel PARCEIRA
 * escape para alguem por engano, sem uma linha em Parceira nao ha painel. E
 * admin nao entra aqui — se precisar ver os numeros de alguem, ve pelo
 * backoffice, que deixa rastro.
 */
export async function requireParceira() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const parceira = await db.parceira.findUnique({
    where: { userId: session.user.id },
    select: {
      id: true,
      nome: true,
      codigo: true,
      comissaoPct: true,
      ativa: true,
      chavePix: true,
      createdAt: true,
    },
  });

  if (!parceira) redirect("/hoje");
  return { session, parceira };
}

/** Base publica do link — o mesmo host que a pessoa esta usando agora. */
export async function baseDoSite(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "https";
  if (host) return `${proto}://${host}`;
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}
