import { getCurrentChild } from "@/lib/currentChild";
import { db } from "@/lib/db";
import { addDiasChave, formatDiaSemana, hojeChave } from "@/lib/dates";
import TopBar from "@/components/TopBar";
import RotinaForm from "./RotinaForm";
import HorariosForm from "./HorariosForm";
import LeituraRotinaCard from "./LeituraRotinaCard";
import { Moon, Bike, Clock3, CalendarCheck, Star } from "lucide-react";
import { lerObjetivoRotina } from "@/lib/rotinaSinais";
import { sugestoesDaRotina } from "@/lib/planEngine";
import { cn } from "@/lib/cn";

const SONO_MAX_H = 14; // escala do gráfico

export default async function RotinaPage() {
  const { child } = await getCurrentChild();

  const hoje = hojeChave();
  const seteDiasAtras = addDiasChave(hoje, -6);

  const entradas = await db.routineEntry.findMany({
    where: { childProfileId: child.id, data: { gte: seteDiasAtras, lte: hoje } },
    orderBy: { data: "asc" },
  });

  const entradaHoje = entradas.find((e) => e.data.getTime() === hoje.getTime());
  const entradaPorDia = new Map(entradas.map((e) => [e.data.getTime(), e]));

  const comSono = entradas.filter((e) => e.horasSono != null);
  const mediaSono =
    comSono.length > 0 ? comSono.reduce((acc, e) => acc + (e.horasSono ?? 0), 0) / comSono.length : null;
  const melhorSono = comSono.length > 0 ? Math.max(...comSono.map((e) => e.horasSono ?? 0)) : null;
  const totalAtividade = entradas.reduce((acc, e) => acc + (e.atividadeMinutos ?? 0), 0);
  const diasRegistrados = entradas.filter(
    (e) => e.horasSono != null || e.atividadeMinutos != null,
  ).length;

  const dias7 = Array.from({ length: 7 }, (_, i) => addDiasChave(seteDiasAtras, i));

  const { leitura } = await lerObjetivoRotina(child.id);
  const { sugestoes } = leitura.semDados ? { sugestoes: [] } : await sugestoesDaRotina(child.id);

  return (
    <>
      <TopBar title={`Rotina de ${child.nome}`} subtitle="Sono e atividades físicas" />

      <div className="space-y-5 px-4 py-4">
        {/* Herói: sono médio da semana (tema noturno) */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-500 to-violet-500 p-5 text-white shadow-card-lg">
          <div aria-hidden className="pointer-events-none absolute -right-8 -top-10 h-40 w-40 rounded-full bg-white/10" />
          <Moon aria-hidden className="pointer-events-none absolute right-5 top-5 text-white/25" size={40} />
          <span className="text-xs font-semibold uppercase tracking-wide text-white/80">Sono médio · 7 dias</span>
          <p className="font-display mt-2 text-5xl leading-none">
            {mediaSono != null ? mediaSono.toFixed(1) : "—"}
            {mediaSono != null && <span className="text-2xl font-semibold text-white/60">h</span>}
          </p>
          <p className="mt-1 text-sm text-white/80">
            {comSono.length > 0 ? `de ${comSono.length} noite${comSono.length > 1 ? "s" : ""} registrada${comSono.length > 1 ? "s" : ""}` : "registre o sono para acompanhar"}
          </p>
          <div className="mt-4 grid grid-cols-3 gap-2">
            <HeroStat icon={Bike} valor={`${totalAtividade}`} unidade="min" rotulo="atividade (7d)" />
            <HeroStat icon={Star} valor={melhorSono != null ? melhorSono.toFixed(1) : "—"} unidade={melhorSono != null ? "h" : ""} rotulo="melhor noite" />
            <HeroStat icon={CalendarCheck} valor={`${diasRegistrados}`} unidade="/7" rotulo="dias registrados" />
          </div>
        </div>

        {/* Gráfico de sono dos últimos 7 dias */}
        <section>
          <h2 className="font-display mb-3 flex items-center gap-2 px-1 text-base font-semibold text-stone-800">
            <Moon size={16} className="text-indigo-500" /> Sono nos últimos 7 dias
          </h2>
          <div className="rounded-3xl border border-stone-200/60 bg-white p-5 shadow-card">
            <div className="flex items-end justify-between gap-2" style={{ height: 108 }}>
              {dias7.map((data) => {
                const e = entradaPorDia.get(data.getTime());
                const horas = e?.horasSono ?? null;
                const ehHoje = data.getTime() === hoje.getTime();
                const altura = horas != null ? Math.max(6, (horas / SONO_MAX_H) * 84) : 4;
                return (
                  <div key={data.toISOString()} className="flex flex-1 flex-col items-center justify-end gap-1">
                    <span className="text-[10px] font-semibold text-stone-500">{horas != null ? `${horas}h` : ""}</span>
                    <div
                      className={cn(
                        "w-full rounded-lg transition-all",
                        horas == null ? "bg-stone-100" : "bg-gradient-to-t from-indigo-500 to-violet-400",
                      )}
                      style={{ height: `${altura}px` }}
                    />
                    <span className={cn("text-[10px] capitalize", ehHoje ? "font-bold text-indigo-600" : "text-stone-400")}>
                      {formatDiaSemana(data).replace(".", "")}
                    </span>
                  </div>
                );
              })}
            </div>
            {totalAtividade > 0 && (
              <p className="mt-3 flex items-center gap-1.5 border-t border-stone-100 pt-3 text-[11px] text-stone-400">
                <Bike size={12} className="text-emerald-500" /> {totalAtividade} min de atividade física na semana.
              </p>
            )}
          </div>
        </section>

        {/* Leitura da rotina (insight + sugestões) */}
        <LeituraRotinaCard childId={child.id} leitura={leitura} sugestoes={sugestoes} />

        {/* Registrar hoje */}
        <section>
          <h2 className="font-display mb-3 px-1 text-base font-semibold text-stone-800">Registrar hoje</h2>
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
        </section>

        {/* Horários habituais */}
        <section>
          <h2 className="font-display mb-3 flex items-center gap-2 px-1 text-base font-semibold text-stone-800">
            <Clock3 size={16} className="text-stone-400" /> Horários habituais
          </h2>
          <div className="rounded-3xl border border-stone-200/60 bg-white p-5 shadow-card">
            <HorariosForm
              childId={child.id}
              dormirInicial={child.horarioDormirHabitual ?? ""}
              acordarInicial={child.horarioAcordarHabitual ?? ""}
            />
          </div>
        </section>
      </div>
    </>
  );
}

function HeroStat({
  icon: Icon,
  valor,
  unidade,
  rotulo,
}: {
  icon: typeof Moon;
  valor: string;
  unidade?: string;
  rotulo: string;
}) {
  return (
    <div className="rounded-2xl bg-white/15 p-2.5 text-center">
      <Icon size={15} className="mx-auto text-white/90" />
      <p className="font-display mt-1 text-lg leading-none text-white">
        {valor}
        {unidade && <span className="text-xs font-semibold text-white/70">{unidade}</span>}
      </p>
      <p className="mt-0.5 text-[10px] leading-tight text-white/70">{rotulo}</p>
    </div>
  );
}
