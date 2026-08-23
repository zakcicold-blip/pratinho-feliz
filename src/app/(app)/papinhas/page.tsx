import Link from "next/link";
import { db } from "@/lib/db";
import { TIPO_REFEICAO_LABEL } from "@/lib/constants";
import TopBar from "@/components/TopBar";
import RecipeThumb from "@/components/RecipeThumb";
import { MealTypeIcon, MEAL_COLOR } from "@/components/mealIcons";
import { Baby, ArrowRight, TriangleAlert, Utensils, ShieldAlert } from "lucide-react";
import MetodoInicio from "./MetodoInicio";
import type { TipoRefeicao } from "@prisma/client";
import { cn } from "@/lib/cn";

type Receita = {
  id: string;
  nome: string;
  tipoRefeicao: TipoRefeicao;
  tempoPreparoMin: number;
  imagemUrl: string | null;
};

const nomeContem = (termos: string[]) =>
  termos.map((t) => ({ nome: { contains: t, mode: "insensitive" as const } }));

export default async function PapinhasPage() {
  const [inicio, amassados, pedacos] = await Promise.all([
    // Sem `take`, esta consulta listava TODAS as receitas liberadas aos 6
    // meses — 71 delas depois das variacoes, o que fazia a tela chegar a
    // 398 KB. As outras fases ja limitavam a 8.
    db.recipe.findMany({
      where: { ativo: true, idadeMinimaMeses: { lte: 6 } },
      select: { id: true, nome: true, tipoRefeicao: true, tempoPreparoMin: true, imagemUrl: true },
      take: 8,
      orderBy: { nome: "asc" },
    }),
    db.recipe.findMany({
      where: {
        ativo: true,
        idadeMinimaMeses: { gt: 6, lte: 9 },
        OR: nomeContem(["mingau", "purê", "pure", "papa", "sopa", "cozid", "amassad", "creme", "vitamina", "iogurte"]),
      },
      select: { id: true, nome: true, tipoRefeicao: true, tempoPreparoMin: true, imagemUrl: true },
      take: 8,
      orderBy: { nome: "asc" },
    }),
    db.recipe.findMany({
      where: {
        ativo: true,
        idadeMinimaMeses: { lte: 12 },
        OR: nomeContem(["panqueca", "omelete", "tapioca", "cuscuz", "pão", "bolinho", "palito", "nhoque", "macarr"]),
      },
      select: { id: true, nome: true, tipoRefeicao: true, tempoPreparoMin: true, imagemUrl: true },
      take: 8,
      orderBy: { nome: "asc" },
    }),
  ]);

  const fases = [
    {
      id: "amassados",
      tag: "Fase 2",
      meses: "7 a 9 meses",
      titulo: "Amassados · pedacinhos macios",
      cor: "from-emerald-500 to-emerald-400",
      corSoft: "text-emerald-600 bg-emerald-50",
      textura: "Amassado com o garfo, não batido",
      intro: "A comida ganha textura. Amasse em vez de bater e apresente novas combinações de sabores.",
      dica: "Nada de mel ainda (só após 1 ano) nem alimentos duros que possam engasgar.",
      receitas: amassados,
    },
    {
      id: "pedacos",
      tag: "Fase 3",
      meses: "10 a 12 meses",
      titulo: "Pedaços · come sozinho",
      cor: "from-amber-500 to-amber-400",
      corSoft: "text-amber-700 bg-amber-50",
      textura: "Pedaços macios do tamanho de um dedo",
      intro: "Fase da autonomia: a criança pega a comida com a mão. Menos papa, mais 'comida de verdade'.",
      dica: "Corte em tiras/pedaços macios e supervisione sempre a refeição.",
      receitas: pedacos,
    },
  ];

  return (
    <>
      <TopBar title="Papinhas por fase" subtitle="Introdução alimentar, passo a passo" back />

      <div className="space-y-6 px-4 py-4">
        {/* Herói */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500 to-orange-400 p-5 text-white shadow-card-lg">
          <Baby aria-hidden className="pointer-events-none absolute right-4 top-4 text-white/25" size={44} />
          <span className="text-xs font-semibold uppercase tracking-wide text-white/80">Do purê à comida da família</span>
          <h2 className="font-display mt-2 max-w-[16rem] text-2xl font-bold leading-tight">
            A introdução alimentar sem medo de errar
          </h2>
          <p className="mt-2 max-w-sm text-sm text-white/85">
            Cada fase com a textura certa, o que oferecer e os cuidados de segurança pela idade.
          </p>
        </div>

        {/* Segurança */}
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200/70 bg-amber-50 px-4 py-3 text-[13px] text-amber-800">
          <TriangleAlert size={16} className="mt-0.5 shrink-0" />
          <span>
            Regras de ouro do 1º ano: <strong>sem mel, sem sal e sem açúcar</strong>; oleaginosas inteiras só
            após os 4 anos; e sempre acompanhe a refeição de perto.
          </span>
        </div>

        <Link
          href="/seguranca"
          className="flex items-center gap-3 rounded-3xl bg-gradient-to-br from-rose-600 to-rose-500 p-4 text-white shadow-card transition active:scale-[0.99]"
        >
          <ShieldAlert size={22} className="shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="font-semibold">Segurança alimentar</p>
            <p className="text-[13px] text-white/85">
              O que pode engasgar, como cortar cada alimento e os limites por idade.
            </p>
          </div>
          <ArrowRight size={18} className="shrink-0 text-white/80" />
        </Link>

        {/* Fase 1: a mesma comida, três formas de oferecer */}
        <section>
          <div className="mb-3">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-stone-900 px-2.5 py-0.5 text-[11px] font-bold text-white">
                Fase 1
              </span>
              <span className="text-xs font-semibold text-stone-400">6 meses</span>
            </div>
            <h3 className="font-display mt-2 text-xl font-bold text-stone-900">
              Início · escolha como oferecer
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-stone-600">
              A comida é a mesma. O que muda é a textura e quem leva à boca — e nenhum dos três
              caminhos é errado.
            </p>
          </div>

          <MetodoInicio />

          {inicio.length > 0 && (
            <div className="mt-3 rounded-3xl border border-stone-200/60 bg-white p-4 shadow-card">
              <p className="mb-2 px-1 text-xs font-semibold tracking-wide text-stone-400 uppercase">
                Receitas desta fase
              </p>
              <ul className="divide-y divide-stone-100">
                {inicio.map((r: Receita) => (
                  <li key={r.id}>
                    <Link href={`/receita/${r.id}`} className="flex items-center gap-3 py-2 transition active:opacity-60">
                      <RecipeThumb tipo={r.tipoRefeicao} imagemUrl={r.imagemUrl} nome={r.nome} size={38} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-stone-800">{r.nome}</p>
                        <p className="flex items-center gap-1 text-[11px] text-stone-400">
                          <span className={MEAL_COLOR[r.tipoRefeicao].text}>
                            <MealTypeIcon tipo={r.tipoRefeicao} size={11} />
                          </span>
                          {TIPO_REFEICAO_LABEL[r.tipoRefeicao]} · {r.tempoPreparoMin} min
                        </p>
                      </div>
                      <ArrowRight size={15} className="shrink-0 text-stone-300" />
                    </Link>
                  </li>
                ))}
              </ul>
              <p className="mt-3 rounded-2xl bg-stone-50 px-3 py-2 text-[12px] leading-relaxed text-stone-500">
                Qualquer receita daqui serve nos três métodos — muda só o preparo final: amassada com
                garfo, amassada com pedaços ao lado, ou cortada em bastão.
              </p>
            </div>
          )}
        </section>

        {/* Fases */}
        {fases.map((fase) => (
          <section key={fase.id}>
            <div className={cn("overflow-hidden rounded-3xl bg-gradient-to-br p-5 text-white shadow-card", fase.cor)}>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-bold">{fase.tag}</span>
                <span className="text-xs font-semibold text-white/80">{fase.meses}</span>
              </div>
              <h3 className="font-display mt-2 text-xl font-bold">{fase.titulo}</h3>
              <p className="mt-1 flex items-center gap-1.5 text-[13px] text-white/85">
                <Utensils size={13} /> {fase.textura}
              </p>
            </div>

            <div className="mt-3 rounded-3xl border border-stone-200/60 bg-white p-4 shadow-card">
              <p className="text-sm text-stone-600">{fase.intro}</p>
              <p className={cn("mt-3 rounded-2xl px-3 py-2 text-[13px] font-medium", fase.corSoft)}>💡 {fase.dica}</p>

              {fase.receitas.length > 0 ? (
                <>
                  <p className="mt-4 mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-stone-400">
                    Receitas desta fase
                  </p>
                  <ul className="divide-y divide-stone-100">
                    {fase.receitas.map((r: Receita) => (
                      <li key={r.id}>
                        <Link href={`/receita/${r.id}`} className="flex items-center gap-3 py-2 transition active:opacity-60">
                          <RecipeThumb tipo={r.tipoRefeicao} imagemUrl={r.imagemUrl} nome={r.nome} size={38} />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-stone-800">{r.nome}</p>
                            <p className="flex items-center gap-1 text-[11px] text-stone-400">
                              <span className={MEAL_COLOR[r.tipoRefeicao].text}>
                                <MealTypeIcon tipo={r.tipoRefeicao} size={11} />
                              </span>
                              {TIPO_REFEICAO_LABEL[r.tipoRefeicao]} · {r.tempoPreparoMin} min
                            </p>
                          </div>
                          <ArrowRight size={15} className="shrink-0 text-stone-300" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <p className="mt-4 text-sm text-stone-400">
                  Receitas desta fase chegam em breve — enquanto isso, siga a orientação de textura acima.
                </p>
              )}
            </div>
          </section>
        ))}

        {/* Fase família */}
        <section>
          <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-stone-800 to-stone-700 p-5 text-white shadow-card">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-bold">Fase 4</span>
              <span className="text-xs font-semibold text-white/80">12 meses+</span>
            </div>
            <h3 className="font-display mt-2 text-xl font-bold">Comida da família</h3>
            <p className="mt-1 text-[13px] text-white/85">A criança já come o que a família come, com pouco sal e temperos suaves.</p>
          </div>
          <Link
            href="/plano"
            className="mt-3 flex items-center justify-between gap-3 rounded-3xl border border-stone-200/60 bg-white p-4 shadow-card transition active:scale-[0.99]"
          >
            <p className="text-sm text-stone-600">
              A partir daqui, o <strong className="text-stone-900">plano de 30 dias</strong> assume o cardápio completo pela idade.
            </p>
            <ArrowRight size={18} className="shrink-0 text-orange-500" />
          </Link>
        </section>
      </div>
    </>
  );
}
