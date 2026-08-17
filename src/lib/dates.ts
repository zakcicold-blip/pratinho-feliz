export function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
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

export function formatDiaMes(date: Date): string {
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

export function formatDiaSemana(date: Date): string {
  return date.toLocaleDateString("pt-BR", { weekday: "short" });
}

export function sameDay(a: Date, b: Date): boolean {
  return startOfDay(a).getTime() === startOfDay(b).getTime();
}
