"use client";

import { useState } from "react";
import { Moon, Smile, Meh, Frown, BatteryLow, Battery, BatteryFull, Bike } from "lucide-react";
import { registrarRotina } from "@/lib/actions/routine";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import type { NivelDisposicao, QualidadeSono } from "@prisma/client";

const QUALIDADE_OPCOES: { valor: QualidadeSono; label: string; Icon: typeof Smile }[] = [
  { valor: "RUIM", label: "Ruim", Icon: Frown },
  { valor: "REGULAR", label: "Regular", Icon: Meh },
  { valor: "BOA", label: "Boa", Icon: Smile },
];

const DISPOSICAO_OPCOES: { valor: NivelDisposicao; label: string; Icon: typeof Battery }[] = [
  { valor: "BAIXA", label: "Baixa", Icon: BatteryLow },
  { valor: "NORMAL", label: "Normal", Icon: Battery },
  { valor: "ALTA", label: "Alta", Icon: BatteryFull },
];

export default function RotinaForm({
  childId,
  dataISO,
  inicial,
}: {
  childId: string;
  dataISO: string;
  inicial: {
    horasSono: number | null;
    qualidadeSono: QualidadeSono | null;
    atividadeMinutos: number | null;
    tipoAtividade: string;
    disposicao: NivelDisposicao | null;
    observacao: string;
  };
}) {
  const [horasSono, setHorasSono] = useState(inicial.horasSono ?? 10);
  const [qualidadeSono, setQualidadeSono] = useState<QualidadeSono | null>(inicial.qualidadeSono);
  const [atividadeMinutos, setAtividadeMinutos] = useState(inicial.atividadeMinutos ?? 30);
  const [tipoAtividade, setTipoAtividade] = useState(inicial.tipoAtividade);
  const [disposicao, setDisposicao] = useState<NivelDisposicao | null>(inicial.disposicao);
  const [observacao, setObservacao] = useState(inicial.observacao);
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");

  async function salvar() {
    setStatus("saving");
    await registrarRotina(childId, {
      data: dataISO,
      horasSono,
      qualidadeSono,
      atividadeMinutos,
      tipoAtividade,
      disposicao,
      observacao,
    });
    setStatus("saved");
    setTimeout(() => setStatus("idle"), 1500);
  }

  return (
    <div className="space-y-4">
      <Card>
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-stone-700">
          <Moon size={16} className="text-indigo-500" /> Sono
        </div>
        <label className="mb-1 block text-sm text-stone-600">
          Horas dormidas: <span className="font-semibold text-stone-800">{horasSono}h</span>
        </label>
        <input
          type="range"
          min={0}
          max={14}
          step={0.5}
          value={horasSono}
          onChange={(e) => setHorasSono(Number(e.target.value))}
          className="w-full accent-indigo-500"
        />
        <div className="mt-3 grid grid-cols-3 gap-2">
          {QUALIDADE_OPCOES.map(({ valor, label, Icon }) => (
            <button
              key={valor}
              type="button"
              onClick={() => setQualidadeSono(valor)}
              className={cn(
                "flex flex-col items-center gap-1 rounded-xl border py-2 text-xs font-medium transition",
                qualidadeSono === valor
                  ? "border-indigo-400 bg-indigo-50 text-indigo-700"
                  : "border-stone-200 text-stone-500 hover:bg-stone-50"
              )}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-stone-700">
          <Bike size={16} className="text-emerald-500" /> Atividade física
        </div>
        <label className="mb-1 block text-sm text-stone-600">
          Minutos ativos: <span className="font-semibold text-stone-800">{atividadeMinutos} min</span>
        </label>
        <input
          type="range"
          min={0}
          max={180}
          step={5}
          value={atividadeMinutos}
          onChange={(e) => setAtividadeMinutos(Number(e.target.value))}
          className="w-full accent-emerald-500"
        />
        <input
          value={tipoAtividade}
          onChange={(e) => setTipoAtividade(e.target.value)}
          placeholder="Ex.: parquinho, natação, bicicleta"
          className="mt-3 w-full rounded-xl border border-stone-300 px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
        />
      </Card>

      <Card>
        <div className="mb-3 text-sm font-semibold text-stone-700">Disposição geral</div>
        <div className="grid grid-cols-3 gap-2">
          {DISPOSICAO_OPCOES.map(({ valor, label, Icon }) => (
            <button
              key={valor}
              type="button"
              onClick={() => setDisposicao(valor)}
              className={cn(
                "flex flex-col items-center gap-1 rounded-xl border py-2 text-xs font-medium transition",
                disposicao === valor
                  ? "border-orange-400 bg-orange-50 text-orange-700"
                  : "border-stone-200 text-stone-500 hover:bg-stone-50"
              )}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </div>
        <textarea
          value={observacao}
          onChange={(e) => setObservacao(e.target.value)}
          placeholder="Observações (opcional)"
          rows={2}
          className="mt-3 w-full rounded-xl border border-stone-300 px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
        />
      </Card>

      <Button onClick={salvar} disabled={status === "saving"} size="lg" className="w-full">
        {status === "saving" ? "Salvando..." : status === "saved" ? "Salvo!" : "Salvar rotina de hoje"}
      </Button>
    </div>
  );
}
