/**
 * Popula a composição nutricional dos ingredientes a partir da TACO.
 * Idempotente: pode rodar quantas vezes for preciso.
 *
 *   npm run db:nutricao
 */
import { PrismaClient } from "@prisma/client";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { TACO_MAP } from "./tacoMap";

const db = new PrismaClient();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

type TacoRow = {
  id: number;
  description: string;
  energy_kcal: number | string;
  protein_g: number | string;
  carbohydrate_g: number | string;
  lipid_g: number | string;
  fiber_g: number | string;
  calcium_mg: number | string;
  iron_mg: number | string;
  sodium_mg: number | string;
  vitaminC_mg: number | string;
  zinc_mg: number | string;
  tryptophan_g: number | string;
  magnesium_mg: number | string;
  potassium_mg: number | string;
  thiamine_mg: number | string;
  riboflavin_mg: number | string;
  pyridoxine_mg: number | string;
  niacin_mg: number | string;
};

/**
 * A TACO usa "NA" (não analisado), "Tr" (traços) e "" (não determinado).
 * "Tr" vira 0; os demais viram null para não inventar dado que não existe.
 */
function num(v: number | string | undefined): number | null {
  if (typeof v === "number") return Number.isFinite(v) ? Number(v.toFixed(2)) : null;
  if (typeof v === "string") {
    const t = v.trim();
    if (t === "Tr") return 0;
    if (t === "" || t === "NA" || t === "*") return null;
    const n = Number(t.replace(",", "."));
    return Number.isFinite(n) ? Number(n.toFixed(2)) : null;
  }
  return null;
}

async function main() {
  const raw = readFileSync(path.join(__dirname, "data", "taco.json"), "utf8");
  const taco: TacoRow[] = JSON.parse(raw);
  const porId = new Map(taco.map((t) => [t.id, t]));

  const ingredientes = await db.ingredient.findMany({ orderBy: { nome: "asc" } });

  let comDados = 0;
  const semMapa: string[] = [];
  const semTaco: string[] = [];

  for (const ing of ingredientes) {
    const entry = TACO_MAP[ing.nome];

    if (!entry) {
      semMapa.push(ing.nome);
      continue;
    }

    if (entry.tacoId === null) {
      semTaco.push(`${ing.nome} (${entry.nota ?? "sem nota"})`);
      // Ainda grava o peso por unidade, se houver, para o cálculo de outras receitas.
      if (entry.gramasPorUnidade) {
        await db.ingredient.update({
          where: { id: ing.id },
          data: { gramasPorUnidade: entry.gramasPorUnidade },
        });
      }
      continue;
    }

    const t = porId.get(entry.tacoId);
    if (!t) {
      console.warn(`! TACO id ${entry.tacoId} nao encontrado para "${ing.nome}"`);
      continue;
    }

    await db.ingredient.update({
      where: { id: ing.id },
      data: {
        tacoId: t.id,
        tacoDescricao: t.description,
        energiaKcal: num(t.energy_kcal),
        proteinaG: num(t.protein_g),
        carboidratoG: num(t.carbohydrate_g),
        lipideoG: num(t.lipid_g),
        fibraG: num(t.fiber_g),
        calcioMg: num(t.calcium_mg),
        ferroMg: num(t.iron_mg),
        sodioMg: num(t.sodium_mg),
        vitaminaCMg: num(t.vitaminC_mg),
        zincoMg: num(t.zinc_mg),
        triptofanoG: num(t.tryptophan_g),
        magnesioMg: num(t.magnesium_mg),
        potassioMg: num(t.potassium_mg),
        tiaminaMg: num(t.thiamine_mg),
        riboflavinaMg: num(t.riboflavin_mg),
        piridoxinaMg: num(t.pyridoxine_mg),
        niacinaMg: num(t.niacin_mg),
        gramasPorUnidade: entry.gramasPorUnidade ?? null,
      },
    });
    comDados++;
  }

  console.log(`\nIngredientes com composicao TACO: ${comDados}/${ingredientes.length}`);
  if (semTaco.length) {
    console.log(`\nSem correspondente na TACO (${semTaco.length}):`);
    semTaco.forEach((n) => console.log("  -", n));
  }
  if (semMapa.length) {
    console.log(`\nFora do mapa - precisam ser mapeados (${semMapa.length}):`);
    semMapa.forEach((n) => console.log("  -", n));
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
