/** Dispara um evento no Meta Pixel, se ele estiver carregado. Seguro no servidor. */
type FbqParams = Record<string, unknown>;

function pegarFbq(): ((...args: unknown[]) => void) | undefined {
  return (window as unknown as { fbq?: (...args: unknown[]) => void }).fbq;
}

/**
 * O script base do pixel carrega com afterInteractive, entao existe uma janela
 * curta em que o clique acontece antes de `window.fbq` existir. A versao
 * anterior descartava a chamada em silencio — e era exatamente isso que fazia
 * o InitiateCheckout do teste gratis sumir do funil quando a pessoa clicava
 * rapido. Aqui a chamada e reagendada por ate 5 segundos.
 */
export function trackPixel(event: string, params?: FbqParams, opcoes?: { eventID?: string }) {
  if (typeof window === "undefined") return;

  const disparar = (fbq: (...args: unknown[]) => void) => {
    // O eventID e o que deixa a Meta juntar este evento com o gemeo enviado
    // pelo servidor (CAPI) em vez de contar os dois.
    if (opcoes) fbq("track", event, params ?? {}, opcoes);
    else if (params) fbq("track", event, params);
    else fbq("track", event);
  };

  const pronto = pegarFbq();
  if (pronto) {
    disparar(pronto);
    return;
  }

  let tentativas = 0;
  const timer = setInterval(() => {
    const fbq = pegarFbq();
    if (fbq) {
      clearInterval(timer);
      disparar(fbq);
      return;
    }
    if (++tentativas > 50) clearInterval(timer); // ~5 s e desiste
  }, 100);
}
