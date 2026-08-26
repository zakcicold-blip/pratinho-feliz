"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireParceira } from "@/lib/parceiraSessao";
import { codigoValido, normalizarCodigo } from "@/lib/parceiras";

/**
 * O que a parceira pode fazer.
 *
 * A lista inteira: criar link, desligar link, atualizar a chave de repasse.
 * Nada aqui toca conta de usuario, assinatura, preco ou a propria comissao —
 * o painel dela e de leitura, e a porcentagem e acordo comercial, nao
 * configuracao de tela.
 *
 * Toda acao resolve a parceira pela SESSAO. Nenhum id vem do formulario, que
 * e como um painel de leitura viraria um jeito de mexer no dos outros.
 */

export type EstadoParceira = { error?: string; ok?: string } | undefined;

const LIMITE_LINKS = 20;

const linkSchema = z.object({
  rotulo: z.string().trim().min(2, "Dê um nome ao link (ex.: Bio do Instagram).").max(60),
  sufixo: z.string().trim().max(40).optional(),
});

/** Cria um link de divulgacao novo. */
export async function criarLink(
  _prev: EstadoParceira,
  formData: FormData,
): Promise<EstadoParceira> {
  const { parceira } = await requireParceira();
  if (!parceira.ativa) return { error: "Sua parceria está pausada. Fale com a gente." };

  const parsed = linkSchema.safeParse({
    rotulo: formData.get("rotulo"),
    sufixo: formData.get("sufixo") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };

  const quantos = await db.linkParceira.count({
    where: { parceiraId: parceira.id, revogadoEm: null },
  });
  if (quantos >= LIMITE_LINKS) {
    return { error: `Você já tem ${LIMITE_LINKS} links ativos. Desligue algum antes de criar outro.` };
  }

  // O slug sempre comeca pelo codigo dela: quem ve o link sabe de quem e, e
  // duas parceiras nao brigam pelo mesmo sufixo.
  const sufixo = normalizarCodigo(parsed.data.sufixo ?? parsed.data.rotulo);
  const base = sufixo ? `${parceira.codigo}-${sufixo}` : parceira.codigo;

  const valido = codigoValido(base);
  if (!valido.ok) return { error: valido.erro };

  // Colisao resolvida com sufixo numerico em vez de erro na cara da pessoa.
  let slug = base;
  for (let i = 2; i <= 20; i++) {
    const existe = await db.linkParceira.findUnique({ where: { slug }, select: { id: true } });
    if (!existe) break;
    slug = `${base}-${i}`;
  }

  await db.linkParceira.create({
    data: { parceiraId: parceira.id, slug, rotulo: parsed.data.rotulo },
  });

  revalidatePath("/parceira/links");
  return { ok: "Link criado." };
}

/**
 * Desliga um link.
 *
 * Nao apaga: as indicacoes que ele trouxe continuam apontando para ele, e
 * apagar sumiria com a origem de comissao ja paga. Desligado, o link para de
 * receber cliques novos e volta a levar para a home.
 */
export async function revogarLink(linkId: string): Promise<EstadoParceira> {
  const { parceira } = await requireParceira();

  // updateMany com o parceiraId no WHERE: o id do link vem do cliente, entao
  // e aqui que se garante que ele e dela.
  const r = await db.linkParceira.updateMany({
    where: { id: linkId, parceiraId: parceira.id, revogadoEm: null },
    data: { revogadoEm: new Date() },
  });
  if (r.count === 0) return { error: "Link não encontrado." };

  revalidatePath("/parceira/links");
  return { ok: "Link desligado." };
}

const pixSchema = z.object({
  chavePix: z.string().trim().max(140),
});

/** Guarda (ou apaga) a chave de repasse. */
export async function salvarChavePix(
  _prev: EstadoParceira,
  formData: FormData,
): Promise<EstadoParceira> {
  const { parceira } = await requireParceira();

  const parsed = pixSchema.safeParse({ chavePix: formData.get("chavePix") ?? "" });
  if (!parsed.success) return { error: "Chave inválida." };

  const valor = parsed.data.chavePix;
  await db.parceira.update({
    where: { id: parceira.id },
    // Campo vazio apaga de verdade: e dado pessoal dela, e ela decide se
    // fica guardado.
    data: { chavePix: valor.length ? valor : null },
  });

  revalidatePath("/parceira/pagamentos");
  return { ok: valor.length ? "Chave salva." : "Chave removida." };
}
