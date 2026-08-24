/**
 * Redefine a senha de uma conta direto no banco.
 *
 * Serve para o caso em que nao da para usar a tela de login — a senha do admin
 * se perdeu e o app nao tem fluxo de "esqueci minha senha". Roda contra o
 * DATABASE_URL do ambiente, entao confira em qual banco voce esta antes de
 * confirmar: o script mostra o host e pede confirmacao.
 *
 * Uso:
 *   npm run senha:reset -- admin@exemplo.com
 *   npm run senha:reset -- admin@exemplo.com --admin   (tambem promove a ADMIN)
 *
 * A senha e digitada no prompt, nunca no argumento — argumento fica no
 * historico do shell.
 */
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

function hostDoBanco(): string {
  const url = process.env.DATABASE_URL ?? "";
  const m = url.match(/@([^/?]+)/);
  return m ? m[1] : "(DATABASE_URL nao definida)";
}

async function main() {
  const args = process.argv.slice(2);
  const promover = args.includes("--admin");
  const email = args.find((a) => !a.startsWith("--"))?.toLowerCase().trim();

  if (!email) {
    console.error("Informe o e-mail: npm run senha:reset -- voce@email.com [--admin]");
    process.exitCode = 1;
    return;
  }

  const usuario = await db.user.findUnique({
    where: { email },
    select: { id: true, name: true, email: true, role: true },
  });

  if (!usuario) {
    console.error(`Nenhuma conta com o e-mail ${email} em ${hostDoBanco()}.`);
    process.exitCode = 1;
    return;
  }

  const rl = createInterface({ input: stdin, output: stdout });
  try {
    console.log(`\nBanco:   ${hostDoBanco()}`);
    console.log(`Conta:   ${usuario.name} <${usuario.email}> (${usuario.role})`);
    if (promover) console.log("Tambem vai promover esta conta para ADMIN.");

    const ok = await rl.question("\nConfirma a troca de senha? (s/N) ");
    if (ok.trim().toLowerCase() !== "s") {
      console.log("Cancelado. Nada foi alterado.");
      return;
    }

    const senha = await rl.question("Nova senha (min. 6 caracteres): ");
    if (senha.length < 6) {
      console.error("Senha curta demais. Nada foi alterado.");
      process.exitCode = 1;
      return;
    }
    const repetida = await rl.question("Repita a senha: ");
    if (senha !== repetida) {
      console.error("As senhas nao conferem. Nada foi alterado.");
      process.exitCode = 1;
      return;
    }

    await db.user.update({
      where: { id: usuario.id },
      data: {
        passwordHash: await bcrypt.hash(senha, 10),
        ...(promover ? { role: "ADMIN" as const } : {}),
      },
    });

    console.log(`\nSenha atualizada. Entre em /login com ${usuario.email}.`);
  } finally {
    rl.close();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
