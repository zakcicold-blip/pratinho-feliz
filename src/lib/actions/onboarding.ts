"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { gerarPlano30Dias } from "@/lib/planEngine";
import { COOKIE_CRIANCA } from "@/lib/currentChild";
import { Objetivo, Praticidade, StatusPreferencia } from "@prisma/client";

export type OnboardingInput = {
  nome: string;
  faixaEtaria: string;
  refeicoesPorDia: number;
  tempoDisponivel: number;
  praticidade: Praticidade;
  objetivo: Objetivo;
  equipamentos: string;
  aceitos: string[];
  recusados: string[];
  desejados: string[];
  restricoes: string[];
  consentimento: boolean;
};

export async function completarOnboarding(input: OnboardingInput) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  if (!input.nome.trim()) return { error: "Informe o nome ou apelido da criança." };
  if (!input.consentimento) {
    return { error: "É necessário confirmar o consentimento para continuar." };
  }

  const child = await db.childProfile.create({
    data: {
      userId: session.user.id,
      nome: input.nome.trim(),
      faixaEtaria: input.faixaEtaria,
      refeicoesPorDia: input.refeicoesPorDia,
      tempoDisponivel: input.tempoDisponivel,
      praticidade: input.praticidade,
      objetivo: input.objetivo,
      equipamentos: input.equipamentos || null,
      consentimentoLgpd: true,
      onboardingCompleto: true,
    },
  });

  const preferencias: { childProfileId: string; ingredientId: string; status: StatusPreferencia }[] =
    [];
  for (const id of input.aceitos) {
    preferencias.push({ childProfileId: child.id, ingredientId: id, status: StatusPreferencia.ACEITA });
  }
  for (const id of input.recusados) {
    preferencias.push({ childProfileId: child.id, ingredientId: id, status: StatusPreferencia.RECUSA });
  }
  for (const id of input.desejados) {
    preferencias.push({ childProfileId: child.id, ingredientId: id, status: StatusPreferencia.DESEJADA });
  }
  for (const id of input.restricoes) {
    preferencias.push({ childProfileId: child.id, ingredientId: id, status: StatusPreferencia.RESTRICAO });
  }

  if (preferencias.length > 0) {
    await db.foodPreference.createMany({ data: preferencias });
  }

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  await gerarPlano30Dias(child.id, 1, hoje);

  // Quem acabou de ser cadastrado vira a crianca em foco — inclusive quando e
  // o segundo ou terceiro filho.
  (await cookies()).set(COOKIE_CRIANCA, child.id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });

  await db.auditLog.create({
    data: {
      userId: session.user.id,
      evento: "onboarding_concluido",
      detalhes: `Perfil "${child.nome}" criado e primeiro plano gerado.`,
    },
  });

  // Retorna em vez de redirecionar: assim o cliente limpa o rascunho do
  // localStorage antes de navegar (o redirect no servidor pulava essa limpeza,
  // e o rascunho vazava para a próxima conta criada no mesmo navegador).
  return { ok: true as const };
}
