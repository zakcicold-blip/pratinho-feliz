/**
 * Atribui uma foto de prato a cada receita (campo imagemUrl), escolhida pela
 * palavra-chave no nome, com fallback pelo tipo de refeição.
 *
 * As imagens vêm da TheMealDB (https://www.themealdb.com) — banco aberto de
 * fotos de comida, uso livre, URLs estáveis. São ilustrativas ("como o prato
 * se pareceria"), não fotos exatas de cada receita.
 *
 *   npm run db:fotos
 */
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();
const M = "https://www.themealdb.com/images/media/meals";

const FOTOS = {
  mingau: `${M}/sng9bm1765320170.jpg`,
  ovos: `${M}/yvpuuy1511797244.jpg`,
  panqueca: `${M}/rwuyqx1511383174.jpg`,
  sopa: `${M}/sqpqtp1515365614.jpg`,
  smoothie: `${M}/pjbaq11784731571.jpg`,
  arrozfeijao: `${M}/j8c1d51782772399.jpg`,
  iogurte: `${M}/y2irzl1585563479.jpg`,
  pure: `${M}/b5ft861583188991.jpg`,
  sanduiche: `${M}/djdg8l1784578885.jpg`,
  wrap: `${M}/prrirc1763781360.jpg`,
  fruta: `${M}/dk70uv1784670127.jpg`,
  banana: `${M}/sywswr1511383814.jpg`,
  salada: `${M}/7ytdtz1784833420.jpg`,
  frango: `${M}/wyxwsp1486979827.jpg`,
  carne: `${M}/pbzcrx1763765096.jpg`,
  peixe: `${M}/ysxwuq1487323065.jpg`,
  cuscuz: `${M}/qxytrx1511304021.jpg`,
  legumes: `${M}/3m8yae1763257951.jpg`,
  pao: `${M}/lmc6r51764365554.jpg`,
  bolo: `${M}/wkhg581762773124.jpg`,
} as const;

// Ordem importa: o primeiro termo que casa vence. Do mais específico ao geral.
const REGRAS: [RegExp, keyof typeof FOTOS][] = [
  [/moqueca|peixe|sardinha|atum/, "peixe"],
  [/canja|galinha|frango/, "frango"],
  [/carne|patinho|hamburguer|hambúrguer|almondega|almôndega|quibe|escondidinho|strogonoff|estrogonofe|bife|feijoada/, "carne"],
  [/baiao|baião|arroz|feijao|feijão/, "arrozfeijao"],
  [/lentilha|grao de bico|grão de bico|homus|ensopado/, "legumes"],
  [/mingau/, "mingau"],
  [/papa|papinha|pure|purê|nhoque/, "pure"],
  [/iogurte/, "iogurte"],
  [/smoothie|vitamina|suco/, "smoothie"],
  [/panqueca/, "panqueca"],
  [/omelete|\bovo|ovos/, "ovos"],
  [/sopa|creme/, "sopa"],
  [/sanduiche|sanduíche|torrada|queijo quente|misto|wrap/, "sanduiche"],
  [/salada/, "salada"],
  [/cuscuz/, "cuscuz"],
  [/tapioca|pao|pão/, "pao"],
  [/bolo|muffin|barrinha|gelatina|chips|pipoca/, "bolo"],
  [/banana/, "banana"],
  [/fruta|abacaxi|melancia|uva|pera|manga|mamao|mamão|palitos de/, "fruta"],
  [/abobora|abóbora|abobrinha|cenoura|beterraba|legume|chuchu|mandioquinha|batata|inhame|risoto|lasanha|torta/, "legumes"],
];

const FALLBACK: Record<string, keyof typeof FOTOS> = {
  CAFE_DA_MANHA: "mingau",
  ALMOCO: "arrozfeijao",
  LANCHE: "fruta",
  JANTAR: "sopa",
};

function semAcento(t: string): string {
  return t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

function escolher(nome: string, tipo: string): string {
  const alvo = semAcento(nome);
  for (const [re, cat] of REGRAS) {
    // Regras já cobrem acento nos dois sentidos; testa contra o nome cru e sem acento.
    if (re.test(nome.toLowerCase()) || re.test(alvo)) return FOTOS[cat];
  }
  return FOTOS[FALLBACK[tipo] ?? "sopa"];
}

async function main() {
  const receitas = await db.recipe.findMany({ select: { id: true, nome: true, tipoRefeicao: true } });
  const cont: Record<string, number> = {};
  for (const r of receitas) {
    const url = escolher(r.nome, r.tipoRefeicao);
    await db.recipe.update({ where: { id: r.id }, data: { imagemUrl: url } });
    const cat = Object.entries(FOTOS).find(([, u]) => u === url)?.[0] ?? "?";
    cont[cat] = (cont[cat] ?? 0) + 1;
  }
  console.log(`Fotos atribuídas a ${receitas.length} receitas.`);
  console.log(cont);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
