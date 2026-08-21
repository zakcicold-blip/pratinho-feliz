import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const raiz = path.resolve(__dirname, "..");
const OUT = path.join(raiz, "public", "screens");

// Chrome do sistema (Windows).
const chromePaths = [
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
];
const executablePath = chromePaths.find((p) => fs.existsSync(p));
if (!executablePath) throw new Error("Chrome nao encontrado.");

const BASE = "http://localhost:3000";
const LARGURA = 390;
const ALTURA = 780; // 1:2, igual ao aspect-[9/18] do mockup

// Conta usada nos prints (precisa ter um plano ativo). Pode trocar por env:
// SCREENS_EMAIL=... SCREENS_SENHA=... npm run screens
const email = process.env.SCREENS_EMAIL ?? "admin@pratinhofeliz.com";
const senha = process.env.SCREENS_SENHA ?? "Dazai3424@";

const telas = [
  { rota: "/hoje", arquivo: "hoje.png" },
  { rota: "/plano", arquivo: "plano.png" },
  { rota: "/rotina", arquivo: "rotina.png" },
  { rota: "/compras", arquivo: "compras.png" },
];

// Esconde a barra/indicador de dev do Next para não aparecer nos prints.
const OCULTAR_DEV = `nextjs-portal, [data-next-badge-root], [data-nextjs-toast], #__next-build-watcher { display: none !important; }`;

const browser = await puppeteer.launch({
  executablePath,
  headless: "new",
  args: ["--hide-scrollbars", "--force-device-scale-factor=2"],
  defaultViewport: { width: LARGURA, height: ALTURA, deviceScaleFactor: 2, isMobile: true },
});

const page = await browser.newPage();

// Login
await page.goto(`${BASE}/login`, { waitUntil: "networkidle2" });
await page.type('input[type="email"]', email);
await page.type('input[type="password"]', senha);
await Promise.all([
  page.waitForNavigation({ waitUntil: "networkidle2" }).catch(() => {}),
  page.click('button[type="submit"]'),
]);
await new Promise((r) => setTimeout(r, 1500));

for (const t of telas) {
  await page.goto(`${BASE}${t.rota}`, { waitUntil: "networkidle2" });
  await page.addStyleTag({ content: OCULTAR_DEV });
  await new Promise((r) => setTimeout(r, 1200));
  const destino = path.join(OUT, t.arquivo);
  await page.screenshot({ path: destino, clip: { x: 0, y: 0, width: LARGURA, height: ALTURA } });
  console.log("capturado:", t.arquivo, "->", (fs.statSync(destino).size / 1024).toFixed(0), "KB");
}

await browser.close();
console.log("pronto");
