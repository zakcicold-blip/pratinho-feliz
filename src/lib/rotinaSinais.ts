import { db } from "@/lib/db";
import { addDiasChave, hojeChave } from "@/lib/dates";
import { faixaEtariaEmMeses } from "@/lib/idade";
import { lerRotina, type LeituraRotina, type SinaisRotina } from "@/lib/objetivosRotina";

/** Quantos dias para trás olhamos ao resumir a rotina. */
const JANELA_DIAS = 7;

/**
 * Resume os registros de rotina recentes da criança em sinais únicos.
 *
 * Cada pilar é lido de forma independente: se a família só preencheu sono,
 * os outros ficam nulos e a recomendação usa apenas o que existe.
 */
export async function lerSinaisRotina(childId: string): Promise<SinaisRotina> {
  const child = await db.childProfile.findUniqueOrThrow({
    where: { id: childId },
    select: { faixaEtaria: true },
  });

  const hoje = hojeChave();
  const desde = addDiasChave(hoje, -(JANELA_DIAS - 1));

  const entradas = await db.routineEntry.findMany({
    where: { childProfileId: childId, data: { gte: desde, lte: hoje } },
    orderBy: { data: "desc" },
  });

  const comSono = entradas.filter((e) => e.horasSono !== null);
  const horasSono =
    comSono.length > 0
      ? comSono.reduce((acc, e) => acc + (e.horasSono ?? 0), 0) / comSono.length
      : null;

  // Qualidade: usa a pior registrada na janela — é o sinal que a família quer resolver.
  const ordem = { RUIM: 0, REGULAR: 1, BOA: 2 } as const;
  const qualidades = entradas
    .map((e) => e.qualidadeSono)
    .filter((q): q is NonNullable<typeof q> => q !== null);
  const qualidadeSono =
    qualidades.length > 0
      ? qualidades.reduce((pior, q) => (ordem[q] < ordem[pior] ? q : pior), qualidades[0])
      : null;

  const comAtividade = entradas.filter((e) => e.atividadeMinutos !== null);
  const atividadeMinutos =
    comAtividade.length > 0
      ? Math.round(
          comAtividade.reduce((acc, e) => acc + (e.atividadeMinutos ?? 0), 0) / comAtividade.length
        )
      : null;

  // Disposição: a mais recente registrada.
  const disposicao = entradas.find((e) => e.disposicao !== null)?.disposicao ?? null;

  return {
    horasSono,
    qualidadeSono,
    atividadeMinutos,
    disposicao,
    idadeMeses: faixaEtariaEmMeses(child.faixaEtaria),
  };
}

/** Sinais + objetivo já interpretado, para uso nas telas. */
export async function lerObjetivoRotina(
  childId: string
): Promise<{ sinais: SinaisRotina; leitura: LeituraRotina }> {
  const sinais = await lerSinaisRotina(childId);
  return { sinais, leitura: lerRotina(sinais) };
}
