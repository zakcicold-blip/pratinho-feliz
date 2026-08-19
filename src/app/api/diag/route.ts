import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hojeChave } from "@/lib/dates";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const hoje = hojeChave();
  const plano = await db.mealPlan.findFirst({
    where: { ativo: true },
    orderBy: { cicloNumero: "desc" },
  });
  const slotsHoje = plano
    ? await db.mealSlot.count({ where: { mealPlanId: plano.id, data: hoje } })
    : 0;
  const primeiros = plano
    ? await db.mealSlot.findMany({
        where: { mealPlanId: plano.id },
        orderBy: { data: "asc" },
        take: 2,
        select: { data: true },
      })
    : [];
  return NextResponse.json({
    serverNowISO: new Date().toISOString(),
    hojeChaveISO: hoje.toISOString(),
    tz: process.env.TZ ?? null,
    dataInicioISO: plano?.dataInicio?.toISOString() ?? null,
    slotsHoje,
    primeirosSlots: primeiros.map((s) => s.data.toISOString()),
  });
}
