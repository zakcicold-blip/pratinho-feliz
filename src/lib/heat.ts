// Configuração compartilhada do mapa de calor da landing.
//
// A ORDEM aqui define o funil de atenção/rolagem no admin — mantenha na mesma
// ordem em que as seções aparecem na página (src/app/page.tsx, atributos
// data-section). Ao reordenar a landing, reordene aqui também.

export type SecaoHeat = { id: string; label: string };

export const SECOES_HEAT: SecaoHeat[] = [
  { id: "topo", label: "Topo / Menu" },
  { id: "hero", label: "Início (Hero)" },
  { id: "como-funciona", label: "Como funciona" },
  { id: "recursos", label: "Recursos" },
  { id: "preco", label: "Preço" },
  { id: "faq", label: "Perguntas frequentes" },
  { id: "cta-final", label: "Chamada final" },
  { id: "rodape", label: "Rodapé" },
];

export const SECAO_LABEL: Record<string, string> = Object.fromEntries(
  SECOES_HEAT.map((s) => [s.id, s.label]),
);

// Rótulos amigáveis dos botões/links rastreados (data-heat).
export const BOTAO_LABEL: Record<string, string> = {
  "header-cadastro": "Menu · Começar grátis",
  "header-login": "Menu · Entrar",
  "hero-cadastro": "Hero · Montar o plano grátis",
  "hero-login": "Hero · Já tenho conta",
  "preco-cadastro": "Preço · Começar 7 dias grátis",
  "cta-final-cadastro": "Chamada final · Criar conta grátis",
  "rodape-cadastro": "Rodapé · Criar conta",
  "rodape-login": "Rodapé · Entrar",
  "rodape-privacidade": "Rodapé · Privacidade",
};

export const HEAT_TIPOS = ["click", "scroll", "secao"] as const;
export type HeatTipo = (typeof HEAT_TIPOS)[number];
