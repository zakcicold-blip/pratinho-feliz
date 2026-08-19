import crypto from "node:crypto";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const PIXEL = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const TOKEN = process.env.META_CAPI_TOKEN;
  const TEST = process.env.META_TEST_EVENT_CODE;
  if (!PIXEL || !TOKEN) {
    return NextResponse.json({ ok: false, motivo: "faltam PIXEL/TOKEN", temPixel: !!PIXEL, temToken: !!TOKEN });
  }
  const body: Record<string, unknown> = {
    data: [
      {
        event_name: "StartTrial",
        event_time: Math.floor(Date.now() / 1000),
        event_id: "capi-selftest-" + Date.now(),
        action_source: "website",
        event_source_url: "https://pratinho-feliz.vercel.app/hoje",
        user_data: {
          em: [crypto.createHash("sha256").update("teste@exemplo.com").digest("hex")],
        },
        custom_data: { value: 29.9, currency: "BRL" },
      },
    ],
    access_token: TOKEN,
  };
  if (TEST) body.test_event_code = TEST;

  const res = await fetch(`https://graph.facebook.com/v21.0/${PIXEL}/events`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  return NextResponse.json({ ok: res.ok, status: res.status, temTestCode: !!TEST, resposta: json });
}
