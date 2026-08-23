import { enviarLembretesDeHoje } from "@/lib/lembretes";

/**
 * Cron diario dos lembretes.
 *
 * Protegido por CRON_SECRET: a Vercel manda o header Authorization com o
 * valor configurado. Sem o segredo definido, a rota recusa — melhor nao rodar
 * do que rodar aberta para qualquer um disparar mensagem para a base.
 */
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(req: Request) {
  const segredo = process.env.CRON_SECRET;
  if (!segredo) {
    return Response.json({ erro: "CRON_SECRET nao configurado." }, { status: 503 });
  }

  const autorizacao = req.headers.get("authorization");
  if (autorizacao !== `Bearer ${segredo}`) {
    return Response.json({ erro: "Nao autorizado." }, { status: 401 });
  }

  const relatorio = await enviarLembretesDeHoje();
  return Response.json(relatorio);
}
