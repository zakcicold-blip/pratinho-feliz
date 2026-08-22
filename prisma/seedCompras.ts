import { db } from "@/lib/db";

/**
 * Define como cada ingrediente é COMPRADO, para a lista de compras conseguir
 * dizer "5 abacates" em vez de "aparece 5x".
 *
 * Curado à mão porque `gramasPorUnidade` é a medida da receita, não a da
 * compra: 1 dente de alho tem 3 g, mas ninguém compra dente — compra cabeça.
 *
 * [unidadeCompra, gramasCompra, rotuloCompra]
 * - UNIDADE: conta itens inteiros. gramasCompra = peso de 1 item comprado.
 * - GRAMAS / ML: soma e formata (350 g, 1,2 kg, 1,5 L).
 */
type Regra = ["UNIDADE", number, string?] | ["GRAMAS"] | ["ML"];

const REGRAS: Record<string, Regra> = {
  // ---------- HORTIFRUTI ----------
  Abacate: ["UNIDADE", 200],
  Abacaxi: ["UNIDADE", 1500],
  Abobrinha: ["UNIDADE", 130],
  Abóbora: ["GRAMAS"],
  Alface: ["UNIDADE", 300, "pé"],
  Alho: ["UNIDADE", 50, "cabeça"],
  Ameixa: ["UNIDADE", 60],
  Banana: ["UNIDADE", 70],
  Batata: ["UNIDADE", 100],
  "Batata-doce": ["UNIDADE", 130],
  Berinjela: ["UNIDADE", 250],
  Beterraba: ["UNIDADE", 100],
  "Brócolis": ["UNIDADE", 400, "maço"],
  Cebola: ["UNIDADE", 100],
  Cenoura: ["UNIDADE", 80],
  Chuchu: ["UNIDADE", 160],
  Couve: ["UNIDADE", 300, "maço"],
  "Couve-flor": ["UNIDADE", 600],
  Ervilha: ["GRAMAS"],
  Espinafre: ["UNIDADE", 300, "maço"],
  Goiaba: ["UNIDADE", 150],
  Inhame: ["UNIDADE", 200],
  Kiwi: ["UNIDADE", 90],
  Laranja: ["UNIDADE", 130],
  "Mamão": ["UNIDADE", 500],
  Mandioca: ["GRAMAS"],
  Mandioquinha: ["UNIDADE", 90],
  Manga: ["UNIDADE", 200],
  "Maçã": ["UNIDADE", 130],
  Melancia: ["GRAMAS"],
  "Melão": ["UNIDADE", 1200],
  "Milho verde": ["UNIDADE", 200, "espiga"],
  Morango: ["GRAMAS"],
  Pepino: ["UNIDADE", 130],
  Pera: ["UNIDADE", 130],
  "Pimentão": ["UNIDADE", 120],
  Repolho: ["UNIDADE", 900],
  Tangerina: ["UNIDADE", 120],
  Tomate: ["UNIDADE", 110],
  Uva: ["GRAMAS"],
  Vagem: ["GRAMAS"],

  // ---------- LATICÍNIOS ----------
  "Iogurte natural": ["UNIDADE", 170, "pote"],
  Leite: ["ML"],
  Manteiga: ["GRAMAS"],
  Queijo: ["GRAMAS"],
  "Requeijão": ["UNIDADE", 200, "pote"],
  Ricota: ["GRAMAS"],

  // ---------- MERCEARIA ----------
  Amendoim: ["GRAMAS"],
  Arroz: ["GRAMAS"],
  Aveia: ["GRAMAS"],
  Azeite: ["ML"],
  Canela: ["GRAMAS"],
  Castanhas: ["GRAMAS"],
  Chia: ["GRAMAS"],
  "Coco ralado": ["GRAMAS"],
  "Farinha de milho": ["GRAMAS"],
  "Farinha de trigo": ["GRAMAS"],
  "Feijão": ["GRAMAS"],
  Gelatina: ["GRAMAS"],
  Gergelim: ["GRAMAS"],
  Granola: ["GRAMAS"],
  Lentilha: ["GRAMAS"],
  "Linhaça": ["GRAMAS"],
  "Macarrão": ["GRAMAS"],
  Mel: ["GRAMAS"],
  "Molho de tomate": ["UNIDADE", 340, "lata"],
  "Polvilho doce": ["GRAMAS"],
  "Pão de forma": ["UNIDADE", 500, "pacote"],
  "Pão francês": ["UNIDADE", 50],
  Quinoa: ["GRAMAS"],

  // ---------- OUTROS ----------
  "Goma de tapioca": ["GRAMAS"],
  "Grão de bico": ["GRAMAS"],
  "Milho de pipoca": ["GRAMAS"],

  // ---------- PROTEÍNA ----------
  "Atum em lata": ["UNIDADE", 120, "lata"],
  "Carne moída": ["GRAMAS"],
  "Filé de peixe": ["GRAMAS"],
  Frango: ["GRAMAS"],
  Ovo: ["UNIDADE", 50],
  "Patinho bovino": ["GRAMAS"],
  "Peito de peru": ["GRAMAS"],
  Sardinha: ["UNIDADE", 125, "lata"],
};

async function main() {
  const ingredientes = await db.ingredient.findMany({ select: { id: true, nome: true } });

  let atualizados = 0;
  const semRegra: string[] = [];

  for (const ing of ingredientes) {
    const regra = REGRAS[ing.nome];
    if (!regra) {
      semRegra.push(ing.nome);
      continue;
    }
    const [unidadeCompra, gramasCompra, rotuloCompra] =
      regra[0] === "UNIDADE" ? regra : ([regra[0], null, null] as const);

    await db.ingredient.update({
      where: { id: ing.id },
      data: {
        unidadeCompra,
        gramasCompra: gramasCompra ?? null,
        rotuloCompra: rotuloCompra ?? null,
      },
    });
    atualizados++;
  }

  const semRegraNoBanco = Object.keys(REGRAS).filter(
    (nome) => !ingredientes.some((i) => i.nome === nome)
  );

  console.log(`Ingredientes atualizados: ${atualizados}/${ingredientes.length}`);
  if (semRegra.length) console.log(`SEM REGRA (ficam em GRAMAS): ${semRegra.join(", ")}`);
  if (semRegraNoBanco.length)
    console.log(`Regra sem ingrediente correspondente: ${semRegraNoBanco.join(", ")}`);
}

main().finally(() => db.$disconnect());
