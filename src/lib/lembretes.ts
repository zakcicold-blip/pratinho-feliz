import { db } from "@/lib/db";
import { hojeChave } from "@/lib/dates";
import { TIPO_REFEICAO_LABEL } from "@/lib/constants";
import { SITE_URL } from "@/lib/blog";
import { enviarEmail, enviarWhatsapp } from "@/lib/envio";

/**
 * Monta e envia o lembrete diário: o que a criança come hoje.
 *
 * Só recebe quem: tem assinatura/acesso liberado, deixou os lembretes
 * ligados e tem plano ativo com refeições para hoje. Quem não tem nada
 * planejado hoje não é incomodado.
 */

export type ResumoDoDia = {
  userId: string;
  nomeResponsavel: string;
  email: string;
  telefone: string | null;
  nomeCrianca: string;
  refeicoes: { tipo: string; receita: string }[];
};

export async function montarResumosDeHoje(): Promise<ResumoDoDia[]> {
  const hoje = hojeChave();

  const usuarios = await db.user.findMany({
    where: {
      lembretes: true,
      // Não manda para quem já recebeu hoje (cron rodando duas vezes).
      OR: [{ ultimoLembreteEm: null }, { ultimoLembreteEm: { lt: hoje } }],
      subscription: {
        OR: [
          { acessoCortesia: true },
          { status: "ATIVA" },
          { status: "TESTE", stripeSubscriptionId: { not: null } },
        ],
      },
    },
    select: {
      id: true,
      name: true,
      email: true,
      telefone: true,
      children: {
        orderBy: { createdAt: "asc" },
        take: 1,
        select: {
          nome: true,
          mealPlans: {
            where: { ativo: true },
            orderBy: { cicloNumero: "desc" },
            take: 1,
            select: {
              slots: {
                where: { data: hoje, recipeId: { not: null }, status: { not: "FORA_DE_CASA" } },
                orderBy: { tipo: "asc" },
                select: { tipo: true, recipe: { select: { nome: true } } },
              },
            },
          },
        },
      },
    },
  });

  const resumos: ResumoDoDia[] = [];

  for (const u of usuarios) {
    const crianca = u.children[0];
    const slots = crianca?.mealPlans[0]?.slots ?? [];
    if (!crianca || slots.length === 0) continue;

    resumos.push({
      userId: u.id,
      nomeResponsavel: u.name,
      email: u.email,
      telefone: u.telefone,
      nomeCrianca: crianca.nome,
      refeicoes: slots
        .filter((s) => s.recipe)
        .map((s) => ({
          tipo: TIPO_REFEICAO_LABEL[s.tipo] ?? s.tipo,
          receita: s.recipe!.nome,
        })),
    });
  }

  return resumos;
}

export function montarHtml(resumo: ResumoDoDia): string {
  const linhas = resumo.refeicoes
    .map(
      (r) =>
        `<tr><td style="padding:8px 0;color:#a8a29e;font-size:13px;width:120px">${r.tipo}</td>` +
        `<td style="padding:8px 0;color:#292524;font-size:15px;font-weight:600">${r.receita}</td></tr>`
    )
    .join("");

  return `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;background:#fdfaf6;padding:32px">
  <div style="max-width:520px;margin:0 auto;background:#fff;border:1px solid #e8e2da;border-radius:20px;padding:28px">
    <div style="font-size:15px;font-weight:700;color:#292524">🍊 Pratinho Feliz</div>
    <div style="font-size:22px;font-weight:800;color:#1c1917;margin-top:18px;line-height:1.25">
      O prato de ${resumo.nomeCrianca} hoje
    </div>
    <table style="width:100%;border-collapse:collapse;margin-top:16px">${linhas}</table>
    <a href="${SITE_URL}/hoje" style="display:inline-block;margin-top:22px;background:#f97316;color:#fff;text-decoration:none;padding:12px 22px;border-radius:999px;font-size:14px;font-weight:600">
      Abrir o plano de hoje
    </a>
    <div style="margin-top:20px;padding-top:16px;border-top:1px solid #f0ebe4;font-size:12px;color:#a8a29e">
      Você recebe isto porque deixou os lembretes ligados. Para parar, é só desligar em
      Configurações dentro do app.
    </div>
  </div>
</div>`;
}

/** Texto curto do WhatsApp — vira parâmetro do template aprovado. */
export function montarParametrosWhatsapp(resumo: ResumoDoDia): string[] {
  const lista = resumo.refeicoes.map((r) => `${r.tipo}: ${r.receita}`).join(" · ");
  return [resumo.nomeCrianca, lista];
}

export type RelatorioEnvio = {
  encontrados: number;
  enviados: number;
  falhas: number;
  simulado: boolean;
  detalhes: string[];
};

export async function enviarLembretesDeHoje(): Promise<RelatorioEnvio> {
  const resumos = await montarResumosDeHoje();
  const detalhes: string[] = [];
  let enviados = 0;
  let falhas = 0;
  let algumReal = false;

  for (const resumo of resumos) {
    // E-mail sempre; WhatsApp só quando a pessoa deixou o telefone.
    const resultados = [
      await enviarEmail(
        resumo.email,
        `O prato de ${resumo.nomeCrianca} hoje`,
        montarHtml(resumo)
      ),
      resumo.telefone
        ? await enviarWhatsapp(resumo.telefone, montarParametrosWhatsapp(resumo))
        : null,
    ].filter(Boolean);

    const houveErro = resultados.some((r) => r && !r.ok);
    if (resultados.some((r) => r && r.ok && !r.simulado)) algumReal = true;

    if (houveErro) {
      falhas++;
      detalhes.push(
        `${resumo.email}: ${resultados
          .filter((r) => r && !r.ok)
          .map((r) => (r && !r.ok ? `${r.canal} ${r.erro}` : ""))
          .join(", ")}`
      );
      continue;
    }

    enviados++;
    await db.user.update({
      where: { id: resumo.userId },
      data: { ultimoLembreteEm: new Date() },
    });
  }

  return {
    encontrados: resumos.length,
    enviados,
    falhas,
    simulado: !algumReal,
    detalhes,
  };
}
