/**
 * Configura o Stripe do Pratinho Feliz de uma vez só:
 *   - cria (ou reaproveita) o produto "Pratinho Feliz"
 *   - cria (ou reaproveita) o preço recorrente de R$ 29,90/mês
 *   - cria (ou reaproveita) o webhook apontando para a produção
 *
 * Uso:
 *   1. Coloque STRIPE_SECRET_KEY=sk_test_... no seu .env
 *   2. npm run stripe:setup
 *   3. Copie as linhas STRIPE_PRICE_ID e STRIPE_WEBHOOK_SECRET que aparecem
 *      no final para o seu .env e para as variáveis de ambiente da Vercel.
 *
 * É idempotente: rodar de novo não duplica produto nem preço. O segredo do
 * webhook só é exibível na criação — se o endpoint já existir, o script avisa.
 *
 * Para produção (live), rode com a chave sk_live_... no lugar da de teste.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Stripe from "stripe";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const raizProjeto = path.resolve(__dirname, "..");

// ---- Parâmetros do plano (decisão de negócio) ----
const PRODUTO_NOME = "Pratinho Feliz";
const PRODUTO_TAG = "pratinho-feliz"; // marca em metadata para achar de novo
const MOEDA = "brl";
const VALOR_CENTAVOS = 2990; // R$ 29,90
const INTERVALO = "month";
const URL_APP = process.env.NEXT_PUBLIC_APP_URL || "https://pratinho-feliz.vercel.app";
const URL_WEBHOOK = `${URL_APP.replace(/\/$/, "")}/api/stripe/webhook`;
const EVENTOS_WEBHOOK = [
  "checkout.session.completed",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "customer.subscription.trial_will_end",
];

/** Carrega STRIPE_SECRET_KEY do .env se ainda não estiver no ambiente. */
function carregarChave() {
  if (process.env.STRIPE_SECRET_KEY) return process.env.STRIPE_SECRET_KEY;

  const envPath = path.join(raizProjeto, ".env");
  if (fs.existsSync(envPath)) {
    for (const linha of fs.readFileSync(envPath, "utf8").split("\n")) {
      const m = linha.match(/^\s*STRIPE_SECRET_KEY\s*=\s*(.+?)\s*$/);
      if (m) return m[1].replace(/^["']|["']$/g, "");
    }
  }
  return null;
}

const chave = carregarChave();
if (!chave) {
  console.error(
    "\n✗ STRIPE_SECRET_KEY não encontrada.\n" +
      "  Coloque STRIPE_SECRET_KEY=sk_test_... no arquivo .env e rode de novo.\n"
  );
  process.exit(1);
}

const modo = chave.startsWith("sk_live_") ? "PRODUÇÃO (live)" : "TESTE";
const stripe = new Stripe(chave, { apiVersion: "2025-02-24.acacia" });

const brl = (c) => `R$ ${(c / 100).toFixed(2).replace(".", ",")}`;

async function acharOuCriarProduto() {
  const busca = await stripe.products.search({
    query: `active:'true' AND metadata['app']:'${PRODUTO_TAG}'`,
  });
  if (busca.data[0]) {
    console.log(`• Produto já existia: ${busca.data[0].id}`);
    return busca.data[0];
  }
  const produto = await stripe.products.create({
    name: PRODUTO_NOME,
    description: "Assinatura do planejador de alimentação infantil Pratinho Feliz.",
    metadata: { app: PRODUTO_TAG },
  });
  console.log(`• Produto criado: ${produto.id}`);
  return produto;
}

async function acharOuCriarPreco(produtoId) {
  const precos = await stripe.prices.list({ product: produtoId, active: true, limit: 100 });
  const existente = precos.data.find(
    (p) =>
      p.currency === MOEDA &&
      p.unit_amount === VALOR_CENTAVOS &&
      p.recurring?.interval === INTERVALO
  );
  if (existente) {
    console.log(`• Preço já existia: ${existente.id} (${brl(VALOR_CENTAVOS)}/mês)`);
    return existente;
  }
  const preco = await stripe.prices.create({
    product: produtoId,
    currency: MOEDA,
    unit_amount: VALOR_CENTAVOS,
    recurring: { interval: INTERVALO },
    metadata: { app: PRODUTO_TAG },
  });
  console.log(`• Preço criado: ${preco.id} (${brl(VALOR_CENTAVOS)}/mês)`);
  return preco;
}

async function acharOuCriarWebhook() {
  const lista = await stripe.webhookEndpoints.list({ limit: 100 });
  const existente = lista.data.find((w) => w.url === URL_WEBHOOK);
  if (existente) {
    console.log(`• Webhook já existia: ${existente.id}`);
    return { endpoint: existente, segredo: null };
  }
  const endpoint = await stripe.webhookEndpoints.create({
    url: URL_WEBHOOK,
    enabled_events: EVENTOS_WEBHOOK,
    description: "Sincroniza assinaturas do Pratinho Feliz.",
  });
  console.log(`• Webhook criado: ${endpoint.id}`);
  return { endpoint, segredo: endpoint.secret };
}

async function main() {
  console.log(`\nConfigurando Stripe em modo ${modo}`);
  console.log(`Webhook apontando para: ${URL_WEBHOOK}\n`);

  const produto = await acharOuCriarProduto();
  const preco = await acharOuCriarPreco(produto.id);
  const { segredo } = await acharOuCriarWebhook();

  console.log("\n" + "─".repeat(60));
  console.log("PRONTO. Cole estas variáveis no .env e na Vercel:\n");
  console.log(`STRIPE_PRICE_ID=${preco.id}`);
  if (segredo) {
    console.log(`STRIPE_WEBHOOK_SECRET=${segredo}`);
  } else {
    console.log(
      "STRIPE_WEBHOOK_SECRET=<o webhook já existia; pegue o 'Signing secret'\n" +
        "  em Developers > Webhooks no painel do Stripe, ou apague o endpoint\n" +
        "  antigo e rode este script de novo para gerar um novo segredo>"
    );
  }
  console.log("\nA STRIPE_SECRET_KEY você já tem (é a que usou para rodar isto).");
  console.log("─".repeat(60) + "\n");
}

main().catch((err) => {
  console.error("\n✗ Erro:", err?.message ?? err, "\n");
  process.exit(1);
});
