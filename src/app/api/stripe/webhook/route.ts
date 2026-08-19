import type Stripe from "stripe";
import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { sincronizarAssinaturaStripe } from "@/lib/assinatura";
import { enviarEventoCapi } from "@/lib/metaCapi";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://pratinho-feliz.vercel.app";

/** Lê os campos de tracking que gravamos no metadata da assinatura. */
function trackingDaSub(sub: Stripe.Subscription) {
  return {
    fbp: sub.metadata?.fbp || null,
    fbc: sub.metadata?.fbc || null,
    startTrialEventId: sub.metadata?.startTrialEventId || null,
  };
}

/** Valor mensal-equivalente do plano da assinatura, em reais. */
function valorDaSub(sub: Stripe.Subscription): number | undefined {
  const centavos = sub.items.data[0]?.price.unit_amount;
  return centavos != null ? centavos / 100 : undefined;
}

// A verificação de assinatura precisa do corpo cru e do runtime Node.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "webhook não configurado" }, { status: 500 });
  }

  const assinatura = req.headers.get("stripe-signature");
  if (!assinatura) {
    return NextResponse.json({ error: "sem assinatura" }, { status: 400 });
  }

  const corpo = await req.text();
  const stripe = getStripe();

  let evento: Stripe.Event;
  try {
    evento = stripe.webhooks.constructEvent(corpo, assinatura, secret);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "assinatura inválida";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  try {
    switch (evento.type) {
      case "checkout.session.completed": {
        const sessao = evento.data.object as Stripe.Checkout.Session;
        if (sessao.subscription) {
          const subId =
            typeof sessao.subscription === "string" ? sessao.subscription : sessao.subscription.id;
          const sub = await stripe.subscriptions.retrieve(subId);
          await sincronizarAssinaturaStripe(sub);

          // StartTrial server-side (CAPI), deduplicado com o pixel pelo mesmo
          // event_id gravado no checkout.
          const { fbp, fbc, startTrialEventId } = trackingDaSub(sub);
          await enviarEventoCapi({
            eventName: "StartTrial",
            eventId: startTrialEventId || `trial:${sub.id}`,
            email: sessao.customer_details?.email ?? null,
            fbp,
            fbc,
            value: valorDaSub(sub),
            currency: "BRL",
            eventSourceUrl: `${APP_URL}/hoje`,
          });
        }
        break;
      }
      case "invoice.payment_succeeded": {
        // Compra real: a cobrança que acontece ao fim do trial (e nas
        // renovações). Fatura de valor 0 (o trial em si) é ignorada.
        const fatura = evento.data.object as Stripe.Invoice;
        const subRef = (fatura as unknown as { subscription?: string | Stripe.Subscription })
          .subscription;
        if (fatura.amount_paid > 0 && subRef) {
          const subId = typeof subRef === "string" ? subRef : subRef.id;
          const sub = await stripe.subscriptions.retrieve(subId);
          const { fbp, fbc } = trackingDaSub(sub);
          await enviarEventoCapi({
            eventName: "Purchase",
            eventId: `purchase:${fatura.id}`,
            email: fatura.customer_email ?? null,
            fbp,
            fbc,
            value: fatura.amount_paid / 100,
            currency: (fatura.currency ?? "brl").toUpperCase(),
            eventSourceUrl: `${APP_URL}/hoje`,
          });
        }
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
      case "customer.subscription.trial_will_end": {
        await sincronizarAssinaturaStripe(evento.data.object as Stripe.Subscription);
        break;
      }
      default:
        break;
    }
  } catch (err) {
    // Erro ao processar: devolve 500 para o Stripe reenviar depois.
    const msg = err instanceof Error ? err.message : "erro ao processar";
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
