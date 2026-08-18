/**
 * Calcula a aptidão de cada receita para os objetivos de rotina
 * (sono / disposição / regulação) a partir da composição dos ingredientes.
 * Idempotente.
 *
 *   npm run db:rotina
 */
import { PrismaClient } from "@prisma/client";
import { calcularScores } from "../src/lib/objetivosRotina";

const db = new PrismaClient();

async function main() {
  const receitas = await db.recipe.findMany({
    include: { ingredients: { include: { ingredient: true } } },
  });

  let comScore = 0;
  const semDados: string[] = [];

  for (const r of receitas) {
    const scores = calcularScores(r.ingredients, r.porcoes);

    if (!scores) {
      semDados.push(r.nome);
      await db.recipe.update({
        where: { id: r.id },
        data: { scoreSono: null, scoreEnergia: null, scoreCalma: null },
      });
      continue;
    }

    await db.recipe.update({
      where: { id: r.id },
      data: {
        scoreSono: scores.sono,
        scoreEnergia: scores.energia,
        scoreCalma: scores.calma,
      },
    });
    comScore++;
  }

  console.log(`\nReceitas com score de rotina: ${comScore}/${receitas.length}`);
  if (semDados.length) {
    console.log(`Sem composicao suficiente (${semDados.length}):`);
    semDados.forEach((n) => console.log("  -", n));
  }

  for (const [rotulo, campo] of [
    ["SONO", "scoreSono"],
    ["ENERGIA", "scoreEnergia"],
    ["CALMA", "scoreCalma"],
  ] as const) {
    const top = await db.recipe.findMany({
      where: { [campo]: { not: null } },
      orderBy: { [campo]: "desc" },
      take: 5,
      select: { nome: true, tipoRefeicao: true, [campo]: true },
    });
    console.log(`\nTop ${rotulo}:`);
    top.forEach((r) => console.log(`  ${String(r[campo as keyof typeof r]).padStart(3)} | ${r.nome}`));
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
