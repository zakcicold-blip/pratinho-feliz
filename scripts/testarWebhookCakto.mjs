/**
 * Simula um evento da Cakto contra o nosso webhook.
 *
 * Serve para provar o caminho inteiro — validacao do segredo, gravacao da
 * compra e liberacao do acesso — sem depender do botao de teste do painel
 * deles e sem fazer uma compra de verdade.
 *
 * O segredo NAO vai no comando: e lido de CAKTO_WEBHOOK_SECRET no .env.local
 * (que o git ignora), o mesmo valor que esta na Cakto e na Vercel.
 *
 * Uso:
 *   npm run cakto:testar                          -> produção, compra aprovada
 *   npm run cakto:testar -- --local               -> http://localhost:3000
 *   npm run cakto:testar -- --evento=refund       -> outro evento
 *   npm run cakto:testar -- --email=voce@ex.com   -> outro comprador
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const raiz = path.resolve(path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Za-z]:)/, "$1"), "..");

/** Le uma chave do .env.local sem depender de pacote externo. */
function doEnvLocal(chave) {
  for (const arquivo of [".env.local", ".env"]) {
    const caminho = path.join(raiz, arquivo);
    if (!fs.existsSync(caminho)) continue;
    const linha = fs
      .readFileSync(caminho, "utf8")
      .split(/\r?\n/)
      .find((l) => l.startsWith(`${chave}=`));
    if (linha) return linha.slice(chave.length + 1).trim().replace(/^["']|["']$/g, "");
  }
  return null;
}

const args = process.argv.slice(2);
const opcao = (nome, padrao) => {
  const encontrada = args.find((a) => a.startsWith(`--${nome}=`));
  return encontrada ? encontrada.split("=").slice(1).join("=") : padrao;
};

const secret = process.env.CAKTO_WEBHOOK_SECRET ?? doEnvLocal("CAKTO_WEBHOOK_SECRET");
if (!secret) {
  console.error(
    "Falta CAKTO_WEBHOOK_SECRET. Coloque a mesma chave da Cakto no .env.local:\n" +
      "  CAKTO_WEBHOOK_SECRET=sua-chave-aqui",
  );
  process.exit(1);
}

const base = args.includes("--local")
  ? "http://localhost:3000"
  : "https://www.pratinhofeliz.online";
const evento = opcao("evento", "purchase_approved");
const email = opcao("email", `teste-webhook+${Date.now()}@pratinhofeliz.online`);

const payload = {
  secret,
  event: evento,
  data: {
    id: crypto.randomUUID(),
    refId: `teste${Math.floor(Math.random() * 1e6)}`,
    status: "paid",
    baseAmount: 29.9,
    checkoutUrl: "https://pay.cakto.com.br/h8c9jbm_1061491",
    offer_type: "main",
    customer: {
      name: "Comprador de Teste",
      email,
      docNumber: "12345678909",
      docType: "cpf",
    },
    product: { id: "teste", short_id: "teste", name: "Pratinho Feliz" },
    offer: { id: "teste-oferta", name: "Mensal", price: 29.9 },
    subscription: { id: `sub_teste_${Date.now()}` },
  },
};

console.log(`POST ${base}/api/cakto/webhook`);
console.log(`evento: ${evento} · comprador: ${email}`);

const resposta = await fetch(`${base}/api/cakto/webhook`, {
  method: "POST",
  headers: { "content-type": "application/json", "user-agent": "CaktoBot/1.0" },
  body: JSON.stringify(payload),
});

console.log(`\nHTTP ${resposta.status}`);
console.log(await resposta.text());

if (resposta.ok) {
  console.log(
    `\nSe o e-mail nao existir no banco, a compra fica aguardando: abra ${base}/acesso\n` +
      `e crie a conta com ${email} e os digitos 8909.`,
  );
}
