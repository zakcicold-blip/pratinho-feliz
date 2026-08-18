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

// Planos oferecidos. Cada um vira um Price recorrente no mesmo produto.
const PLANOS = [
  { envVar: "STRIPE_PRICE_ID", rotulo: "Mensal", valorCentavos: 2990, intervalo: "month", intervaloCount: 1 },
  { envVar: "STRIPE_PRICE_ID_TRIMESTRAL", rotulo: "Trimestral", valorCentavos: 5990, intervalo: "month", intervaloCount: 3 },
];
const URL_APP = process.env.NEXT_PUBLIC_APP_URL || "https://pratinho-feliz.vercel.app";
const URL_WEBHOOK = `${URL_APP.replace(/\/$/, "")}/api/stripe/webhook`;
const EVENTOS_WEBHOOK = [
  "checkout.session.completed",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "customer.subscription.trial_will_end",
];

/** Grava (ou atualiza) uma variável no .env, sem imprimir o valor na tela. */
function gravarNoEnv(chaveVar, valor) {
  const envPath = path.join(raizProjeto, ".env");
  let conteudo = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf8") : "";
  const linha = `${chaveVar}=${valor}`;
  const re = new RegExp(`^\\s*${chaveVar}\\s*=.*$`, "m");
  if (re.test(conteudo)) {
    conteudo = conteudo.replace(re, linha);
  } else {
    if (conteudo.length && !conteudo.endsWith("\n")) conteudo += "\n";
    conteudo += linha + "\n";
  }
  fs.writeFileSync(envPath, conteudo);
}

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

async function acharOuCriarPreco(produtoId, plano) {
  const precos = await stripe.prices.list({ product: produtoId, active: true, limit: 100 });
  const existente = precos.data.find(
    (p) =>
      p.currency === MOEDA &&
      p.unit_amount === plano.valorCentavos &&
      p.recurring?.interval === plano.intervalo &&
      (p.recurring?.interval_count ?? 1) === plano.intervaloCount
  );
  const sufixo = plano.intervaloCount > 1 ? `a cada ${plano.intervaloCount} meses` : "/mês";
  if (existente) {
    console.log(`• Preço ${plano.rotulo} já existia: ${existente.id} (${brl(plano.valorCentavos)} ${sufixo})`);
    return existente;
  }
  const preco = await stripe.prices.create({
    product: produtoId,
    currency: MOEDA,
    unit_amount: plano.valorCentavos,
    recurring: { interval: plano.intervalo, interval_count: plano.intervaloCount },
    metadata: { app: PRODUTO_TAG, plano: plano.rotulo },
  });
  console.log(`• Preço ${plano.rotulo} criado: ${preco.id} (${brl(plano.valorCentavos)} ${sufixo})`);
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

  const precosPorEnv = {};
  for (const plano of PLANOS) {
    const preco = await acharOuCriarPreco(produto.id, plano);
    precosPorEnv[plano.envVar] = preco.id;
  }

  const { segredo } = await acharOuCriarWebhook();

  // Grava direto no .env em vez de imprimir — o webhook secret é sensível e
  // não deve aparecer em logs/terminal compartilhado.
  for (const [envVar, id] of Object.entries(precosPorEnv)) gravarNoEnv(envVar, id);
  if (segredo) gravarNoEnv("STRIPE_WEBHOOK_SECRET", segredo);

  console.log("\n" + "─".repeat(60));
  console.log("PRONTO. Já gravei no seu .env:\n");
  for (const [envVar, id] of Object.entries(precosPorEnv)) {
    console.log(`  ${envVar.padEnd(26)} = ${id}   (não é segredo)`);
  }
  if (segredo) {
    console.log(`  ${"STRIPE_WEBHOOK_SECRET".padEnd(26)} = whsec_******  (gravado, não exibido)`);
  } else {
    console.log(
      "  STRIPE_WEBHOOK_SECRET = <o webhook já existia; pegue o 'Signing secret'\n" +
        "    em Developers > Webhooks no painel, ou apague o endpoint e rode de novo>"
    );
  }
  console.log(
    "\nPróximo passo: copie STRIPE_SECRET_KEY, STRIPE_PRICE_ID,\n" +
      "STRIPE_PRICE_ID_TRIMESTRAL e STRIPE_WEBHOOK_SECRET do .env para a Vercel."
  );
  console.log("─".repeat(60) + "\n");
}

main().catch((err) => {
  console.error("\n✗ Erro:", err?.message ?? err, "\n");
  process.exit(1);
});
