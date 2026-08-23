/**
 * Service worker do Pratinho Feliz.
 *
 * Escopo deliberadamente pequeno: guarda o que a pessoa precisa abrir sem
 * rede — plano de hoje, receita e lista de compras. O corredor do mercado e a
 * cozinha sao onde o sinal e pior, e sao justamente as telas que precisam
 * abrir.
 *
 * Estrategia: network-first com queda para o cache. Assim o conteudo continua
 * fresco quando ha rede, e ainda abre quando nao ha. Nunca guardamos POST,
 * rota de API, autenticacao nem checkout.
 */

const VERSAO = "pf-v1";
const CACHE_PAGINAS = `${VERSAO}-paginas`;
const CACHE_ESTATICOS = `${VERSAO}-estaticos`;

/** Telas que valem guardar para uso offline. */
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

function podeGuardar(url) {
  if (NUNCA.some((re) => re.test(url.pathname))) return false;
  return PADROES_OFFLINE.some((re) => re.test(url.pathname));
}

self.addEventListener("fetch", (evento) => {
  const req = evento.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Estaticos do Next: cache-first, sao versionados por hash.
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
