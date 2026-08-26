/**
 * Espacos de foto da landing.
 *
 * Cada entrada e um lugar reservado na pagina. Enquanto `arquivo` for null o
 * espaco nao aparece para quem visita — em desenvolvimento ele vira um
 * placeholder visivel, com o tamanho recomendado, para dar para enxergar onde
 * a foto vai entrar.
 *
 * Para publicar uma foto: coloque o arquivo em `public/fotos/` e troque o
 * `arquivo: null` pelo nome dele. Nao da para descobrir isso sozinho lendo a
 * pasta: na Vercel o codigo roda em funcao serverless, que nao enxerga
 * `public/` — esses arquivos sao servidos pela CDN, fora do sistema de
 * arquivos da funcao.
 */
export type FotoSite = {
  /** Nome do arquivo dentro de public/fotos, ou null enquanto nao existir. */
  arquivo: string | null;
  /** Texto alternativo — descreve a cena para leitor de tela e para o Google. */
  alt: string;
  /** Legenda opcional exibida sobre a foto. */
  legenda?: string;
  /** Proporcao do espaco, para o placeholder e para reservar o lugar. */
  proporcao: string;
  /** Dica de tamanho, mostrada no placeholder em desenvolvimento. */
  dica: string;
};

/**
 * As quatro cenas de "Um dia comum".
 *
 * A ordem nao e decorativa, e o arco que a pessoa vive: a recusa (a dor), o
 * branco das 18h (o momento em que ela procuraria um app), a refeicao que
 * funciona (o alivio) e a lancheira pronta (o depois). Reconhecimento vem
 * antes de argumento — quem le "isso e a minha casa" continua lendo.
 *
 * Cada cena tem texto proprio e funciona SEM foto: enquanto nao houver
 * imagem, a secao aparece so com o texto, em vez de sumir da pagina. Foto
 * aqui melhora a secao, nao sustenta ela.
 */
export type CenaDoDia = {
  foto: FotoSite;
  etapa: string;
  titulo: string;
  texto: string;
};

export const CENAS_DO_DIA: CenaDoDia[] = [
  {
    foto: {
      arquivo: null,
      alt: "Criança pequena de boca fechada, virando o rosto para o prato na mesa",
      proporcao: "4 / 3",
      dica: "1200×900 — criança recusando comida, expressão fechada",
    },
    etapa: "Terça, 12h10",
    titulo: "Ele empurra o prato de novo",
    texto:
      "É a terceira vez na semana com o mesmo prato, e você já sabe como termina. Insistir cansa os dois, e trocar por outra coisa parece render mais — até virar a única coisa que ele come.",
  },
  {
    foto: {
      arquivo: null,
      alt: "Mãe de pé olhando dentro da geladeira aberta no fim da tarde",
      proporcao: "4 / 3",
      dica: "1200×900 — geladeira aberta, fim de tarde, luz baixa",
    },
    etapa: "Terça, 18h05",
    titulo: "A geladeira aberta e nenhuma ideia",
    texto:
      "O jantar precisa sair em quarenta minutos. Tem comida na geladeira, mas não tem decisão — e decidir com fome, com criança pedindo colo, é o que faz a semana inteira virar macarrão.",
  },
  {
    foto: {
      arquivo: null,
      alt: "Mãe dando comida na boca do filho pequeno, os dois sentados à mesa",
      proporcao: "4 / 3",
      dica: "1200×900 — mãe dando comida, momento tranquilo",
    },
    etapa: "Quinta, 12h",
    titulo: "O almoço que já estava decidido às sete da manhã",
    texto:
      "Você abriu o app, viu o que era, e tinha os ingredientes porque a lista foi feita no sábado. A refeição não ficou mais gostosa por causa disso — ficou mais fácil, que é o que faltava.",
  },
  {
    foto: {
      arquivo: null,
      alt: "Lancheira montada sobre a bancada, pronta para a escola",
      proporcao: "4 / 3",
      dica: "1200×900 — lancheira ou marmita pronta na bancada",
    },
    etapa: "Sexta, 7h20",
    titulo: "A semana montada antes de começar",
    texto:
      "Trinta dias no ar, a lista pronta, o que ele recusou fora do caminho. Você continua cozinhando — só parou de decidir tudo em cima da hora.",
  },
];

/** Faixa de fotos reais de criancas comendo, depois de "Como funciona". */
export const FOTOS_CRIANCAS: FotoSite[] = [
  {
    arquivo: null,
    alt: "Criança comendo uma refeição montada no Pratinho Feliz",
    legenda: "Almoço de terça",
    proporcao: "4 / 5",
    dica: "1200×1500 (retrato 4:5)",
  },
  {
    arquivo: null,
    alt: "Prato infantil colorido servido em casa",
    legenda: "Feito em 20 minutos",
    proporcao: "4 / 5",
    dica: "1200×1500 (retrato 4:5)",
  },
  {
    arquivo: null,
    alt: "Criança pequena experimentando um alimento novo",
    legenda: "Aceitou de primeira",
    proporcao: "4 / 5",
    dica: "1200×1500 (retrato 4:5)",
  },
];

/** Foto larga da faixa antes dos planos. */
export const FOTO_MESA: FotoSite = {
  arquivo: null,
  alt: "Mesa posta com refeições da semana preparadas pelo plano do app",
  proporcao: "16 / 7",
  dica: "1600×700 (panorâmica)",
};

/** Fotos que acompanham os passos de "Como funciona". */
export const FOTO_ROTINA: FotoSite = {
  arquivo: null,
  alt: "Responsável usando o app na cozinha enquanto prepara a refeição",
  proporcao: "1 / 1",
  dica: "1000×1000 (quadrada)",
};

export function caminhoDaFoto(foto: FotoSite): string | null {
  return foto.arquivo ? `/fotos/${foto.arquivo}` : null;
}

/** Se ha ao menos uma foto publicada — usado para esconder a secao inteira. */
export function algumaPublicada(fotos: FotoSite[]): boolean {
  return fotos.some((f) => f.arquivo !== null);
}
