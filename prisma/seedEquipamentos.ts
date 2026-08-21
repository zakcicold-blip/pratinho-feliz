// Receitas por equipamento (Air fryer, Batedeira, Mixer/Processador, Micro-ondas,
// Panela de pressão, Sanduicheira/Grill) — ~10 de cada.
// Fundamentadas em receitas reais de alimentação infantil (pesquisa web);
// compostas só com ingredientes já existentes no app (nutrição funciona) e com
// o aparelho citado no preparo (o app detecta o equipamento exigido pelo texto).
//
// Rodar:  npm run db:equipamentos  &&  npm run db:gramas
import { PrismaClient, TipoRefeicao } from "@prisma/client";

const db = new PrismaClient();

type Ing = { nome: string; quantidade: string };
type Receita = {
  nome: string;
  resumo: string;
  tipoRefeicao: TipoRefeicao;
  tempoPreparoMin: number;
  dificuldade: "Fácil" | "Média";
  rendimento: string;
  idadeMinimaMeses: number;
  passos: string[];
  tags: string[];
  ingredientes: Ing[];
};

// ---- Derivações (espelham prisma/seed.ts) ---------------------------------
const EQUIPAMENTOS_DETECTAR: { id: string; palavras: string[] }[] = [
  { id: "FORNO", palavras: ["forno", "assadeira", "assar", "asse", "assados", "gratine", "gratinar"] },
  { id: "AIR_FRYER", palavras: ["air fryer", "airfryer"] },
  { id: "LIQUIDIFICADOR", palavras: ["liquidificador"] },
  { id: "BATEDEIRA", palavras: ["batedeira"] },
  { id: "MIXER", palavras: ["mixer", "processador"] },
  { id: "MICRO_ONDAS", palavras: ["micro-ondas", "microondas"] },
  { id: "PANELA_PRESSAO", palavras: ["panela de pressao"] },
  { id: "SANDUICHEIRA", palavras: ["sanduicheira", "grill"] },
];
const semAcento = (t: string) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
function deriveEquipamentos(r: Receita): string {
  const texto = semAcento(r.passos.join(" ") + " " + r.resumo);
  return EQUIPAMENTOS_DETECTAR.filter((eq) =>
    eq.palavras.some((pal) => {
      const p = semAcento(pal).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      return new RegExp(String.raw`\b` + p + String.raw`\b`).test(texto);
    }),
  ).map((eq) => eq.id).join(",");
}
const ALERGENOS: Record<string, string> = {
  Leite: "leite", Queijo: "leite", Requeijão: "leite", "Iogurte natural": "leite",
  Manteiga: "leite", Ricota: "leite", Ovo: "ovo", "Filé de peixe": "peixe",
  "Atum em lata": "peixe", Sardinha: "peixe", Amendoim: "amendoim", Castanhas: "castanhas",
  Mel: "mel", "Farinha de trigo": "gluten", Macarrão: "gluten", Aveia: "gluten",
  "Pão de forma": "gluten", "Pão francês": "gluten",
};
function deriveRestricoes(ings: Ing[]): string {
  const tags = new Set<string>();
  for (const i of ings) if (ALERGENOS[i.nome]) tags.add(ALERGENOS[i.nome]);
  return Array.from(tags).join(",");
}

const CafeDaManha = TipoRefeicao.CAFE_DA_MANHA;
const Almoco = TipoRefeicao.ALMOCO;
const Lanche = TipoRefeicao.LANCHE;
const Jantar = TipoRefeicao.JANTAR;

const RECEITAS: Receita[] = [
  // ================= AIR FRYER =================
  { nome: "Palitos de batata-doce na air fryer", resumo: "Crocantes por fora, macios por dentro, sem fritura.", tipoRefeicao: Lanche, tempoPreparoMin: 20, dificuldade: "Fácil", rendimento: "1 porção", idadeMinimaMeses: 9, tags: ["lanche", "vegetal"], passos: ["Corte a batata-doce em palitos finos.", "Misture com um fio de azeite.", "Leve à air fryer a 180°C por 15 minutos, mexendo na metade do tempo."], ingredientes: [{ nome: "Batata-doce", quantidade: "1 unidade pequena" }, { nome: "Azeite", quantidade: "1 colher de chá" }] },
  { nome: "Bolinhas de frango na air fryer", resumo: "Nuggetzinho caseiro sem empanado industrializado.", tipoRefeicao: Almoco, tempoPreparoMin: 25, dificuldade: "Média", rendimento: "1 porção", idadeMinimaMeses: 12, tags: ["proteína", "frango"], passos: ["Misture o frango desfiado com o ovo e a aveia até dar liga.", "Modele bolinhas pequenas.", "Leve à air fryer a 180°C por 12 minutos, virando na metade."], ingredientes: [{ nome: "Frango", quantidade: "3 colheres de sopa desfiado" }, { nome: "Ovo", quantidade: "1 unidade" }, { nome: "Aveia", quantidade: "2 colheres de sopa" }] },
  { nome: "Almôndegas de carne na air fryer", resumo: "Macias e douradinhas, sem óleo.", tipoRefeicao: Almoco, tempoPreparoMin: 22, dificuldade: "Fácil", rendimento: "1 porção", idadeMinimaMeses: 12, tags: ["proteína", "carne"], passos: ["Misture a carne moída com o ovo, a aveia e a cebola bem picadinha.", "Modele almôndegas pequenas.", "Leve à air fryer a 180°C por 12 minutos."], ingredientes: [{ nome: "Carne moída", quantidade: "4 colheres de sopa" }, { nome: "Ovo", quantidade: "1 unidade" }, { nome: "Aveia", quantidade: "1 colher de sopa" }, { nome: "Cebola", quantidade: "1 colher de sopa picada" }] },
  { nome: "Chips de abobrinha na air fryer", resumo: "O jeito que a criança come vegetal sem reclamar.", tipoRefeicao: Lanche, tempoPreparoMin: 18, dificuldade: "Fácil", rendimento: "1 porção", idadeMinimaMeses: 12, tags: ["vegetal", "crocante"], passos: ["Corte a abobrinha em rodelas finas.", "Passe no ovo batido e depois na farinha de milho.", "Leve à air fryer a 180°C por 10 minutos."], ingredientes: [{ nome: "Abobrinha", quantidade: "1/2 unidade" }, { nome: "Ovo", quantidade: "1 unidade" }, { nome: "Farinha de milho", quantidade: "2 colheres de sopa" }] },
  { nome: "Banana docinha na air fryer", resumo: "Sobremesa natural, sem açúcar.", tipoRefeicao: Lanche, tempoPreparoMin: 12, dificuldade: "Fácil", rendimento: "1 porção", idadeMinimaMeses: 8, tags: ["fruta", "doce natural"], passos: ["Corte a banana ao meio no comprimento.", "Polvilhe canela por cima.", "Leve à air fryer a 180°C por 8 minutos, até dourar."], ingredientes: [{ nome: "Banana", quantidade: "1 unidade" }, { nome: "Canela", quantidade: "1 pitada" }] },
  { nome: "Maçã quentinha com canela na air fryer", resumo: "Cheirinho de sobremesa em poucos minutos.", tipoRefeicao: Lanche, tempoPreparoMin: 12, dificuldade: "Fácil", rendimento: "1 porção", idadeMinimaMeses: 6, tags: ["fruta", "doce natural"], passos: ["Descasque e corte a maçã em cubos.", "Polvilhe canela.", "Leve à air fryer a 170°C por 10 minutos, até ficar macia."], ingredientes: [{ nome: "Maçã", quantidade: "1 unidade" }, { nome: "Canela", quantidade: "1 pitada" }] },
  { nome: "Croquete de inhame e carne na air fryer", resumo: "Recheado, macio e sem fritar.", tipoRefeicao: Jantar, tempoPreparoMin: 30, dificuldade: "Média", rendimento: "1 porção", idadeMinimaMeses: 12, tags: ["proteína", "raiz"], passos: ["Cozinhe e amasse o inhame formando uma massa.", "Recheie com a carne moída já refogada e modele croquetes.", "Passe no ovo e leve à air fryer a 180°C por 12 minutos."], ingredientes: [{ nome: "Inhame", quantidade: "1 unidade" }, { nome: "Carne moída", quantidade: "3 colheres de sopa" }, { nome: "Ovo", quantidade: "1 unidade" }] },
  { nome: "Bolinho de arroz e queijo na air fryer", resumo: "Aproveita o arroz do dia anterior.", tipoRefeicao: Lanche, tempoPreparoMin: 18, dificuldade: "Fácil", rendimento: "1 porção", idadeMinimaMeses: 12, tags: ["aproveitamento", "queijo"], passos: ["Misture o arroz cozido com o queijo ralado e o ovo.", "Modele bolinhos.", "Leve à air fryer a 180°C por 12 minutos."], ingredientes: [{ nome: "Arroz", quantidade: "4 colheres de sopa cozido" }, { nome: "Queijo", quantidade: "2 colheres de sopa ralado" }, { nome: "Ovo", quantidade: "1 unidade" }] },
  { nome: "Palitos de mandioca na air fryer", resumo: "A batata frita da casa, versão saudável.", tipoRefeicao: Lanche, tempoPreparoMin: 25, dificuldade: "Fácil", rendimento: "1 porção", idadeMinimaMeses: 12, tags: ["raiz", "crocante"], passos: ["Cozinhe a mandioca até ficar macia e corte em palitos.", "Regue com um fio de azeite.", "Leve à air fryer a 200°C por 12 minutos, até dourar."], ingredientes: [{ nome: "Mandioca", quantidade: "1 pedaço médio" }, { nome: "Azeite", quantidade: "1 colher de chá" }] },
  { nome: "Bolinho de abóbora e frango na air fryer", resumo: "Vegetal e proteína num bolinho só.", tipoRefeicao: Jantar, tempoPreparoMin: 25, dificuldade: "Média", rendimento: "1 porção", idadeMinimaMeses: 12, tags: ["vegetal", "frango"], passos: ["Amasse a abóbora cozida e misture com o frango desfiado, a aveia e o ovo.", "Modele bolinhos.", "Leve à air fryer a 180°C por 14 minutos."], ingredientes: [{ nome: "Abóbora", quantidade: "3 colheres de sopa" }, { nome: "Frango", quantidade: "2 colheres de sopa desfiado" }, { nome: "Aveia", quantidade: "1 colher de sopa" }, { nome: "Ovo", quantidade: "1 unidade" }] },

  // ================= SANDUICHEIRA / GRILL =================
  { nome: "Misto quentinho de queijo na sanduicheira", resumo: "O clássico rápido do lanche.", tipoRefeicao: Lanche, tempoPreparoMin: 8, dificuldade: "Fácil", rendimento: "1 porção", idadeMinimaMeses: 12, tags: ["lanche", "queijo"], passos: ["Monte o sanduíche com o queijo entre as fatias de pão.", "Prense na sanduicheira por 4 minutos, até dourar."], ingredientes: [{ nome: "Pão de forma", quantidade: "2 fatias" }, { nome: "Queijo", quantidade: "1 fatia" }] },
  { nome: "Sanduíche de frango e cenoura na sanduicheira", resumo: "Proteína e vegetal escondidos no lanche.", tipoRefeicao: Lanche, tempoPreparoMin: 10, dificuldade: "Fácil", rendimento: "1 porção", idadeMinimaMeses: 12, tags: ["frango", "vegetal"], passos: ["Misture o frango desfiado com a ricota e a cenoura ralada.", "Recheie o pão e prense na sanduicheira por 4 minutos."], ingredientes: [{ nome: "Pão de forma", quantidade: "2 fatias" }, { nome: "Frango", quantidade: "2 colheres de sopa desfiado" }, { nome: "Ricota", quantidade: "1 colher de sopa" }, { nome: "Cenoura", quantidade: "1 colher de sopa ralada" }] },
  { nome: "Sanduíche de peru e queijo na sanduicheira", resumo: "Leve e proteico pra qualquer hora.", tipoRefeicao: Lanche, tempoPreparoMin: 8, dificuldade: "Fácil", rendimento: "1 porção", idadeMinimaMeses: 12, tags: ["lanche", "proteína"], passos: ["Monte o sanduíche com o peito de peru e o queijo.", "Prense na sanduicheira por 4 minutos."], ingredientes: [{ nome: "Pão de forma", quantidade: "2 fatias" }, { nome: "Peito de peru", quantidade: "2 fatias" }, { nome: "Queijo", quantidade: "1 fatia" }] },
  { nome: "Tapioca de queijo na sanduicheira", resumo: "Sem glúten e prontinha em minutos.", tipoRefeicao: Lanche, tempoPreparoMin: 8, dificuldade: "Fácil", rendimento: "1 porção", idadeMinimaMeses: 10, tags: ["sem glúten", "queijo"], passos: ["Espalhe a goma de tapioca na sanduicheira.", "Coloque o queijo no meio e prense por 3 minutos."], ingredientes: [{ nome: "Goma de tapioca", quantidade: "3 colheres de sopa" }, { nome: "Queijo", quantidade: "1 fatia" }] },
  { nome: "Panqueca de banana prensada no grill", resumo: "Doce natural, macia e sem açúcar.", tipoRefeicao: CafeDaManha, tempoPreparoMin: 10, dificuldade: "Fácil", rendimento: "1 porção", idadeMinimaMeses: 9, tags: ["fruta", "café da manhã"], passos: ["Amasse a banana e misture com o ovo e a aveia.", "Despeje a massa no grill e prense por 5 minutos, até firmar."], ingredientes: [{ nome: "Banana", quantidade: "1 unidade" }, { nome: "Ovo", quantidade: "1 unidade" }, { nome: "Aveia", quantidade: "2 colheres de sopa" }] },
  { nome: "Sanduíche de atum na sanduicheira", resumo: "Fonte de ômega, prático e saboroso.", tipoRefeicao: Lanche, tempoPreparoMin: 10, dificuldade: "Fácil", rendimento: "1 porção", idadeMinimaMeses: 12, tags: ["peixe", "lanche"], passos: ["Misture o atum com o requeijão.", "Recheie o pão e prense na sanduicheira por 4 minutos."], ingredientes: [{ nome: "Pão de forma", quantidade: "2 fatias" }, { nome: "Atum em lata", quantidade: "2 colheres de sopa" }, { nome: "Requeijão", quantidade: "1 colher de sopa" }] },
  { nome: "Misto de queijo e tomate no grill", resumo: "Queijinho derretido com um toque de tomate.", tipoRefeicao: Lanche, tempoPreparoMin: 8, dificuldade: "Fácil", rendimento: "1 porção", idadeMinimaMeses: 12, tags: ["queijo", "vegetal"], passos: ["Monte o sanduíche com o queijo e rodelas finas de tomate.", "Prense no grill por 4 minutos."], ingredientes: [{ nome: "Pão de forma", quantidade: "2 fatias" }, { nome: "Queijo", quantidade: "1 fatia" }, { nome: "Tomate", quantidade: "2 rodelas" }] },
  { nome: "Sanduíche de abacate e ovo na sanduicheira", resumo: "Gordura boa e proteína num lanche cremoso.", tipoRefeicao: CafeDaManha, tempoPreparoMin: 10, dificuldade: "Fácil", rendimento: "1 porção", idadeMinimaMeses: 12, tags: ["café da manhã", "abacate"], passos: ["Amasse o abacate e espalhe no pão.", "Coloque o ovo cozido fatiado e prense na sanduicheira por 3 minutos."], ingredientes: [{ nome: "Pão de forma", quantidade: "2 fatias" }, { nome: "Abacate", quantidade: "2 colheres de sopa" }, { nome: "Ovo", quantidade: "1 unidade cozido" }] },
  { nome: "Crepe de espinafre no grill", resumo: "Verdinho que passa despercebido.", tipoRefeicao: Almoco, tempoPreparoMin: 12, dificuldade: "Média", rendimento: "1 porção", idadeMinimaMeses: 12, tags: ["vegetal", "ovo"], passos: ["Bata o ovo com a farinha de trigo e o espinafre picado.", "Despeje no grill, coloque o queijo e prense por 5 minutos."], ingredientes: [{ nome: "Ovo", quantidade: "1 unidade" }, { nome: "Farinha de trigo", quantidade: "2 colheres de sopa" }, { nome: "Espinafre", quantidade: "1 colher de sopa picado" }, { nome: "Queijo", quantidade: "1 colher de sopa" }] },
  { nome: "Pãozinho de queijo prensado na sanduicheira", resumo: "Massa de tapioca com queijo, sequinho por fora.", tipoRefeicao: Lanche, tempoPreparoMin: 12, dificuldade: "Fácil", rendimento: "1 porção", idadeMinimaMeses: 12, tags: ["sem glúten", "queijo"], passos: ["Misture a goma de tapioca com o queijo e o ovo até formar uma massa.", "Coloque porções na sanduicheira e prense por 6 minutos."], ingredientes: [{ nome: "Goma de tapioca", quantidade: "3 colheres de sopa" }, { nome: "Queijo", quantidade: "2 colheres de sopa ralado" }, { nome: "Ovo", quantidade: "1 unidade" }] },

  // ================= PANELA DE PRESSÃO =================
  { nome: "Feijão macio na panela de pressão", resumo: "Base do almoço, cremoso e bem cozido.", tipoRefeicao: Almoco, tempoPreparoMin: 40, dificuldade: "Fácil", rendimento: "3 porções", idadeMinimaMeses: 8, tags: ["leguminosa", "ferro"], passos: ["Refogue a cebola e o alho no azeite dentro da panela de pressão.", "Junte o feijão e água até cobrir dois dedos acima.", "Cozinhe por 20 minutos após pegar pressão."], ingredientes: [{ nome: "Feijão", quantidade: "1 xícara" }, { nome: "Cebola", quantidade: "1/2 unidade" }, { nome: "Alho", quantidade: "1 dente" }, { nome: "Azeite", quantidade: "1 colher de chá" }] },
  { nome: "Carne desfiada na panela de pressão", resumo: "Macia de desmanchar, fácil de mastigar.", tipoRefeicao: Almoco, tempoPreparoMin: 45, dificuldade: "Média", rendimento: "3 porções", idadeMinimaMeses: 12, tags: ["proteína", "ferro"], passos: ["Doure o patinho com a cebola e o alho na panela de pressão.", "Cubra com água e cozinhe por 30 minutos após a pressão.", "Desfie a carne ainda quente."], ingredientes: [{ nome: "Patinho bovino", quantidade: "150 g" }, { nome: "Cebola", quantidade: "1/2 unidade" }, { nome: "Alho", quantidade: "1 dente" }] },
  { nome: "Frango desfiado na panela de pressão", resumo: "Pronto para rechear qualquer coisa.", tipoRefeicao: Almoco, tempoPreparoMin: 25, dificuldade: "Fácil", rendimento: "2 porções", idadeMinimaMeses: 8, tags: ["proteína", "frango"], passos: ["Coloque o frango, a cebola e a cenoura na panela de pressão com um pouco de água.", "Cozinhe por 15 minutos após pegar pressão.", "Desfie o frango."], ingredientes: [{ nome: "Frango", quantidade: "1 filé" }, { nome: "Cebola", quantidade: "1/2 unidade" }, { nome: "Cenoura", quantidade: "1/2 unidade" }] },
  { nome: "Sopa de legumes com frango na panela de pressão", resumo: "Jantar completo e reconfortante.", tipoRefeicao: Jantar, tempoPreparoMin: 25, dificuldade: "Fácil", rendimento: "2 porções", idadeMinimaMeses: 8, tags: ["sopa", "vegetais"], passos: ["Junte o frango, a batata, a cenoura, a abobrinha e o chuchu na panela de pressão com água.", "Cozinhe por 12 minutos após a pressão.", "Amasse levemente conforme a fase da criança."], ingredientes: [{ nome: "Frango", quantidade: "1/2 filé" }, { nome: "Batata", quantidade: "1 unidade" }, { nome: "Cenoura", quantidade: "1/2 unidade" }, { nome: "Abobrinha", quantidade: "1/4 unidade" }, { nome: "Chuchu", quantidade: "1/4 unidade" }] },
  { nome: "Canja de galinha na panela de pressão", resumo: "Aconchego em forma de comida.", tipoRefeicao: Jantar, tempoPreparoMin: 25, dificuldade: "Fácil", rendimento: "2 porções", idadeMinimaMeses: 8, tags: ["sopa", "arroz"], passos: ["Coloque o frango, o arroz e a cenoura na panela de pressão com bastante água.", "Cozinhe por 12 minutos após pegar pressão.", "Desfie o frango e sirva."], ingredientes: [{ nome: "Frango", quantidade: "1/2 filé" }, { nome: "Arroz", quantidade: "2 colheres de sopa" }, { nome: "Cenoura", quantidade: "1/2 unidade" }] },
  { nome: "Cozido de grão de bico na panela de pressão", resumo: "Leguminosa cremosa cheia de fibra.", tipoRefeicao: Almoco, tempoPreparoMin: 40, dificuldade: "Média", rendimento: "3 porções", idadeMinimaMeses: 12, tags: ["leguminosa", "fibra"], passos: ["Refogue a cebola e o tomate na panela de pressão.", "Junte o grão de bico, a cenoura e água até cobrir.", "Cozinhe por 20 minutos após a pressão."], ingredientes: [{ nome: "Grão de bico", quantidade: "1 xícara" }, { nome: "Cenoura", quantidade: "1/2 unidade" }, { nome: "Tomate", quantidade: "1/2 unidade" }, { nome: "Cebola", quantidade: "1/2 unidade" }] },
  { nome: "Lentilha com legumes na panela de pressão", resumo: "Ferro vegetal fácil de digerir.", tipoRefeicao: Almoco, tempoPreparoMin: 25, dificuldade: "Fácil", rendimento: "2 porções", idadeMinimaMeses: 8, tags: ["leguminosa", "ferro"], passos: ["Refogue a cebola na panela de pressão.", "Junte a lentilha, a cenoura e água.", "Cozinhe por 10 minutos após pegar pressão."], ingredientes: [{ nome: "Lentilha", quantidade: "1/2 xícara" }, { nome: "Cenoura", quantidade: "1/2 unidade" }, { nome: "Cebola", quantidade: "1/2 unidade" }] },
  { nome: "Mandioca com carne na panela de pressão", resumo: "Raiz macia com carninha desfiada.", tipoRefeicao: Jantar, tempoPreparoMin: 35, dificuldade: "Média", rendimento: "2 porções", idadeMinimaMeses: 12, tags: ["raiz", "proteína"], passos: ["Coloque a mandioca e a carne moída na panela de pressão com água.", "Cozinhe por 15 minutos após a pressão.", "Amasse a mandioca e misture com a carne."], ingredientes: [{ nome: "Mandioca", quantidade: "1 pedaço médio" }, { nome: "Carne moída", quantidade: "3 colheres de sopa" }] },
  { nome: "Abóbora com frango na panela de pressão", resumo: "Papa alaranjada, doce e nutritiva.", tipoRefeicao: Almoco, tempoPreparoMin: 20, dificuldade: "Fácil", rendimento: "2 porções", idadeMinimaMeses: 6, tags: ["vegetal", "frango"], passos: ["Coloque a abóbora e o frango na panela de pressão com um pouco de água.", "Cozinhe por 10 minutos após pegar pressão.", "Amasse ou desfie conforme a fase."], ingredientes: [{ nome: "Abóbora", quantidade: "1 fatia" }, { nome: "Frango", quantidade: "1/2 filé" }] },
  { nome: "Feijão com abóbora e couve na panela de pressão", resumo: "Feijão turbinado de vegetais.", tipoRefeicao: Almoco, tempoPreparoMin: 40, dificuldade: "Média", rendimento: "3 porções", idadeMinimaMeses: 9, tags: ["leguminosa", "vegetais"], passos: ["Refogue a cebola na panela de pressão.", "Junte o feijão, a abóbora e água.", "Cozinhe por 20 minutos após a pressão e misture a couve picada no fim."], ingredientes: [{ nome: "Feijão", quantidade: "1 xícara" }, { nome: "Abóbora", quantidade: "1 fatia" }, { nome: "Couve", quantidade: "1 folha picada" }, { nome: "Cebola", quantidade: "1/2 unidade" }] },

  // ================= MICRO-ONDAS =================
  { nome: "Bolo de caneca de banana no micro-ondas", resumo: "Docinho quentinho em 3 minutos.", tipoRefeicao: Lanche, tempoPreparoMin: 8, dificuldade: "Fácil", rendimento: "1 porção", idadeMinimaMeses: 9, tags: ["fruta", "doce natural"], passos: ["Amasse a banana e misture com o ovo, a aveia e a canela numa caneca.", "Leve ao micro-ondas por 2 a 3 minutos, até firmar."], ingredientes: [{ nome: "Banana", quantidade: "1 unidade" }, { nome: "Ovo", quantidade: "1 unidade" }, { nome: "Aveia", quantidade: "3 colheres de sopa" }, { nome: "Canela", quantidade: "1 pitada" }] },
  { nome: "Purê de batata rápido no micro-ondas", resumo: "Acompanhamento cremoso sem panela.", tipoRefeicao: Almoco, tempoPreparoMin: 12, dificuldade: "Fácil", rendimento: "1 porção", idadeMinimaMeses: 8, tags: ["raiz", "acompanhamento"], passos: ["Corte a batata em cubos e cozinhe no micro-ondas com um pouco de água por 6 minutos.", "Amasse com a manteiga até ficar cremoso."], ingredientes: [{ nome: "Batata", quantidade: "1 unidade" }, { nome: "Manteiga", quantidade: "1 colher de chá" }] },
  { nome: "Mingau de aveia no micro-ondas", resumo: "Café da manhã pronto em minutos.", tipoRefeicao: CafeDaManha, tempoPreparoMin: 6, dificuldade: "Fácil", rendimento: "1 porção", idadeMinimaMeses: 6, tags: ["café da manhã", "fibra"], passos: ["Misture a aveia com água e a banana amassada numa tigela.", "Leve ao micro-ondas por 2 minutos, mexa e sirva."], ingredientes: [{ nome: "Aveia", quantidade: "3 colheres de sopa" }, { nome: "Banana", quantidade: "1/2 unidade" }] },
  { nome: "Ovos mexidos no micro-ondas", resumo: "Proteína rápida do café da manhã.", tipoRefeicao: CafeDaManha, tempoPreparoMin: 5, dificuldade: "Fácil", rendimento: "1 porção", idadeMinimaMeses: 9, tags: ["ovo", "proteína"], passos: ["Bata o ovo com o queijo ralado numa tigela.", "Leve ao micro-ondas por 1 minuto, mexa e volte por mais 40 segundos."], ingredientes: [{ nome: "Ovo", quantidade: "1 unidade" }, { nome: "Queijo", quantidade: "1 colher de sopa ralado" }] },
  { nome: "Batata-doce cozida no micro-ondas", resumo: "Lanche doce de verdade, sem açúcar.", tipoRefeicao: Lanche, tempoPreparoMin: 8, dificuldade: "Fácil", rendimento: "1 porção", idadeMinimaMeses: 6, tags: ["raiz", "doce natural"], passos: ["Fure a batata-doce com um garfo.", "Leve ao micro-ondas por 5 minutos, até ficar macia.", "Amasse com uma pitada de canela."], ingredientes: [{ nome: "Batata-doce", quantidade: "1 unidade pequena" }, { nome: "Canela", quantidade: "1 pitada" }] },
  { nome: "Crumble de maçã e aveia no micro-ondas", resumo: "Sobremesa quentinha em 4 minutos.", tipoRefeicao: Lanche, tempoPreparoMin: 8, dificuldade: "Fácil", rendimento: "1 porção", idadeMinimaMeses: 8, tags: ["fruta", "fibra"], passos: ["Corte a maçã em cubos e cubra com a aveia e a canela.", "Leve ao micro-ondas por 4 minutos, até a maçã amaciar."], ingredientes: [{ nome: "Maçã", quantidade: "1 unidade" }, { nome: "Aveia", quantidade: "2 colheres de sopa" }, { nome: "Canela", quantidade: "1 pitada" }] },
  { nome: "Bolo de caneca de cenoura no micro-ondas", resumo: "Vegetal disfarçado de bolinho.", tipoRefeicao: Lanche, tempoPreparoMin: 8, dificuldade: "Fácil", rendimento: "1 porção", idadeMinimaMeses: 9, tags: ["vegetal", "lanche"], passos: ["Misture a cenoura ralada com o ovo, a aveia e a farinha de trigo numa caneca.", "Leve ao micro-ondas por 3 minutos, até firmar."], ingredientes: [{ nome: "Cenoura", quantidade: "1/2 unidade ralada" }, { nome: "Ovo", quantidade: "1 unidade" }, { nome: "Aveia", quantidade: "2 colheres de sopa" }, { nome: "Farinha de trigo", quantidade: "1 colher de sopa" }] },
  { nome: "Papa de abóbora com frango no micro-ondas", resumo: "Almoço macio pronto rapidinho.", tipoRefeicao: Almoco, tempoPreparoMin: 10, dificuldade: "Fácil", rendimento: "1 porção", idadeMinimaMeses: 6, tags: ["vegetal", "frango"], passos: ["Cozinhe a abóbora no micro-ondas com um pouco de água por 5 minutos.", "Amasse e misture com o frango desfiado."], ingredientes: [{ nome: "Abóbora", quantidade: "1 fatia" }, { nome: "Frango", quantidade: "2 colheres de sopa desfiado" }] },
  { nome: "Purê de maçã e pera no micro-ondas", resumo: "Fruta cozidinha, docinha e lisa.", tipoRefeicao: Lanche, tempoPreparoMin: 8, dificuldade: "Fácil", rendimento: "1 porção", idadeMinimaMeses: 6, tags: ["fruta", "papinha"], passos: ["Descasque e corte a maçã e a pera em cubos.", "Leve ao micro-ondas com um pouco de água por 4 minutos.", "Amasse até virar purê."], ingredientes: [{ nome: "Maçã", quantidade: "1/2 unidade" }, { nome: "Pera", quantidade: "1/2 unidade" }] },
  { nome: "Omelete de caneca no micro-ondas", resumo: "Refeição proteica em uma caneca.", tipoRefeicao: CafeDaManha, tempoPreparoMin: 6, dificuldade: "Fácil", rendimento: "1 porção", idadeMinimaMeses: 9, tags: ["ovo", "proteína"], passos: ["Bata o ovo com o queijo e o tomate picadinho numa caneca.", "Leve ao micro-ondas por 1 minuto e 30 segundos, até firmar."], ingredientes: [{ nome: "Ovo", quantidade: "1 unidade" }, { nome: "Queijo", quantidade: "1 colher de sopa" }, { nome: "Tomate", quantidade: "1 colher de sopa picado" }] },

  // ================= MIXER / PROCESSADOR =================
  { nome: "Hambúrguer de frango no processador", resumo: "Nutritivo e macio, sem nada industrializado.", tipoRefeicao: Almoco, tempoPreparoMin: 20, dificuldade: "Média", rendimento: "2 porções", idadeMinimaMeses: 12, tags: ["frango", "proteína"], passos: ["Processe o frango com a cenoura no processador até formar uma massa.", "Misture o ovo e a aveia, modele os hambúrgueres.", "Grelhe na frigideira até dourar dos dois lados."], ingredientes: [{ nome: "Frango", quantidade: "1 filé" }, { nome: "Cenoura", quantidade: "1/2 unidade" }, { nome: "Ovo", quantidade: "1 unidade" }, { nome: "Aveia", quantidade: "2 colheres de sopa" }] },
  { nome: "Almôndegas no processador", resumo: "Tempero batido e carne macia.", tipoRefeicao: Almoco, tempoPreparoMin: 20, dificuldade: "Fácil", rendimento: "2 porções", idadeMinimaMeses: 12, tags: ["carne", "proteína"], passos: ["Bata a cebola no processador e misture com a carne moída, o ovo e a aveia.", "Modele as almôndegas.", "Cozinhe no molho de tomate por 15 minutos."], ingredientes: [{ nome: "Carne moída", quantidade: "5 colheres de sopa" }, { nome: "Cebola", quantidade: "1/2 unidade" }, { nome: "Ovo", quantidade: "1 unidade" }, { nome: "Aveia", quantidade: "1 colher de sopa" }, { nome: "Molho de tomate", quantidade: "3 colheres de sopa" }] },
  { nome: "Patê de frango no mixer", resumo: "Recheio cremoso pra pão e torradas.", tipoRefeicao: Lanche, tempoPreparoMin: 10, dificuldade: "Fácil", rendimento: "2 porções", idadeMinimaMeses: 9, tags: ["frango", "lanche"], passos: ["Bata o frango cozido com o requeijão e a cenoura no mixer até ficar cremoso."], ingredientes: [{ nome: "Frango", quantidade: "3 colheres de sopa desfiado" }, { nome: "Requeijão", quantidade: "1 colher de sopa" }, { nome: "Cenoura", quantidade: "1/4 unidade cozida" }] },
  { nome: "Patê de atum no mixer", resumo: "Ômega numa pastinha saborosa.", tipoRefeicao: Lanche, tempoPreparoMin: 8, dificuldade: "Fácil", rendimento: "2 porções", idadeMinimaMeses: 12, tags: ["peixe", "lanche"], passos: ["Bata o atum com o requeijão no mixer até virar um patê liso."], ingredientes: [{ nome: "Atum em lata", quantidade: "3 colheres de sopa" }, { nome: "Requeijão", quantidade: "1 colher de sopa" }] },
  { nome: "Creme de abóbora com frango no mixer", resumo: "Sopa-creme aveludada e nutritiva.", tipoRefeicao: Jantar, tempoPreparoMin: 20, dificuldade: "Fácil", rendimento: "2 porções", idadeMinimaMeses: 6, tags: ["vegetal", "frango"], passos: ["Cozinhe a abóbora, a cenoura e o frango.", "Bata tudo com o mixer até ficar bem cremoso."], ingredientes: [{ nome: "Abóbora", quantidade: "1 fatia" }, { nome: "Cenoura", quantidade: "1/2 unidade" }, { nome: "Frango", quantidade: "2 colheres de sopa" }] },
  { nome: "Creme de brócolis no mixer", resumo: "Verdinho aveludado que a criança aceita.", tipoRefeicao: Jantar, tempoPreparoMin: 18, dificuldade: "Fácil", rendimento: "2 porções", idadeMinimaMeses: 8, tags: ["vegetal", "cálcio"], passos: ["Cozinhe o brócolis e a batata até ficarem macios.", "Bata com o mixer, junte o queijo ralado e misture."], ingredientes: [{ nome: "Brócolis", quantidade: "1 xícara" }, { nome: "Batata", quantidade: "1 unidade" }, { nome: "Queijo", quantidade: "1 colher de sopa ralado" }] },
  { nome: "Papa de carne e legumes no mixer", resumo: "Primeira papa salgada bem completa.", tipoRefeicao: Almoco, tempoPreparoMin: 20, dificuldade: "Fácil", rendimento: "2 porções", idadeMinimaMeses: 6, tags: ["papinha", "ferro"], passos: ["Cozinhe a carne moída, a batata e a cenoura.", "Bata levemente com o mixer, deixando a textura da fase da criança."], ingredientes: [{ nome: "Carne moída", quantidade: "3 colheres de sopa" }, { nome: "Batata", quantidade: "1 unidade" }, { nome: "Cenoura", quantidade: "1/2 unidade" }] },
  { nome: "Patê de ricota com cenoura no mixer", resumo: "Leve, colorido e cheio de cálcio.", tipoRefeicao: Lanche, tempoPreparoMin: 8, dificuldade: "Fácil", rendimento: "2 porções", idadeMinimaMeses: 9, tags: ["cálcio", "lanche"], passos: ["Bata a ricota com a cenoura cozida no mixer até ficar homogêneo."], ingredientes: [{ nome: "Ricota", quantidade: "3 colheres de sopa" }, { nome: "Cenoura", quantidade: "1/2 unidade cozida" }] },
  { nome: "Hambúrguer de feijão no processador", resumo: "Versão vegetariana rica em ferro.", tipoRefeicao: Almoco, tempoPreparoMin: 20, dificuldade: "Média", rendimento: "2 porções", idadeMinimaMeses: 12, tags: ["leguminosa", "vegetariano"], passos: ["Processe o feijão cozido com a cebola no processador.", "Misture a aveia e a cenoura ralada, modele os hambúrgueres.", "Grelhe na frigideira até firmar."], ingredientes: [{ nome: "Feijão", quantidade: "4 colheres de sopa cozido" }, { nome: "Aveia", quantidade: "2 colheres de sopa" }, { nome: "Cenoura", quantidade: "1/4 unidade ralada" }, { nome: "Cebola", quantidade: "1 colher de sopa" }] },
  { nome: "Creme de ervilha no mixer", resumo: "Docinho natural da ervilha, bem aveludado.", tipoRefeicao: Jantar, tempoPreparoMin: 18, dificuldade: "Fácil", rendimento: "2 porções", idadeMinimaMeses: 8, tags: ["leguminosa", "vegetal"], passos: ["Cozinhe a ervilha, a batata e o frango.", "Bata com o mixer até ficar um creme liso."], ingredientes: [{ nome: "Ervilha", quantidade: "1/2 xícara" }, { nome: "Batata", quantidade: "1 unidade" }, { nome: "Frango", quantidade: "2 colheres de sopa" }] },

  // ================= BATEDEIRA =================
  { nome: "Panqueca fofa de banana na batedeira", resumo: "Massa aerada que fica leve e macia.", tipoRefeicao: CafeDaManha, tempoPreparoMin: 12, dificuldade: "Fácil", rendimento: "1 porção", idadeMinimaMeses: 9, tags: ["fruta", "café da manhã"], passos: ["Bata a banana, o ovo e a aveia na batedeira até a massa ficar fofa.", "Despeje pequenas porções na frigideira e doure dos dois lados."], ingredientes: [{ nome: "Banana", quantidade: "1 unidade" }, { nome: "Ovo", quantidade: "1 unidade" }, { nome: "Aveia", quantidade: "2 colheres de sopa" }] },
  { nome: "Crepe de aveia na batedeira", resumo: "Fininho e dobrável, pra rechear do jeito que quiser.", tipoRefeicao: CafeDaManha, tempoPreparoMin: 12, dificuldade: "Fácil", rendimento: "1 porção", idadeMinimaMeses: 9, tags: ["café da manhã", "fibra"], passos: ["Bata o ovo, a aveia e a banana na batedeira até virar uma massa lisa.", "Espalhe fino na frigideira e doure."], ingredientes: [{ nome: "Ovo", quantidade: "1 unidade" }, { nome: "Aveia", quantidade: "2 colheres de sopa" }, { nome: "Banana", quantidade: "1/2 unidade" }] },
  { nome: "Omelete fofa na batedeira", resumo: "Ovinho aeradinho que cresce na frigideira.", tipoRefeicao: CafeDaManha, tempoPreparoMin: 10, dificuldade: "Fácil", rendimento: "1 porção", idadeMinimaMeses: 9, tags: ["ovo", "proteína"], passos: ["Bata os ovos na batedeira até dobrarem de volume.", "Junte o queijo e cozinhe na frigideira em fogo baixo, tampado."], ingredientes: [{ nome: "Ovo", quantidade: "1 unidade" }, { nome: "Queijo", quantidade: "1 colher de sopa ralado" }] },
  { nome: "Panqueca de cenoura na batedeira", resumo: "Colorida e docinha, com vegetal escondido.", tipoRefeicao: Lanche, tempoPreparoMin: 12, dificuldade: "Fácil", rendimento: "1 porção", idadeMinimaMeses: 10, tags: ["vegetal", "lanche"], passos: ["Bata a cenoura, o ovo e a farinha de trigo na batedeira.", "Doure pequenas porções na frigideira."], ingredientes: [{ nome: "Cenoura", quantidade: "1/2 unidade" }, { nome: "Ovo", quantidade: "1 unidade" }, { nome: "Farinha de trigo", quantidade: "2 colheres de sopa" }] },
  { nome: "Mousse de manga na batedeira", resumo: "Sobremesa gelada e cremosa de fruta.", tipoRefeicao: Lanche, tempoPreparoMin: 10, dificuldade: "Fácil", rendimento: "2 porções", idadeMinimaMeses: 9, tags: ["fruta", "sobremesa"], passos: ["Bata a manga com o iogurte e a gelatina já dissolvida na batedeira até ficar aerado.", "Leve à geladeira por 1 hora."], ingredientes: [{ nome: "Manga", quantidade: "1/2 unidade" }, { nome: "Iogurte natural", quantidade: "3 colheres de sopa" }, { nome: "Gelatina", quantidade: "1 colher de chá" }] },
  { nome: "Creme de morango na batedeira", resumo: "Rosadinho, leve e naturalmente doce.", tipoRefeicao: Lanche, tempoPreparoMin: 6, dificuldade: "Fácil", rendimento: "1 porção", idadeMinimaMeses: 8, tags: ["fruta", "sobremesa"], passos: ["Bata os morangos com o iogurte na batedeira até virar um creme."], ingredientes: [{ nome: "Morango", quantidade: "4 unidades" }, { nome: "Iogurte natural", quantidade: "3 colheres de sopa" }] },
  { nome: "Panqueca de maçã na batedeira", resumo: "Cheirinho de maçã com canela na frigideira.", tipoRefeicao: CafeDaManha, tempoPreparoMin: 12, dificuldade: "Fácil", rendimento: "1 porção", idadeMinimaMeses: 10, tags: ["fruta", "café da manhã"], passos: ["Bata a maçã ralada, o ovo, a aveia e a canela na batedeira.", "Doure porções pequenas na frigideira."], ingredientes: [{ nome: "Maçã", quantidade: "1/2 unidade" }, { nome: "Ovo", quantidade: "1 unidade" }, { nome: "Aveia", quantidade: "2 colheres de sopa" }, { nome: "Canela", quantidade: "1 pitada" }] },
  { nome: "Panqueca de abóbora na batedeira", resumo: "Massa alaranjada, macia e nutritiva.", tipoRefeicao: Lanche, tempoPreparoMin: 14, dificuldade: "Fácil", rendimento: "1 porção", idadeMinimaMeses: 12, tags: ["vegetal", "lanche"], passos: ["Bata a abóbora cozida, o ovo e a farinha de trigo na batedeira.", "Doure na frigideira dos dois lados."], ingredientes: [{ nome: "Abóbora", quantidade: "3 colheres de sopa" }, { nome: "Ovo", quantidade: "1 unidade" }, { nome: "Farinha de trigo", quantidade: "2 colheres de sopa" }] },
  { nome: "Creminho de abacate e banana na batedeira", resumo: "Gordura boa e energia num creme docinho.", tipoRefeicao: Lanche, tempoPreparoMin: 6, dificuldade: "Fácil", rendimento: "1 porção", idadeMinimaMeses: 6, tags: ["fruta", "papinha"], passos: ["Bata o abacate com a banana na batedeira até ficar um creme liso."], ingredientes: [{ nome: "Abacate", quantidade: "2 colheres de sopa" }, { nome: "Banana", quantidade: "1 unidade" }] },
  { nome: "Panqueca de beterraba na batedeira", resumo: "Rosa-choque e cheia de ferro.", tipoRefeicao: Lanche, tempoPreparoMin: 14, dificuldade: "Média", rendimento: "1 porção", idadeMinimaMeses: 12, tags: ["vegetal", "ferro"], passos: ["Bata a beterraba cozida, o ovo, a aveia e a farinha de trigo na batedeira.", "Doure porções na frigideira."], ingredientes: [{ nome: "Beterraba", quantidade: "1/2 unidade cozida" }, { nome: "Ovo", quantidade: "1 unidade" }, { nome: "Aveia", quantidade: "1 colher de sopa" }, { nome: "Farinha de trigo", quantidade: "1 colher de sopa" }] },
];

async function main() {
  const ings = await db.ingredient.findMany({ select: { id: true, nome: true } });
  const idPorNome = new Map(ings.map((i) => [i.nome, i.id]));

  // Valida: todo ingrediente citado precisa existir (nutrição depende disso).
  const faltando = new Set<string>();
  for (const r of RECEITAS) for (const i of r.ingredientes) if (!idPorNome.has(i.nome)) faltando.add(i.nome);
  if (faltando.size > 0) {
    console.error("Ingredientes inexistentes:", [...faltando].join(", "));
    process.exit(1);
  }

  let criadas = 0;
  let atualizadas = 0;
  const porEquip: Record<string, number> = {};

  for (const r of RECEITAS) {
    const equipamentos = deriveEquipamentos(r);
    for (const e of equipamentos.split(",")) porEquip[e] = (porEquip[e] ?? 0) + 1;

    const dados = {
      resumo: r.resumo,
      tipoRefeicao: r.tipoRefeicao,
      tempoPreparoMin: r.tempoPreparoMin,
      dificuldade: r.dificuldade,
      rendimento: r.rendimento,
      passos: r.passos.join("\n"),
      tags: r.tags.join(","),
      restricoes: deriveRestricoes(r.ingredientes),
      nutricao: "",
      idadeMinimaMeses: r.idadeMinimaMeses,
      equipamentos,
    };
    const ingCreate = {
      create: r.ingredientes.map((i) => ({ ingredientId: idPorNome.get(i.nome)!, quantidade: i.quantidade })),
    };

    const existente = await db.recipe.findFirst({ where: { nome: r.nome } });
    if (existente) {
      await db.recipeIngredient.deleteMany({ where: { recipeId: existente.id } });
      await db.recipe.update({ where: { id: existente.id }, data: { ...dados, ingredients: ingCreate } });
      atualizadas++;
    } else {
      await db.recipe.create({ data: { nome: r.nome, ...dados, ingredients: ingCreate } });
      criadas++;
    }
  }

  const total = await db.recipe.count();
  console.log(`\n✅ ${criadas} novas, ${atualizadas} atualizadas. Total de receitas no app: ${total}.`);
  console.log("Por equipamento:", Object.entries(porEquip).map(([k, v]) => `${k}=${v}`).join(" | "));
  console.log("\n⚠️  Rode agora:  npm run db:gramas   (converte as quantidades em gramas p/ a nutrição)\n");
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => db.$disconnect());
