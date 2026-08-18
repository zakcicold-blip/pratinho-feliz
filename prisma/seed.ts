import { PrismaClient, TipoRefeicao } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

type IngredienteSeed = { nome: string; categoria: string };
type RecipeIngredienteSeed = { nome: string; quantidade: string };
type RecipeSeed = {
  nome: string;
  resumo: string;
  tipoRefeicao: TipoRefeicao;
  tempoPreparoMin: number;
  dificuldade: "Fácil" | "Média";
  rendimento: string;
  passos: string[];
  tags: string[];
  /**
   * Idade mínima explícita, em meses. Quando ausente, é derivada dos
   * ingredientes. Usada nas receitas de primeiros sólidos, que são preparadas
   * em consistência apropriada e por isso valem desde os 6 meses.
   */
  idadeMinimaMeses?: number;
  ingredientes: RecipeIngredienteSeed[];
};

const INGREDIENTES: IngredienteSeed[] = [
  { nome: "Banana", categoria: "HORTIFRUTI" },
  { nome: "Maçã", categoria: "HORTIFRUTI" },
  { nome: "Mamão", categoria: "HORTIFRUTI" },
  { nome: "Morango", categoria: "HORTIFRUTI" },
  { nome: "Manga", categoria: "HORTIFRUTI" },
  { nome: "Laranja", categoria: "HORTIFRUTI" },
  { nome: "Abacate", categoria: "HORTIFRUTI" },
  { nome: "Cenoura", categoria: "HORTIFRUTI" },
  { nome: "Pepino", categoria: "HORTIFRUTI" },
  { nome: "Abobrinha", categoria: "HORTIFRUTI" },
  { nome: "Abóbora", categoria: "HORTIFRUTI" },
  { nome: "Batata", categoria: "HORTIFRUTI" },
  { nome: "Batata-doce", categoria: "HORTIFRUTI" },
  { nome: "Mandioquinha", categoria: "HORTIFRUTI" },
  { nome: "Mandioca", categoria: "HORTIFRUTI" },
  { nome: "Brócolis", categoria: "HORTIFRUTI" },
  { nome: "Espinafre", categoria: "HORTIFRUTI" },
  { nome: "Tomate", categoria: "HORTIFRUTI" },
  { nome: "Cebola", categoria: "HORTIFRUTI" },
  { nome: "Alho", categoria: "HORTIFRUTI" },

  { nome: "Frango", categoria: "PROTEINA" },
  { nome: "Carne moída", categoria: "PROTEINA" },
  { nome: "Filé de peixe", categoria: "PROTEINA" },
  { nome: "Ovo", categoria: "PROTEINA" },
  { nome: "Peito de peru", categoria: "PROTEINA" },

  { nome: "Leite", categoria: "LATICINIOS" },
  { nome: "Queijo", categoria: "LATICINIOS" },
  { nome: "Requeijão", categoria: "LATICINIOS" },
  { nome: "Iogurte natural", categoria: "LATICINIOS" },
  { nome: "Manteiga", categoria: "LATICINIOS" },

  { nome: "Aveia", categoria: "MERCEARIA" },
  { nome: "Arroz", categoria: "MERCEARIA" },
  { nome: "Feijão", categoria: "MERCEARIA" },
  { nome: "Macarrão", categoria: "MERCEARIA" },
  { nome: "Farinha de trigo", categoria: "MERCEARIA" },
  { nome: "Farinha de milho", categoria: "MERCEARIA" },
  { nome: "Granola", categoria: "MERCEARIA" },
  { nome: "Castanhas", categoria: "MERCEARIA" },
  { nome: "Amendoim", categoria: "MERCEARIA" },
  { nome: "Azeite", categoria: "MERCEARIA" },
  { nome: "Molho de tomate", categoria: "MERCEARIA" },
  { nome: "Gelatina", categoria: "MERCEARIA" },
  { nome: "Canela", categoria: "MERCEARIA" },
  { nome: "Mel", categoria: "MERCEARIA" },
  { nome: "Pão de forma", categoria: "MERCEARIA" },
  { nome: "Pão francês", categoria: "MERCEARIA" },

  { nome: "Goma de tapioca", categoria: "OUTROS" },
  { nome: "Grão de bico", categoria: "OUTROS" },
  { nome: "Milho de pipoca", categoria: "OUTROS" },

  { nome: "Beterraba", categoria: "HORTIFRUTI" },
  { nome: "Couve", categoria: "HORTIFRUTI" },
  { nome: "Chuchu", categoria: "HORTIFRUTI" },
  { nome: "Milho verde", categoria: "HORTIFRUTI" },
  { nome: "Ervilha", categoria: "HORTIFRUTI" },
  { nome: "Abacaxi", categoria: "HORTIFRUTI" },
  { nome: "Melancia", categoria: "HORTIFRUTI" },
  { nome: "Uva", categoria: "HORTIFRUTI" },
  { nome: "Pera", categoria: "HORTIFRUTI" },
  { nome: "Lentilha", categoria: "MERCEARIA" },
  { nome: "Quinoa", categoria: "MERCEARIA" },
  { nome: "Chia", categoria: "MERCEARIA" },
  { nome: "Linhaça", categoria: "MERCEARIA" },
  { nome: "Coco ralado", categoria: "MERCEARIA" },

  // Itens comuns da feira brasileira, para enriquecer despensa,
  // preferencias e lista de compras.
  { nome: "Berinjela", categoria: "HORTIFRUTI" },
  { nome: "Vagem", categoria: "HORTIFRUTI" },
  { nome: "Repolho", categoria: "HORTIFRUTI" },
  { nome: "Alface", categoria: "HORTIFRUTI" },
  { nome: "Couve-flor", categoria: "HORTIFRUTI" },
  { nome: "Pimentão", categoria: "HORTIFRUTI" },
  { nome: "Inhame", categoria: "HORTIFRUTI" },
  { nome: "Goiaba", categoria: "HORTIFRUTI" },
  { nome: "Melão", categoria: "HORTIFRUTI" },
  { nome: "Tangerina", categoria: "HORTIFRUTI" },
  { nome: "Ameixa", categoria: "HORTIFRUTI" },
  { nome: "Kiwi", categoria: "HORTIFRUTI" },
  { nome: "Atum em lata", categoria: "PROTEINA" },
  { nome: "Sardinha", categoria: "PROTEINA" },
  { nome: "Patinho bovino", categoria: "PROTEINA" },
  { nome: "Ricota", categoria: "LATICINIOS" },
  { nome: "Gergelim", categoria: "MERCEARIA" },
  { nome: "Polvilho doce", categoria: "MERCEARIA" },
];

const ALERGENOS_POR_INGREDIENTE: Record<string, string> = {
  Leite: "leite",
  Queijo: "leite",
  Requeijão: "leite",
  "Iogurte natural": "leite",
  Manteiga: "leite",
  Ovo: "ovo",
  "Filé de peixe": "peixe",
  Amendoim: "amendoim",
  Castanhas: "castanhas",
  Mel: "mel",
  "Farinha de trigo": "gluten",
  Macarrão: "gluten",
  "Pão de forma": "gluten",
  "Pão francês": "gluten",
};

function deriveRestricoes(ingredientes: RecipeIngredienteSeed[]): string[] {
  const tags = new Set<string>();
  for (const ing of ingredientes) {
    const alergeno = ALERGENOS_POR_INGREDIENTE[ing.nome];
    if (alergeno) tags.add(alergeno);
  }
  return Array.from(tags);
}

/**
 * Idade mínima recomendada segue diretrizes amplamente aceitas em alimentação infantil:
 * mel é contraindicado antes dos 12 meses (risco de botulismo infantil) e alimentos duros/
 * inteiros como amendoim e castanhas são risco de engasgo antes dos 3 anos quando não moídos.
 */
function deriveIdadeMinimaMeses(receita: RecipeSeed): number {
  const nomes = new Set(receita.ingredientes.map((i) => i.nome));
  // Regras de seguranca vem primeiro e nao podem ser afrouxadas pelo seed:
  // mel antes de 1 ano (botulismo infantil) e oleaginosas inteiras antes dos
  // 3 anos (engasgo).
  if (nomes.has("Mel")) return 12;
  if (nomes.has("Amendoim") || nomes.has("Castanhas")) return 36;
  // Pipoca: formato e textura fazem dela um dos maiores riscos de engasgo.
  // Sociedades de pediatria recomendam evitar antes dos 4 anos.
  if (nomes.has("Milho de pipoca")) return 48;
  if (receita.idadeMinimaMeses !== undefined) return receita.idadeMinimaMeses;
  return 8;
}

// Equipamentos que a receita realmente exige, lidos do modo de preparo.
// Fogao e panela sao pressupostos e nao entram aqui.
const EQUIPAMENTOS_DETECTAR: { id: string; palavras: string[] }[] = [
  // Palavras ja sem acento e comparadas com limite de palavra, para "asse"/"assar"
  // nao casarem dentro de "amasse"/"amassar".
  { id: "FORNO", palavras: ["forno", "assadeira", "assar", "asse", "assados", "gratine", "gratinar"] },
  { id: "AIR_FRYER", palavras: ["air fryer", "airfryer"] },
  { id: "LIQUIDIFICADOR", palavras: ["liquidificador"] },
  { id: "BATEDEIRA", palavras: ["batedeira"] },
  { id: "MIXER", palavras: ["mixer", "processador"] },
  { id: "MICRO_ONDAS", palavras: ["micro-ondas", "microondas"] },
  { id: "PANELA_PRESSAO", palavras: ["panela de pressao"] },
  { id: "SANDUICHEIRA", palavras: ["sanduicheira", "grill"] },
];

function semAcento(t: string): string {
  return t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

function deriveEquipamentos(receita: RecipeSeed): string {
  const texto = semAcento(receita.passos.join(" ") + " " + receita.resumo);
  // \b em volta do termo evita casar dentro de outra palavra
  // (ex.: "asse" em "amasse", "assar" em "amassar").
  const achados = EQUIPAMENTOS_DETECTAR.filter((eq) =>
    eq.palavras.some((pal) => {
      const p = semAcento(pal).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      return new RegExp(String.raw`\b` + p + String.raw`\b`).test(texto);
    })
  ).map((eq) => eq.id);
  return achados.join(",");
}

const FONTE_PROTEINA = new Set([
  "Frango",
  "Carne moída",
  "Filé de peixe",
  "Ovo",
  "Peito de peru",
  "Feijão",
  "Grão de bico",
  "Lentilha",
  "Quinoa",
]);
const FONTE_FERRO = new Set([
  "Carne moída",
  "Frango",
  "Feijão",
  "Espinafre",
  "Filé de peixe",
  "Lentilha",
  "Couve",
]);
const FONTE_CALCIO = new Set(["Leite", "Queijo", "Iogurte natural", "Requeijão", "Manteiga"]);
const FONTE_FIBRA = new Set([
  "Aveia",
  "Feijão",
  "Brócolis",
  "Abóbora",
  "Batata-doce",
  "Espinafre",
  "Granola",
  "Grão de bico",
  "Lentilha",
  "Chia",
  "Linhaça",
]);
const FONTE_VITAMINA_C = new Set([
  "Laranja",
  "Morango",
  "Manga",
  "Tomate",
  "Brócolis",
  "Mamão",
  "Abacaxi",
]);

/**
 * Notas curtas baseadas em grupos alimentares presentes na receita — sem inventar valores
 * precisos de calorias ou macronutrientes, apenas destaques nutricionais defensáveis.
 */
function deriveNutricao(ingredientes: RecipeIngredienteSeed[]): string {
  const nomes = new Set(ingredientes.map((i) => i.nome));
  const notas: string[] = [];

  const temFerro = [...nomes].some((n) => FONTE_FERRO.has(n));
  const temVitaminaC = [...nomes].some((n) => FONTE_VITAMINA_C.has(n));

  if (temFerro && temVitaminaC) {
    notas.push("combina ferro com vitamina C, que ajuda na absorção");
  } else if (temFerro) {
    notas.push("fonte de ferro");
  }

  if ([...nomes].some((n) => FONTE_PROTEINA.has(n))) notas.push("boa fonte de proteína");
  if ([...nomes].some((n) => FONTE_CALCIO.has(n))) notas.push("fonte de cálcio");
  if ([...nomes].some((n) => FONTE_FIBRA.has(n))) notas.push("rica em fibras");

  if (notas.length === 0) return "Refeição leve e de fácil digestão.";

  const [primeira, segunda] = notas;
  const texto = primeira.charAt(0).toUpperCase() + primeira.slice(1);
  return segunda ? `${texto} e ${segunda}.` : `${texto}.`;
}

const RECEITAS: RecipeSeed[] = [
  // CAFÉ DA MANHÃ
  {
    nome: "Mingau de aveia com banana",
    resumo: "Café quentinho, cremoso e rápido de fazer.",
    tipoRefeicao: TipoRefeicao.CAFE_DA_MANHA,
    tempoPreparoMin: 10,
    dificuldade: "Fácil",
    rendimento: "1 porção",
    passos: [
      "Aqueça o leite em fogo baixo.",
      "Adicione a aveia e mexa por 3 minutos até engrossar.",
      "Sirva com banana fatiada e uma pitada de canela.",
    ],
    tags: ["doce", "pratico", "vegetariano"],
    ingredientes: [
      { nome: "Aveia", quantidade: "3 colheres de sopa" },
      { nome: "Leite", quantidade: "200 ml" },
      { nome: "Banana", quantidade: "1 unidade" },
      { nome: "Canela", quantidade: "a gosto" },
    ],
  },
  {
    nome: "Pão com queijo e mamão",
    resumo: "Combinação clássica, pronta em minutos.",
    tipoRefeicao: TipoRefeicao.CAFE_DA_MANHA,
    tempoPreparoMin: 8,
    dificuldade: "Fácil",
    rendimento: "1 porção",
    passos: ["Corte o pão ao meio.", "Recheie com queijo.", "Sirva com mamão picado."],
    tags: ["pratico", "vegetariano"],
    ingredientes: [
      { nome: "Pão francês", quantidade: "1 unidade" },
      { nome: "Queijo", quantidade: "2 fatias" },
      { nome: "Mamão", quantidade: "1 fatia" },
    ],
  },
  {
    nome: "Vitamina de banana com aveia",
    resumo: "Bebida nutritiva para começar o dia.",
    tipoRefeicao: TipoRefeicao.CAFE_DA_MANHA,
    tempoPreparoMin: 5,
    dificuldade: "Fácil",
    rendimento: "1 copo",
    passos: ["Bata todos os ingredientes no liquidificador.", "Sirva gelado."],
    tags: ["doce", "pratico", "vegetariano"],
    ingredientes: [
      { nome: "Banana", quantidade: "1 unidade" },
      { nome: "Leite", quantidade: "200 ml" },
      { nome: "Aveia", quantidade: "1 colher de sopa" },
    ],
  },
  {
    nome: "Panqueca de banana",
    resumo: "Só dois ingredientes, doçura natural.",
    tipoRefeicao: TipoRefeicao.CAFE_DA_MANHA,
    tempoPreparoMin: 15,
    dificuldade: "Média",
    rendimento: "4 panquecas",
    passos: [
      "Amasse a banana com o ovo.",
      "Misture a aveia até formar uma massa.",
      "Frite em fogo baixo dos dois lados.",
    ],
    tags: ["doce", "vegetariano"],
    ingredientes: [
      { nome: "Banana", quantidade: "1 unidade" },
      { nome: "Ovo", quantidade: "1 unidade" },
      { nome: "Aveia", quantidade: "2 colheres de sopa" },
    ],
  },
  {
    nome: "Omelete simples",
    resumo: "Proteína rápida para qualquer manhã.",
    tipoRefeicao: TipoRefeicao.CAFE_DA_MANHA,
    tempoPreparoMin: 10,
    dificuldade: "Fácil",
    rendimento: "1 porção",
    passos: ["Bata os ovos.", "Tempere levemente.", "Frite em fogo baixo até dourar."],
    tags: ["pratico", "proteina"],
    ingredientes: [
      { nome: "Ovo", quantidade: "2 unidades" },
      { nome: "Azeite", quantidade: "1 fio" },
    ],
  },
  {
    nome: "Cuscuz com ovo",
    resumo: "Clássico nordestino, fácil de adaptar.",
    tipoRefeicao: TipoRefeicao.CAFE_DA_MANHA,
    tempoPreparoMin: 15,
    dificuldade: "Fácil",
    rendimento: "2 porções",
    passos: [
      "Hidrate a farinha de milho com água morna.",
      "Cozinhe no vapor por 10 minutos.",
      "Sirva com ovo mexido.",
    ],
    tags: ["pratico"],
    ingredientes: [
      { nome: "Farinha de milho", quantidade: "1 xícara" },
      { nome: "Ovo", quantidade: "1 unidade" },
    ],
  },
  {
    nome: "Iogurte com granola e morango",
    resumo: "Fresco, crocante e sem precisar do fogão.",
    tipoRefeicao: TipoRefeicao.CAFE_DA_MANHA,
    tempoPreparoMin: 5,
    dificuldade: "Fácil",
    rendimento: "1 porção",
    passos: ["Coloque o iogurte na tigela.", "Adicione a granola.", "Finalize com morango picado."],
    tags: ["pratico", "vegetariano"],
    ingredientes: [
      { nome: "Iogurte natural", quantidade: "1 pote" },
      { nome: "Granola", quantidade: "2 colheres de sopa" },
      { nome: "Morango", quantidade: "4 unidades" },
    ],
  },
  {
    nome: "Tapioca com queijo",
    resumo: "Sem glúten e rápida de preparar.",
    tipoRefeicao: TipoRefeicao.CAFE_DA_MANHA,
    tempoPreparoMin: 10,
    dificuldade: "Fácil",
    rendimento: "1 unidade",
    passos: [
      "Peneire a goma de tapioca na frigideira quente.",
      "Deixe firmar e vire.",
      "Recheie com queijo e dobre.",
    ],
    tags: ["pratico", "sem_gluten"],
    ingredientes: [
      { nome: "Goma de tapioca", quantidade: "3 colheres de sopa" },
      { nome: "Queijo", quantidade: "2 fatias" },
    ],
  },
  {
    nome: "Mingau de milho",
    resumo: "Sabor caseiro que aquece o café da manhã.",
    tipoRefeicao: TipoRefeicao.CAFE_DA_MANHA,
    tempoPreparoMin: 15,
    dificuldade: "Fácil",
    rendimento: "2 porções",
    passos: [
      "Dissolva a farinha de milho em um pouco de leite frio.",
      "Leve ao fogo com o restante do leite.",
      "Mexa até engrossar.",
    ],
    tags: ["doce", "vegetariano"],
    ingredientes: [
      { nome: "Farinha de milho", quantidade: "3 colheres de sopa" },
      { nome: "Leite", quantidade: "300 ml" },
    ],
  },
  {
    nome: "Bolo de banana caseiro",
    resumo: "Ótimo para render o café da semana toda.",
    tipoRefeicao: TipoRefeicao.CAFE_DA_MANHA,
    tempoPreparoMin: 40,
    dificuldade: "Média",
    rendimento: "8 fatias",
    passos: [
      "Bata a banana com o ovo e o leite.",
      "Misture a farinha aos poucos.",
      "Asse por 30 minutos.",
    ],
    tags: ["doce", "rende_bem"],
    ingredientes: [
      { nome: "Banana", quantidade: "3 unidades" },
      { nome: "Ovo", quantidade: "2 unidades" },
      { nome: "Leite", quantidade: "100 ml" },
      { nome: "Farinha de trigo", quantidade: "2 xícaras" },
    ],
  },
  {
    nome: "Sanduíche de queijo quente",
    resumo: "Favorito garantido, pronto na frigideira.",
    tipoRefeicao: TipoRefeicao.CAFE_DA_MANHA,
    tempoPreparoMin: 8,
    dificuldade: "Fácil",
    rendimento: "1 porção",
    passos: ["Monte o sanduíche com o queijo.", "Doure na frigideira com manteiga dos dois lados."],
    tags: ["pratico", "vegetariano"],
    ingredientes: [
      { nome: "Pão de forma", quantidade: "2 fatias" },
      { nome: "Queijo", quantidade: "2 fatias" },
      { nome: "Manteiga", quantidade: "1 colher de chá" },
    ],
  },
  {
    nome: "Vitamina de manga",
    resumo: "Refrescante e rica em vitamina A.",
    tipoRefeicao: TipoRefeicao.CAFE_DA_MANHA,
    tempoPreparoMin: 5,
    dificuldade: "Fácil",
    rendimento: "1 copo",
    passos: ["Bata a manga com o leite.", "Sirva gelado."],
    tags: ["doce", "pratico"],
    ingredientes: [
      { nome: "Manga", quantidade: "1 unidade" },
      { nome: "Leite", quantidade: "200 ml" },
    ],
  },
  {
    nome: "Papinha de maçã com canela",
    resumo: "Doce natural, ótimo para os pequenos.",
    tipoRefeicao: TipoRefeicao.CAFE_DA_MANHA,
    tempoPreparoMin: 15,
    dificuldade: "Fácil",
    rendimento: "1 porção",
    passos: [
      "Cozinhe a maçã picada até amolecer.",
      "Amasse com um garfo.",
      "Finalize com canela.",
    ],
    tags: ["doce", "vegetariano"],
    ingredientes: [
      { nome: "Maçã", quantidade: "1 unidade" },
      { nome: "Canela", quantidade: "a gosto" },
    ],
  },

  // ALMOÇO
  {
    nome: "Arroz, feijão e frango desfiado",
    resumo: "O trio clássico da rotina brasileira.",
    tipoRefeicao: TipoRefeicao.ALMOCO,
    tempoPreparoMin: 35,
    dificuldade: "Média",
    rendimento: "2 porções",
    passos: [
      "Cozinhe o arroz e o feijão separadamente.",
      "Cozinhe o frango e desfie.",
      "Monte o prato com os três juntos.",
    ],
    tags: ["classico", "proteina"],
    ingredientes: [
      { nome: "Arroz", quantidade: "1 xícara" },
      { nome: "Feijão", quantidade: "1 concha" },
      { nome: "Frango", quantidade: "150 g" },
    ],
  },
  {
    nome: "Purê de batata com carne moída",
    resumo: "Cremoso e fácil de aceitar.",
    tipoRefeicao: TipoRefeicao.ALMOCO,
    tempoPreparoMin: 30,
    dificuldade: "Média",
    rendimento: "2 porções",
    passos: [
      "Cozinhe e amasse a batata com leite e manteiga.",
      "Refogue a carne moída com cebola e tomate.",
      "Sirva o purê com a carne por cima.",
    ],
    tags: ["cremoso", "proteina"],
    ingredientes: [
      { nome: "Batata", quantidade: "3 unidades" },
      { nome: "Leite", quantidade: "50 ml" },
      { nome: "Manteiga", quantidade: "1 colher de sopa" },
      { nome: "Carne moída", quantidade: "150 g" },
      { nome: "Cebola", quantidade: "1/2 unidade" },
      { nome: "Tomate", quantidade: "1 unidade" },
    ],
  },
  {
    nome: "Macarrão ao sugo com carne moída",
    resumo: "Sempre bem aceito pelas crianças.",
    tipoRefeicao: TipoRefeicao.ALMOCO,
    tempoPreparoMin: 25,
    dificuldade: "Fácil",
    rendimento: "2 porções",
    passos: [
      "Cozinhe o macarrão.",
      "Refogue a carne moída com molho de tomate.",
      "Misture tudo e sirva.",
    ],
    tags: ["classico", "proteina"],
    ingredientes: [
      { nome: "Macarrão", quantidade: "150 g" },
      { nome: "Carne moída", quantidade: "150 g" },
      { nome: "Molho de tomate", quantidade: "1/2 xícara" },
    ],
  },
  {
    nome: "Peixe grelhado com purê de mandioquinha",
    resumo: "Leve e rico em ômega-3.",
    tipoRefeicao: TipoRefeicao.ALMOCO,
    tempoPreparoMin: 30,
    dificuldade: "Média",
    rendimento: "2 porções",
    passos: [
      "Grelhe o filé de peixe com azeite.",
      "Cozinhe e amasse a mandioquinha.",
      "Sirva juntos.",
    ],
    tags: ["leve", "proteina"],
    ingredientes: [
      { nome: "Filé de peixe", quantidade: "150 g" },
      { nome: "Mandioquinha", quantidade: "2 unidades" },
      { nome: "Azeite", quantidade: "1 fio" },
    ],
  },
  {
    nome: "Strogonoff de frango light",
    resumo: "Cremoso sem exagerar nos temperos.",
    tipoRefeicao: TipoRefeicao.ALMOCO,
    tempoPreparoMin: 25,
    dificuldade: "Média",
    rendimento: "2 porções",
    passos: [
      "Refogue o frango em cubos com cebola e alho.",
      "Adicione o molho de tomate e o leite aos poucos.",
      "Sirva com arroz.",
    ],
    tags: ["cremoso", "proteina"],
    ingredientes: [
      { nome: "Frango", quantidade: "150 g" },
      { nome: "Cebola", quantidade: "1/2 unidade" },
      { nome: "Alho", quantidade: "1 dente" },
      { nome: "Molho de tomate", quantidade: "3 colheres de sopa" },
      { nome: "Leite", quantidade: "50 ml" },
      { nome: "Arroz", quantidade: "1 xícara" },
    ],
  },
  {
    nome: "Risoto de abóbora com frango",
    resumo: "Cremoso, doce e nutritivo.",
    tipoRefeicao: TipoRefeicao.ALMOCO,
    tempoPreparoMin: 35,
    dificuldade: "Média",
    rendimento: "2 porções",
    passos: [
      "Refogue o arroz com cebola.",
      "Adicione a abóbora em cubos e caldo aos poucos.",
      "Misture o frango desfiado no final.",
    ],
    tags: ["cremoso", "proteina"],
    ingredientes: [
      { nome: "Arroz", quantidade: "1 xícara" },
      { nome: "Abóbora", quantidade: "1 xícara" },
      { nome: "Cebola", quantidade: "1/2 unidade" },
      { nome: "Frango", quantidade: "150 g" },
    ],
  },
  {
    nome: "Almôndegas com molho de tomate e arroz",
    resumo: "Formato divertido que agrada os pequenos.",
    tipoRefeicao: TipoRefeicao.ALMOCO,
    tempoPreparoMin: 30,
    dificuldade: "Média",
    rendimento: "2 porções",
    passos: [
      "Modele bolinhas com a carne moída temperada.",
      "Cozinhe no molho de tomate por 15 minutos.",
      "Sirva com arroz.",
    ],
    tags: ["divertido", "proteina"],
    ingredientes: [
      { nome: "Carne moída", quantidade: "200 g" },
      { nome: "Molho de tomate", quantidade: "1/2 xícara" },
      { nome: "Arroz", quantidade: "1 xícara" },
    ],
  },
  {
    nome: "Peito de frango grelhado com legumes",
    resumo: "Simples, colorido e equilibrado.",
    tipoRefeicao: TipoRefeicao.ALMOCO,
    tempoPreparoMin: 25,
    dificuldade: "Fácil",
    rendimento: "2 porções",
    passos: [
      "Grelhe o frango temperado.",
      "Cozinhe a cenoura e o brócolis no vapor.",
      "Sirva juntos.",
    ],
    tags: ["leve", "proteina"],
    ingredientes: [
      { nome: "Frango", quantidade: "150 g" },
      { nome: "Cenoura", quantidade: "1 unidade" },
      { nome: "Brócolis", quantidade: "1 xícara" },
    ],
  },
  {
    nome: "Arroz de forno com legumes",
    resumo: "Ótimo para aproveitar o que tem na geladeira.",
    tipoRefeicao: TipoRefeicao.ALMOCO,
    tempoPreparoMin: 40,
    dificuldade: "Média",
    rendimento: "3 porções",
    passos: [
      "Misture o arroz cozido com legumes picados e queijo.",
      "Leve ao forno até gratinar.",
    ],
    tags: ["rende_bem", "vegetariano"],
    ingredientes: [
      { nome: "Arroz", quantidade: "2 xícaras" },
      { nome: "Cenoura", quantidade: "1 unidade" },
      { nome: "Abobrinha", quantidade: "1 unidade" },
      { nome: "Queijo", quantidade: "1 xícara" },
    ],
  },
  {
    nome: "Escondidinho de carne com mandioca",
    resumo: "Comfort food que some do prato rapidinho.",
    tipoRefeicao: TipoRefeicao.ALMOCO,
    tempoPreparoMin: 45,
    dificuldade: "Média",
    rendimento: "3 porções",
    passos: [
      "Cozinhe e amasse a mandioca com leite e manteiga.",
      "Refogue a carne moída.",
      "Monte camadas e leve ao forno para gratinar.",
    ],
    tags: ["cremoso", "proteina"],
    ingredientes: [
      { nome: "Mandioca", quantidade: "500 g" },
      { nome: "Leite", quantidade: "100 ml" },
      { nome: "Manteiga", quantidade: "1 colher de sopa" },
      { nome: "Carne moída", quantidade: "200 g" },
      { nome: "Queijo", quantidade: "1/2 xícara" },
    ],
  },
  {
    nome: "Lasanha de abobrinha",
    resumo: "Versão mais leve do prato favorito.",
    tipoRefeicao: TipoRefeicao.ALMOCO,
    tempoPreparoMin: 40,
    dificuldade: "Média",
    rendimento: "3 porções",
    passos: [
      "Fatie a abobrinha finamente para substituir a massa.",
      "Monte camadas com carne moída, molho e queijo.",
      "Leve ao forno por 25 minutos.",
    ],
    tags: ["vegetais_escondidos", "proteina"],
    ingredientes: [
      { nome: "Abobrinha", quantidade: "2 unidades" },
      { nome: "Carne moída", quantidade: "200 g" },
      { nome: "Molho de tomate", quantidade: "1 xícara" },
      { nome: "Queijo", quantidade: "1 xícara" },
    ],
  },
  {
    nome: "Filé de peixe com purê de batata-doce",
    resumo: "Combinação leve e doce natural.",
    tipoRefeicao: TipoRefeicao.ALMOCO,
    tempoPreparoMin: 30,
    dificuldade: "Média",
    rendimento: "2 porções",
    passos: [
      "Cozinhe e amasse a batata-doce.",
      "Grelhe o filé de peixe temperado.",
      "Sirva juntos.",
    ],
    tags: ["leve", "proteina"],
    ingredientes: [
      { nome: "Filé de peixe", quantidade: "150 g" },
      { nome: "Batata-doce", quantidade: "2 unidades" },
    ],
  },
  {
    nome: "Panqueca de carne",
    resumo: "Recheio saboroso em uma massa macia.",
    tipoRefeicao: TipoRefeicao.ALMOCO,
    tempoPreparoMin: 35,
    dificuldade: "Média",
    rendimento: "6 unidades",
    passos: [
      "Prepare a massa com ovo, leite e farinha.",
      "Recheie com a carne moída refogada.",
      "Cubra com molho de tomate e leve ao forno para gratinar.",
    ],
    tags: ["proteina"],
    ingredientes: [
      { nome: "Ovo", quantidade: "1 unidade" },
      { nome: "Leite", quantidade: "150 ml" },
      { nome: "Farinha de trigo", quantidade: "1 xícara" },
      { nome: "Carne moída", quantidade: "150 g" },
      { nome: "Molho de tomate", quantidade: "1/2 xícara" },
    ],
  },

  // LANCHE
  {
    nome: "Banana amassada com aveia",
    resumo: "Doce natural, pronto em 2 minutos.",
    tipoRefeicao: TipoRefeicao.LANCHE,
    tempoPreparoMin: 5,
    dificuldade: "Fácil",
    rendimento: "1 porção",
    passos: ["Amasse a banana.", "Misture a aveia por cima."],
    tags: ["doce", "pratico"],
    ingredientes: [
      { nome: "Banana", quantidade: "1 unidade" },
      { nome: "Aveia", quantidade: "1 colher de sopa" },
    ],
  },
  {
    nome: "Sanduíche natural de peito de peru",
    resumo: "Leve e fácil de levar para a escola.",
    tipoRefeicao: TipoRefeicao.LANCHE,
    tempoPreparoMin: 8,
    dificuldade: "Fácil",
    rendimento: "1 porção",
    passos: ["Monte o sanduíche com o peito de peru e o queijo."],
    tags: ["pratico", "leve"],
    ingredientes: [
      { nome: "Pão de forma", quantidade: "2 fatias" },
      { nome: "Peito de peru", quantidade: "2 fatias" },
      { nome: "Queijo", quantidade: "1 fatia" },
    ],
  },
  {
    nome: "Palitinhos de cenoura e pepino com homus",
    resumo: "Crocante, colorido e fácil de segurar.",
    tipoRefeicao: TipoRefeicao.LANCHE,
    tempoPreparoMin: 10,
    dificuldade: "Fácil",
    rendimento: "1 porção",
    passos: ["Corte a cenoura e o pepino em palitos.", "Sirva com o homus para molhar."],
    tags: ["cru", "vegetariano"],
    ingredientes: [
      { nome: "Cenoura", quantidade: "1 unidade" },
      { nome: "Pepino", quantidade: "1 unidade" },
      { nome: "Grão de bico", quantidade: "1/2 xícara (homus)" },
    ],
  },
  {
    nome: "Frutas picadas coloridas",
    resumo: "Salada de frutas simples e visual.",
    tipoRefeicao: TipoRefeicao.LANCHE,
    tempoPreparoMin: 10,
    dificuldade: "Fácil",
    rendimento: "1 porção",
    passos: ["Pique as frutas em cubos.", "Misture em uma tigela."],
    tags: ["cru", "doce"],
    ingredientes: [
      { nome: "Banana", quantidade: "1/2 unidade" },
      { nome: "Maçã", quantidade: "1/2 unidade" },
      { nome: "Morango", quantidade: "3 unidades" },
    ],
  },
  {
    nome: "Bolinho de maçã e cenoura",
    resumo: "Uma forma gostosa de incluir vegetais.",
    tipoRefeicao: TipoRefeicao.LANCHE,
    tempoPreparoMin: 35,
    dificuldade: "Média",
    rendimento: "12 bolinhos",
    passos: [
      "Rale a maçã e a cenoura.",
      "Misture com ovo, farinha e um fio de mel.",
      "Asse em forminhas por 20 minutos.",
    ],
    tags: ["vegetais_escondidos", "rende_bem"],
    ingredientes: [
      { nome: "Maçã", quantidade: "1 unidade" },
      { nome: "Cenoura", quantidade: "1 unidade" },
      { nome: "Ovo", quantidade: "2 unidades" },
      { nome: "Farinha de trigo", quantidade: "1 xícara" },
      { nome: "Mel", quantidade: "1 colher de sopa" },
    ],
  },
  {
    nome: "Iogurte natural com frutas",
    resumo: "Fresco e cheio de textura.",
    tipoRefeicao: TipoRefeicao.LANCHE,
    tempoPreparoMin: 5,
    dificuldade: "Fácil",
    rendimento: "1 porção",
    passos: ["Misture o iogurte com as frutas picadas."],
    tags: ["pratico", "vegetariano"],
    ingredientes: [
      { nome: "Iogurte natural", quantidade: "1 pote" },
      { nome: "Manga", quantidade: "1/2 unidade" },
    ],
  },
  {
    nome: "Pipoca caseira",
    resumo: "Lanche divertido e crocante.",
    tipoRefeicao: TipoRefeicao.LANCHE,
    tempoPreparoMin: 10,
    dificuldade: "Fácil",
    rendimento: "1 tigela",
    passos: ["Estoure o milho na panela com um fio de azeite.", "Tempere levemente."],
    tags: ["divertido", "pratico"],
    ingredientes: [
      { nome: "Milho de pipoca", quantidade: "1/2 xícara" },
      { nome: "Azeite", quantidade: "1 fio" },
    ],
  },
  {
    nome: "Barrinha caseira de banana e aveia",
    resumo: "Ótima para render vários dias.",
    tipoRefeicao: TipoRefeicao.LANCHE,
    tempoPreparoMin: 30,
    dificuldade: "Média",
    rendimento: "8 barrinhas",
    passos: [
      "Amasse a banana e misture com a aveia.",
      "Espalhe em uma forma.",
      "Asse por 20 minutos e corte em barras.",
    ],
    tags: ["rende_bem", "doce"],
    ingredientes: [
      { nome: "Banana", quantidade: "2 unidades" },
      { nome: "Aveia", quantidade: "1 xícara" },
    ],
  },
  {
    nome: "Suco natural de laranja",
    resumo: "Vitamina C fresquinha.",
    tipoRefeicao: TipoRefeicao.LANCHE,
    tempoPreparoMin: 5,
    dificuldade: "Fácil",
    rendimento: "1 copo",
    passos: ["Esprema as laranjas.", "Sirva na hora."],
    tags: ["pratico", "cru"],
    ingredientes: [{ nome: "Laranja", quantidade: "3 unidades" }],
  },
  {
    nome: "Torrada com abacate amassado",
    resumo: "Cremoso e rico em gorduras boas.",
    tipoRefeicao: TipoRefeicao.LANCHE,
    tempoPreparoMin: 8,
    dificuldade: "Fácil",
    rendimento: "1 porção",
    passos: ["Torre o pão.", "Amasse o abacate por cima."],
    tags: ["pratico", "vegetariano"],
    ingredientes: [
      { nome: "Pão de forma", quantidade: "1 fatia" },
      { nome: "Abacate", quantidade: "1/4 unidade" },
    ],
  },
  {
    nome: "Gelatina caseira de frutas",
    resumo: "Refrescante e com pedacinhos de fruta de verdade.",
    tipoRefeicao: TipoRefeicao.LANCHE,
    tempoPreparoMin: 15,
    dificuldade: "Fácil",
    rendimento: "4 porções",
    passos: ["Prepare a gelatina conforme a embalagem.", "Adicione fruta picada.", "Leve à geladeira."],
    tags: ["doce", "refrescante"],
    ingredientes: [
      { nome: "Gelatina", quantidade: "1 pacote" },
      { nome: "Morango", quantidade: "5 unidades" },
    ],
  },
  {
    nome: "Muffin de cenoura",
    resumo: "Fofinho e leva vegetais escondidos.",
    tipoRefeicao: TipoRefeicao.LANCHE,
    tempoPreparoMin: 35,
    dificuldade: "Média",
    rendimento: "10 muffins",
    passos: [
      "Bata a cenoura com ovo e leite.",
      "Misture com a farinha.",
      "Asse em forminhas por 20 minutos.",
    ],
    tags: ["vegetais_escondidos", "rende_bem"],
    ingredientes: [
      { nome: "Cenoura", quantidade: "2 unidades" },
      { nome: "Ovo", quantidade: "2 unidades" },
      { nome: "Leite", quantidade: "100 ml" },
      { nome: "Farinha de trigo", quantidade: "2 xícaras" },
    ],
  },
  {
    nome: "Chips de banana assada",
    resumo: "Crocante sem fritura.",
    tipoRefeicao: TipoRefeicao.LANCHE,
    tempoPreparoMin: 30,
    dificuldade: "Fácil",
    rendimento: "1 porção",
    passos: ["Fatie a banana bem fina.", "Asse até ficar crocante."],
    tags: ["doce", "rende_bem"],
    ingredientes: [{ nome: "Banana", quantidade: "2 unidades" }],
  },

  // JANTAR
  {
    nome: "Sopa de legumes com frango",
    resumo: "Reconfortante para fechar o dia.",
    tipoRefeicao: TipoRefeicao.JANTAR,
    tempoPreparoMin: 35,
    dificuldade: "Fácil",
    rendimento: "2 porções",
    passos: [
      "Cozinhe o frango com os legumes picados.",
      "Bata parte no liquidificador para engrossar, se preferir.",
      "Sirva quente.",
    ],
    tags: ["reconfortante", "proteina"],
    ingredientes: [
      { nome: "Frango", quantidade: "150 g" },
      { nome: "Cenoura", quantidade: "1 unidade" },
      { nome: "Batata", quantidade: "1 unidade" },
      { nome: "Abobrinha", quantidade: "1 unidade" },
    ],
  },
  {
    nome: "Canja de galinha",
    resumo: "Clássica e fácil de digerir.",
    tipoRefeicao: TipoRefeicao.JANTAR,
    tempoPreparoMin: 40,
    dificuldade: "Média",
    rendimento: "3 porções",
    passos: [
      "Cozinhe o frango desfiado com arroz e legumes.",
      "Deixe cozinhar até o arroz ficar bem macio.",
    ],
    tags: ["reconfortante", "classico"],
    ingredientes: [
      { nome: "Frango", quantidade: "150 g" },
      { nome: "Arroz", quantidade: "1/2 xícara" },
      { nome: "Cenoura", quantidade: "1 unidade" },
    ],
  },
  {
    nome: "Omelete de legumes",
    resumo: "Rápido e cheio de cor.",
    tipoRefeicao: TipoRefeicao.JANTAR,
    tempoPreparoMin: 12,
    dificuldade: "Fácil",
    rendimento: "1 porção",
    passos: ["Bata os ovos com os legumes picados bem miúdos.", "Frite em fogo baixo."],
    tags: ["pratico", "vegetariano"],
    ingredientes: [
      { nome: "Ovo", quantidade: "2 unidades" },
      { nome: "Abobrinha", quantidade: "1/2 unidade" },
      { nome: "Tomate", quantidade: "1/2 unidade" },
    ],
  },
  {
    nome: "Purê de abóbora com frango desfiado",
    resumo: "Doce, macio e fácil de aceitar.",
    tipoRefeicao: TipoRefeicao.JANTAR,
    tempoPreparoMin: 30,
    dificuldade: "Fácil",
    rendimento: "2 porções",
    passos: ["Cozinhe e amasse a abóbora.", "Misture o frango desfiado por cima."],
    tags: ["cremoso", "proteina"],
    ingredientes: [
      { nome: "Abóbora", quantidade: "2 xícaras" },
      { nome: "Frango", quantidade: "150 g" },
    ],
  },
  {
    nome: "Wrap de frango com salada",
    resumo: "Leve para o jantar de dias corridos.",
    tipoRefeicao: TipoRefeicao.JANTAR,
    tempoPreparoMin: 15,
    dificuldade: "Fácil",
    rendimento: "1 porção",
    passos: ["Recheie o pão com frango desfiado, queijo e tomate.", "Enrole e sirva."],
    tags: ["pratico", "proteina"],
    ingredientes: [
      { nome: "Pão de forma", quantidade: "1 fatia grande" },
      { nome: "Frango", quantidade: "100 g" },
      { nome: "Queijo", quantidade: "1 fatia" },
      { nome: "Tomate", quantidade: "1/2 unidade" },
    ],
  },
  {
    nome: "Arroz integral com ovo mexido",
    resumo: "Simples, rápido e nutritivo.",
    tipoRefeicao: TipoRefeicao.JANTAR,
    tempoPreparoMin: 20,
    dificuldade: "Fácil",
    rendimento: "1 porção",
    passos: ["Esquente o arroz.", "Prepare o ovo mexido.", "Sirva juntos."],
    tags: ["pratico", "proteina"],
    ingredientes: [
      { nome: "Arroz", quantidade: "1 xícara" },
      { nome: "Ovo", quantidade: "2 unidades" },
    ],
  },
  {
    nome: "Creme de mandioquinha com carne",
    resumo: "Textura macia, ótimo para noites frias.",
    tipoRefeicao: TipoRefeicao.JANTAR,
    tempoPreparoMin: 30,
    dificuldade: "Média",
    rendimento: "2 porções",
    passos: ["Cozinhe a mandioquinha e bata até cremosa.", "Misture a carne moída refogada."],
    tags: ["cremoso", "proteina"],
    ingredientes: [
      { nome: "Mandioquinha", quantidade: "3 unidades" },
      { nome: "Carne moída", quantidade: "100 g" },
    ],
  },
  {
    nome: "Panqueca de espinafre com queijo",
    resumo: "Verde escondido em um recheio gostoso.",
    tipoRefeicao: TipoRefeicao.JANTAR,
    tempoPreparoMin: 30,
    dificuldade: "Média",
    rendimento: "4 unidades",
    passos: [
      "Prepare a massa com ovo, leite e farinha.",
      "Recheie com espinafre refogado e queijo.",
      "Enrole e leve ao forno por 10 minutos.",
    ],
    tags: ["vegetais_escondidos", "vegetariano"],
    ingredientes: [
      { nome: "Ovo", quantidade: "1 unidade" },
      { nome: "Leite", quantidade: "150 ml" },
      { nome: "Farinha de trigo", quantidade: "1 xícara" },
      { nome: "Espinafre", quantidade: "1 xícara" },
      { nome: "Queijo", quantidade: "1/2 xícara" },
    ],
  },
  {
    nome: "Sopa de abóbora com carne moída",
    resumo: "Doce e salgada ao mesmo tempo, agrada muito.",
    tipoRefeicao: TipoRefeicao.JANTAR,
    tempoPreparoMin: 35,
    dificuldade: "Fácil",
    rendimento: "2 porções",
    passos: ["Cozinhe a abóbora até macia.", "Adicione a carne moída refogada.", "Bata levemente."],
    tags: ["reconfortante", "proteina"],
    ingredientes: [
      { nome: "Abóbora", quantidade: "2 xícaras" },
      { nome: "Carne moída", quantidade: "100 g" },
    ],
  },
  {
    nome: "Macarrão com molho branco e brócolis",
    resumo: "Cremoso com um toque verde.",
    tipoRefeicao: TipoRefeicao.JANTAR,
    tempoPreparoMin: 25,
    dificuldade: "Média",
    rendimento: "2 porções",
    passos: [
      "Cozinhe o macarrão e o brócolis.",
      "Prepare um molho simples com leite e manteiga.",
      "Misture tudo.",
    ],
    tags: ["cremoso", "vegetariano"],
    ingredientes: [
      { nome: "Macarrão", quantidade: "150 g" },
      { nome: "Brócolis", quantidade: "1 xícara" },
      { nome: "Leite", quantidade: "100 ml" },
      { nome: "Manteiga", quantidade: "1 colher de sopa" },
    ],
  },
  {
    nome: "Peixe ao forno com legumes",
    resumo: "Assado de uma vez só, pouca louça.",
    tipoRefeicao: TipoRefeicao.JANTAR,
    tempoPreparoMin: 35,
    dificuldade: "Média",
    rendimento: "2 porções",
    passos: [
      "Tempere o peixe e disponha com os legumes na assadeira.",
      "Regue com azeite.",
      "Asse por 25 minutos.",
    ],
    tags: ["leve", "proteina"],
    ingredientes: [
      { nome: "Filé de peixe", quantidade: "150 g" },
      { nome: "Batata", quantidade: "2 unidades" },
      { nome: "Cenoura", quantidade: "1 unidade" },
      { nome: "Azeite", quantidade: "1 fio" },
    ],
  },
  {
    nome: "Risoto de frango light",
    resumo: "Versão mais leve para o fim do dia.",
    tipoRefeicao: TipoRefeicao.JANTAR,
    tempoPreparoMin: 30,
    dificuldade: "Média",
    rendimento: "2 porções",
    passos: [
      "Refogue o arroz com cebola.",
      "Adicione caldo aos poucos até cozinhar.",
      "Misture o frango desfiado.",
    ],
    tags: ["cremoso", "proteina"],
    ingredientes: [
      { nome: "Arroz", quantidade: "1 xícara" },
      { nome: "Cebola", quantidade: "1/2 unidade" },
      { nome: "Frango", quantidade: "150 g" },
    ],
  },
  {
    nome: "Torta salgada de legumes",
    resumo: "Rende para o jantar de dois dias.",
    tipoRefeicao: TipoRefeicao.JANTAR,
    tempoPreparoMin: 45,
    dificuldade: "Média",
    rendimento: "6 fatias",
    passos: [
      "Misture a massa de ovo, leite e farinha com fermento.",
      "Adicione os legumes picados e o queijo.",
      "Asse por 35 minutos.",
    ],
    tags: ["rende_bem", "vegetariano"],
    ingredientes: [
      { nome: "Ovo", quantidade: "3 unidades" },
      { nome: "Leite", quantidade: "150 ml" },
      { nome: "Farinha de trigo", quantidade: "2 xícaras" },
      { nome: "Cenoura", quantidade: "1 unidade" },
      { nome: "Queijo", quantidade: "1 xícara" },
    ],
  },
  {
    nome: "Nhoque de batata com molho de tomate",
    resumo: "Macio e divertido de comer.",
    tipoRefeicao: TipoRefeicao.JANTAR,
    tempoPreparoMin: 45,
    dificuldade: "Média",
    rendimento: "3 porções",
    passos: [
      "Cozinhe e amasse a batata.",
      "Misture com farinha até formar uma massa macia.",
      "Modele, cozinhe em água fervente e sirva com molho.",
    ],
    tags: ["divertido", "vegetariano"],
    ingredientes: [
      { nome: "Batata", quantidade: "4 unidades" },
      { nome: "Farinha de trigo", quantidade: "1 xícara" },
      { nome: "Molho de tomate", quantidade: "1/2 xícara" },
    ],
  },

  // CAFÉ DA MANHÃ — expansão
  {
    nome: "Papa de banana com aveia e chia",
    resumo: "Textura de papinha, ótima para os primeiros meses de sólidos.",
    tipoRefeicao: TipoRefeicao.CAFE_DA_MANHA,
    tempoPreparoMin: 8,
    dificuldade: "Fácil",
    rendimento: "1 porção",
    passos: [
      "Amasse bem a banana com um garfo.",
      "Misture a aveia e a chia até formar uma papa homogênea.",
      "Sirva em temperatura ambiente.",
    ],
    idadeMinimaMeses: 6,
    tags: ["papinha", "primeiros_solidos", "vegetariano"],
    ingredientes: [
      { nome: "Banana", quantidade: "1 unidade" },
      { nome: "Aveia", quantidade: "1 colher de sopa" },
      { nome: "Chia", quantidade: "1 colher de chá" },
    ],
  },
  {
    nome: "Vitamina de mamão com linhaça",
    resumo: "Cremosa, ajuda no trânsito intestinal.",
    tipoRefeicao: TipoRefeicao.CAFE_DA_MANHA,
    tempoPreparoMin: 5,
    dificuldade: "Fácil",
    rendimento: "1 copo",
    passos: ["Bata o mamão com o leite e a linhaça no liquidificador.", "Sirva na hora."],
    tags: ["doce", "pratico", "vegetariano"],
    ingredientes: [
      { nome: "Mamão", quantidade: "1/2 unidade" },
      { nome: "Leite", quantidade: "150 ml" },
      { nome: "Linhaça", quantidade: "1 colher de chá" },
    ],
  },
  {
    nome: "Pão integral com banana amassada",
    resumo: "Café simples, pronto em minutos.",
    tipoRefeicao: TipoRefeicao.CAFE_DA_MANHA,
    tempoPreparoMin: 5,
    dificuldade: "Fácil",
    rendimento: "1 porção",
    passos: ["Amasse a banana.", "Espalhe sobre o pão."],
    tags: ["pratico", "vegetariano"],
    ingredientes: [
      { nome: "Pão de forma", quantidade: "1 fatia" },
      { nome: "Banana", quantidade: "1 unidade" },
    ],
  },
  {
    nome: "Omelete de espinafre e queijo",
    resumo: "Café salgado com folhas escondidas.",
    tipoRefeicao: TipoRefeicao.CAFE_DA_MANHA,
    tempoPreparoMin: 10,
    dificuldade: "Fácil",
    rendimento: "1 porção",
    passos: [
      "Refogue rapidamente o espinafre picado.",
      "Bata os ovos e misture o espinafre e o queijo.",
      "Frite em fogo baixo até dourar.",
    ],
    tags: ["vegetais_escondidos", "proteina"],
    ingredientes: [
      { nome: "Ovo", quantidade: "2 unidades" },
      { nome: "Espinafre", quantidade: "1/2 xícara" },
      { nome: "Queijo", quantidade: "1 fatia" },
    ],
  },
  {
    nome: "Panqueca de aveia e maçã",
    resumo: "Sem açúcar adicionado, doçura natural da fruta.",
    tipoRefeicao: TipoRefeicao.CAFE_DA_MANHA,
    tempoPreparoMin: 15,
    dificuldade: "Média",
    rendimento: "4 panquecas",
    passos: [
      "Bata a maçã ralada com o ovo e a aveia.",
      "Frite pequenas porções em fogo baixo.",
      "Sirva quente.",
    ],
    tags: ["doce", "vegetariano"],
    ingredientes: [
      { nome: "Maçã", quantidade: "1 unidade" },
      { nome: "Ovo", quantidade: "1 unidade" },
      { nome: "Aveia", quantidade: "3 colheres de sopa" },
    ],
  },
  {
    nome: "Mingau de quinoa com maçã",
    resumo: "Alternativa proteica ao mingau tradicional.",
    tipoRefeicao: TipoRefeicao.CAFE_DA_MANHA,
    tempoPreparoMin: 20,
    dificuldade: "Média",
    rendimento: "2 porções",
    passos: [
      "Cozinhe a quinoa no leite até formar um creme.",
      "Adicione a maçã picada nos últimos minutos.",
      "Finalize com canela.",
    ],
    tags: ["proteina", "vegetariano"],
    ingredientes: [
      { nome: "Quinoa", quantidade: "3 colheres de sopa" },
      { nome: "Leite", quantidade: "250 ml" },
      { nome: "Maçã", quantidade: "1/2 unidade" },
      { nome: "Canela", quantidade: "a gosto" },
    ],
  },
  {
    nome: "Vitamina de abacate com leite",
    resumo: "Cremosa e rica em gorduras boas para o desenvolvimento.",
    tipoRefeicao: TipoRefeicao.CAFE_DA_MANHA,
    tempoPreparoMin: 5,
    dificuldade: "Fácil",
    rendimento: "1 copo",
    passos: ["Bata o abacate com o leite até ficar homogêneo.", "Sirva gelado."],
    tags: ["cremoso", "vegetariano"],
    ingredientes: [
      { nome: "Abacate", quantidade: "1/2 unidade" },
      { nome: "Leite", quantidade: "150 ml" },
    ],
  },
  {
    nome: "Pão caseiro com manteiga e mel",
    resumo: "Clássico afetivo — apenas para maiores de 1 ano.",
    tipoRefeicao: TipoRefeicao.CAFE_DA_MANHA,
    tempoPreparoMin: 5,
    dificuldade: "Fácil",
    rendimento: "1 porção",
    passos: ["Passe a manteiga no pão.", "Finalize com um fio de mel."],
    tags: ["doce", "pratico"],
    ingredientes: [
      { nome: "Pão francês", quantidade: "1 unidade" },
      { nome: "Manteiga", quantidade: "1 colher de chá" },
      { nome: "Mel", quantidade: "1 colher de chá" },
    ],
  },
  {
    nome: "Salada de frutas com uva e pera",
    resumo: "Refrescante, boa fonte de fibras e água.",
    tipoRefeicao: TipoRefeicao.CAFE_DA_MANHA,
    tempoPreparoMin: 10,
    dificuldade: "Fácil",
    rendimento: "1 porção",
    passos: ["Corte a uva ao meio e a pera em cubos pequenos.", "Misture em uma tigela."],
    tags: ["cru", "doce"],
    ingredientes: [
      { nome: "Uva", quantidade: "6 unidades" },
      { nome: "Pera", quantidade: "1 unidade" },
    ],
  },

  // ALMOÇO — expansão
  {
    nome: "Papa de mandioquinha com frango",
    resumo: "Receita clássica de introdução alimentar, macia e nutritiva.",
    tipoRefeicao: TipoRefeicao.ALMOCO,
    tempoPreparoMin: 30,
    dificuldade: "Fácil",
    rendimento: "1 porção",
    passos: [
      "Cozinhe a mandioquinha e o frango até ficarem bem macios.",
      "Amasse ou processe até virar uma papa.",
      "Sirva morno.",
    ],
    idadeMinimaMeses: 6,
    tags: ["papinha", "primeiros_solidos", "proteina"],
    ingredientes: [
      { nome: "Mandioquinha", quantidade: "1 unidade" },
      { nome: "Frango", quantidade: "80 g" },
    ],
  },
  {
    nome: "Feijão tropeiro light com couve",
    resumo: "Versão mais leve de um clássico mineiro.",
    tipoRefeicao: TipoRefeicao.ALMOCO,
    tempoPreparoMin: 30,
    dificuldade: "Média",
    rendimento: "3 porções",
    passos: [
      "Refogue a couve picada bem fina.",
      "Misture com o feijão já cozido e o ovo mexido.",
      "Sirva com arroz.",
    ],
    tags: ["classico", "proteina"],
    ingredientes: [
      { nome: "Feijão", quantidade: "1 xícara" },
      { nome: "Couve", quantidade: "1 xícara" },
      { nome: "Ovo", quantidade: "1 unidade" },
      { nome: "Arroz", quantidade: "1 xícara" },
    ],
  },
  {
    nome: "Moqueca de peixe infantil",
    resumo: "Versão suave, sem pimenta, do prato baiano.",
    tipoRefeicao: TipoRefeicao.ALMOCO,
    tempoPreparoMin: 35,
    dificuldade: "Média",
    rendimento: "2 porções",
    passos: [
      "Refogue cebola e tomate no azeite.",
      "Adicione o peixe e cozinhe em fogo baixo até ficar macio.",
      "Sirva com arroz.",
    ],
    tags: ["proteina", "leve"],
    ingredientes: [
      { nome: "Filé de peixe", quantidade: "150 g" },
      { nome: "Tomate", quantidade: "1 unidade" },
      { nome: "Cebola", quantidade: "1/2 unidade" },
      { nome: "Azeite", quantidade: "1 fio" },
      { nome: "Arroz", quantidade: "1 xícara" },
    ],
  },
  {
    nome: "Quibe de forno com abóbora",
    resumo: "Assado, sem fritura, com vegetais escondidos.",
    tipoRefeicao: TipoRefeicao.ALMOCO,
    tempoPreparoMin: 40,
    dificuldade: "Média",
    rendimento: "3 porções",
    passos: [
      "Cozinhe e amasse a abóbora.",
      "Misture com a carne moída temperada.",
      "Leve ao forno em uma assadeira untada por 25 minutos.",
    ],
    tags: ["vegetais_escondidos", "proteina"],
    ingredientes: [
      { nome: "Abóbora", quantidade: "1 xícara" },
      { nome: "Carne moída", quantidade: "200 g" },
      { nome: "Cebola", quantidade: "1/2 unidade" },
    ],
  },
  {
    nome: "Ensopado de lentilha com legumes",
    resumo: "Rico em ferro vegetal e fibras.",
    tipoRefeicao: TipoRefeicao.ALMOCO,
    tempoPreparoMin: 35,
    dificuldade: "Média",
    rendimento: "3 porções",
    passos: [
      "Refogue cebola e cenoura.",
      "Adicione a lentilha e água, cozinhe até amaciar.",
      "Ajuste a consistência conforme a idade da criança.",
    ],
    tags: ["vegetariano", "rende_bem"],
    ingredientes: [
      { nome: "Lentilha", quantidade: "1 xícara" },
      { nome: "Cenoura", quantidade: "1 unidade" },
      { nome: "Cebola", quantidade: "1/2 unidade" },
    ],
  },
  {
    nome: "Frango xadrez infantil com legumes",
    resumo: "Versão sem sal em excesso e sem pimenta.",
    tipoRefeicao: TipoRefeicao.ALMOCO,
    tempoPreparoMin: 30,
    dificuldade: "Média",
    rendimento: "2 porções",
    passos: [
      "Refogue o frango em cubos com cebola.",
      "Adicione cenoura e ervilha picadas.",
      "Sirva com arroz.",
    ],
    tags: ["proteina", "colorido"],
    ingredientes: [
      { nome: "Frango", quantidade: "150 g" },
      { nome: "Cebola", quantidade: "1/2 unidade" },
      { nome: "Cenoura", quantidade: "1 unidade" },
      { nome: "Ervilha", quantidade: "1/2 xícara" },
      { nome: "Arroz", quantidade: "1 xícara" },
    ],
  },
  {
    nome: "Purê de batata-doce com carne desfiada",
    resumo: "Doce e salgado, combinação muito bem aceita.",
    tipoRefeicao: TipoRefeicao.ALMOCO,
    tempoPreparoMin: 35,
    dificuldade: "Fácil",
    rendimento: "2 porções",
    passos: [
      "Cozinhe e amasse a batata-doce.",
      "Cozinhe a carne até desfiar facilmente.",
      "Sirva o purê com a carne por cima.",
    ],
    tags: ["cremoso", "proteina"],
    ingredientes: [
      { nome: "Batata-doce", quantidade: "2 unidades" },
      { nome: "Carne moída", quantidade: "150 g" },
    ],
  },
  {
    nome: "Salada morna de quinoa com legumes",
    resumo: "Prato completo com proteína vegetal e textura variada.",
    tipoRefeicao: TipoRefeicao.ALMOCO,
    tempoPreparoMin: 25,
    dificuldade: "Média",
    rendimento: "2 porções",
    passos: [
      "Cozinhe a quinoa conforme a embalagem.",
      "Misture com cenoura e ervilha cozidas.",
      "Tempere com um fio de azeite.",
    ],
    tags: ["vegetariano", "colorido"],
    ingredientes: [
      { nome: "Quinoa", quantidade: "1 xícara" },
      { nome: "Cenoura", quantidade: "1 unidade" },
      { nome: "Ervilha", quantidade: "1/2 xícara" },
      { nome: "Azeite", quantidade: "1 fio" },
    ],
  },
  {
    nome: "Chuchu refogado com frango desfiado",
    resumo: "Leve, macio e de fácil digestão.",
    tipoRefeicao: TipoRefeicao.ALMOCO,
    tempoPreparoMin: 25,
    dificuldade: "Fácil",
    rendimento: "2 porções",
    passos: [
      "Refogue o chuchu picado até amaciar.",
      "Misture o frango desfiado.",
      "Sirva com arroz.",
    ],
    tags: ["leve", "proteina"],
    ingredientes: [
      { nome: "Chuchu", quantidade: "1 unidade" },
      { nome: "Frango", quantidade: "150 g" },
      { nome: "Arroz", quantidade: "1 xícara" },
    ],
  },
  {
    nome: "Bolinho de peixe assado com batata",
    resumo: "Formato divertido, assado em vez de frito.",
    tipoRefeicao: TipoRefeicao.ALMOCO,
    tempoPreparoMin: 35,
    dificuldade: "Média",
    rendimento: "10 bolinhos",
    passos: [
      "Cozinhe e amasse a batata.",
      "Misture com o peixe desfiado e o ovo.",
      "Modele bolinhas e asse por 20 minutos.",
    ],
    tags: ["divertido", "proteina"],
    ingredientes: [
      { nome: "Batata", quantidade: "3 unidades" },
      { nome: "Filé de peixe", quantidade: "150 g" },
      { nome: "Ovo", quantidade: "1 unidade" },
    ],
  },

  // LANCHE — expansão
  {
    nome: "Palitos de abacaxi e melancia",
    resumo: "Refrescante, ótimo para dias quentes.",
    tipoRefeicao: TipoRefeicao.LANCHE,
    tempoPreparoMin: 8,
    dificuldade: "Fácil",
    rendimento: "1 porção",
    passos: ["Corte o abacaxi e a melancia em palitos.", "Sirva gelado."],
    tags: ["cru", "refrescante"],
    ingredientes: [
      { nome: "Abacaxi", quantidade: "2 fatias" },
      { nome: "Melancia", quantidade: "2 fatias" },
    ],
  },
  {
    nome: "Mix de iogurte com chia e manga",
    resumo: "Cremoso, com textura de pudim natural.",
    tipoRefeicao: TipoRefeicao.LANCHE,
    tempoPreparoMin: 10,
    dificuldade: "Fácil",
    rendimento: "1 porção",
    passos: [
      "Misture o iogurte com a chia e deixe descansar 5 minutos.",
      "Finalize com manga picada.",
    ],
    tags: ["cremoso", "vegetariano"],
    ingredientes: [
      { nome: "Iogurte natural", quantidade: "1 pote" },
      { nome: "Chia", quantidade: "1 colher de chá" },
      { nome: "Manga", quantidade: "1/2 unidade" },
    ],
  },
  {
    nome: "Bolinho de milho verde assado",
    resumo: "Macio, feito no forno.",
    tipoRefeicao: TipoRefeicao.LANCHE,
    tempoPreparoMin: 30,
    dificuldade: "Média",
    rendimento: "10 bolinhos",
    passos: [
      "Bata o milho verde com o ovo e a farinha.",
      "Coloque em forminhas.",
      "Asse por 20 minutos.",
    ],
    tags: ["rende_bem", "vegetariano"],
    ingredientes: [
      { nome: "Milho verde", quantidade: "1 xícara" },
      { nome: "Ovo", quantidade: "1 unidade" },
      { nome: "Farinha de trigo", quantidade: "1/2 xícara" },
    ],
  },
  {
    nome: "Beterraba assada em palitos",
    resumo: "Doce natural e cor vibrante que chama atenção.",
    tipoRefeicao: TipoRefeicao.LANCHE,
    tempoPreparoMin: 35,
    dificuldade: "Fácil",
    rendimento: "1 porção",
    passos: [
      "Corte a beterraba em palitos.",
      "Regue com azeite e asse até ficar macia.",
    ],
    tags: ["colorido", "vegetariano"],
    ingredientes: [
      { nome: "Beterraba", quantidade: "1 unidade" },
      { nome: "Azeite", quantidade: "1 fio" },
    ],
  },
  {
    nome: "Vitamina de morango com coco",
    resumo: "Tropical e cheia de sabor.",
    tipoRefeicao: TipoRefeicao.LANCHE,
    tempoPreparoMin: 5,
    dificuldade: "Fácil",
    rendimento: "1 copo",
    passos: ["Bata o morango com o leite.", "Finalize com coco ralado por cima."],
    tags: ["doce", "pratico"],
    ingredientes: [
      { nome: "Morango", quantidade: "5 unidades" },
      { nome: "Leite", quantidade: "150 ml" },
      { nome: "Coco ralado", quantidade: "1 colher de chá" },
    ],
  },
  {
    nome: "Sanduíche de homus com pepino",
    resumo: "Proteína vegetal em formato prático.",
    tipoRefeicao: TipoRefeicao.LANCHE,
    tempoPreparoMin: 8,
    dificuldade: "Fácil",
    rendimento: "1 porção",
    passos: ["Passe o homus no pão.", "Adicione fatias finas de pepino."],
    tags: ["pratico", "vegetariano"],
    ingredientes: [
      { nome: "Pão de forma", quantidade: "2 fatias" },
      { nome: "Grão de bico", quantidade: "3 colheres de sopa (homus)" },
      { nome: "Pepino", quantidade: "1/4 unidade" },
    ],
  },
  {
    nome: "Bolinho de banana e linhaça",
    resumo: "Sem açúcar refinado, adocicado naturalmente.",
    tipoRefeicao: TipoRefeicao.LANCHE,
    tempoPreparoMin: 30,
    dificuldade: "Média",
    rendimento: "10 bolinhos",
    passos: [
      "Amasse a banana e misture com o ovo e a aveia.",
      "Adicione a linhaça.",
      "Asse em forminhas por 20 minutos.",
    ],
    tags: ["rende_bem", "doce"],
    ingredientes: [
      { nome: "Banana", quantidade: "2 unidades" },
      { nome: "Ovo", quantidade: "1 unidade" },
      { nome: "Aveia", quantidade: "1 xícara" },
      { nome: "Linhaça", quantidade: "1 colher de sopa" },
    ],
  },
  {
    nome: "Espetinho de frutas coloridas",
    resumo: "Visual divertido, ótimo para chamar atenção da criança.",
    tipoRefeicao: TipoRefeicao.LANCHE,
    tempoPreparoMin: 10,
    dificuldade: "Fácil",
    rendimento: "1 porção",
    passos: [
      "Corte as frutas em cubos.",
      "Monte em um espeto de churrasco sem ponta (ou palito rombudo) para crianças maiores.",
    ],
    tags: ["divertido", "cru"],
    ingredientes: [
      { nome: "Morango", quantidade: "3 unidades" },
      { nome: "Uva", quantidade: "4 unidades" },
      { nome: "Melancia", quantidade: "2 cubos" },
    ],
  },
  {
    nome: "Panqueca americana de aveia (mini)",
    resumo: "Miniaturas fofinhas, boas para segurar com a mão.",
    tipoRefeicao: TipoRefeicao.LANCHE,
    tempoPreparoMin: 15,
    dificuldade: "Média",
    rendimento: "8 mini panquecas",
    passos: [
      "Bata a aveia, o ovo e o leite até formar uma massa.",
      "Frite pequenas porções em fogo baixo.",
    ],
    tags: ["divertido", "vegetariano"],
    ingredientes: [
      { nome: "Aveia", quantidade: "1 xícara" },
      { nome: "Ovo", quantidade: "1 unidade" },
      { nome: "Leite", quantidade: "100 ml" },
    ],
  },
  {
    nome: "Queijo em cubos com uva",
    resumo: "Combinação clássica de proteína e fruta.",
    tipoRefeicao: TipoRefeicao.LANCHE,
    tempoPreparoMin: 5,
    dificuldade: "Fácil",
    rendimento: "1 porção",
    passos: ["Corte o queijo em cubos pequenos.", "Sirva com uvas cortadas ao meio."],
    tags: ["pratico", "proteina"],
    ingredientes: [
      { nome: "Queijo", quantidade: "4 cubos" },
      { nome: "Uva", quantidade: "6 unidades" },
    ],
  },

  // JANTAR — expansão
  {
    nome: "Papa de abóbora com carne moída",
    resumo: "Papinha nutritiva para o início da introdução alimentar.",
    tipoRefeicao: TipoRefeicao.JANTAR,
    tempoPreparoMin: 30,
    dificuldade: "Fácil",
    rendimento: "1 porção",
    passos: [
      "Cozinhe a abóbora até ficar bem macia.",
      "Refogue a carne moída e cozinhe até desmanchar.",
      "Amasse ou processe tudo junto.",
    ],
    idadeMinimaMeses: 6,
    tags: ["papinha", "primeiros_solidos", "proteina"],
    ingredientes: [
      { nome: "Abóbora", quantidade: "1 xícara" },
      { nome: "Carne moída", quantidade: "80 g" },
    ],
  },
  {
    nome: "Sopa de lentilha com legumes",
    resumo: "Encorpada, rica em ferro vegetal.",
    tipoRefeicao: TipoRefeicao.JANTAR,
    tempoPreparoMin: 35,
    dificuldade: "Fácil",
    rendimento: "3 porções",
    passos: [
      "Refogue cebola, cenoura e chuchu.",
      "Adicione a lentilha e água, cozinhe até amaciar.",
      "Bata parcialmente para engrossar, se preferir.",
    ],
    tags: ["reconfortante", "vegetariano"],
    ingredientes: [
      { nome: "Lentilha", quantidade: "1 xícara" },
      { nome: "Cebola", quantidade: "1/2 unidade" },
      { nome: "Cenoura", quantidade: "1 unidade" },
      { nome: "Chuchu", quantidade: "1 unidade" },
    ],
  },
  {
    nome: "Omelete de couve com queijo",
    resumo: "Jantar rápido com folhas verdes escondidas.",
    tipoRefeicao: TipoRefeicao.JANTAR,
    tempoPreparoMin: 10,
    dificuldade: "Fácil",
    rendimento: "1 porção",
    passos: [
      "Pique a couve bem fina.",
      "Bata os ovos com a couve e o queijo.",
      "Frite em fogo baixo até dourar.",
    ],
    tags: ["vegetais_escondidos", "proteina"],
    ingredientes: [
      { nome: "Ovo", quantidade: "2 unidades" },
      { nome: "Couve", quantidade: "1/4 xícara" },
      { nome: "Queijo", quantidade: "1 fatia" },
    ],
  },
  {
    nome: "Purê de beterraba com frango",
    resumo: "Cor vibrante que desperta curiosidade da criança.",
    tipoRefeicao: TipoRefeicao.JANTAR,
    tempoPreparoMin: 35,
    dificuldade: "Fácil",
    rendimento: "2 porções",
    passos: [
      "Cozinhe e amasse a beterraba.",
      "Misture o frango desfiado.",
      "Sirva morno.",
    ],
    tags: ["colorido", "proteina"],
    ingredientes: [
      { nome: "Beterraba", quantidade: "1 unidade" },
      { nome: "Frango", quantidade: "150 g" },
    ],
  },
  {
    nome: "Risoto de quinoa com legumes",
    resumo: "Versão proteica do risoto tradicional.",
    tipoRefeicao: TipoRefeicao.JANTAR,
    tempoPreparoMin: 30,
    dificuldade: "Média",
    rendimento: "2 porções",
    passos: [
      "Refogue a quinoa com cebola.",
      "Adicione cenoura picada e água aos poucos até cozinhar.",
    ],
    tags: ["vegetariano", "proteina"],
    ingredientes: [
      { nome: "Quinoa", quantidade: "1 xícara" },
      { nome: "Cebola", quantidade: "1/2 unidade" },
      { nome: "Cenoura", quantidade: "1 unidade" },
    ],
  },
  {
    nome: "Escondidinho de peixe com batata-doce",
    resumo: "Versão leve do clássico escondidinho.",
    tipoRefeicao: TipoRefeicao.JANTAR,
    tempoPreparoMin: 40,
    dificuldade: "Média",
    rendimento: "3 porções",
    passos: [
      "Cozinhe e amasse a batata-doce.",
      "Refogue o peixe e desfie.",
      "Monte camadas e leve ao forno para gratinar com queijo.",
    ],
    tags: ["proteina", "leve"],
    ingredientes: [
      { nome: "Batata-doce", quantidade: "500 g" },
      { nome: "Filé de peixe", quantidade: "150 g" },
      { nome: "Queijo", quantidade: "1/2 xícara" },
    ],
  },
  {
    nome: "Ervilha refogada com ovo e arroz",
    resumo: "Simples, colorido e rápido para noites corridas.",
    tipoRefeicao: TipoRefeicao.JANTAR,
    tempoPreparoMin: 20,
    dificuldade: "Fácil",
    rendimento: "2 porções",
    passos: [
      "Refogue a ervilha rapidamente.",
      "Adicione o ovo mexido.",
      "Sirva com arroz.",
    ],
    tags: ["pratico", "proteina"],
    ingredientes: [
      { nome: "Ervilha", quantidade: "1 xícara" },
      { nome: "Ovo", quantidade: "2 unidades" },
      { nome: "Arroz", quantidade: "1 xícara" },
    ],
  },
  {
    nome: "Canja de peixe com legumes",
    resumo: "Alternativa leve à canja tradicional de frango.",
    tipoRefeicao: TipoRefeicao.JANTAR,
    tempoPreparoMin: 35,
    dificuldade: "Média",
    rendimento: "3 porções",
    passos: [
      "Cozinhe o peixe com cenoura e chuchu.",
      "Adicione arroz e cozinhe até ficar bem macio.",
    ],
    tags: ["reconfortante", "proteina"],
    ingredientes: [
      { nome: "Filé de peixe", quantidade: "150 g" },
      { nome: "Cenoura", quantidade: "1 unidade" },
      { nome: "Chuchu", quantidade: "1 unidade" },
      { nome: "Arroz", quantidade: "1/2 xícara" },
    ],
  },
  {
    nome: "Torta de liquidificador com legumes",
    resumo: "Rende para o jantar de mais de um dia.",
    tipoRefeicao: TipoRefeicao.JANTAR,
    tempoPreparoMin: 45,
    dificuldade: "Média",
    rendimento: "6 fatias",
    passos: [
      "Bata no liquidificador ovos, leite, farinha e azeite.",
      "Misture cenoura ralada e milho verde.",
      "Asse por 35 minutos.",
    ],
    tags: ["rende_bem", "vegetariano"],
    ingredientes: [
      { nome: "Ovo", quantidade: "3 unidades" },
      { nome: "Leite", quantidade: "150 ml" },
      { nome: "Farinha de trigo", quantidade: "1 xícara" },
      { nome: "Azeite", quantidade: "1 fio" },
      { nome: "Cenoura", quantidade: "1 unidade" },
      { nome: "Milho verde", quantidade: "1/2 xícara" },
    ],
  },
  {
    nome: "Macarrão com lentilha e molho de tomate",
    resumo: "Combinação proteica vegetal com o clássico macarrão.",
    tipoRefeicao: TipoRefeicao.JANTAR,
    tempoPreparoMin: 30,
    dificuldade: "Fácil",
    rendimento: "2 porções",
    passos: [
      "Cozinhe o macarrão e a lentilha separadamente.",
      "Misture com o molho de tomate.",
    ],
    tags: ["proteina", "classico"],
    ingredientes: [
      { nome: "Macarrão", quantidade: "150 g" },
      { nome: "Lentilha", quantidade: "1/2 xícara" },
      { nome: "Molho de tomate", quantidade: "1/2 xícara" },
    ],
  },

  // ---------------------------------------------------------------------
  // PRIMEIROS SÓLIDOS (a partir dos 6 meses)
  //
  // Preparos em consistência de papa/amassado, sem sal e sem açúcar
  // adicionados, seguindo o Guia Alimentar para Crianças Brasileiras
  // Menores de 2 Anos (Ministério da Saúde, 2021). Existem para que a faixa
  // "6 meses a 1 ano" tenha as quatro refeições cobertas no plano.
  // ---------------------------------------------------------------------
  {
    nome: "Papa de mamão com aveia",
    resumo: "Fruta amassada com aveia, macia e fácil de aceitar.",
    tipoRefeicao: TipoRefeicao.CAFE_DA_MANHA,
    tempoPreparoMin: 5,
    dificuldade: "Fácil",
    rendimento: "1 porção",
    passos: [
      "Amasse o mamão com um garfo até virar purê.",
      "Misture a aveia e espere 2 minutos para hidratar.",
      "Sirva morno ou em temperatura ambiente.",
    ],
    idadeMinimaMeses: 6,
    tags: ["papinha", "primeiros_solidos", "vegetariano", "pratico"],
    ingredientes: [
      { nome: "Mamão", quantidade: "1/2 unidade" },
      { nome: "Aveia", quantidade: "1 colher de sopa" },
    ],
  },
  {
    nome: "Papa de pera cozida com canela",
    resumo: "Pera cozida e amassada, bem macia para começar.",
    tipoRefeicao: TipoRefeicao.CAFE_DA_MANHA,
    tempoPreparoMin: 12,
    dificuldade: "Fácil",
    rendimento: "1 porção",
    passos: [
      "Descasque a pera e cozinhe em pouca água até ficar bem macia.",
      "Amasse com um garfo e polvilhe uma pitada de canela.",
      "Deixe amornar antes de servir.",
    ],
    idadeMinimaMeses: 6,
    tags: ["papinha", "primeiros_solidos", "vegetariano"],
    ingredientes: [
      { nome: "Pera", quantidade: "1 unidade" },
      { nome: "Canela", quantidade: "a gosto" },
    ],
  },
  {
    nome: "Abacate amassado com gotas de laranja",
    resumo: "Gordura boa para o cérebro, pronto em minutos.",
    tipoRefeicao: TipoRefeicao.LANCHE,
    tempoPreparoMin: 5,
    dificuldade: "Fácil",
    rendimento: "1 porção",
    passos: [
      "Amasse o abacate com um garfo.",
      "Pingue algumas gotas de laranja e misture.",
      "Sirva imediatamente para não escurecer.",
    ],
    idadeMinimaMeses: 6,
    tags: ["papinha", "primeiros_solidos", "vegetariano", "pratico"],
    ingredientes: [
      { nome: "Abacate", quantidade: "1/2 unidade" },
      { nome: "Laranja", quantidade: "1/2 unidade" },
    ],
  },
  {
    nome: "Papa de maçã cozida",
    resumo: "Clássico primeiro lanche, sem açúcar adicionado.",
    tipoRefeicao: TipoRefeicao.LANCHE,
    tempoPreparoMin: 12,
    dificuldade: "Fácil",
    rendimento: "1 porção",
    passos: [
      "Descasque a maçã e cozinhe em pouca água até desmanchar.",
      "Amasse bem com um garfo.",
      "Sirva morna.",
    ],
    idadeMinimaMeses: 6,
    tags: ["papinha", "primeiros_solidos", "vegetariano"],
    ingredientes: [{ nome: "Maçã", quantidade: "1 unidade" }],
  },
  {
    nome: "Papa de banana com abacate",
    resumo: "Duas frutas amassadas, cremosa e calórica na medida.",
    tipoRefeicao: TipoRefeicao.LANCHE,
    tempoPreparoMin: 5,
    dificuldade: "Fácil",
    rendimento: "1 porção",
    passos: [
      "Amasse a banana e o abacate juntos até ficar homogêneo.",
      "Sirva na hora.",
    ],
    idadeMinimaMeses: 6,
    tags: ["papinha", "primeiros_solidos", "vegetariano", "pratico"],
    ingredientes: [
      { nome: "Banana", quantidade: "1/2 unidade" },
      { nome: "Abacate", quantidade: "1/2 unidade" },
    ],
  },
  {
    nome: "Papa de batata-doce com frango e brócolis",
    resumo: "Papa completa: raiz, proteína e verdura no mesmo prato.",
    tipoRefeicao: TipoRefeicao.ALMOCO,
    tempoPreparoMin: 30,
    dificuldade: "Fácil",
    rendimento: "1 porção",
    passos: [
      "Cozinhe a batata-doce e o brócolis até ficarem bem macios.",
      "Cozinhe o frango e desfie bem fino.",
      "Amasse tudo com um garfo e finalize com o azeite.",
    ],
    idadeMinimaMeses: 6,
    tags: ["papinha", "primeiros_solidos", "proteina", "ferro"],
    ingredientes: [
      { nome: "Batata-doce", quantidade: "1 unidade" },
      { nome: "Frango", quantidade: "50 g" },
      { nome: "Brócolis", quantidade: "2 buquês" },
      { nome: "Azeite", quantidade: "1 colher de chá" },
    ],
  },
  {
    nome: "Papa de arroz com feijão e abobrinha",
    resumo: "O arroz com feijão da casa, em versão amassada.",
    tipoRefeicao: TipoRefeicao.ALMOCO,
    tempoPreparoMin: 25,
    dificuldade: "Fácil",
    rendimento: "1 porção",
    passos: [
      "Cozinhe a abobrinha até ficar bem macia.",
      "Misture o arroz cozido com o feijão (grãos e um pouco do caldo).",
      "Amasse tudo com o garfo até a consistência de papa.",
    ],
    idadeMinimaMeses: 6,
    tags: ["papinha", "primeiros_solidos", "vegetariano", "ferro"],
    ingredientes: [
      { nome: "Arroz", quantidade: "3 colheres de sopa" },
      { nome: "Feijão", quantidade: "2 colheres de sopa" },
      { nome: "Abobrinha", quantidade: "1/2 unidade" },
    ],
  },
  {
    nome: "Papa de chuchu com peixe e cenoura",
    resumo: "Peixe bem desfiado, macio e leve para o jantar.",
    tipoRefeicao: TipoRefeicao.JANTAR,
    tempoPreparoMin: 25,
    dificuldade: "Fácil",
    rendimento: "1 porção",
    passos: [
      "Cozinhe o chuchu e a cenoura até ficarem bem macios.",
      "Cozinhe o peixe e desfie, conferindo com cuidado se não há espinhas.",
      "Amasse tudo junto e finalize com o azeite.",
    ],
    idadeMinimaMeses: 6,
    tags: ["papinha", "primeiros_solidos", "proteina", "leve"],
    ingredientes: [
      { nome: "Chuchu", quantidade: "1/2 unidade" },
      { nome: "Cenoura", quantidade: "1/2 unidade" },
      { nome: "Filé de peixe", quantidade: "50 g" },
      { nome: "Azeite", quantidade: "1 colher de chá" },
    ],
  },
  {
    nome: "Papa de batata com ovo e cenoura",
    resumo: "Ovo bem cozido, uma das melhores proteínas do início.",
    tipoRefeicao: TipoRefeicao.JANTAR,
    tempoPreparoMin: 25,
    dificuldade: "Fácil",
    rendimento: "1 porção",
    passos: [
      "Cozinhe a batata e a cenoura até ficarem bem macias.",
      "Cozinhe o ovo por 10 minutos, até gema e clara firmes.",
      "Amasse tudo junto com o azeite até virar papa.",
    ],
    idadeMinimaMeses: 6,
    tags: ["papinha", "primeiros_solidos", "proteina", "vegetariano"],
    ingredientes: [
      { nome: "Batata", quantidade: "1 unidade" },
      { nome: "Cenoura", quantidade: "1/2 unidade" },
      { nome: "Ovo", quantidade: "1 unidade" },
      { nome: "Azeite", quantidade: "1 colher de chá" },
    ],
  },
];

async function main() {
  console.log("Semeando ingredientes...");
  const ingredienteIdPorNome = new Map<string, string>();
  for (const ing of INGREDIENTES) {
    const record = await db.ingredient.upsert({
      where: { nome: ing.nome },
      update: { categoria: ing.categoria },
      create: { nome: ing.nome, categoria: ing.categoria },
    });
    ingredienteIdPorNome.set(ing.nome, record.id);
  }

  console.log("Semeando receitas...");
  let criadas = 0;
  let atualizadas = 0;
  for (const receita of RECEITAS) {
    const restricoes = deriveRestricoes(receita.ingredientes);
    const nutricao = deriveNutricao(receita.ingredientes);
    const idadeMinimaMeses = deriveIdadeMinimaMeses(receita);

    const dadosBase = {
      resumo: receita.resumo,
      tipoRefeicao: receita.tipoRefeicao,
      tempoPreparoMin: receita.tempoPreparoMin,
      dificuldade: receita.dificuldade,
      rendimento: receita.rendimento,
      passos: receita.passos.join("\n"),
      tags: receita.tags.join(","),
      restricoes: restricoes.join(","),
      nutricao,
      idadeMinimaMeses,
      equipamentos: deriveEquipamentos(receita),
    };

    const existente = await db.recipe.findFirst({ where: { nome: receita.nome } });

    if (existente) {
      await db.recipeIngredient.deleteMany({ where: { recipeId: existente.id } });
      await db.recipe.update({
        where: { id: existente.id },
        data: {
          ...dadosBase,
          ingredients: {
            create: receita.ingredientes.map((ing) => ({
              ingredientId: ingredienteIdPorNome.get(ing.nome)!,
              quantidade: ing.quantidade,
            })),
          },
        },
      });
      atualizadas++;
    } else {
      await db.recipe.create({
        data: {
          nome: receita.nome,
          ...dadosBase,
          ingredients: {
            create: receita.ingredientes.map((ing) => ({
              ingredientId: ingredienteIdPorNome.get(ing.nome)!,
              quantidade: ing.quantidade,
            })),
          },
        },
      });
      criadas++;
    }
  }

  console.log(
    `Pronto! ${ingredienteIdPorNome.size} ingredientes, ${criadas} receitas novas, ${atualizadas} atualizadas.`
  );

  const adminEmail = "admin@pratinhofeliz.com";
  const adminExistente = await db.user.findUnique({ where: { email: adminEmail } });
  if (!adminExistente) {
    await db.user.create({
      data: {
        name: "Admin Pratinho Feliz",
        email: adminEmail,
        passwordHash: await bcrypt.hash("admin123", 10),
        role: "ADMIN",
        subscription: { create: { plano: "FAMILIA", status: "ATIVA" } },
      },
    });
    console.log(`Admin criado: ${adminEmail} / admin123`);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
