import { useEffect, useState } from "react";

/**
 * Consentimento de cookies (LGPD). O rastreamento (Meta Pixel, Utmify) só é
 * carregado quando a pessoa aceita — até lá, e se recusar, nada é disparado.
 */
export const CONSENT_KEY = "pf_cookie_consent";
export const CONSENT_EVENT = "pf-consent";

export type ConsentValue = "accepted" | "rejected";

export function getConsent(): ConsentValue | null {
  if (typeof window === "undefined") return null;
  const v = localStorage.getItem(CONSENT_KEY);
  return v === "accepted" || v === "rejected" ? v : null;
}

export function setConsent(value: ConsentValue) {
  localStorage.setItem(CONSENT_KEY, value);
  // Avisa os componentes de rastreamento na mesma aba para reagirem na hora.
  window.dispatchEvent(new Event(CONSENT_EVENT));
}

/** Lê o consentimento e re-renderiza quando ele muda. `undefined` = ainda montando. */
export function useConsent(): ConsentValue | null | undefined {
  const [consent, setConsentState] = useState<ConsentValue | null | undefined>(undefined);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- lê o consentimento do localStorage no cliente, só após montar (evita divergência de hidratação)
    setConsentState(getConsent());
    const handler = () => setConsentState(getConsent());
    window.addEventListener(CONSENT_EVENT, handler);
    return () => window.removeEventListener(CONSENT_EVENT, handler);
  }, []);

  return consent;
}
