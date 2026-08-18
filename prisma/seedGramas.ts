/**
 * Estima o peso em gramas de cada ingrediente das receitas e o número de
 * porções a partir do texto de rendimento. Idempotente.
 *
 *   npm run db:gramas
 */
import { PrismaClient } from "@prisma/client";
import { estimarGramas } from "../src/lib/medidas";

const db = new PrismaClient();

/**
 * "2 porções" -> 2 | "8 fatias" -> 8 | "1 copo" -> 1
 * Rendimentos em unidades pequenas (bolinhos, panquecas) contam como porções,
 * já que a criança come algumas unidades por refeição.
 */
function lerPorcoes(rendimento: string): number {
  const m = rendimento.match(/(\d+)/);
  if (!m) return 1;
  const n = Number(m[1]);
  return Number.isFinite(n) && n > 0 ? n : 1;
}

async function main() {
  const receitas = await db.recipe.findMany({ select: { id: true, rendimento: true } });
  for (const r of receitas) {
    await db.recipe.update({
      where: { id: r.id },
      data: { porcoes: lerPorcoes(r.rendimento) },
    });
  }
  console.log(`Porcoes definidas em ${receitas.length} receitas.`);

  const itens = await db.recipeIngredient.findMany({
    include: { ingredient: true, recipe: { select: { nome: true } } },
  });

  let convertidos = 0;
  const naoConvertidos: string[] = [];

  for (const item of itens) {
    const gramas = estimarGramas(item.quantidade, item.ingredient.gramasPorUnidade);

    await db.recipeIngredient.update({
      where: { id: item.id },
      data: { gramas },
    });

    if (gramas === null) {
      naoConvertidos.push(`${item.recipe.nome} → ${item.ingredient.nome} ("${item.quantidade}")`);
    } else {
      convertidos++;
    }
  }

  console.log(`\nMedidas convertidas: ${convertidos}/${itens.length}`);
  if (naoConvertidos.length) {
    console.log(`\nNao convertidas (${naoConvertidos.length}):`);
    naoConvertidos.slice(0, 25).forEach((n) => console.log("  -", n));
    if (naoConvertidos.length > 25) console.log(`  ... e mais ${naoConvertidos.length - 25}`);
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
