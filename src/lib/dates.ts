export function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

// ---------------------------------------------------------------------------
// Chave de dia — meia-noite UTC do dia-calendário em São Paulo.
//
// As datas dos slots são gravadas como "chave" (00:00Z de um dia). Comparar
// com startOfDay(new Date()) é frágil porque setHours usa o fuso do processo
// (UTC na Vercel, Brasília na máquina local), o que fazia "hoje" não bater com
// os slots. Estas funções calculam o dia sempre no fuso de São Paulo, então o
// resultado independe de onde o código roda.
// ---------------------------------------------------------------------------
const FUSO_APP = "America/Sao_Paulo";

/** Meia-noite UTC do dia-calendário (em São Paulo) do instante dado. */
export function chaveDoDia(instante: Date): Date {
  const [y, m, d] = new Intl.DateTimeFormat("en-CA", {
    timeZone: FUSO_APP,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .format(instante)
    .split("-")
    .map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

/** A chave do dia de hoje (fuso de São Paulo). */
export function hojeChave(): Date {
  return chaveDoDia(new Date());
}

/**
 * Trunca para 00:00Z do dia UTC. Idempotente em chaves — use quando o valor já
 * é uma chave (ex.: vindo do formulário) para não reinterpretar o fuso.
 */
export function chaveUtc(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

/** Hora atual (0-23) no fuso de São Paulo, para saudações. */
export function horaSaoPaulo(): number {
  const h = new Intl.DateTimeFormat("en-GB", {
    timeZone: FUSO_APP,
    hour: "2-digit",
    hour12: false,
  }).format(new Date());
  return Number(h) % 24;
}

/** Soma dias a uma chave. Brasil não tem horário de verão, então 1 dia = 24h. */
export function addDiasChave(chave: Date, dias: number): Date {
  return new Date(chave.getTime() + dias * 86400000);
}

/**
 * Diferença em dias entre duas chaves (00:00Z). Diff simples: não reaplica
 * chaveDoDia, porque 00:00Z já representa o dia certo. Math.round absorve
 * qualquer pequeno desvio de datas antigas gravadas fora de 00:00Z.
 */
export function diffDiasChave(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}

/** Se duas datas caem no mesmo dia-calendário de São Paulo. */
export function mesmoDiaChave(a: Date, b: Date): boolean {
  return chaveDoDia(a).getTime() === chaveDoDia(b).getTime();
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function startOfWeek(date: Date): Date {
  const d = startOfDay(date);
  const dayOfWeek = d.getDay();
  return addDays(d, -dayOfWeek);
}

// As datas de dia são "chaves" em 00:00Z, então formatamos em UTC para o
// rótulo cair no dia certo em qualquer fuso de servidor.
export function formatDiaMes(date: Date): string {
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", timeZone: "UTC" });
}

export function formatDiaSemana(date: Date): string {
  return date.toLocaleDateString("pt-BR", { weekday: "short", timeZone: "UTC" });
}

export function sameDay(a: Date, b: Date): boolean {
  return startOfDay(a).getTime() === startOfDay(b).getTime();
}

// ---------------------------------------------------------------------------
// Instantes (createdAt e afins) formatados no fuso de Sao Paulo.
//
// Sem timeZone explicito, o toLocaleString usa o fuso do processo — UTC na
// Vercel. Era o que fazia o painel mostrar 14:37 para um evento das 11:37.
// ---------------------------------------------------------------------------

/** Data e hora curtas: 25/08, 11:37. */
export function dataHoraBR(instante: Date): string {
  return instante.toLocaleString("pt-BR", {
    timeZone: FUSO_APP,
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Data e hora completas: 25/08/2026 11:37. */
export function dataHoraCompletaBR(instante: Date): string {
  return instante.toLocaleString("pt-BR", { timeZone: FUSO_APP });
}

/** Só a data: 25/08/2026. */
export function dataBR(instante: Date): string {
  return instante.toLocaleDateString("pt-BR", { timeZone: FUSO_APP });
}

/**
 * Meia-noite de hoje em Sao Paulo, como instante real.
 *
 * Diferente de chaveDoDia (que devolve 00:00Z do dia-calendario), aqui o que
 * se quer e o comeco do dia para comparar com createdAt. O deslocamento e
 * calculado, nao fixado em -3, para nao quebrar se o horario de verao voltar.
 */
export function inicioDoDiaSaoPaulo(agora: Date = new Date()): Date {
  const emUtc = new Date(agora.toLocaleString("en-US", { timeZone: "UTC" }));
  const emSaoPaulo = new Date(agora.toLocaleString("en-US", { timeZone: FUSO_APP }));
  const deslocamento = emUtc.getTime() - emSaoPaulo.getTime();
  return new Date(chaveDoDia(agora).getTime() + deslocamento);
}
