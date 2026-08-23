import { db } from "@/lib/db";

/**
 * Conserta a quantidade escrita nas variações de receita.
 *
 * O gerador trocava o ingrediente e mantinha o texto original da quantidade.
 * Como cada alimento tem um peso de unidade diferente, "4 unidades" de morango
 * (48 g) virava "4 unidades" de banana — que seriam 280 g. O peso em gramas
 * continuava correto, mas quem lia a receita colocava quatro bananas.
 *
 * O peso é a fonte da verdade: veio da receita base e é o que alimenta o
 * cálculo nutricional e a lista de compras. Aqui reescrevemos o texto para
 * descrever esse mesmo peso na unidade do ingrediente novo, e ajustamos o
 * peso para bater exatamente com o texto.
 *
 *   npm run db:corrigir-variacoes -- --dry
 */

/** Quantas unidades daquele alimento, em texto que uma pessoa entende. */
function textoDaQuantidade(gramas: number, gramasPorUnidade: number) {
  const bruto = gramas / gramasPorUnidade;

  if (bruto < 0.75) {
    return { texto: "1/2 unidade", gramas: Math.round(gramasPorUnidade / 2) };
  }
  const n = Math.max(1, Math.round(bruto));
  return {
    texto: `${n} ${n === 1 ? "unidade" : "unidades"}`,
    gramas: Math.round(n * gramasPorUnidade),
  };
}

/** Preserva o complemento do texto original ("2 unidades cozida" → "cozida"). */
function complemento(quantidade: string): string {
  const resto = quantidade.replace(/^[\d/]+\s*unidades?/i, "").trim();
  return resto ? ` ${resto}` : "";
}

async function main() {
  const dry = process.argv.includes("--dry");

  const variacoes = await db.recipe.findMany({
    where: { baseRecipeId: { not: null } },
    select: {
      nome: true,
      variacaoTroca: true,
      ingredients: { include: { ingredient: true } },
    },
  });

  let corrigidas = 0;
  const exemplos: string[] = [];

  for (const receita of variacoes) {
    const trocado = receita.variacaoTroca?.split("→")[1]?.trim();
    if (!trocado) continue;

    for (const item of receita.ingredients) {
      if (item.ingredient.nome !== trocado) continue;

      const gpu = item.ingredient.gramasPorUnidade;
      if (!gpu || !item.gramas) continue;
      if (!/unidade/i.test(item.quantidade)) continue;

      const novo = textoDaQuantidade(item.gramas, gpu);
      const textoFinal = novo.texto + complemento(item.quantidade);
      if (textoFinal === item.quantidade) continue;

      if (exemplos.length < 12) {
        exemplos.push(
          `${receita.nome}\n     ${item.ingredient.nome}: "${item.quantidade}" (${item.gramas}g) → "${textoFinal}" (${novo.gramas}g)`
        );
      }
      corrigidas++;

      if (!dry) {
        await db.recipeIngredient.update({
          where: { id: item.id },
          data: { quantidade: textoFinal, gramas: novo.gramas },
        });
      }
    }
  }

  console.log(`\n=== ${dry ? "SIMULAÇÃO" : "APLICADO"} ===`);
  console.log(`Variações auditadas: ${variacoes.length}`);
  console.log(`Quantidades ${dry ? "a corrigir" : "corrigidas"}: ${corrigidas}\n`);
  for (const e of exemplos) console.log("  • " + e);
}

main().finally(() => db.$disconnect());
