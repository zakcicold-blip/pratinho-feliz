import { headers } from "next/headers";
import { db } from "@/lib/db";

/**
 * Limite de tentativas.
 *
 * Existe por duas razoes concretas. A primeira e ataque de senha: sem limite,
 * uma lista de e-mails vazados de outro site e testada aqui a milhares por
 * minuto, e uma parte sempre reaproveita senha. A segunda e custo: o
 * assistente chama uma API paga, e o mapa de calor escreve no banco sem
 * login — os dois sao gratuitos de abusar.
 *
 * O contador vive no banco porque cada requisicao serverless pode cair numa
 * instancia diferente da anterior; contador em memoria zera sozinho e da uma
 * falsa sensacao de protecao.
 *
 * A politica e sempre "falhar aberto": se o banco estiver fora, a pessoa
 * entra. Um limitador que derruba o login inteiro quando tem problema causa
 * mais dano do que o abuso que ele previne.
 */

export type Veredito = {
  ok: boolean;
  /** Segundos ate poder tentar de novo. Zero quando liberado. */
  esperaSegundos: number;
};

const LIBERADO: Veredito = { ok: true, esperaSegundos: 0 };

/**
 * As regras, num lugar so.
 *
 * Numeros escolhidos para nao atrapalhar quem erra a senha de verdade: cinco
 * tentativas em quinze minutos cobre o esquecimento normal e mata a forca
 * bruta, que precisa de milhares.
 */
export const REGRAS = {
  login_ip: { limite: 20, janelaSegundos: 15 * 60 },
  login_email: { limite: 5, janelaSegundos: 15 * 60 },
  cadastro_ip: { limite: 5, janelaSegundos: 60 * 60 },
  reivindicar_ip: { limite: 10, janelaSegundos: 60 * 60 },
  assistente_user: { limite: 30, janelaSegundos: 60 * 60 },
  heat_ip: { limite: 120, janelaSegundos: 60 },
  suporte_user: { limite: 5, janelaSegundos: 60 * 60 },
  link_parceira: { limite: 30, janelaSegundos: 60 * 60 },
} as const;

export type Regra = keyof typeof REGRAS;

/**
 * IP de quem chamou.
 *
 * Atras da CDN da Vercel, o IP real e o PRIMEIRO de x-forwarded-for — os
 * seguintes sao os proxies do caminho. Pegar o ultimo limitaria a Vercel
 * inteira a cinco tentativas.
 */
export async function ipDaRequisicao(): Promise<string> {
  const h = await headers();
  const encaminhado = h.get("x-forwarded-for");
  if (encaminhado) {
    const primeiro = encaminhado.split(",")[0]?.trim();
    if (primeiro) return primeiro;
  }
  return h.get("x-real-ip") ?? "desconhecido";
}

/** Mesma coisa, a partir de uma Request (rotas de API). */
export function ipDaRequest(req: Request): string {
  const encaminhado = req.headers.get("x-forwarded-for");
  if (encaminhado) {
    const primeiro = encaminhado.split(",")[0]?.trim();
    if (primeiro) return primeiro;
  }
  return req.headers.get("x-real-ip") ?? "desconhecido";
}

/**
 * Consome uma tentativa. Devolve se pode seguir.
 *
 * `identificador` e quem esta tentando: IP, e-mail ou id de usuario. Nunca
 * concatene dado sensivel aqui — a chave fica gravada em texto no banco.
 */
export async function consumir(regra: Regra, identificador: string): Promise<Veredito> {
  const { limite, janelaSegundos } = REGRAS[regra];
  const chave = `${regra}:${identificador}`.slice(0, 200);
  const agora = new Date();

  try {
    const atual = await db.rateLimit.findUnique({ where: { chave } });

    // Sem registro ou janela vencida: comeca uma janela nova.
    if (!atual || atual.janelaFim <= agora) {
      const janelaFim = new Date(agora.getTime() + janelaSegundos * 1000);
      await db.rateLimit.upsert({
        where: { chave },
        update: { contagem: 1, janelaFim },
        create: { chave, contagem: 1, janelaFim },
      });
      return LIBERADO;
    }

    if (atual.contagem >= limite) {
      return {
        ok: false,
        esperaSegundos: Math.max(1, Math.ceil((atual.janelaFim.getTime() - agora.getTime()) / 1000)),
      };
    }

    // updateMany com a janela no WHERE: se outra requisicao tiver reiniciado a
    // janela no meio, este incremento nao aplica em vez de somar na janela
    // errada.
    await db.rateLimit.updateMany({
      where: { chave, janelaFim: atual.janelaFim },
      data: { contagem: { increment: 1 } },
    });

    return LIBERADO;
  } catch {
    // Falha aberto de proposito. Ver o comentario do topo.
    return LIBERADO;
  }
}

/** Zera o contador. Chamado quando a tentativa deu certo (login válido). */
export async function liberar(regra: Regra, identificador: string): Promise<void> {
  try {
    await db.rateLimit.deleteMany({ where: { chave: `${regra}:${identificador}`.slice(0, 200) } });
  } catch {
    // Não é crítico: a janela vence sozinha.
  }
}

/** Texto para a pessoa, sem revelar a regra exata a quem está sondando. */
export function mensagemDeEspera(veredito: Veredito): string {
  const minutos = Math.ceil(veredito.esperaSegundos / 60);
  return minutos <= 1
    ? "Muitas tentativas seguidas. Espere um minuto e tente de novo."
    : `Muitas tentativas seguidas. Tente de novo em ${minutos} minutos.`;
}

/** Apaga janelas vencidas. Chamado pelo cron diário. */
export async function limparVencidos(): Promise<number> {
  const r = await db.rateLimit.deleteMany({ where: { janelaFim: { lt: new Date() } } });
  return r.count;
}
