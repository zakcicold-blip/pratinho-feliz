import webpush from "web-push";
import { db } from "@/lib/db";

/**
 * Notificações do app.
 *
 * Duas coisas diferentes, sempre juntas:
 *
 * 1. A notificação DENTRO do app (tabela Notificacao), que aparece na aba do
 *    sino. Essa sempre é criada — não depende de permissão nem de aparelho.
 * 2. O push do navegador, que chega mesmo com o app fechado. Esse depende de
 *    a pessoa ter autorizado, e pode falhar em silêncio (aparelho desligado,
 *    inscrição expirada). Por isso ele nunca é a única via.
 *
 * Sem as chaves VAPID configuradas, o push simplesmente não é enviado e a
 * notificação no app continua funcionando.
 */

export type TipoNotificacao = "PLANO" | "LEMBRETE" | "DICA" | "SISTEMA";

const VAPID_PUBLICA = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const VAPID_PRIVADA = process.env.VAPID_PRIVATE_KEY;
const CONTATO = process.env.VAPID_SUBJECT ?? "mailto:ola@pratinhofeliz.online";

let configurado = false;

function prepararWebPush(): boolean {
  if (!VAPID_PUBLICA || !VAPID_PRIVADA) return false;
  if (!configurado) {
    webpush.setVapidDetails(CONTATO, VAPID_PUBLICA, VAPID_PRIVADA);
    configurado = true;
  }
  return true;
}

export function pushDisponivel(): boolean {
  return Boolean(VAPID_PUBLICA && VAPID_PRIVADA);
}

/**
 * Cria a notificação no app e tenta entregar o push.
 * O push falhar nunca impede a notificação de existir na lista.
 */
export async function notificar({
  userId,
  tipo,
  titulo,
  corpo,
  link,
}: {
  userId: string;
  tipo: TipoNotificacao;
  titulo: string;
  corpo: string;
  link?: string;
}): Promise<{ noApp: true; push: "enviado" | "sem-inscricao" | "desativado" | "falhou" }> {
  await db.notificacao.create({
    data: { userId, tipo, titulo, corpo, link: link ?? null },
  });

  if (!prepararWebPush()) return { noApp: true, push: "desativado" };

  const inscricoes = await db.pushSubscription.findMany({
    where: { userId, invalidaEm: null },
  });
  if (inscricoes.length === 0) return { noApp: true, push: "sem-inscricao" };

  const carga = JSON.stringify({ titulo, corpo, link: link ?? "/notificacoes" });
  let algumEnviado = false;

  await Promise.all(
    inscricoes.map(async (inscricao) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: inscricao.endpoint,
            keys: { p256dh: inscricao.p256dh, auth: inscricao.auth },
          },
          carga
        );
        algumEnviado = true;
      } catch (erro) {
        // 404/410 = a inscrição morreu (app desinstalado, permissão revogada).
        // Marcamos em vez de apagar, para dar para auditar depois.
        const status = (erro as { statusCode?: number }).statusCode;
        if (status === 404 || status === 410) {
          await db.pushSubscription.update({
            where: { id: inscricao.id },
            data: { invalidaEm: new Date() },
          });
        } else {
          console.error("Push falhou:", status, (erro as Error).message);
        }
      }
    })
  );

  return { noApp: true, push: algumEnviado ? "enviado" : "falhou" };
}

/** Quantas notificações a pessoa ainda não abriu. */
export async function contarNaoLidas(userId: string): Promise<number> {
  return db.notificacao.count({ where: { userId, lida: false } });
}
