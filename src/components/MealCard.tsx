"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import {
  buscarAlternativas,
  buscarAlternativasComDespensa,
  trocarRefeicao,
  marcarForaDeCasa,
  marcarSemTempo,
  desfazerStatusSlot,
} from "@/lib/actions/plan";
import { registrarFeedback } from "@/lib/actions/feedback";
import { alternarFavorito } from "@/lib/actions/favorites";
import { ESTADO_FEEDBACK_LABEL, STATUS_SLOT_LABEL } from "@/lib/constants";
import { MealTypeIcon, MEAL_COLOR } from "@/components/mealIcons";
import { REACTION_ACTIVE_BG, ReactionIcon } from "@/components/reactionIcons";
import {
  Star,
  ChevronDown,
  Clock,
  Car,
  RefreshCcw,
  X,
  Sparkles,
  Lightbulb,
  PackageSearch,
} from "lucide-react";
import { cn } from "@/lib/cn";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import type { EstadoFeedback, TipoRefeicao } from "@prisma/client";

type Alternativa = {
  recipeId: string;
  nome: string;
  explicacao: string;
  emCasa?: number;
  total?: number;
  completo?: boolean;
};

const STATUS_TONE: Record<string, "blue" | "amber" | "neutral" | "emerald"> = {
  TROCADO: "blue",
  SEM_TEMPO: "amber",
  FORA_DE_CASA: "neutral",
  CONCLUIDO: "emerald",
};

export type MealCardData = {
  slotId: string;
  tipo: TipoRefeicao;
  tipoLabel: string;
  status: string;
  explicacao: string | null;
  recipe: {
    id: string;
    nome: string;
    resumo: string;
    tempoPreparoMin: number;
    dificuldade: string;
  } | null;
  favorito: boolean;
  feedbackEstado: string | null;
};

export default function MealCard({ data, childId }: { data: MealCardData; childId: string }) {
  const [pending, startTransition] = useTransition();
  const [showTrocar, setShowTrocar] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [modoTrocar, setModoTrocar] = useState<"sugeridas" | "despensa">("sugeridas");
  const [alternativas, setAlternativas] = useState<Alternativa[] | null>(null);
  const [temItensNaDespensa, setTemItensNaDespensa] = useState(true);
  const [favorito, setFavorito] = useState(data.favorito);
  const [feedback, setFeedback] = useState(data.feedbackEstado);
  const [status, setStatus] = useState(data.status);

  async function carregarAlternativas(modo: "sugeridas" | "despensa") {
    setModoTrocar(modo);
    setAlternativas(null);
    if (modo === "sugeridas") {
      const alt = await buscarAlternativas(data.slotId);
      setAlternativas(alt);
    } else {
      const resp = await buscarAlternativasComDespensa(data.slotId);
      setTemItensNaDespensa(resp.temItensNaDespensa);
      setAlternativas(resp.alternativas);
    }
  }

  async function abrirTrocar() {
    setShowTrocar(true);
    await carregarAlternativas("sugeridas");
  }

  function escolherAlternativa(recipeId: string, explicacao: string) {
    startTransition(async () => {
      await trocarRefeicao(data.slotId, recipeId, explicacao);
      setShowTrocar(false);
      setStatus("TROCADO");
    });
  }

  function feedbackClick(estado: EstadoFeedback) {
    setFeedback(estado);
    startTransition(async () => {
      await registrarFeedback(data.slotId, estado);
    });
  }

  function favoritoClick() {
    if (!data.recipe) return;
    setFavorito((f) => !f);
    startTransition(async () => {
      await alternarFavorito(childId, data.recipe!.id);
    });
  }

  function semTempo() {
    setShowMenu(false);
    startTransition(async () => {
      await marcarSemTempo(data.slotId);
      setStatus("SEM_TEMPO");
    });
  }

  function foraDeCasa() {
    setShowMenu(false);
    startTransition(async () => {
      await marcarForaDeCasa(data.slotId);
      setStatus("FORA_DE_CASA");
    });
  }

  function desfazer() {
    setShowMenu(false);
    startTransition(async () => {
      await desfazerStatusSlot(data.slotId);
      setStatus("PLANEJADO");
    });
  }

  const foraDeCasaAtivo = status === "FORA_DE_CASA";
  const cor = MEAL_COLOR[data.tipo];

  return (
    <div
      className={cn(
        "rounded-2xl border border-l-4 border-stone-200/70 bg-white shadow-card",
        cor.accent
      )}
    >
      <div className="p-4">
        <div className="flex items-center justify-between">
          <span
            className={cn(
              "flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide",
              cor.text
            )}
          >
            <MealTypeIcon tipo={data.tipo} size={13} />
            {data.tipoLabel}
          </span>
          {status !== "PLANEJADO" && (
            <Badge tone={STATUS_TONE[status] ?? "neutral"}>{STATUS_SLOT_LABEL[status]}</Badge>
          )}
        </div>

        {foraDeCasaAtivo ? (
          <div className="mt-3 flex items-center justify-between">
            <p className="text-sm text-stone-500">Refeição fora de casa hoje.</p>
            <button onClick={desfazer} className="text-xs font-semibold text-orange-600 hover:underline">
              Desfazer
            </button>
          </div>
        ) : data.recipe ? (
          <>
            <div className="mt-3 flex items-center gap-3">
              <span
                className={cn(
                  "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
                  cor.bg
                )}
              >
                <MealTypeIcon tipo={data.tipo} size={22} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] font-semibold text-stone-800">
                  {data.recipe.nome}
                </p>
                <p className="text-xs text-stone-500">
                  {data.recipe.tempoPreparoMin} min · {data.recipe.dificuldade}
                </p>
              </div>
              <button
                onClick={favoritoClick}
                aria-label="Favoritar"
                className={cn(
                  "shrink-0 transition active:scale-90",
                  favorito ? "text-amber-400" : "text-stone-300 hover:text-stone-400"
                )}
              >
                <Star size={22} fill={favorito ? "currentColor" : "none"} />
              </button>
            </div>

            {data.explicacao && (
              <p className="mt-2 flex items-center gap-1 text-xs text-stone-400">
                <Sparkles size={12} className="shrink-0 text-orange-300" />
                {data.explicacao}
              </p>
            )}

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Button href={`/receita/${data.recipe.id}`} variant="secondary" size="sm">
                Ver receita
              </Button>
              <Button onClick={abrirTrocar} disabled={pending} variant="outline" size="sm">
                <RefreshCcw size={13} /> Trocar
              </Button>
              <div className="relative ml-auto">
                <Button onClick={() => setShowMenu((v) => !v)} variant="ghost" size="sm">
                  Mais <ChevronDown size={13} />
                </Button>
                {showMenu && (
                  <div className="animate-fade-in absolute right-0 z-10 mt-1 w-56 rounded-xl border border-stone-200 bg-white p-1 shadow-card-lg">
                    <button
                      onClick={semTempo}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-stone-700 hover:bg-stone-50"
                    >
                      <Clock size={15} className="text-stone-400" /> Estou sem tempo hoje
                    </button>
                    <button
                      onClick={foraDeCasa}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-stone-700 hover:bg-stone-50"
                    >
                      <Car size={15} className="text-stone-400" /> Vamos comer fora
                    </button>
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        startTransition(async () => {
                          await trocarRefeicao(
                            data.slotId,
                            data.recipe!.id,
                            "Já comemos algo diferente"
                          );
                        });
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-stone-700 hover:bg-stone-50"
                    >
                      <RefreshCcw size={15} className="text-stone-400" /> Já comemos algo diferente
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-3 grid grid-cols-4 gap-1 border-t border-stone-100 pt-3">
              {(Object.keys(ESTADO_FEEDBACK_LABEL) as EstadoFeedback[]).map((estado) => (
                <button
                  key={estado}
                  onClick={() => feedbackClick(estado)}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-xl py-2 text-[10px] font-medium transition",
                    feedback === estado
                      ? REACTION_ACTIVE_BG[estado]
                      : "text-stone-400 hover:bg-stone-50"
                  )}
                >
                  <ReactionIcon estado={estado} active={feedback === estado} size={19} />
                  {ESTADO_FEEDBACK_LABEL[estado]}
                </button>
              ))}
            </div>
          </>
        ) : (
          <p className="mt-3 text-sm text-stone-500">
            Nenhuma receita compatível encontrada. Ajuste o perfil ou tente trocar.
          </p>
        )}
      </div>

      {showTrocar && (
        <div className="fixed inset-0 z-30 flex items-end justify-center bg-black/40 sm:items-center">
          <div className="max-h-[80vh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-white p-5 sm:rounded-2xl">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-base font-bold text-stone-800">
                Trocar {data.tipoLabel.toLowerCase()}
              </h3>
              <button onClick={() => setShowTrocar(false)} className="text-stone-400 hover:text-stone-600">
                <X size={18} />
              </button>
            </div>

            <div className="mb-3 flex gap-1 rounded-xl bg-stone-100 p-1 text-xs font-semibold">
              <button
                onClick={() => carregarAlternativas("sugeridas")}
                className={cn(
                  "flex flex-1 items-center justify-center gap-1 rounded-lg py-2 transition",
                  modoTrocar === "sugeridas" ? "bg-white text-stone-800 shadow-card" : "text-stone-500"
                )}
              >
                <Lightbulb size={13} /> Sugestões
              </button>
              <button
                onClick={() => carregarAlternativas("despensa")}
                className={cn(
                  "flex flex-1 items-center justify-center gap-1 rounded-lg py-2 transition",
                  modoTrocar === "despensa" ? "bg-white text-stone-800 shadow-card" : "text-stone-500"
                )}
              >
                <PackageSearch size={13} /> Da despensa
              </button>
            </div>

            {alternativas === null ? (
              <p className="py-6 text-center text-sm text-stone-400">Buscando alternativas...</p>
            ) : modoTrocar === "despensa" && !temItensNaDespensa ? (
              <div className="py-6 text-center">
                <PackageSearch size={26} className="mx-auto text-stone-300" />
                <p className="mt-2 text-sm font-medium text-stone-600">
                  Você ainda não marcou itens na despensa.
                </p>
                <p className="mt-1 text-xs text-stone-400">
                  Vá em Compras e toque em &ldquo;Já tenho&rdquo; nos itens que já tem em casa para
                  usar este filtro.
                </p>
                <Link
                  href="/compras"
                  className="mt-3 inline-block text-xs font-semibold text-orange-600 hover:underline"
                >
                  Ir para Compras →
                </Link>
              </div>
            ) : alternativas.length === 0 ? (
              <p className="py-6 text-center text-sm text-stone-400">
                Nenhuma alternativa compatível encontrada.
              </p>
            ) : (
              <div className="space-y-2">
                {alternativas.map((alt) => (
                  <button
                    key={alt.recipeId}
                    onClick={() => escolherAlternativa(alt.recipeId, alt.explicacao)}
                    disabled={pending}
                    className="w-full rounded-xl border border-stone-200 p-3 text-left transition hover:border-orange-300 hover:bg-orange-50"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-stone-800">{alt.nome}</p>
                      {modoTrocar === "despensa" && (
                        <Badge tone={alt.completo ? "emerald" : "amber"} className="shrink-0">
                          {alt.completo ? "Tudo em casa" : `${alt.emCasa}/${alt.total} em casa`}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-stone-500">{alt.explicacao}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
