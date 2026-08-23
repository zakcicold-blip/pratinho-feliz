"use server";

import { requireSession } from "@/lib/currentChild";
import { getCurrentChild } from "@/lib/currentChild";
import { perguntarAoPratinho, type RespostaAssistente } from "@/lib/assistente";

/**
 * Server action do assistente. A crianca em foco vem do cookie no servidor —
 * o cliente nao escolhe de qual perfil o modelo le o historico.
 */
export async function perguntar(pergunta: string): Promise<RespostaAssistente> {
  const session = await requireSession();
  const { child } = await getCurrentChild();
  return perguntarAoPratinho(session.user.id, child.id, pergunta);
}
