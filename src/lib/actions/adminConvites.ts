"use server";

import crypto from "node:crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";

/**
 * Convites de cortesia criados no painel.
 *
 * O acesso liberado aqui nao passa pelo Stripe e nao entra na receita — e o
 * mesmo `acessoCortesia` que o botao da lista de usuarios liga, so que
 * concedido antes da conta existir.
 */

const novoConviteSchema = z.object({
  rotulo: z.string().trim().min(2, "Diga para quem é o convite.").max(80),
  motivo: z.string().trim().max(120).optional(),
  maxUsos: z.coerce.number().int().min(1, "Mínimo de 1 uso.").max(500),
  // 0 = sem validade. Limite alto o suficiente para "um ano" e nada alem.
  validadeDias: z.coerce.number().int().min(0).max(365),
});

export type ConviteState = { error?: string } | undefined;

/** Token do link. 24 bytes aleatorios: impossivel de adivinhar por tentativa. */
function novoToken(): string {
  return crypto.randomBytes(24).toString("base64url");
}

export async function criarConvite(_prev: ConviteState, formData: FormData): Promise<ConviteState> {
  const session = await requireAdmin();

  const parsed = novoConviteSchema.safeParse({
    rotulo: formData.get("rotulo"),
    motivo: formData.get("motivo") ?? undefined,
    maxUsos: formData.get("maxUsos") ?? 1,
    validadeDias: formData.get("validadeDias") ?? 30,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const { rotulo, motivo, maxUsos, validadeDias } = parsed.data;
  const convite = await db.conviteCortesia.create({
    data: {
      token: novoToken(),
      rotulo,
      motivo: motivo && motivo.length > 0 ? motivo : null,
      maxUsos,
      expiraEm: validadeDias > 0 ? new Date(Date.now() + validadeDias * 864e5) : null,
      criadoPorId: session.user.id,
    },
  });

  await db.auditLog.create({
    data: {
      userId: session.user.id,
      evento: "convite_cortesia_criado",
      detalhes: `Convite "${rotulo}" (${maxUsos} uso(s), id ${convite.id}).`,
    },
  });

  revalidatePath("/admin/convites");
}

/**
 * Revoga o link. Nao mexe em quem ja entrou por ele: quem virou cortesia
 * continua com acesso, e tirar isso e o botao da lista de usuarios.
 */
export async function revogarConvite(conviteId: string): Promise<ConviteState> {
  const session = await requireAdmin();

  const convite = await db.conviteCortesia.findUnique({ where: { id: conviteId } });
  if (!convite) return { error: "Convite não encontrado." };
  if (convite.revogadoEm) return;

  await db.conviteCortesia.update({
    where: { id: conviteId },
    data: { revogadoEm: new Date() },
  });

  await db.auditLog.create({
    data: {
      userId: session.user.id,
      evento: "convite_cortesia_revogado",
      detalhes: `Convite "${convite.rotulo}" (id ${convite.id}) revogado.`,
    },
  });

  revalidatePath("/admin/convites");
}
