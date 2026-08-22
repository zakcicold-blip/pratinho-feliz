"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Minus, Plus } from "lucide-react";
import { marcarComprado, alternarDespensa, registrarQuantidade } from "@/lib/actions/pantry";
import { formatarMedida, type MedidaCompra } from "@/lib/compras";
import { cn } from "@/lib/cn";

/** Espera o usuário parar de digitar antes de gravar. */
const ATRASO_GRAVACAO = 600;

function paraTexto(base: number | null, medida: MedidaCompra): string {
  if (base == null) return "";
  const exibido = base / medida.fator;
  return exibido.toLocaleString("pt-BR", { maximumFractionDigits: medida.casas });
}

function paraNumero(texto: string): number | null {
  const limpo = texto.replace(",", ".").trim();
  if (!limpo) return null;
  const n = Number(limpo);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export default function ShoppingItemRow({
  childId,
  semanaInicioISO,
  ingredientId,
  nome,
  sugestao,
  sugestaoBase,
  medida,
  aproximado,
  compradoInicial,
  quantidadeInicial,
}: {
  childId: string;
  semanaInicioISO: string;
  ingredientId: string;
  nome: string;
  /** Sugestão do plano, já formatada: "27 un", "1,2 kg". */
  sugestao: string;
  /** Sugestão na unidade base, usada ao tocar em "usar sugestão". */
  sugestaoBase: number;
  medida: MedidaCompra;
  /** Algum uso não tinha peso convertível — o total é piso, não exato. */
  aproximado: boolean;
  compradoInicial: boolean;
  /** O que a pessoa já anotou ter pegado, na unidade base. */
  quantidadeInicial: number | null;
}) {
  const [comprado, setComprado] = useState(compradoInicial);
  const [ocultar, setOcultar] = useState(false);
  const [texto, setTexto] = useState(() => paraTexto(quantidadeInicial, medida));
  const [, startTransition] = useTransition();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  function gravar(novoTexto: string) {
    const exibido = paraNumero(novoTexto);
    const base = exibido == null ? null : exibido * medida.fator;

    if (base != null) setComprado(true);

    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      startTransition(async () => {
        await registrarQuantidade(childId, new Date(semanaInicioISO), ingredientId, base);
      });
    }, ATRASO_GRAVACAO);
  }

  function alterarTexto(novo: string) {
    setTexto(novo);
    gravar(novo);
  }

  function passo(direcao: 1 | -1) {
    const atual = paraNumero(texto) ?? (direcao === 1 ? 0 : medida.passo);
    const bruto = atual + direcao * medida.passo;
    const proximo = Math.max(0, Number(bruto.toFixed(medida.casas)));
    const novo = proximo === 0 ? "" : proximo.toLocaleString("pt-BR", { maximumFractionDigits: medida.casas });
    alterarTexto(novo);
  }

  if (ocultar) return null;

  const anotado = paraNumero(texto) != null;
  const unidade = medida.contavel
    ? medida.unidadeSingular === "un"
      ? "un"
      : medida.unidadeSingular
    : medida.unidadeSingular;

  return (
    <div className="py-2.5">
      <div className="flex items-center justify-between gap-2">
        <label className="flex min-w-0 flex-1 items-center gap-3">
          <input
            type="checkbox"
            checked={comprado}
            onChange={(e) => {
              const checked = e.target.checked;
              setComprado(checked);
              startTransition(async () => {
                await marcarComprado(childId, new Date(semanaInicioISO), ingredientId, checked);
              });
            }}
            className="h-4 w-4 shrink-0 rounded border-stone-300 text-orange-500"
          />
          <span className="min-w-0 flex-1">
            <span
              className={cn(
                "block truncate text-sm",
                comprado ? "text-stone-400 line-through" : "text-stone-700"
              )}
            >
              {nome}
            </span>
            <span className="block text-[11px] text-stone-400">
              {medida.aGosto ? (
                "a gosto"
              ) : (
                <>
                  Sugestão: {sugestao}
                  {aproximado && " ou mais"}
                </>
              )}
            </span>
          </span>
        </label>

        <button
          onClick={() => {
            setOcultar(true);
            startTransition(async () => {
              await alternarDespensa(childId, ingredientId);
            });
          }}
          className="shrink-0 rounded-full bg-stone-100 px-2.5 py-1 text-[11px] font-medium text-stone-500 transition hover:bg-stone-200"
        >
          Já tenho
        </button>
      </div>

      {!medida.aGosto && (
        <div className="mt-1.5 flex items-center gap-2 pl-7">
          <div
            className={cn(
              "flex items-center rounded-full border transition",
              anotado ? "border-orange-300 bg-orange-50" : "border-stone-200 bg-white"
            )}
          >
            <button
              type="button"
              onClick={() => passo(-1)}
              aria-label={`Diminuir ${nome}`}
              className="flex h-7 w-7 items-center justify-center rounded-full text-stone-400 transition hover:text-stone-700"
            >
              <Minus size={13} />
            </button>
            <input
              value={texto}
              onChange={(e) => alterarTexto(e.target.value)}
              inputMode="decimal"
              aria-label={`Quantidade de ${nome} que você pegou`}
              placeholder="0"
              className={cn(
                "w-12 border-0 bg-transparent p-0 text-center text-sm font-semibold tabular-nums outline-none",
                anotado ? "text-orange-700" : "text-stone-500"
              )}
            />
            <button
              type="button"
              onClick={() => passo(1)}
              aria-label={`Aumentar ${nome}`}
              className="flex h-7 w-7 items-center justify-center rounded-full text-stone-400 transition hover:text-stone-700"
            >
              <Plus size={13} />
            </button>
          </div>

          <span className={cn("text-xs font-medium", anotado ? "text-orange-700" : "text-stone-400")}>
            {unidade}
          </span>

          {!anotado && sugestaoBase > 0 && (
            <button
              type="button"
              onClick={() => alterarTexto(paraTexto(sugestaoBase, medida))}
              className="rounded-full px-2 py-1 text-[11px] font-medium text-stone-400 transition hover:bg-stone-100 hover:text-stone-600"
            >
              usar {formatarMedida(medida, sugestaoBase)}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
