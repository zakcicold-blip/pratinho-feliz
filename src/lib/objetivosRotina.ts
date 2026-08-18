/**
 * Objetivos nutricionais derivados da rotina da criança.
 *
 * IMPORTANTE — o que isto é e o que não é:
 * Estas são sugestões de cardápio baseadas em composição de alimentos. Não são
 * tratamento, diagnóstico nem promessa de resultado. Distúrbio de sono, agitação
 * persistente ou cansaço fora do normal são assunto de pediatra.
 *
 * Base de cada score:
 * - Magnésio, potássio, ferro, fibra, carboidrato, proteína e energia vêm da TACO
 *   (dado medido, cobertura de 93% a 97% no caso de magnésio/potássio/ferro).
 * - As vitaminas do complexo B vêm da TACO, mas com cobertura parcial (42% a 66%);
 *   quando faltam, o componente simplesmente não entra na média.
 * - Triptofano existe na TACO, mas com apenas 4% de cobertura — inutilizável.
 *   No lugar dele usamos ALIMENTOS_FONTE_TRIPTOFANO abaixo, que é uma
 *   classificação qualitativa de grupos alimentares reconhecidos como fonte,
 *   NÃO um valor medido.
 */

export type ObjetivoRotina = "SONO" | "ENERGIA" | "CALMA" | "EQUILIBRIO";

export const OBJETIVO_LABEL: Record<ObjetivoRotina, string> = {
  SONO: "Apoiar o sono",
  ENERGIA: "Mais disposição",
  CALMA: "Ajudar a regular",
  EQUILIBRIO: "Manter o equilíbrio",
};

export const OBJETIVO_DESCRICAO: Record<ObjetivoRotina, string> = {
  SONO: "Refeições com magnésio e alimentos fonte de triptofano, sem peso excessivo à noite.",
  ENERGIA: "Refeições com ferro, vitaminas do complexo B e energia de liberação lenta.",
  CALMA: "Refeições ricas em fibra e magnésio, evitando picos de açúcar.",
  EQUILIBRIO: "A rotina está equilibrada — o cardápio segue variado.",
};

/**
 * Grupos alimentares reconhecidos como fonte de triptofano.
 * Classificação qualitativa — ver aviso no topo do arquivo.
 */
const ALIMENTOS_FONTE_TRIPTOFANO = new Set([
  "leite",
  "queijo",
  "requeijao",
  "iogurte natural",
  "ovo",
  "aveia",
  "banana",
  "frango",
  "peito de peru",
  "file de peixe",
  "amendoim",
  "castanhas",
  "grao de bico",
  "lentilha",
  "quinoa",
]);

function norm(s: string) {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

export type IngredienteScore = {
  gramas: number | null;
  ingredient: {
    nome: string;
    energiaKcal: number | null;
    proteinaG: number | null;
    carboidratoG: number | null;
    fibraG: number | null;
    ferroMg: number | null;
    magnesioMg: number | null;
    tiaminaMg: number | null;
    riboflavinaMg: number | null;
    piridoxinaMg: number | null;
    niacinaMg: number | null;
  };
};

/** Converte um valor em uma nota 0..1, saturando no teto de referência. */
function normalizar(valor: number, referencia: number): number {
  if (referencia <= 0) return 0;
  return Math.max(0, Math.min(1, valor / referencia));
}

/** Média apenas dos componentes que têm dado, para não punir lacuna da tabela. */
function media(componentes: (number | null)[]): number {
  const validos = componentes.filter((c): c is number => c !== null);
  if (validos.length === 0) return 0;
  return validos.reduce((a, b) => a + b, 0) / validos.length;
}

export type ScoresReceita = {
  sono: number;
  energia: number;
  calma: number;
};

/**
 * Calcula a aptidão da receita (0 a 100) para cada objetivo, a partir dos
 * valores por porção dos ingredientes.
 */
export function calcularScores(itens: IngredienteScore[], porcoes: number): ScoresReceita | null {
  const divisor = porcoes > 0 ? porcoes : 1;

  let energia = 0;
  let proteina = 0;
  let carboidrato = 0;
  let fibra = 0;
  let ferro = 0;
  let magnesio = 0;
  let vitaminasB = 0;
  let vitaminasBComDado = 0;
  let pesoTriptofano = 0;
  let algumDado = false;

  for (const item of itens) {
    const ing = item.ingredient;
    if (item.gramas === null || ing.energiaKcal === null) {
      // Sem peso ou sem composição: só conta para o proxy de triptofano.
      if (ALIMENTOS_FONTE_TRIPTOFANO.has(norm(ing.nome))) pesoTriptofano += 1;
      continue;
    }

    algumDado = true;
    const f = item.gramas / 100;

    energia += (ing.energiaKcal ?? 0) * f;
    proteina += (ing.proteinaG ?? 0) * f;
    carboidrato += (ing.carboidratoG ?? 0) * f;
    fibra += (ing.fibraG ?? 0) * f;
    ferro += (ing.ferroMg ?? 0) * f;
    magnesio += (ing.magnesioMg ?? 0) * f;

    for (const v of [ing.tiaminaMg, ing.riboflavinaMg, ing.piridoxinaMg, ing.niacinaMg]) {
      if (v !== null) {
        vitaminasB += v * f;
        vitaminasBComDado++;
      }
    }

    if (ALIMENTOS_FONTE_TRIPTOFANO.has(norm(ing.nome))) pesoTriptofano += 1;
  }

  if (!algumDado) return null;

  const porPorcao = {
    energia: energia / divisor,
    proteina: proteina / divisor,
    carboidrato: carboidrato / divisor,
    fibra: fibra / divisor,
    ferro: ferro / divisor,
    magnesio: magnesio / divisor,
    vitaminasB: vitaminasB / divisor,
  };

  // Tetos de referência: valores por porção considerados "bem servidos" para
  // uma refeição infantil. Servem para normalizar, não são recomendações de IDR.
  const nMagnesio = normalizar(porPorcao.magnesio, 60);
  const nFerro = normalizar(porPorcao.ferro, 3);
  const nFibra = normalizar(porPorcao.fibra, 6);
  const nProteina = normalizar(porPorcao.proteina, 15);
  const nVitB = vitaminasBComDado > 0 ? normalizar(porPorcao.vitaminasB, 1.5) : null;
  const nTriptofano = normalizar(pesoTriptofano, 2);

  // Carboidrato acompanhado de fibra libera energia mais devagar. Sem fibra,
  // funciona como proxy de carboidrato de absorção rápida.
  const densidadeFibra = porPorcao.carboidrato > 0 ? porPorcao.fibra / porPorcao.carboidrato : 0;
  const nCarboLento = normalizar(densidadeFibra, 0.12);
  const penalidadeCarboRapido = 1 - nCarboLento;

  // Refeição muito densa à noite pesa contra o sono.
  const penalidadePesada = normalizar(Math.max(0, porPorcao.energia - 350), 250);

  const sono = media([
    nMagnesio,
    nTriptofano,
    nCarboLento * 0.7,
    1 - penalidadePesada,
  ]);

  const energiaScore = media([nFerro, nVitB, nCarboLento, nProteina]);

  const calma = media([nMagnesio, nFibra, 1 - penalidadePesada, 1 - penalidadeCarboRapido]);

  const pct = (n: number) => Math.round(Math.max(0, Math.min(1, n)) * 100);

  return { sono: pct(sono), energia: pct(energiaScore), calma: pct(calma) };
}

// ---------------------------------------------------------------------------
// Leitura da rotina → objetivo
// ---------------------------------------------------------------------------

export type SinaisRotina = {
  /** Média de horas de sono nos últimos dias, quando registrada. */
  horasSono: number | null;
  /** Pior/predominante qualidade de sono registrada. */
  qualidadeSono: "BOA" | "REGULAR" | "RUIM" | null;
  /** Média de minutos de atividade por dia registrado. */
  atividadeMinutos: number | null;
  disposicao: "BAIXA" | "NORMAL" | "ALTA" | null;
  /** Idade em meses, usada para o alvo de sono. */
  idadeMeses: number;
};

export type LeituraRotina = {
  objetivo: ObjetivoRotina;
  /** Frases curtas explicando o que levou a esse objetivo. */
  motivos: string[];
  /** `true` quando nenhum dos três pilares foi respondido. */
  semDados: boolean;
  /** Pilares ainda não respondidos, para a interface poder pedir. */
  pilaresFaltando: string[];
};

/**
 * Alvo de sono por idade, em horas, seguindo as faixas amplamente usadas em
 * pediatria (1-2 anos: 11-14 h; 3-5 anos: 10-13 h; 6-12 anos: 9-12 h).
 * Usado só para dizer se o sono está curto — não é diagnóstico.
 */
function sonoCurto(horas: number, idadeMeses: number): boolean {
  if (idadeMeses < 12) return horas < 12;
  if (idadeMeses < 36) return horas < 11;
  if (idadeMeses < 72) return horas < 10;
  return horas < 9;
}

/**
 * Decide o objetivo a partir dos três pilares.
 *
 * A ordem de prioridade reflete o que mais atrapalha a rotina da família:
 * 1. Agitação alta somada a sono ruim → regular antes de tudo.
 * 2. Sono ruim/curto → apoiar o sono.
 * 3. Disposição alta demais → ajudar a regular.
 * 4. Disposição baixa ou pouca atividade → mais disposição.
 */
export function lerRotina(sinais: SinaisRotina): LeituraRotina {
  const motivos: string[] = [];
  const faltando: string[] = [];

  const temSono = sinais.qualidadeSono !== null || sinais.horasSono !== null;
  const temAtividade = sinais.atividadeMinutos !== null;
  const temDisposicao = sinais.disposicao !== null;

  if (!temSono) faltando.push("sono");
  if (!temAtividade) faltando.push("atividade física");
  if (!temDisposicao) faltando.push("disposição");

  if (!temSono && !temAtividade && !temDisposicao) {
    return { objetivo: "EQUILIBRIO", motivos: [], semDados: true, pilaresFaltando: faltando };
  }

  const sonoRuim =
    sinais.qualidadeSono === "RUIM" ||
    (sinais.horasSono !== null && sonoCurto(sinais.horasSono, sinais.idadeMeses));
  const sonoRegular = sinais.qualidadeSono === "REGULAR";
  const agitado = sinais.disposicao === "ALTA";
  const semPique = sinais.disposicao === "BAIXA";
  const poucaAtividade = sinais.atividadeMinutos !== null && sinais.atividadeMinutos < 30;
  const muitaAtividade = sinais.atividadeMinutos !== null && sinais.atividadeMinutos >= 90;

  if (sonoRuim) motivos.push("o sono está curto ou de má qualidade");
  if (sonoRegular && !sonoRuim) motivos.push("o sono está irregular");
  if (agitado) motivos.push("a disposição está muito alta");
  if (semPique) motivos.push("a disposição está baixa");
  if (poucaAtividade) motivos.push("a atividade física está abaixo de 30 min por dia");
  if (muitaAtividade) motivos.push("há bastante atividade física no dia");

  // 1. Agitação + sono ruim: o caso que o cardápio mais pode ajudar a regular.
  if (agitado && (sonoRuim || sonoRegular)) {
    return { objetivo: "CALMA", motivos, semDados: false, pilaresFaltando: faltando };
  }

  // 2. Sono como problema isolado.
  if (sonoRuim) {
    return { objetivo: "SONO", motivos, semDados: false, pilaresFaltando: faltando };
  }

  // 3. Agitação sem problema de sono.
  if (agitado) {
    return { objetivo: "CALMA", motivos, semDados: false, pilaresFaltando: faltando };
  }

  // 4. Falta de energia — seja por disposição baixa, seja por pouca atividade.
  if (semPique || poucaAtividade) {
    return { objetivo: "ENERGIA", motivos, semDados: false, pilaresFaltando: faltando };
  }

  if (sonoRegular) {
    return { objetivo: "SONO", motivos, semDados: false, pilaresFaltando: faltando };
  }

  return {
    objetivo: "EQUILIBRIO",
    motivos: motivos.length ? motivos : ["sono, atividade e disposição dentro do esperado"],
    semDados: false,
    pilaresFaltando: faltando,
  };
}

/** Campo de score correspondente ao objetivo, para ordenar receitas. */
export function campoDoObjetivo(objetivo: ObjetivoRotina): "scoreSono" | "scoreEnergia" | "scoreCalma" | null {
  if (objetivo === "SONO") return "scoreSono";
  if (objetivo === "ENERGIA") return "scoreEnergia";
  if (objetivo === "CALMA") return "scoreCalma";
  return null;
}
