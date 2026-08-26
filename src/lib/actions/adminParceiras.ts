"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";
import { codigoValido, normalizarCodigo } from "@/lib/parceiras";

/**
 * Cadastro de parceiras — lado do admin.
 *
 * Promover alguem a parceira muda quem recebe dinheiro, entao tudo aqui passa
 * por requireAdmin e deixa registro em AuditLog. E a promocao parte de uma
 * conta que JA existe: a pessoa se cadastra no app como qualquer usuaria e
 * so depois vira parceira, o que evita criar conta com senha definida por
 * terceiro.
 */

export type EstadoAdminParceira = { error?: string; ok?: string } | undefined;

const criarSchema = z.object({
  email: z.string().trim().toLowerCase().email("E-mail inválido."),
  nome: z.string().trim().min(2, "Informe o nome público da parceira.").max(80),
  codigo: z.string().trim().min(1, "Informe o código do link."),
  comissaoPct: z.coerce
    .number()
    .min(0, "A comissão não pode ser negativa.")
    .max(80, "Acima de 80% provavelmente é engano."),
  observacao: z.string().trim().max(280).optional(),
});

export async function criarParceira(
  _prev: EstadoAdminParceira,
  formData: FormData,
): Promise<EstadoAdminParceira> {
  const sessao = await requireAdmin();

  const parsed = criarSchema.safeParse({
    email: formData.get("email"),
    nome: formData.get("nome"),
    codigo: formData.get("codigo"),
    comissaoPct: formData.get("comissaoPct"),
    observacao: formData.get("observacao") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };

  const codigo = normalizarCodigo(parsed.data.codigo);
  const valido = codigoValido(codigo);
  if (!valido.ok) return { error: valido.erro };

  const user = await db.user.findUnique({
    where: { email: parsed.data.email },
    select: { id: true, role: true, parceira: { select: { id: true } } },
  });
  if (!user) {
    return {
      error: "Não há conta com esse e-mail. Peça para ela se cadastrar no app antes.",
    };
  }
  if (user.parceira) return { error: "Essa conta já é parceira." };
  // Rebaixar um admin por engano tiraria o acesso dele ao backoffice.
  if (user.role === "ADMIN") return { error: "Essa conta é admin. Use outra para a parceria." };

  if (await db.parceira.findUnique({ where: { codigo }, select: { id: true } })) {
    return { error: `O código "${codigo}" já está em uso.` };
  }

  await db.$transaction([
    db.parceira.create({
      data: {
        userId: user.id,
        nome: parsed.data.nome,
        codigo,
        comissaoPct: parsed.data.comissaoPct,
        observacao: parsed.data.observacao ?? null,
        // Um primeiro link ja criado: sem ele o painel abre vazio e a pessoa
        // nao sabe qual e o proximo passo.
        links: { create: { slug: codigo, rotulo: "Link principal" } },
      },
    }),
    db.user.update({ where: { id: user.id }, data: { role: "PARCEIRA" } }),
    db.auditLog.create({
      data: {
        userId: sessao.user.id,
        evento: "parceira_criada",
        detalhes: `${parsed.data.email} virou parceira "${parsed.data.nome}" (/p/${codigo}), ${parsed.data.comissaoPct}%.`,
      },
    }),
  ]);

  revalidatePath("/admin/parceiras");
  return { ok: `Parceira criada. O link dela é /p/${codigo}.` };
}

const ajusteSchema = z.object({
  parceiraId: z.string().min(1),
  comissaoPct: z.coerce.number().min(0).max(80),
});

/**
 * Muda o percentual daqui para a frente.
 *
 * Indicacoes antigas guardam a propria copia do percentual, entao renegociar
 * nao reescreve o que ja foi indicado — e uma comissao combinada em janeiro
 * continua valendo o que valia.
 */
export async function ajustarComissao(
  _prev: EstadoAdminParceira,
  formData: FormData,
): Promise<EstadoAdminParceira> {
  const sessao = await requireAdmin();

  const parsed = ajusteSchema.safeParse({
    parceiraId: formData.get("parceiraId"),
    comissaoPct: formData.get("comissaoPct"),
  });
  if (!parsed.success) return { error: "Percentual inválido." };

  const parceira = await db.parceira.update({
    where: { id: parsed.data.parceiraId },
    data: { comissaoPct: parsed.data.comissaoPct },
    select: { nome: true },
  });

  await db.auditLog.create({
    data: {
      userId: sessao.user.id,
      evento: "parceira_comissao_alterada",
      detalhes: `${parceira.nome} passou a ${parsed.data.comissaoPct}% (vale para indicações novas).`,
    },
  });

  revalidatePath("/admin/parceiras");
  return { ok: "Comissão atualizada." };
}

/** Pausa ou reativa a parceria. */
export async function alternarParceira(parceiraId: string): Promise<EstadoAdminParceira> {
  const sessao = await requireAdmin();

  const atual = await db.parceira.findUnique({
    where: { id: parceiraId },
    select: { ativa: true, nome: true },
  });
  if (!atual) return { error: "Parceira não encontrada." };

  await db.parceira.update({ where: { id: parceiraId }, data: { ativa: !atual.ativa } });
  await db.auditLog.create({
    data: {
      userId: sessao.user.id,
      evento: atual.ativa ? "parceira_pausada" : "parceira_reativada",
      detalhes: `${atual.nome} foi ${atual.ativa ? "pausada" : "reativada"}.`,
    },
  });

  revalidatePath("/admin/parceiras");
  return { ok: atual.ativa ? "Parceria pausada." : "Parceria reativada." };
}
