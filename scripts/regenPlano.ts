import { db } from "@/lib/db";
import { gerarPlano30Dias } from "@/lib/planEngine";

async function main() {
  const child = await db.childProfile.findFirst({
    where: { user: { email: "admin@pratinhofeliz.com" } },
    orderBy: { createdAt: "asc" },
  });
  if (!child) throw new Error("Sem perfil de crianca no admin.");
  await db.mealPlan.updateMany({ where: { childProfileId: child.id, ativo: true }, data: { ativo: false } });
  const ciclo = (await db.mealPlan.count({ where: { childProfileId: child.id } })) + 1;
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  await gerarPlano30Dias(child.id, ciclo, hoje);
  console.log("Plano regenerado para", child.nome, "iniciando hoje (ciclo", ciclo + ").");
  await db.$disconnect();
}
main().catch((e) => { console.error(e); process.exit(1); });
