/**
 * Service worker do Pratinho Feliz.
 *
 * Escopo deliberadamente pequeno: guarda o que a pessoa precisa abrir sem
 * rede — plano de hoje, receita e lista de compras. O corredor do mercado e a
 * cozinha sao onde o sinal e pior, e sao justamente as telas que precisam
 * abrir.
 *
 * DUAS REGRAS QUE NAO PODEM SER QUEBRADAS:
 *
 * 1. So intercepta NAVEGACAO de documento (req.mode === "navigate").
 *    A navegacao entre telas do Next nao baixa HTML: baixa payload RSC na
 *    mesma URL, com header RSC. Cachear os dois na mesma chave devolve HTML
 *    onde o roteador espera RSC e quebra a navegacao — alem de colocar o
 *    worker no meio de toda troca de tela, que e exatamente o que deixa o app
 *    com cara de lento.
 *
 * 2. Cache de pagina logada e apagado no logout (mensagem "limpar-cache"),
 *    para a proxima conta no mesmo aparelho nunca ver a tela da anterior.
 */

const VERSAO = "pf-v3";
const CACHE_PAGINAS = `${VERSAO}-paginas`;
const CACHE_ESTATICOS = `${VERSAO}-estaticos`;

/** Telas que valem guardar para abrir sem rede. */
const PADROES_OFFLINE = [/^\/hoje/, /^\/compras/, /^\/receita\//, /^\/plano/];

/** Nunca cachear: dados de sessao, pagamento e mutacoes. */
const NUNCA = [/^\/api\//, /^\/assinar/, /^\/login/, /^\/cadastro/, /^\/admin/];

self.addEventListener("install", (evento) => {
  self.skipWaiting();
  evento.waitUntil(caches.open(CACHE_PAGINAS));
});

self.addEventListener("activate", (evento) => {
  evento.waitUntil(
    (async () => {
      const chaves = await caches.keys();
      await Promise.all(chaves.filter((c) => !c.startsWith(VERSAO)).map((c) => caches.delete(c)));
      await self.clients.claim();
    })()
  );
});

/** O app pede a limpeza ao sair da conta. */
self.addEventListener("message", (evento) => {
  if (evento.data === "limpar-cache") {
    evento.waitUntil(caches.delete(CACHE_PAGINAS));
  }
});

function podeGuardar(url) {
  if (NUNCA.some((re) => re.test(url.pathname))) return false;
  return PADROES_OFFLINE.some((re) => re.test(url.pathname));
}

self.addEventListener("fetch", (evento) => {
  const req = evento.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Estaticos do Next: cache-first, sao versionados por hash no nome.
  if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icons/")) {
    evento.respondWith(
      (async () => {
        const cache = await caches.open(CACHE_ESTATICOS);
        const salvo = await cache.match(req);
        if (salvo) return salvo;
        const resposta = await fetch(req);
        if (resposta.ok) cache.put(req, resposta.clone());
        return resposta;
      })()
    );
    return;
  }

  // Daqui para baixo, so documento de verdade. Navegacao interna do Next
  // (payload RSC) passa direto, sem o worker no caminho.
  if (req.mode !== "navigate") return;
  if (req.headers.get("RSC") === "1") return;
  if (url.searchParams.has("_rsc")) return;
  if (!podeGuardar(url)) return;

  // Paginas: rede primeiro, cache como rede de seguranca.
  evento.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_PAGINAS);
      try {
        const resposta = await fetch(req);
        if (resposta.ok) cache.put(req, resposta.clone());
        return resposta;
      } catch (erro) {
        const salvo = await cache.match(req);
        if (salvo) return salvo;
        throw erro;
      }
    })()
  );
});

/* ----------------------------------------------------------------------
   PUSH — notificacao que chega com o app fechado.
   ---------------------------------------------------------------------- */

self.addEventListener("push", (evento) => {
  let dados = { titulo: "Pratinho Feliz", corpo: "", link: "/notificacoes" };
  try {
    if (evento.data) dados = { ...dados, ...evento.data.json() };
  } catch {
    // Payload invalido: mostra a notificacao generica em vez de sumir.
  }

  evento.waitUntil(
    self.registration.showNotification(dados.titulo, {
      body: dados.corpo,
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      lang: "pt-BR",
      // A tag agrupa: uma nova substitui a anterior em vez de empilhar.
      tag: "pratinho-feliz",
      renotify: true,
      data: { link: dados.link },
    })
  );
});

self.addEventListener("notificationclick", (evento) => {
  evento.notification.close();
  const destino = evento.notification.data?.link || "/notificacoes";

  evento.waitUntil(
    (async () => {
      const abas = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      // Se o app ja esta aberto, leva a aba existente para a tela certa em
      // vez de abrir outra janela.
      for (const aba of abas) {
        if (aba.url.includes(self.location.origin)) {
          await aba.focus();
          if ("navigate" in aba) await aba.navigate(destino);
          return;
        }
      }
      await self.clients.openWindow(destino);
    })()
  );
});
