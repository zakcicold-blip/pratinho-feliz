/**
 * Mapeamento entre os ingredientes do catálogo do Pratinho Feliz e as entradas da
 * TACO — Tabela Brasileira de Composição de Alimentos (NEPA/UNICAMP, 4ª edição).
 *
 * `tacoId` é o id do alimento no dataset em `prisma/data/taco.json`. Nenhum valor
 * nutricional é escrito à mão: a composição vem sempre da tabela.
 *
 * `gramasPorUnidade` é o peso médio de 1 unidade, usado para converter medidas como
 * "1 unidade" ou "2 fatias" em gramas. São aproximações de porção usual — servem
 * para estimativa, não para prescrição clínica.
 */

export type TacoMapEntry = {
  /** Id do alimento na TACO. `null` = sem correspondente na tabela. */
  tacoId: number | null;
  /** Peso médio de 1 unidade em gramas, quando aplicável. */
  gramasPorUnidade?: number;
  /** Motivo, quando não há correspondente na TACO. */
  nota?: string;
};

export const TACO_MAP: Record<string, TacoMapEntry> = {
  // ---- Hortifrúti ----
  Banana: { tacoId: 182, gramasPorUnidade: 70 }, // Banana, prata, crua
  Maçã: { tacoId: 221, gramasPorUnidade: 130 }, // Maçã, Argentina, com casca, crua
  Mamão: { tacoId: 226, gramasPorUnidade: 160 }, // Mamão, Papaia, cru
  Morango: { tacoId: 239, gramasPorUnidade: 12 }, // Morango, cru
  Manga: { tacoId: 231, gramasPorUnidade: 200 }, // Manga, Tommy Atkins, crua
  Laranja: { tacoId: 214, gramasPorUnidade: 130 }, // Laranja, pêra, crua
  Abacate: { tacoId: 163, gramasPorUnidade: 200 }, // Abacate, cru
  Cenoura: { tacoId: 109, gramasPorUnidade: 80 }, // Cenoura, cozida
  Pepino: { tacoId: 142, gramasPorUnidade: 130 }, // Pepino, cru
  Abobrinha: { tacoId: 70, gramasPorUnidade: 130 }, // Abobrinha, italiana, cozida
  Abóbora: { tacoId: 64, gramasPorUnidade: 200 }, // Abóbora, cabotian, cozida
  Batata: { tacoId: 91, gramasPorUnidade: 100 }, // Batata, inglesa, cozida
  "Batata-doce": { tacoId: 88, gramasPorUnidade: 130 }, // Batata, doce, cozida
  Mandioquinha: { tacoId: 86, gramasPorUnidade: 90 }, // Batata, baroa (= mandioquinha), cozida
  Mandioca: { tacoId: 129, gramasPorUnidade: 150 }, // Mandioca, cozida
  Brócolis: { tacoId: 100, gramasPorUnidade: 90 }, // Brócolis, cozido
  Espinafre: { tacoId: 120, gramasPorUnidade: 60 }, // Espinafre, Nova Zelândia, refogado
  Tomate: { tacoId: 157, gramasPorUnidade: 110 }, // Tomate, com semente, cru
  Cebola: { tacoId: 107, gramasPorUnidade: 100 }, // Cebola, crua
  Alho: { tacoId: 82, gramasPorUnidade: 3 }, // Alho, cru (1 dente)
  Beterraba: { tacoId: 97, gramasPorUnidade: 100 }, // Beterraba, cozida
  Couve: { tacoId: 116, gramasPorUnidade: 60 }, // Couve, manteiga, refogada
  Chuchu: { tacoId: 112, gramasPorUnidade: 160 }, // Chuchu, cozido
  "Milho verde": { tacoId: 45, gramasPorUnidade: 80 }, // Milho, verde, enlatado, drenado
  Ervilha: { tacoId: 560, gramasPorUnidade: 80 }, // Ervilha, enlatada, drenada
  Abacaxi: { tacoId: 164, gramasPorUnidade: 80 }, // Abacaxi, cru (1 fatia)
  Melancia: { tacoId: 235, gramasPorUnidade: 200 }, // Melancia, crua (1 fatia)
  Uva: { tacoId: 257, gramasPorUnidade: 8 }, // Uva, Rubi, crua
  Pera: { tacoId: 243, gramasPorUnidade: 130 }, // Pêra, Williams, crua

  // ---- Proteínas ----
  Frango: { tacoId: 408, gramasPorUnidade: 100 }, // Frango, peito, sem pele, cozido
  "Carne moída": { tacoId: 326, gramasPorUnidade: 100 }, // Carne, bovina, acém, moído, cozido
  "Filé de peixe": { tacoId: 301, gramasPorUnidade: 100 }, // Merluza, filé, assado
  Ovo: { tacoId: 488, gramasPorUnidade: 50 }, // Ovo, de galinha, inteiro, cozido
  "Peito de peru": { tacoId: 425, gramasPorUnidade: 15 }, // Peru, congelado, assado (1 fatia)

  // ---- Laticínios ----
  // ATENÇÃO: nesta extração da TACO, o leite de vaca fluido (ids 457 e 458) vem com "*"
  // em energia e proteína — a linha existe, mas esses dois valores não foram extraídos.
  // Cálcio e os demais estão presentes. Como não há substituto fiel na tabela (459 é leite
  // em pó, 454 é leite de cabra), o leite fica sem energia e é excluído do cálculo, que
  // então é exibido como "parcial". Preencher esses dois valores exige conferir a TACO
  // impressa — não são inventados aqui.
  Leite: { tacoId: 458, gramasPorUnidade: 200 }, // Leite, de vaca, integral
  Queijo: { tacoId: 463, gramasPorUnidade: 20 }, // Queijo, mozarela (1 fatia)
  "Iogurte natural": { tacoId: 448, gramasPorUnidade: 170 }, // Iogurte, natural (1 pote)
  Manteiga: { tacoId: 261, gramasPorUnidade: 5 }, // Manteiga, com sal (1 colher de chá)
  Requeijão: { tacoId: null, nota: "Sem correspondente direto na TACO 4a ed." },

  // ---- Mercearia ----
  Aveia: { tacoId: 7, gramasPorUnidade: 15 }, // Aveia, flocos, crua (1 colher de sopa)
  Arroz: { tacoId: 3, gramasPorUnidade: 150 }, // Arroz, tipo 1, cozido (1 xícara)
  Feijão: { tacoId: 561, gramasPorUnidade: 80 }, // Feijão, carioca, cozido (1 concha)
  Macarrão: { tacoId: 40, gramasPorUnidade: 80 }, // Macarrão, trigo, cru
  "Farinha de trigo": { tacoId: 35, gramasPorUnidade: 120 }, // Farinha, de trigo (1 xícara)
  "Farinha de milho": { tacoId: 33, gramasPorUnidade: 120 }, // Farinha, de milho, amarela
  Amendoim: { tacoId: 557, gramasPorUnidade: 15 }, // Amendoim, grão, cru
  Castanhas: { tacoId: 589, gramasPorUnidade: 5 }, // Castanha-do-Brasil, crua
  Azeite: { tacoId: 260, gramasPorUnidade: 8 }, // Azeite, de oliva, extra virgem (1 fio)
  "Molho de tomate": { tacoId: 159, gramasPorUnidade: 120 }, // Tomate, molho industrializado
  Gelatina: { tacoId: 515, gramasPorUnidade: 12 }, // Gelatina, sabores variados, pó
  Mel: { tacoId: null, nota: "Sem correspondente direto na TACO 4a ed." },
  "Pão de forma": { tacoId: 52, gramasPorUnidade: 25 }, // Pão, trigo, forma, integral (1 fatia)
  "Pão francês": { tacoId: 53, gramasPorUnidade: 50 }, // Pão, trigo, francês (1 unidade)
  Granola: { tacoId: null, nota: "Produto composto, varia muito entre marcas." },
  Canela: { tacoId: null, nota: "Especiaria — quantidade nutricionalmente irrelevante." },
  Linhaça: { tacoId: 594, gramasPorUnidade: 10 }, // Linhaça, semente
  Quinoa: { tacoId: null, nota: "Sem correspondente na TACO 4a ed." },
  Chia: { tacoId: null, nota: "Sem correspondente na TACO 4a ed." },
  "Coco ralado": { tacoId: 590, gramasPorUnidade: 8 }, // Coco, cru

  // ---- Outros ----
  "Goma de tapioca": { tacoId: null, nota: "TACO só traz tapioca já preparada com manteiga." },
  "Grão de bico": { tacoId: 575, gramasPorUnidade: 80 }, // Grão-de-bico, cru
  "Milho de pipoca": { tacoId: 61, gramasPorUnidade: 30 }, // Pipoca, com óleo de soja, sem sal
  Lentilha: { tacoId: 577, gramasPorUnidade: 80 }, // Lentilha, cozida

  // ---- Ampliacao do catalogo ----
  Berinjela: { tacoId: 95, gramasPorUnidade: 250 }, // Berinjela, cozida
  Vagem: { tacoId: 162, gramasPorUnidade: 8 }, // Vagem, crua
  Repolho: { tacoId: 149, gramasPorUnidade: 900 }, // Repolho, branco, cru
  Alface: { tacoId: 78, gramasPorUnidade: 8 }, // Alface, crespa, crua
  "Couve-flor": { tacoId: 118, gramasPorUnidade: 60 }, // Couve-flor, cozida
  Pimentão: { tacoId: 144, gramasPorUnidade: 120 }, // Pimentao, verde, cru
  Inhame: { tacoId: 126, gramasPorUnidade: 200 }, // Inhame, cru
  Goiaba: { tacoId: 200, gramasPorUnidade: 150 }, // Goiaba, vermelha, com casca, crua
  Melão: { tacoId: 236, gramasPorUnidade: 100 }, // Melao, cru
  Tangerina: { tacoId: 251, gramasPorUnidade: 120 }, // Tangerina, Ponca, crua
  Ameixa: { tacoId: 172, gramasPorUnidade: 60 }, // Ameixa, crua
  Kiwi: { tacoId: 207, gramasPorUnidade: 90 }, // Kiwi, cru
  "Atum em lata": { tacoId: 277, gramasPorUnidade: 120 }, // Atum, conserva em oleo
  Sardinha: { tacoId: 321, gramasPorUnidade: 80 }, // Sardinha, inteira, crua
  "Patinho bovino": { tacoId: 376, gramasPorUnidade: 120 }, // Carne, bovina, patinho, sem gordura, cru
  Ricota: { tacoId: 469, gramasPorUnidade: 30 }, // Queijo, ricota
  Gergelim: { tacoId: 593, gramasPorUnidade: 9 }, // Gergelim, semente
  "Polvilho doce": { tacoId: 146, gramasPorUnidade: 60 }, // Polvilho, doce
};

export const TACO_FONTE =
  "TACO — Tabela Brasileira de Composição de Alimentos (NEPA/UNICAMP, 4ª ed.)";
