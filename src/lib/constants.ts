export const TIPO_REFEICAO_LABEL: Record<string, string> = {
  CAFE_DA_MANHA: "Café da manhã",
  ALMOCO: "Almoço",
  LANCHE: "Lanche",
  JANTAR: "Jantar",
};

export const TIPO_REFEICAO_ORDEM = ["CAFE_DA_MANHA", "ALMOCO", "LANCHE", "JANTAR"];

export const PRATICIDADE_LABEL: Record<string, string> = {
  MUITO_RAPIDO: "Muito rápido",
  EQUILIBRADO: "Equilibrado",
  PODE_COZINHAR_MAIS: "Pode cozinhar mais",
};

export const OBJETIVO_LABEL: Record<string, string> = {
  ORGANIZAR_ROTINA: "Organizar a rotina",
  VARIAR_CARDAPIO: "Variar o cardápio",
  APRESENTAR_NOVOS_ALIMENTOS: "Apresentar novos alimentos",
  REDUZIR_IMPROVISO: "Reduzir o improviso",
};

export const ESTADO_FEEDBACK_LABEL: Record<string, string> = {
  GOSTOU: "Gostou",
  ACEITOU: "Aceitou",
  EXPERIMENTOU: "Experimentou",
  RECUSOU: "Recusou",
};

export const STATUS_SLOT_LABEL: Record<string, string> = {
  PLANEJADO: "Planejado",
  TROCADO: "Trocado",
  FORA_DE_CASA: "Fora de casa",
  SEM_TEMPO: "Sem tempo",
  CONCLUIDO: "Concluído",
};

export const CATEGORIA_INGREDIENTE_LABEL: Record<string, string> = {
  HORTIFRUTI: "Feira / Hortifruti",
  PROTEINA: "Açougue / Proteínas",
  MERCEARIA: "Mercearia",
  LATICINIOS: "Laticínios",
  OUTROS: "Outros",
};

export const CATEGORIA_INGREDIENTE_ORDEM = [
  "HORTIFRUTI",
  "PROTEINA",
  "LATICINIOS",
  "MERCEARIA",
  "OUTROS",
];

export const FAIXAS_ETARIAS = [
  "6 meses a 1 ano",
  "1 a 2 anos",
  "2 a 3 anos",
  "3 a 5 anos",
  "6 a 8 anos",
  "9 a 12 anos",
];
