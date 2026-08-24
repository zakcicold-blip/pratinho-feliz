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
