"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { chaveUtc } from "@/lib/dates";
import { requireSession } from "@/lib/currentChild";
import { NivelDisposicao, QualidadeSono } from "@prisma/client";

export type RotinaInput = {
  data: string;
  horasSono: number | null;
  qualidadeSono: QualidadeSono | null;
  atividadeMinutos: number | null;
  tipoAtividade: string;
  disposicao: NivelDisposicao | null;
  observacao: string;
};

async function assertOwnership(childId: string) {
  const session = await requireSession();
  const child = await db.childProfile.findUniqueOrThrow({ where: { id: childId } });
  if (child.userId !== session.user.id) throw new Error("Não autorizado.");
}

export async function registrarRotina(childId: string, input: RotinaInput) {
  await assertOwnership(childId);

  const data = chaveUtc(new Date(input.data));

  await db.routineEntry.upsert({
    where: { childProfileId_data: { childProfileId: childId, data } },
    update: {
      horasSono: input.horasSono,
      qualidadeSono: input.qualidadeSono,
      atividadeMinutos: input.atividadeMinutos,
      tipoAtividade: input.tipoAtividade || null,
      disposicao: input.disposicao,
      observacao: input.observacao || null,
    },
    create: {
      childProfileId: childId,
      data,
      horasSono: input.horasSono,
      qualidadeSono: input.qualidadeSono,
      atividadeMinutos: input.atividadeMinutos,
      tipoAtividade: input.tipoAtividade || null,
      disposicao: input.disposicao,
      observacao: input.observacao || null,
    },
  });

  revalidatePath("/rotina");
  return { ok: true };
}

export async function atualizarHorariosHabituais(
  childId: string,
  horarioDormirHabitual: string,
  horarioAcordarHabitual: string
) {
  await assertOwnership(childId);
  await db.childProfile.update({
    where: { id: childId },
    data: {
      horarioDormirHabitual: horarioDormirHabitual || null,
      horarioAcordarHabitual: horarioAcordarHabitual || null,
    },
  });
  revalidatePath("/rotina");
}
