import type Stripe from "stripe";
import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { sincronizarAssinaturaStripe } from "@/lib/assinatura";

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
