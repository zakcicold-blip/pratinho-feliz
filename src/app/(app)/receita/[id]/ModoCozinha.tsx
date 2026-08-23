"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { ChefHat, X, ChevronLeft, ChevronRight, Timer, Check, Play, Pause } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Modo cozinha: passo a passo em tela cheia.
 *
 * Pensado para ser usado com a mão suja e o fogo aceso — letra grande, alvos
 * de toque grandes, tela que não apaga e um timer para os passos que citam
 * tempo. A receita deixa de ser um texto para ler antes e vira algo para usar
 * durante.
 */

/** Acha "10 minutos", "5 min", "meia hora" no texto do passo. */
function minutosNoTexto(texto: string): number | null {
  const meiaHora = /meia\s+hora/i.test(texto);
  if (meiaHora) return 30;

  const hora = texto.match(/(\d+)\s*hora/i);
  if (hora) return Number(hora[1]) * 60;

  const min = texto.match(/(\d+)\s*(?:a\s*\d+\s*)?min/i);
  if (min) return Number(min[1]);

  return null;
}

function formatarRelogio(segundos: number): string {
  const m = Math.floor(segundos / 60);
  const s = segundos % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function ModoCozinha({
  nome,
  passos,
  ingredientes,
}: {
  nome: string;
  passos: string[];
  ingredientes: string[];
}) {
  const [aberto, setAberto] = useState(false);
  const [indice, setIndice] = useState(0);
  const [feitos, setFeitos] = useState<Set<number>>(new Set());
  const [restante, setRestante] = useState<number | null>(null);
  const [rodando, setRodando] = useState(false);
  const wakeLock = useRef<WakeLockSentinel | null>(null);

  const passo = passos[indice] ?? "";
  const minutos = minutosNoTexto(passo);

  // ---- tela acesa enquanto o modo está aberto ----
  const soltarTela = useCallback(async () => {
    try {
      await wakeLock.current?.release();
    } catch {
      // Liberar wake lock nunca deve quebrar a tela.
    }
    wakeLock.current = null;
  }, []);

  useEffect(() => {
    if (!aberto) return;

    let cancelado = false;
    async function segurarTela() {
      try {
        if ("wakeLock" in navigator) {
          const sentinela = await navigator.wakeLock.request("screen");
          if (cancelado) sentinela.release();
          else wakeLock.current = sentinela;
        }
      } catch {
        // Sem wake lock (navegador antigo ou bateria baixa) o modo continua útil.
      }
    }
    segurarTela();

    return () => {
      cancelado = true;
      soltarTela();
    };
  }, [aberto, soltarTela]);

  // ---- timer ----
  // O intervalo e um sistema externo: o efeito so o cria e o destroi. As
  // paradas acontecem dentro do callback, nao no corpo do efeito.
  useEffect(() => {
    if (!rodando) return;

    const id = setInterval(() => {
      setRestante((r) => {
        if (r === null) return null;
        if (r <= 1) {
          setRodando(false);
          // Vibra quando o aparelho permite — o fogao costuma estar barulhento.
          navigator.vibrate?.([200, 100, 200]);
          return 0;
        }
        return r - 1;
      });
    }, 1000);

    return () => clearInterval(id);
  }, [rodando]);

  /** Trocar de passo zera o timer: ele pertence ao passo. */
  function irPara(novoIndice: number) {
    setIndice(novoIndice);
    setRestante(null);
    setRodando(false);
  }

  function marcarEAvancar() {
    setFeitos((antes) => new Set(antes).add(indice));
    if (indice < passos.length - 1) irPara(indice + 1);
  }

  if (!aberto) {
    return (
      <button
        onClick={() => {
          setAberto(true);
          irPara(0);
          setFeitos(new Set());
        }}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-stone-900 py-3.5 text-sm font-semibold text-white transition active:scale-[0.99] hover:bg-stone-800"
      >
        <ChefHat size={16} /> Modo cozinha
      </button>
    );
  }

  const ultimo = indice === passos.length - 1;
  const tudoFeito = feitos.size === passos.length;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#fdfaf6]">
      {/* Cabeçalho */}
      <div className="flex items-center gap-3 border-b border-stone-200/70 px-4 py-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-stone-800">{nome}</p>
          <p className="text-xs text-stone-400">
            Passo {indice + 1} de {passos.length}
          </p>
        </div>
        <button
          onClick={() => {
            setAberto(false);
            soltarTela();
          }}
          aria-label="Sair do modo cozinha"
          className="flex h-10 w-10 items-center justify-center rounded-full text-stone-500 transition hover:bg-stone-100"
        >
          <X size={20} />
        </button>
      </div>

      {/* Progresso */}
      <div className="flex gap-1 px-4 pt-3">
        {passos.map((_, i) => (
          <span
            key={i}
            className={cn(
              "h-1 flex-1 rounded-full transition",
              feitos.has(i) ? "bg-emerald-500" : i === indice ? "bg-orange-500" : "bg-stone-200"
            )}
          />
        ))}
      </div>

      {/* Passo atual */}
      <div className="flex flex-1 flex-col justify-center overflow-y-auto px-6 py-6">
        {tudoFeito ? (
          <div className="text-center">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
              <Check size={32} />
            </span>
            <p className="font-display mt-4 text-2xl font-extrabold text-stone-900">Prato pronto!</p>
            <p className="mt-2 text-stone-600">Bom apetite. Depois conte como foi na tela de hoje.</p>
          </div>
        ) : (
          <>
            <span className="text-xs font-semibold tracking-wide text-orange-500 uppercase">
              Passo {indice + 1}
            </span>
            <p className="font-display mt-3 text-[1.65rem] leading-snug font-bold text-balance text-stone-900">
              {passo}
            </p>

            {minutos !== null && (
              <div className="mt-6 flex items-center gap-3 rounded-2xl border border-stone-200/70 bg-white p-4 shadow-card">
                <Timer size={20} className="shrink-0 text-orange-500" />
                <div className="flex-1">
                  <p className="text-xs text-stone-400">Cronômetro do passo</p>
                  <p className="text-2xl font-bold tabular-nums text-stone-900">
                    {formatarRelogio(restante ?? minutos * 60)}
                  </p>
                </div>
                <button
                  onClick={() => {
                    if (restante === null) setRestante(minutos * 60);
                    setRodando((r) => !r);
                  }}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-orange-500 text-white transition active:scale-95"
                  aria-label={rodando ? "Pausar" : "Iniciar"}
                >
                  {rodando ? <Pause size={18} /> : <Play size={18} />}
                </button>
              </div>
            )}

            {indice === 0 && ingredientes.length > 0 && (
              <div className="mt-6 rounded-2xl bg-white/70 p-4">
                <p className="mb-2 text-xs font-semibold tracking-wide text-stone-400 uppercase">
                  Separe antes de começar
                </p>
                <ul className="space-y-1 text-[15px] text-stone-600">
                  {ingredientes.map((i) => (
                    <li key={i}>{i}</li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>

      {/* Controles — alvos grandes, para usar com a mão ocupada */}
      <div className="flex items-center gap-3 border-t border-stone-200/70 px-4 py-4 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
        <button
          onClick={() => irPara(Math.max(0, indice - 1))}
          disabled={indice === 0}
          aria-label="Passo anterior"
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-stone-200 bg-white text-stone-600 transition disabled:opacity-40"
        >
          <ChevronLeft size={24} />
        </button>

        {tudoFeito ? (
          <button
            onClick={() => {
              setAberto(false);
              soltarTela();
            }}
            className="h-14 flex-1 rounded-2xl bg-stone-900 text-base font-semibold text-white"
          >
            Fechar
          </button>
        ) : (
          <button
            onClick={marcarEAvancar}
            className="flex h-14 flex-1 items-center justify-center gap-2 rounded-2xl bg-orange-500 text-base font-semibold text-white transition active:scale-[0.99]"
          >
            <Check size={20} /> {ultimo ? "Terminei" : "Feito, próximo"}
          </button>
        )}

        <button
          onClick={() => irPara(Math.min(passos.length - 1, indice + 1))}
          disabled={ultimo}
          aria-label="Próximo passo"
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-stone-200 bg-white text-stone-600 transition disabled:opacity-40"
        >
          <ChevronRight size={24} />
        </button>
      </div>
    </div>
  );
}
