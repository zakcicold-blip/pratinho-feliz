"use server";

import { requireSession } from "@/lib/currentChild";
import { getCurrentChild } from "@/lib/currentChild";
import { perguntarAoPratinho, type RespostaAssistente } from "@/lib/assistente";
import { consumir, mensagemDeEspera } from "@/lib/rateLimit";

/**
 * Server action do assistente. A crianca em foco vem do cookie no servidor —
 * o cliente nao escolhe de qual perfil o modelo le o historico.
 */
export async function perguntar(pergunta: string): Promise<RespostaAssistente> {
  const session = await requireSession();

  // Cada pergunta chama uma API paga por token. Trinta por hora e mais do que
  // qualquer pessoa usa de verdade e impede que uma conta comprometida — ou
  // um script — vire uma fatura.
  const limite = await consumir("assistente_user", session.user.id);
  if (!limite.ok) return { ok: false, erro: mensagemDeEspera(limite) };

  const { child } = await getCurrentChild();
  return perguntarAoPratinho(session.user.id, child.id, pergunta);
}
