"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/currentChild";

export async function alternarLembretes(ativo: boolean) {
  const session = await requireSession();
  await db.user.update({ where: { id: session.user.id }, data: { lembretes: ativo } });
  revalidatePath("/configuracoes");
}
