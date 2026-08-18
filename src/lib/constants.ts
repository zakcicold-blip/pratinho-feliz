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

/**
 * Equipamentos de cozinha que mudam o que dá para preparar.
 *
 * A lista é curta de propósito: só entram itens que realmente destravam ou
 * bloqueiam receitas. Fogão, panela e forno de fogão são pressupostos — não
 * fazem parte da escolha.
 *
 * `palavras` são os termos procurados no modo de preparo para descobrir qual
 * equipamento a receita exige.
 */
export const EQUIPAMENTOS_COMUNS: { id: string; label: string; palavras: string[] }[] = [
  { id: "FORNO", label: "Forno", palavras: ["forno", "assadeira", "assar", "asse "] },
  { id: "AIR_FRYER", label: "Air fryer", palavras: ["air fryer", "airfryer", "fritadeira sem óleo"] },
  { id: "LIQUIDIFICADOR", label: "Liquidificador", palavras: ["liquidificador", "bata no liquidificador"] },
  { id: "BATEDEIRA", label: "Batedeira", palavras: ["batedeira"] },
  { id: "MIXER", label: "Mixer ou processador", palavras: ["mixer", "processador"] },
  { id: "MICRO_ONDAS", label: "Micro-ondas", palavras: ["micro-ondas", "microondas"] },
  { id: "PANELA_PRESSAO", label: "Panela de pressão", palavras: ["panela de pressão"] },
  { id: "SANDUICHEIRA", label: "Sanduicheira ou grill", palavras: ["sanduicheira", "grill", "chapa"] },
];

export const EQUIPAMENTO_LABEL: Record<string, string> = Object.fromEntries(
  EQUIPAMENTOS_COMUNS.map((e) => [e.id, e.label])
);

/** Lê o campo de equipamentos do perfil (texto separado por vírgula). */
export function parseEquipamentos(valor: string | null | undefined): Set<string> {
  if (!valor) return new Set();
  return new Set(
    valor
      .split(",")
      .map((v) => v.trim().toUpperCase())
      .filter(Boolean)
  );
}
