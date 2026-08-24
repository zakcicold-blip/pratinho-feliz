/** Dispara um evento no Meta Pixel, se ele estiver carregado. Seguro no servidor. */
type FbqParams = Record<string, unknown>;

export function trackPixel(event: string, params?: FbqParams, opcoes?: { eventID?: string }) {
  if (typeof window === "undefined") return;
  const fbq = (window as unknown as { fbq?: (...args: unknown[]) => void }).fbq;
  if (!fbq) return;
  // O eventID e o que deixa a Meta juntar este evento com o gemeo enviado pelo
  // servidor (CAPI) em vez de contar os dois.
  if (opcoes) fbq("track", event, params ?? {}, opcoes);
  else if (params) fbq("track", event, params);
  else fbq("track", event);
}
