/**
 * Referências diárias de nutrientes por faixa etária.
 *
 * Valores de RDA/AI das DRIs (Dietary Reference Intakes, Institute of
 * Medicine / National Academies), que são a base usada também pelas
 * recomendações brasileiras.
 *
 * IMPORTANTE: servem como REFERÊNCIA de leitura, não como meta clínica. O app
 * só enxerga as refeições planejadas — leite materno, fórmula e o que a criança
 * come fora do plano não entram na conta. Por isso a interface fala em
 * "cobertura do que está planejado", nunca em déficit.
 */

export type NutrienteChave =
  | "energiaKcal"
  | "proteinaG"
  | "fibraG"
  | "calcioMg"
  | "ferroMg"
  | "vitaminaCMg"
  | "zincoMg";

export type Nutriente = {
  chave: NutrienteChave;
  nome: string;
  unidade: string;
  /** Por que esse nutriente importa nessa fase — texto curto para a interface. */
  porque: string;
};

export const NUTRIENTES: Nutriente[] = [
  {
    chave: "energiaKcal",
    nome: "Energia",
    unidade: "kcal",
    porque: "Combustível do dia. Varia muito com o tamanho e o quanto a criança se mexe.",
  },
  {
    chave: "proteinaG",
    nome: "Proteína",
    unidade: "g",
    porque: "Constrói músculo e sustenta o crescimento.",
  },
  {
    chave: "ferroMg",
    nome: "Ferro",
    unidade: "mg",
    porque: "A carência mais comum da infância. Carne, feijão e folhas escuras.",
  },
  {
    chave: "calcioMg",
    nome: "Cálcio",
    unidade: "mg",
    porque: "Osso e dente em formação.",
  },
  {
    chave: "fibraG",
    nome: "Fibra",
    unidade: "g",
    porque: "Intestino funcionando e saciedade.",
  },
  {
    chave: "vitaminaCMg",
    nome: "Vitamina C",
    unidade: "mg",
    porque: "Melhora a absorção do ferro dos vegetais.",
  },
  {
    chave: "zincoMg",
    nome: "Zinco",
    unidade: "mg",
    porque: "Imunidade e paladar.",
  },
];

type Faixa = {
  ateMeses: number;
  rotulo: string;
  /** Quanto do total diário se espera que venha da comida (o resto é leite). */
  fracaoDaComida: number;
  valores: Record<NutrienteChave, number>;
};

const FAIXAS: Faixa[] = [
  {
    ateMeses: 11,
    rotulo: "6 a 11 meses",
    // Nessa fase o leite ainda é a base da nutrição.
    fracaoDaComida: 0.4,
    valores: {
      energiaKcal: 750,
      proteinaG: 11,
      ferroMg: 11,
      calcioMg: 260,
      fibraG: 5,
      vitaminaCMg: 50,
      zincoMg: 3,
    },
  },
  {
    ateMeses: 35,
    rotulo: "1 a 3 anos",
    fracaoDaComida: 0.8,
    valores: {
      energiaKcal: 1200,
      proteinaG: 13,
      ferroMg: 7,
      calcioMg: 700,
      fibraG: 19,
      vitaminaCMg: 15,
      zincoMg: 3,
    },
  },
  {
    ateMeses: 95,
    rotulo: "4 a 8 anos",
    fracaoDaComida: 0.9,
    valores: {
      energiaKcal: 1500,
      proteinaG: 19,
      ferroMg: 10,
      calcioMg: 1000,
      fibraG: 25,
      vitaminaCMg: 25,
      zincoMg: 5,
    },
  },
  {
    ateMeses: 999,
    rotulo: "9 a 13 anos",
    fracaoDaComida: 0.9,
    valores: {
      energiaKcal: 1900,
      proteinaG: 34,
      ferroMg: 8,
      calcioMg: 1300,
      fibraG: 26,
      vitaminaCMg: 45,
      zincoMg: 8,
    },
  },
];

export function faixaNutricional(idadeMeses: number): Faixa {
  return FAIXAS.find((f) => idadeMeses <= f.ateMeses) ?? FAIXAS[FAIXAS.length - 1];
}

export type CoberturaNutriente = {
  nutriente: Nutriente;
  /** Média diária entregue pelas refeições planejadas. */
  mediaDiaria: number;
  /** Referência diária esperada da comida, já descontada a parte do leite. */
  referencia: number;
  /** 0 a 100+ — quanto do esperado o plano cobre. */
  percentual: number;
  nivel: "baixo" | "adequado" | "alto";
};

export type CoberturaSemana = {
  faixa: string;
  diasComPlano: number;
  refeicoesConsideradas: number;
  /** Refeições sem dado nutricional completo — a leitura é um piso. */
  refeicoesParciais: number;
  itens: CoberturaNutriente[];
  /** Abaixo de 1 ano o leite domina e a leitura muda de sentido. */
  contaComLeite: boolean;
};

/**
 * Compara o que as refeições planejadas entregam por dia com a referência da
 * faixa etária. Acima de 130% marcamos "alto" só para sinalizar concentração —
 * não é alerta clínico.
 */
export function calcularCoberturaSemana(
  totais: Record<NutrienteChave, number>,
  diasComPlano: number,
  idadeMeses: number,
  refeicoesConsideradas: number,
  refeicoesParciais: number
): CoberturaSemana {
  const faixa = faixaNutricional(idadeMeses);
  const dias = Math.max(1, diasComPlano);

  const itens = NUTRIENTES.map((nutriente) => {
    const mediaDiaria = totais[nutriente.chave] / dias;
    const referencia = faixa.valores[nutriente.chave] * faixa.fracaoDaComida;
    const percentual = referencia > 0 ? (mediaDiaria / referencia) * 100 : 0;

    return {
      nutriente,
      mediaDiaria,
      referencia,
      percentual,
      nivel: percentual < 70 ? "baixo" : percentual > 130 ? "alto" : "adequado",
    } satisfies CoberturaNutriente;
  });

  return {
    faixa: faixa.rotulo,
    diasComPlano,
    refeicoesConsideradas,
    refeicoesParciais,
    itens,
    contaComLeite: idadeMeses <= 11,
  };
}
