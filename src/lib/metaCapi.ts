import crypto from "node:crypto";

// Conversions API do Meta — envia eventos do SERVIDOR (fonte confiável), sem
// depender do navegador. Deduplicado com o pixel via event_id.
const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;
const TOKEN = process.env.META_CAPI_TOKEN;
const TEST_CODE = process.env.META_TEST_EVENT_CODE; // opcional, para "Test Events"
const API_VERSION = "v21.0";

/** Se o CAPI está configurado (sem token/pixel, tudo vira no-op silencioso). */
export function capiAtivo(): boolean {
  return Boolean(PIXEL_ID && TOKEN);
}

function sha256(valor?: string | null): string | undefined {
  if (!valor) return undefined;
  return crypto.createHash("sha256").update(valor.trim().toLowerCase()).digest("hex");
}

export type EventoCapi = {
  eventName: "InitiateCheckout" | "StartTrial" | "Purchase" | "Subscribe";
  /** Mesmo id usado no pixel do navegador quando houver, para deduplicar. */
  eventId: string;
  email?: string | null;
  fbp?: string | null;
  fbc?: string | null;
  clientIp?: string | null;
  userAgent?: string | null;
  value?: number;
  currency?: string;
  eventSourceUrl?: string;
};

/** Envia um evento ao Meta. Nunca lança — falha de tracking não pode quebrar o webhook. */
export async function enviarEventoCapi(p: EventoCapi): Promise<void> {
  if (!capiAtivo()) return;

  const user_data: Record<string, unknown> = {};
  const em = sha256(p.email);
  if (em) user_data.em = [em];
  if (p.fbp) user_data.fbp = p.fbp;
  if (p.fbc) user_data.fbc = p.fbc;
  if (p.clientIp) user_data.client_ip_address = p.clientIp;
  if (p.userAgent) user_data.client_user_agent = p.userAgent;

  const evento: Record<string, unknown> = {
    event_name: p.eventName,
    event_time: Math.floor(Date.now() / 1000),
    event_id: p.eventId,
    action_source: "website",
    user_data,
  };
  if (p.eventSourceUrl) evento.event_source_url = p.eventSourceUrl;
  if (p.value != null) {
    evento.custom_data = { value: p.value, currency: p.currency ?? "BRL" };
  }

  const body: Record<string, unknown> = { data: [evento], access_token: TOKEN };
  if (TEST_CODE) body.test_event_code = TEST_CODE;

  try {
    const res = await fetch(`https://graph.facebook.com/${API_VERSION}/${PIXEL_ID}/events`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      console.error("Meta CAPI respondeu", res.status, await res.text());
    }
  } catch (err) {
    console.error("Meta CAPI falhou:", err);
  }
}
