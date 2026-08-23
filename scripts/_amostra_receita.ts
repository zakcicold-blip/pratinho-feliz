import { db } from "@/lib/db";
async function main() {
  const r = await db.recipe.findFirst({
    where: { ativo: true, tipoRefeicao: "ALMOCO" },
    include: { ingredients: { include: { ingredient: true } } },
  });
  if (!r) return;
  console.log(JSON.stringify({
    nome: r.nome, resumo: r.resumo, rendimento: r.rendimento, porcoes: r.porcoes,
    dificuldade: r.dificuldade, tags: r.tags, restricoes: r.restricoes,
    equipamentos: r.equipamentos, idadeMinimaMeses: r.idadeMinimaMeses,
    nutricao: r.nutricao.slice(0, 200),
    passos: r.passos.slice(0, 400),
    ingredientes: r.ingredients.map(i => `${i.ingredient.nome} | ${i.quantidade} | ${i.gramas}g`),
  }, null, 1));
  const restricoesDistintas = await db.recipe.findMany({ where: { ativo: true }, select: { restricoes: true }, distinct: ["restricoes"], take: 12 });
  console.log("\nRESTRICOES DISTINTAS:", restricoesDistintas.map(x => x.restricoes));
}
main().finally(() => db.$disconnect());
