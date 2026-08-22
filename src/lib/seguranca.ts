/**
 * Base de segurança alimentar infantil.
 *
 * Conteúdo fundamentado em:
 * - Ministério da Saúde — Guia Alimentar para Crianças Brasileiras Menores de 2 Anos (2019)
 * - Sociedade Brasileira de Pediatria — Guia Prático de Alimentação Complementar e Método BLW
 * - American Academy of Pediatrics — Policy Statement on Prevention of Choking Among Children
 *
 * Regra de ouro do formato: o que passa por um tubo de papel higiênico
 * (cerca de 4,4 cm) cabe na traqueia de uma criança pequena.
 */

export type NivelRisco = "alto" | "medio";

export type AlimentoRisco = {
  nome: string;
  nivel: NivelRisco;
  porque: string;
  /** Como NÃO oferecer. */
  errado: string;
  /** Como oferecer com segurança. */
  certo: string;
  /** Até que idade o cuidado se mantém. */
  ateQuando: string;
};

export const ALIMENTOS_RISCO: AlimentoRisco[] = [
  {
    nome: "Uva e frutas redondas",
    nivel: "alto",
    porque:
      "O formato redondo e a casca escorregadia fazem a fruta inteira vedar a traqueia como uma rolha.",
    errado: "Inteira, ou cortada ao meio na largura (continua redonda).",
    certo: "Cortada no comprimento em 4 pedaços. Mirtilo e uva pequena: ao meio, no comprimento.",
    ateQuando: "Até os 4 ou 5 anos",
  },
  {
    nome: "Salsicha e linguiça",
    nivel: "alto",
    porque:
      "A rodela tem exatamente o diâmetro da traqueia infantil. É o alimento que mais causa morte por asfixia segundo a Academia Americana de Pediatria.",
    errado: "Em rodelas — o formato mais perigoso que existe.",
    certo:
      "Cortada no comprimento (em quatro tiras) e depois em pedacinhos. Sendo ultraprocessada, o ideal é evitar antes dos 2 anos.",
    ateQuando: "Até os 4 anos",
  },
  {
    nome: "Tomate-cereja",
    nivel: "alto",
    porque: "Mesmo problema da uva: redondo, firme por fora e escorregadio.",
    errado: "Inteiro ou partido ao meio.",
    certo: "Cortado no comprimento em 4 pedaços.",
    ateQuando: "Até os 4 anos",
  },
  {
    nome: "Castanhas, amendoim e nozes",
    nivel: "alto",
    porque:
      "São duras, não se dissolvem com a saliva e, se aspiradas, alojam-se no pulmão e inflamam.",
    errado: "Inteiras ou picadas grosseiramente, em qualquer idade pequena.",
    certo:
      "Como pasta lisa espalhada fina no pão, ou trituradas em farelo fino sobre a comida. Inteiras, só depois dos 4 anos.",
    ateQuando: "Inteiras: só após 4 anos",
  },
  {
    nome: "Pipoca",
    nivel: "alto",
    porque:
      "Casca fina e irregular que não amolece na boca e escapa fácil para a via aérea. Grãos não estourados são ainda piores.",
    errado: "Oferecer em qualquer quantidade para criança pequena.",
    certo: "Evitar por completo. Não existe forma segura de cortar pipoca.",
    ateQuando: "Até os 4 ou 5 anos",
  },
  {
    nome: "Cenoura e maçã cruas",
    nivel: "alto",
    porque:
      "Duras o bastante para soltar lascas grandes na mordida, antes de a criança ter molares para triturar.",
    errado: "Em palito cru, rodela crua ou pedaço grande com casca.",
    certo:
      "Cozidas até ficarem macias (amassam entre os dedos), ou raladas bem fininhas quando cruas.",
    ateQuando: "Até os 4 anos",
  },
  {
    nome: "Bala dura, pirulito e chiclete",
    nivel: "alto",
    porque: "Não se desfazem, escorregam inteiros e podem ser inalados numa risada ou num susto.",
    errado: "Oferecer em qualquer situação.",
    certo: "Evitar. Além do engasgo, são açúcar puro — desaconselhado antes dos 2 anos.",
    ateQuando: "Até os 4 anos",
  },
  {
    nome: "Uva-passa e frutas secas",
    nivel: "medio",
    porque: "Grudam no céu da boca e incham com a saliva, formando um bolo difícil de engolir.",
    errado: "Inteiras, direto do pacote.",
    certo: "Picadas bem miúdas ou hidratadas e amassadas junto com outro alimento.",
    ateQuando: "Até os 3 anos",
  },
  {
    nome: "Queijo em cubos",
    nivel: "medio",
    porque: "O cubo tem o formato exato para entalar; o queijo ainda amolece e adere à traqueia.",
    errado: "Em cubos ou bolinhas.",
    certo: "Em tiras finas e compridas, ou ralado.",
    ateQuando: "Até os 4 anos",
  },
  {
    nome: "Carne em pedaço",
    nivel: "medio",
    porque:
      "A fibra da carne não se rompe sem molares. A criança mastiga, não consegue desfazer e engole inteiro.",
    errado: "Cubos de carne, bife cortado em quadrados, frango em pedaço com nervura.",
    certo: "Desfiada, moída ou em tiras longas e macias que ela raspe com a gengiva.",
    ateQuando: "Até os 3 anos",
  },
  {
    nome: "Pão amassado e massa crua",
    nivel: "medio",
    porque: "Vira uma bola de goma na boca, que gruda e não se desfaz com a saliva.",
    errado: "Miolo de pão amassado na mão, bolinhas de massa.",
    certo: "Pão levemente tostado, cortado em tiras. Massa sempre bem cozida.",
    ateQuando: "Até os 2 anos",
  },
  {
    nome: "Azeitona e frutas com caroço",
    nivel: "medio",
    porque: "O caroço é duro, liso e do tamanho exato para obstruir.",
    errado: "Servir com caroço, contando que a criança cuspa.",
    certo: "Sempre descaroçadas e cortadas no comprimento.",
    ateQuando: "Até os 4 anos",
  },
];

export type RegraIdade = {
  item: string;
  regra: string;
  porque: string;
  liberaEm: string;
};

export const PROIBIDOS_POR_IDADE: RegraIdade[] = [
  {
    item: "Mel",
    regra: "Nunca antes de 1 ano",
    porque:
      "Pode conter esporos de Clostridium botulinum. O intestino do bebê ainda não impede que germinem, o que causa botulismo infantil — grave e potencialmente fatal.",
    liberaEm: "12 meses",
  },
  {
    item: "Sal",
    regra: "Nada de sal adicionado no 1º ano",
    porque:
      "Os rins do bebê não dão conta da sobrecarga de sódio, e o paladar se molda cedo ao excesso. Tempere com alho, cebola, azeite e ervas.",
    liberaEm: "Após 1 ano, em quantidade mínima",
  },
  {
    item: "Açúcar",
    regra: "Nenhum açúcar até os 2 anos",
    porque:
      "Inclui mel, melado, açúcar mascavo, sucos adoçados e bolachas doces. Reduz a aceitação de sabores naturais e aumenta o risco de cárie e obesidade.",
    liberaEm: "24 meses",
  },
  {
    item: "Leite de vaca como bebida",
    regra: "Não antes de 1 ano",
    porque:
      "Tem pouco ferro, atrapalha a absorção do ferro dos outros alimentos e pode causar micro-sangramentos no intestino do lactente.",
    liberaEm: "12 meses, e ainda assim abaixo de 500 ml por dia",
  },
  {
    item: "Ultraprocessados",
    regra: "Evitar até os 2 anos",
    porque:
      "Salgadinho, macarrão instantâneo, embutido, refrigerante, iogurte adoçado e bolacha recheada. Deslocam comida de verdade e moldam o paladar.",
    liberaEm: "Quanto mais tarde, melhor",
  },
  {
    item: "Suco de fruta",
    regra: "Evitar no 1º ano",
    porque:
      "Concentra açúcar, tira a fibra e a mastigação, e ocupa o espaço do leite e da comida. Ofereça a fruta inteira e água.",
    liberaEm: "Após 1 ano, no máximo 120 ml por dia",
  },
  {
    item: "Café, chá preto e mate",
    regra: "Evitar na primeira infância",
    porque:
      "A cafeína altera o sono e os taninos reduzem bastante a absorção de ferro quando tomados junto às refeições.",
    liberaEm: "Idade escolar, com moderação",
  },
  {
    item: "Cru ou malpassado",
    regra: "Nunca",
    porque:
      "Ovo cru ou mole, carne malpassada, peixe cru e leite não pasteurizado — risco de salmonela, E. coli e listéria, muito mais graves em bebês.",
    liberaEm: "Sempre bem cozido",
  },
];

export const REGRAS_MESA = [
  {
    titulo: "Sempre sentado e ereto",
    texto:
      "Cadeirão com apoio para os pés e tronco na vertical. Comer deitado, reclinado, no colo em movimento ou no carro multiplica o risco.",
  },
  {
    titulo: "Nunca correndo, rindo ou brincando",
    texto:
      "A maior parte dos engasgos acontece com a criança em movimento. Refeição é sentada e sem correria pela casa.",
  },
  {
    titulo: "Um adulto presente e olhando",
    texto:
      "Engasgo verdadeiro é silencioso — não há barulho para chamar sua atenção. Só se percebe olhando.",
  },
  {
    titulo: "Sem tela durante a refeição",
    texto:
      "A criança distraída esquece de mastigar e engole pedaços maiores. Também atrapalha o aprendizado de fome e saciedade.",
  },
  {
    titulo: "Uma porção pequena por vez",
    texto:
      "Prato cheio convida a encher a boca. Ofereça poucos pedaços e reponha conforme ela dá conta.",
  },
  {
    titulo: "Faça um curso de desengasgo",
    texto:
      "Primeiros socorros para bebês é a única coisa desta lista que ajuda depois que o acidente já aconteceu. Vale mais que qualquer regra de corte.",
  },
];

export const FONTES = [
  {
    nome: "Guia Alimentar para Crianças Brasileiras Menores de 2 Anos — Ministério da Saúde",
    url: "https://bvsms.saude.gov.br/bvs/publicacoes/guia_alimentar_criancas_menores_2anos.pdf",
  },
  {
    nome: "Alimentação Complementar e o Método BLW — Sociedade Brasileira de Pediatria",
    url: "https://www.sbp.com.br/fileadmin/user_upload/19491c-GP_-_AlimCompl_-_Metodo_BLW.pdf",
  },
  {
    nome: "Choking Prevention — American Academy of Pediatrics",
    url: "https://www.healthychildren.org/English/health-issues/injuries-emergencies/Pages/Choking-Prevention.aspx",
  },
];
