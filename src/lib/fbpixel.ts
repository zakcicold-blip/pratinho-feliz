/** Dispara um evento no Meta Pixel, se ele estiver carregado. Seguro no servidor. */
type FbqParams = Record<string, unknown>;

export function trackPixel(event: string, params?: FbqParams) {
  if (typeof window === "undefined") return;
  const fbq = (window as unknown as { fbq?: (...args: unknown[]) => void }).fbq;
  if (!fbq) return;
  if (params) fbq("track", event, params);
  else fbq("track", event);
}
