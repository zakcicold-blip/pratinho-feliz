/**
 * Envio de mensagens (e-mail e WhatsApp).
 *
 * Dois princípios:
 *
 * 1. NADA é enviado a menos que LEMBRETES_ATIVOS=1 esteja no ambiente. Ter a
 *    chave do provedor configurada não basta — mandar mensagem para a base de
 *    clientes é decisão do dono do produto, não efeito colateral de um deploy.
 * 2. Sem chave, a função não quebra: registra no log o que teria enviado. Dá
 *    para testar o fluxo inteiro sem risco de disparar nada.
 */

export type ResultadoEnvio =
  | { ok: true; canal: "email" | "whatsapp"; simulado: boolean }
  | { ok: false; canal: "email" | "whatsapp"; erro: string };

/** Trava geral: sem isso, tudo roda em simulação. */
export function envioAtivo(): boolean {
  return process.env.LEMBRETES_ATIVOS === "1";
}

/** Só digitos, com o 55 do Brasil na frente quando falta. */
export function normalizarTelefone(telefone: string): string | null {
  const digitos = telefone.replace(/\D/g, "");
  if (digitos.length < 10) return null;
  return digitos.startsWith("55") ? digitos : `55${digitos}`;
}

/**
 * E-mail via Resend (API REST, sem SDK).
 * Requer RESEND_API_KEY e EMAIL_REMETENTE.
 */
export async function enviarEmail(
  para: string,
  assunto: string,
  html: string
): Promise<ResultadoEnvio> {
  const chave = process.env.RESEND_API_KEY;
  const remetente = process.env.EMAIL_REMETENTE;

  if (!envioAtivo() || !chave || !remetente) {
    console.log(`[lembrete:simulado] email → ${para} | ${assunto}`);
    return { ok: true, canal: "email", simulado: true };
  }

  try {
    const resposta = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${chave}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: remetente, to: [para], subject: assunto, html }),
    });

    if (!resposta.ok) {
      return { ok: false, canal: "email", erro: `Resend ${resposta.status}` };
    }
    return { ok: true, canal: "email", simulado: false };
  } catch (e) {
    return { ok: false, canal: "email", erro: e instanceof Error ? e.message : "falha de rede" };
  }
}

/**
 * WhatsApp via Meta Cloud API.
 * Requer WHATSAPP_TOKEN, WHATSAPP_PHONE_ID e WHATSAPP_TEMPLATE.
 *
 * Atenção: mensagem iniciada pelo negócio fora da janela de 24 h só sai por
 * TEMPLATE aprovado pela Meta. Por isso mandamos template com parâmetros, e
 * não texto livre — texto livre seria recusado pela API na maior parte dos casos.
 */
export async function enviarWhatsapp(
  telefone: string,
  parametros: string[]
): Promise<ResultadoEnvio> {
  const numero = normalizarTelefone(telefone);
  if (!numero) return { ok: false, canal: "whatsapp", erro: "telefone inválido" };

  const token = process.env.WHATSAPP_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_ID;
  const template = process.env.WHATSAPP_TEMPLATE;

  if (!envioAtivo() || !token || !phoneId || !template) {
    console.log(`[lembrete:simulado] whatsapp → ${numero} | ${parametros.join(" | ")}`);
    return { ok: true, canal: "whatsapp", simulado: true };
  }

  try {
    const resposta = await fetch(`https://graph.facebook.com/v21.0/${phoneId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: numero,
        type: "template",
        template: {
          name: template,
          language: { code: "pt_BR" },
          components: [
            {
              type: "body",
              parameters: parametros.map((p) => ({ type: "text", text: p })),
            },
          ],
        },
      }),
    });

    if (!resposta.ok) {
      return { ok: false, canal: "whatsapp", erro: `Meta ${resposta.status}` };
    }
    return { ok: true, canal: "whatsapp", simulado: false };
  } catch (e) {
    return { ok: false, canal: "whatsapp", erro: e instanceof Error ? e.message : "falha de rede" };
  }
}
