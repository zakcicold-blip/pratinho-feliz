"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import { buscarConvite, RECUSA_LABEL } from "@/lib/convites";
import { registrarEtapa } from "@/lib/funil";
import { cookies } from "next/headers";
import { COOKIE_INDICACAO, registrarIndicacao } from "@/lib/parceiras";
import { consumir, ipDaRequisicao, liberar, mensagemDeEspera } from "@/lib/rateLimit";
import { avaliarSenha, campoSenha, gerarHash } from "@/lib/senha";

const registerSchema = z.object({
  name: z.string().trim().min(2, "Informe seu nome."),
  email: z.string().trim().toLowerCase().email("E-mail inválido."),
  telefone: z.string().trim().max(30).optional(),
  password: campoSenha,
});

export type FormState = { error?: string } | undefined;

export async function registerAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    telefone: formData.get("telefone") ?? undefined,
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const { name, email, telefone, password } = parsed.data;

  // Cinco contas por hora por IP. Segura criacao em massa sem incomodar uma
  // familia inteira cadastrando do mesmo wi-fi.
  const forca = avaliarSenha(password, { nome: name, email });
  if (!forca.ok) return { error: forca.erro };

  const ip = await ipDaRequisicao();
  const limite = await consumir("cadastro_ip", ip);
  if (!limite.ok) return { error: mensagemDeEspera(limite) };

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "Já existe uma conta com esse e-mail." };
  }

  const passwordHash = await gerarHash(password);

  const criado = await db.user.create({
    data: {
      name,
      email,
      telefone: telefone && telefone.length > 0 ? telefone : null,
      passwordHash,
      subscription: {
        create: { plano: "ESSENCIAL", status: "TESTE" },
      },
    },
    select: { id: true },
  });

  // Veio de uma parceira? O cookie foi gravado la em /p/<slug>. Nao pode
  // atrapalhar o cadastro, entao registrarIndicacao engole os proprios erros.
  const indicacao = (await cookies()).get(COOKIE_INDICACAO)?.value;
  await registrarIndicacao(criado.id, indicacao);

  await registrarEtapa("conta_criada", { email, path: "/cadastro" });

  // Vai direto para o app: o cadastro da crianca virou modal dentro dele.
  // novo=1 sinaliza ao Meta Pixel que é um cadastro recém-concluído.
  await signIn("credentials", {
    email,
    password,
    redirectTo: "/hoje?novo=1",
  });
}

export async function loginAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") ?? "").toLowerCase().trim();

  /*
   * Duas contagens, propositos diferentes.
   *
   * Por e-mail (5/15min) trava forca bruta contra UMA conta. Por IP (20/15min)
   * trava a lista de e-mails vazados sendo testada em sequencia, que passaria
   * pelo primeiro limite sem encostar nele.
   *
   * O limite por e-mail e checado ANTES do de IP para que quem esta so
   * errando a propria senha receba a mensagem que descreve a situacao dele.
   */
  const ip = await ipDaRequisicao();
  if (email) {
    const porEmail = await consumir("login_email", email);
    if (!porEmail.ok) return { error: mensagemDeEspera(porEmail) };
  }
  const porIp = await consumir("login_ip", ip);
  if (!porIp.ok) return { error: mensagemDeEspera(porIp) };

  try {
    await signIn("credentials", {
      email,
      password: String(formData.get("password") ?? ""),
      redirectTo: "/hoje",
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return { error: "E-mail ou senha incorretos." };
    }
    // signIn com redirectTo lanca NEXT_REDIRECT quando da certo: e por aqui
    // que o sucesso passa, e e onde o contador daquele e-mail e zerado.
    if (email) await liberar("login_email", email);
    throw err;
  }
}

/**
 * Cadastro por link de cortesia.
 *
 * Mesma criacao de conta do fluxo normal, com duas diferencas: a assinatura ja
 * nasce com `acessoCortesia`, entao a pessoa nao encosta no paywall, e o
 * convite e consumido junto. As duas coisas acontecem na mesma transacao com
 * um `updateMany` condicionado ao limite de usos — sem isso, duas pessoas
 * abrindo o mesmo link de uso unico ao mesmo tempo criariam duas contas.
 *
 * O token e revalidado aqui mesmo: a pagina pode ter ficado aberta por horas
 * depois de o convite ser revogado ou vencer.
 */
export async function registerComConvite(
  token: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    telefone: formData.get("telefone") ?? undefined,
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const validacao = await buscarConvite(token);
  if (!validacao.ok) return { error: RECUSA_LABEL[validacao.motivo] };
  const convite = validacao.convite;

  const { name, email, telefone, password } = parsed.data;

  const forca = avaliarSenha(password, { nome: name, email });
  if (!forca.ok) return { error: forca.erro };

  if (await db.user.findUnique({ where: { email } })) {
    return { error: "Já existe uma conta com esse e-mail." };
  }

  const passwordHash = await gerarHash(password);

  try {
    await db.$transaction(async (tx) => {
      const consumido = await tx.conviteCortesia.updateMany({
        where: { id: convite.id, revogadoEm: null, usos: { lt: convite.maxUsos } },
        data: { usos: { increment: 1 } },
      });
      if (consumido.count === 0) throw new ConviteIndisponivel();

      await tx.user.create({
        data: {
          name,
          email,
          telefone: telefone && telefone.length > 0 ? telefone : null,
          passwordHash,
          subscription: {
            create: {
              plano: "ESSENCIAL",
              status: "TESTE",
              acessoCortesia: true,
              cortesiaMotivo: convite.motivo ?? `Convite: ${convite.rotulo}`,
              cortesiaEm: new Date(),
              conviteId: convite.id,
            },
          },
        },
      });
    });
  } catch (err) {
    if (err instanceof ConviteIndisponivel) {
      return { error: RECUSA_LABEL.esgotado };
    }
    throw err;
  }

  await db.auditLog.create({
    data: {
      evento: "cortesia_por_convite",
      detalhes: `${email} entrou pelo convite "${convite.rotulo}" (id ${convite.id}).`,
    },
  });

  await registrarEtapa("conta_criada", { email, path: "/convite" });

  // cortesia=1 marca a origem para o onboarding; novo=1 e o mesmo sinal de
  // cadastro novo que o Pixel ja escuta.
  await signIn("credentials", { email, password, redirectTo: "/hoje?novo=1&cortesia=1" });
}

class ConviteIndisponivel extends Error {}
