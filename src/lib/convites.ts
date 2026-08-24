import { db } from "@/lib/db";
import type { ConviteCortesia } from "@prisma/client";

/**
 * Regras de um link de cortesia.
 *
 * O token e a unica credencial do convite — quem tem o link cria a conta. Por
 * isso todo caminho que aceita um token passa por aqui, e a validacao roda de
 * novo no envio do formulario: entre abrir a pagina e enviar, o convite pode
 * ter sido revogado, expirado ou gasto por outra pessoa.
 */
export type MotivoInvalido = "inexistente" | "revogado" | "expirado" | "esgotado";

export type ConviteValidado =
  | { ok: true; convite: ConviteCortesia }
  | { ok: false; motivo: MotivoInvalido };

export const RECUSA_LABEL: Record<MotivoInvalido, string> = {
  inexistente: "Este convite não existe. Confira se o link foi copiado inteiro.",
  revogado: "Este convite foi cancelado por quem enviou.",
  expirado: "Este convite venceu. Peça um novo para quem te enviou.",
  esgotado: "Este convite já foi usado.",
};

export function avaliarConvite(convite: ConviteCortesia | null): ConviteValidado {
  if (!convite) return { ok: false, motivo: "inexistente" };
  if (convite.revogadoEm) return { ok: false, motivo: "revogado" };
  if (convite.expiraEm && convite.expiraEm.getTime() < Date.now()) {
    return { ok: false, motivo: "expirado" };
  }
  if (convite.usos >= convite.maxUsos) return { ok: false, motivo: "esgotado" };
  return { ok: true, convite };
}

export async function buscarConvite(token: string): Promise<ConviteValidado> {
  const limpo = token.trim();
  if (!limpo) return { ok: false, motivo: "inexistente" };
  const convite = await db.conviteCortesia.findUnique({ where: { token: limpo } });
  return avaliarConvite(convite);
}

/** URL completa do convite, para o admin copiar e enviar. */
export function urlDoConvite(base: string, token: string): string {
  return `${base.replace(/\/$/, "")}/convite/${token}`;
}
