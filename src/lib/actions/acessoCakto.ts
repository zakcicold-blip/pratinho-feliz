"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { signIn } from "@/auth";
import { consumir, ipDaRequisicao, mensagemDeEspera } from "@/lib/rateLimit";
import { avaliarSenha, campoSenha, gerarHash } from "@/lib/senha";

/**
 * Criacao de conta para quem pagou na Cakto.
 *
 * O checkout deles acontece fora do site e sem login, entao a compra chega
 * pelo webhook antes de existir conta. Aqui a pessoa prova que a compra e dela
 * — e-mail do pagamento + os quatro ultimos digitos do CPF — e escolhe a
 * senha. O webhook nao pode criar a senha: so a pessoa define a dela.
 */

const MAX_TENTATIVAS = 8;

const schema = z.object({
  email: z.string().trim().toLowerCase().email("E-mail inválido."),
  documento: z.string().trim().regex(/^\d{4}$/, "Informe os 4 últimos dígitos do CPF."),
  senha: campoSenha,
  nome: z.string().trim().min(2, "Informe seu nome.").max(80),
});

export type AcessoState = { error?: string } | undefined;

export async function liberarAcessoCakto(
  _prev: AcessoState,
  formData: FormData,
): Promise<AcessoState> {
  const parsed = schema.safeParse({
    email: formData.get("email"),
    documento: formData.get("documento"),
    senha: formData.get("senha"),
    nome: formData.get("nome"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };

  const { email, documento, senha, nome } = parsed.data;

  // O contador por compra so trava DEPOIS de achar uma compra. Quem varre
  // e-mails para descobrir quem comprou nunca encosta nele — por isso o
  // limite por IP vem antes de qualquer consulta.
  const forca = avaliarSenha(senha, { nome, email });
  if (!forca.ok) return { error: forca.erro };

  const limite = await consumir("reivindicar_ip", await ipDaRequisicao());
  if (!limite.ok) return { error: mensagemDeEspera(limite) };

  const compra = await db.compraCakto.findFirst({
    where: { email, liberadaEm: null },
    orderBy: { createdAt: "desc" },
  });

  if (!compra) {
    // Mensagem unica para "nao existe compra" e "ja foi liberada": quem estiver
    // adivinhando e-mail nao descobre quem comprou.
    return {
      error:
        "Não encontramos uma compra aguardando liberação para esse e-mail. Se você já criou a conta, use a tela de entrar.",
    };
  }

  if (compra.tentativas >= MAX_TENTATIVAS) {
    return {
      error: "Muitas tentativas para esta compra. Fale com a gente para liberar manualmente.",
    };
  }

  if (compra.docLast4 && compra.docLast4 !== documento) {
    await db.compraCakto.update({
      where: { id: compra.id },
      data: { tentativas: { increment: 1 } },
    });
    return { error: "Os dígitos do CPF não conferem com os do pagamento." };
  }

  const existente = await db.user.findUnique({ where: { email } });
  if (existente) {
    return {
      error: "Já existe uma conta com esse e-mail. Entre por ela — o acesso já está liberado.",
    };
  }

  const passwordHash = await gerarHash(senha);
  const usuario = await db.user.create({
    data: {
      name: compra.nome?.trim() || nome,
      email,
      passwordHash,
      subscription: {
        create: {
          plano: "ESSENCIAL",
          status: "ATIVA",
          caktoAssinaturaId: compra.assinaturaId,
          caktoRefId: compra.refId,
        },
      },
    },
  });

  await db.compraCakto.update({
    where: { id: compra.id },
    data: { userId: usuario.id, liberadaEm: new Date() },
  });

  await db.auditLog.create({
    data: {
      userId: usuario.id,
      evento: "cakto_acesso_criado",
      detalhes: `${email} criou a conta a partir da compra ${compra.refId ?? compra.id}.`,
    },
  });

  // compra=1 marca no Pixel que veio de uma compra concluida.
  await signIn("credentials", { email, password: senha, redirectTo: "/hoje?novo=1&compra=1" });
}
