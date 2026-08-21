// Conta demo para UGC — acesso completo, SEM passar por pagamento.
// Cria (ou reseta) um usuário com assinatura ATIVA (o paywall libera direto),
// uma criança com onboarding concluído e um plano de 30 dias começando hoje.
//
// Rodar:  npm run db:demo
// Customizar:  DEMO_EMAIL=... DEMO_SENHA=... DEMO_CRIANCA=... npm run db:demo
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { gerarPlano30Dias } from "@/lib/planEngine";
import { hojeChave } from "@/lib/dates";

const db = new PrismaClient();

const EMAIL = (process.env.DEMO_EMAIL ?? "demo@pratinhofeliz.app").toLowerCase().trim();
const SENHA = process.env.DEMO_SENHA ?? "demo1234";
const NOME_RESPONSAVEL = process.env.DEMO_RESP ?? "Conta Demo";
const NOME_CRIANCA = process.env.DEMO_CRIANCA ?? "Bento";

async function main() {
  const passwordHash = await bcrypt.hash(SENHA, 10);

  // 1) Usuário
  const user = await db.user.upsert({
    where: { email: EMAIL },
    update: { passwordHash, name: NOME_RESPONSAVEL },
    create: { name: NOME_RESPONSAVEL, email: EMAIL, passwordHash },
  });

  // 2) Assinatura ATIVA sem Stripe → libera o app sem pagamento
  await db.subscription.upsert({
    where: { userId: user.id },
    update: { status: "ATIVA", plano: "ESSENCIAL" },
    create: { userId: user.id, plano: "ESSENCIAL", status: "ATIVA" },
  });

  // 3) Criança com onboarding pronto
  let child = await db.childProfile.findFirst({ where: { userId: user.id } });
  if (!child) {
    child = await db.childProfile.create({
      data: {
        userId: user.id,
        nome: NOME_CRIANCA,
        faixaEtaria: "2 a 3 anos",
        refeicoesPorDia: 4,
        tempoDisponivel: 30,
        praticidade: "EQUILIBRADO",
        objetivo: "ORGANIZAR_ROTINA",
        consentimentoLgpd: true,
        onboardingCompleto: true,
      },
    });
  }

  // 4) Plano de 30 dias começando hoje (desativa o anterior, se houver)
  const atual = await db.mealPlan.findFirst({
    where: { childProfileId: child.id, ativo: true },
    orderBy: { cicloNumero: "desc" },
  });
  if (atual) await db.mealPlan.update({ where: { id: atual.id }, data: { ativo: false } });
  await gerarPlano30Dias(child.id, (atual?.cicloNumero ?? 0) + 1, hojeChave());

  console.log("\n✅ Conta demo pronta (acesso total, sem pagamento):");
  console.log("   E-mail : " + EMAIL);
  console.log("   Senha  : " + SENHA);
  console.log("   Criança: " + child.nome + " · plano de 30 dias gerado a partir de hoje.");
  console.log("\n   Login: /login  →  entra direto no app.\n");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
