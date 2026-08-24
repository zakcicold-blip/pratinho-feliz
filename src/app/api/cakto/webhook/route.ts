import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { enviarEventoCapi } from "@/lib/metaCapi";

/**
 * Webhook da Cakto.
 *
 * Diferente do Stripe, a Cakto nao assina o corpo: a validacao e um campo
 * `secret` DENTRO do JSON (docs.cakto.com.br/conceitos/webhooks). Por isso a
 * comparacao e feita em tempo constante e a rota so aceita HTTPS na pratica —
 * a credencial viaja no corpo.
 *
 * Ela espera 2xx em ate 8 segundos e reenvia ate 5 vezes. Como o `data.id` do
 * evento e a chave primaria de CompraCakto, reenvio do mesmo evento cai no
 * mesmo registro em vez de duplicar a compra.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SEGREDO = process.env.CAKTO_WEBHOOK_SECRET;

/** Eventos que liberam ou renovam o acesso. */
const LIBERAM = new Set([
  "purchase_approved",
  "subscription_created",
  "subscription_renewed",
  "subscription_resumed",
]);

/** Eventos que tiram o acesso. */
const SUSPENDEM = new Set([
  "refund",
  "chargeback",
  "subscription_canceled",
  "subscription_renewal_refused",
  "subscription_paused",
]);

type PayloadCakto = {
  secret?: string;
  event?: string;
  data?: {
    id?: string;
    refId?: string;
    status?: string;
    baseAmount?: number;
    customer?: { name?: string; email?: string; docNumber?: string; docType?: string };
    product?: { name?: string };
    offer?: { id?: string; price?: number };
    subscription?: { id?: string } | null;
  };
};

function segredoConfere(recebido: string): boolean {
  if (!SEGREDO) return false;
  const a = Buffer.from(recebido);
  const b = Buffer.from(SEGREDO);
  // timingSafeEqual exige o mesmo tamanho; comparar o tamanho antes nao vaza
  // mais do que o proprio erro ja vazaria.
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export async function POST(req: Request) {
  if (!SEGREDO) {
    console.error("Webhook da Cakto chamado sem CAKTO_WEBHOOK_SECRET configurado.");
    return NextResponse.json({ error: "webhook não configurado" }, { status: 500 });
  }

  let corpo: PayloadCakto;
  try {
    corpo = (await req.json()) as PayloadCakto;
  } catch {
    return NextResponse.json({ error: "corpo inválido" }, { status: 400 });
  }

  if (!corpo.secret || !segredoConfere(corpo.secret)) {
    return NextResponse.json({ error: "não autorizado" }, { status: 401 });
  }

  const evento = corpo.event ?? "";
  const dados = corpo.data ?? {};
  const email = (dados.customer?.email ?? "").toLowerCase().trim();

  // Eventos de meio de caminho (pix gerado, checkout abandonado) nao mexem em
  // acesso. Responder 2xx evita reenvio inutil.
  if (!LIBERAM.has(evento) && !SUSPENDEM.has(evento)) {
    return NextResponse.json({ ok: true, ignorado: evento });
  }

  if (!email) {
    console.error("Evento da Cakto sem e-mail do cliente:", evento, dados.id);
    return NextResponse.json({ ok: true, semEmail: true });
  }

  const docNumber = (dados.customer?.docNumber ?? "").replace(/\D/g, "");
  const valor = dados.baseAmount ?? dados.offer?.price ?? null;
  const assinaturaId = dados.subscription?.id ?? null;

  try {
    if (LIBERAM.has(evento)) {
      await liberar({
        eventoId: dados.id ?? `${evento}:${email}:${Date.now()}`,
        evento,
        status: dados.status ?? "",
        refId: dados.refId ?? null,
        email,
        nome: dados.customer?.name?.trim() || null,
        docLast4: docNumber ? docNumber.slice(-4) : null,
        valor,
        produtoNome: dados.product?.name ?? null,
        ofertaId: dados.offer?.id ?? null,
        assinaturaId,
      });
    } else {
      await suspender(email, evento, assinaturaId);
    }
  } catch (err) {
    // Erro nosso: responder 500 faz a Cakto reenviar, que e o que queremos.
    console.error("Falha ao processar webhook da Cakto:", err);
    return NextResponse.json({ error: "falha ao processar" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

type CompraRecebida = {
  eventoId: string;
  evento: string;
  status: string;
  refId: string | null;
  email: string;
  nome: string | null;
  docLast4: string | null;
  valor: number | null;
  produtoNome: string | null;
  ofertaId: string | null;
  assinaturaId: string | null;
};

async function liberar(c: CompraRecebida) {
  const usuario = await db.user.findUnique({ where: { email: c.email }, select: { id: true } });

  await db.compraCakto.upsert({
    where: { id: c.eventoId },
    create: {
      id: c.eventoId,
      refId: c.refId,
      evento: c.evento,
      status: c.status,
      email: c.email,
      nome: c.nome,
      docLast4: c.docLast4,
      valor: c.valor,
      produtoNome: c.produtoNome,
      ofertaId: c.ofertaId,
      assinaturaId: c.assinaturaId,
      userId: usuario?.id ?? null,
      liberadaEm: usuario ? new Date() : null,
    },
    update: {
      status: c.status,
      userId: usuario?.id ?? undefined,
      liberadaEm: usuario ? new Date() : undefined,
    },
  });

  // Quem ja tem conta recebe o acesso na hora. Quem ainda nao tem fica com a
  // compra registrada e reivindica em /acesso — nao da para criar conta aqui,
  // porque senha e coisa que so a pessoa pode escolher.
  if (usuario) {
    await db.subscription.upsert({
      where: { userId: usuario.id },
      update: {
        status: "ATIVA",
        plano: "ESSENCIAL",
        caktoAssinaturaId: c.assinaturaId ?? undefined,
        caktoRefId: c.refId ?? undefined,
        cancelAtPeriodEnd: false,
      },
      create: {
        userId: usuario.id,
        plano: "ESSENCIAL",
        status: "ATIVA",
        caktoAssinaturaId: c.assinaturaId,
        caktoRefId: c.refId,
      },
    });
  }

  await db.auditLog.create({
    data: {
      userId: usuario?.id ?? null,
      evento: `cakto_${c.evento}`,
      detalhes: `${c.email} — ${c.produtoNome ?? "assinatura"}${c.valor ? ` R$ ${c.valor}` : ""}${
        usuario ? " (acesso liberado)" : " (aguardando criação da conta)"
      }`,
    },
  });

  // Purchase para o Meta. Sem cookie do navegador aqui, o casamento com o
  // anuncio fica por conta do e-mail com hash — e o que o CAPI aceita.
  if (c.evento === "purchase_approved" || c.evento === "subscription_renewed") {
    await enviarEventoCapi({
      eventName: "Purchase",
      eventId: `cakto:${c.eventoId}`,
      email: c.email,
      value: c.valor ?? undefined,
      currency: "BRL",
      eventSourceUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? "https://www.pratinhofeliz.online"}/`,
    });
  }
}

async function suspender(email: string, evento: string, assinaturaId: string | null) {
  const usuario = await db.user.findUnique({
    where: { email },
    select: { id: true, subscription: { select: { acessoCortesia: true } } },
  });
  if (!usuario) return;

  // Cortesia nao depende de pagamento — um estorno na Cakto nao tira o acesso
  // de quem entrou por convite.
  if (usuario.subscription?.acessoCortesia) return;

  // Pausa e falha de renovacao sao reversiveis: viram carencia, nao cancelamento.
  const status = evento === "subscription_paused" || evento === "subscription_renewal_refused"
    ? "CARENCIA"
    : "CANCELADA";

  await db.subscription.upsert({
    where: { userId: usuario.id },
    update: { status, caktoAssinaturaId: assinaturaId ?? undefined },
    create: { userId: usuario.id, plano: "ESSENCIAL", status, caktoAssinaturaId: assinaturaId },
  });

  await db.auditLog.create({
    data: { userId: usuario.id, evento: `cakto_${evento}`, detalhes: `Acesso de ${email} para ${status}.` },
  });
}
