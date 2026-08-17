import { getCurrentChild } from "@/lib/currentChild";
import { db } from "@/lib/db";
import { addDays, formatDiaMes, formatDiaSemana, startOfDay } from "@/lib/dates";
import TopBar from "@/components/TopBar";
import RotinaForm from "./RotinaForm";
import HorariosForm from "./HorariosForm";
import Card from "@/components/ui/Card";
import StatCard from "@/components/ui/StatCard";
import { Moon, Bike, Clock3 } from "lucide-react";

export default async function RotinaPage() {
  const { child } = await getCurrentChild();

  const hoje = startOfDay(new Date());
  const seteDiasAtras = addDays(hoje, -6);

  const entradas = await db.routineEntry.findMany({
    where: { childProfileId: child.id, data: { gte: seteDiasAtras, lte: hoje } },
    orderBy: { data: "asc" },
  });

  const entradaHoje = entradas.find((e) => e.data.getTime() === hoje.getTime());
  const entradaPorDia = new Map(entradas.map((e) => [e.data.getTime(), e]));

  const comSono = entradas.filter((e) => e.horasSono != null);
  const mediaSono =
    comSono.length > 0
      ? comSono.reduce((acc, e) => acc + (e.horasSono ?? 0), 0) / comSono.length
      : null;
  const totalAtividade = entradas.reduce((acc, e) => acc + (e.atividadeMinutos ?? 0), 0);

  return (
    <>
      <TopBar title={`Rotina de ${child.nome}`} subtitle="Sono e atividades físicas" />

      <div className="space-y-4 px-4 py-4">
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            icon={Moon}
            tone="indigo"
            value={mediaSono != null ? `${mediaSono.toFixed(1)}h` : "—"}
            label="média de sono (7 dias)"
          />
          <StatCard
            icon={Bike}
            tone="emerald"
            value={`${totalAtividade} min`}
            label="atividade total (7 dias)"
          />
        </div>

        <Card>
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-stone-700">
            <Clock3 size={16} className="text-stone-400" /> Horários habituais
          </div>
          <HorariosForm
            childId={child.id}
            dormirInicial={child.horarioDormirHabitual ?? ""}
            acordarInicial={child.horarioAcordarHabitual ?? ""}
          />
        </Card>

        <div>
          <h2 className="mb-2 text-sm font-semibold text-stone-700">Hoje</h2>
          <RotinaForm
            childId={child.id}
            dataISO={hoje.toISOString()}
            inicial={{
              horasSono: entradaHoje?.horasSono ?? null,
              qualidadeSono: entradaHoje?.qualidadeSono ?? null,
              atividadeMinutos: entradaHoje?.atividadeMinutos ?? null,
              tipoAtividade: entradaHoje?.tipoAtividade ?? "",
              disposicao: entradaHoje?.disposicao ?? null,
              observacao: entradaHoje?.observacao ?? "",
            }}
          />
        </div>

        <Card>
          <h2 className="mb-3 text-sm font-semibold text-stone-700">Últimos 7 dias</h2>
          <div className="space-y-2">
            {Array.from({ length: 7 }, (_, i) => addDays(seteDiasAtras, i)).map((data) => {
              const entrada = entradaPorDia.get(data.getTime());
              return (
                <div
                  key={data.toISOString()}
                  className="flex items-center justify-between border-b border-stone-100 py-1.5 text-sm last:border-0"
                >
                  <span className="text-stone-500">
                    {formatDiaSemana(data)} {formatDiaMes(data)}
                  </span>
                  <span className="font-medium text-stone-700">
                    {entrada?.horasSono != null ? `${entrada.horasSono}h sono` : "—"}
                    {entrada?.atividadeMinutos ? ` · ${entrada.atividadeMinutos}min ativ.` : ""}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </>
  );
}
