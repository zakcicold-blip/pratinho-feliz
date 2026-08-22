import Link from "next/link";
import TopBar from "@/components/TopBar";
import { cn } from "@/lib/cn";
import {
  ALIMENTOS_RISCO,
  PROIBIDOS_POR_IDADE,
  REGRAS_MESA,
  FONTES,
  type NivelRisco,
} from "@/lib/seguranca";
import {
  ShieldAlert,
  TriangleAlert,
  X,
  Check,
  Volume2,
  VolumeX,
  Ban,
  Ruler,
  ExternalLink,
  ArrowRight,
} from "lucide-react";

export const metadata = { title: "Segurança alimentar" };

const NIVEL: Record<NivelRisco, { rotulo: string; chip: string }> = {
  alto: { rotulo: "Risco alto", chip: "bg-rose-100 text-rose-700" },
  medio: { rotulo: "Atenção", chip: "bg-amber-100 text-amber-700" },
};

export default function SegurancaPage() {
  const alto = ALIMENTOS_RISCO.filter((a) => a.nivel === "alto");
  const medio = ALIMENTOS_RISCO.filter((a) => a.nivel === "medio");

  return (
    <>
      <TopBar title="Segurança alimentar" subtitle="Engasgo, cortes e limites por idade" back />

      <div className="space-y-6 px-4 py-4">
        {/* Herói */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-600 to-rose-500 p-5 text-white shadow-card-lg">
          <ShieldAlert
            aria-hidden
            className="pointer-events-none absolute top-4 right-4 text-white/25"
            size={44}
          />
          <span className="text-xs font-semibold tracking-wide text-white/80 uppercase">
            Antes de qualquer receita
          </span>
          <h2 className="font-display mt-2 max-w-[17rem] text-2xl leading-tight font-bold">
            O que pode engasgar e como cortar certo
          </h2>
          <p className="mt-2 max-w-sm text-sm text-white/85">
            Asfixia por alimento é a principal causa de morte acidental em crianças menores de 1 ano.
            Quase tudo aqui se resolve mudando o formato do corte.
          </p>
        </div>

        {/* Engasgo x ânsia — o mais importante */}
        <section>
          <h3 className="font-display mb-1 text-lg font-bold text-stone-900">
            Ânsia não é engasgo
          </h3>
          <p className="mb-3 text-sm leading-relaxed text-stone-600">
            É a confusão mais comum — e a mais importante de desfazer. A ânsia é um reflexo de
            proteção que empurra a comida para fora. Nos bebês ela fica bem à frente na língua, o que
            faz o reflexo disparar muito. Já o engasgo de verdade é <strong>silencioso</strong>.
          </p>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-3xl border border-emerald-200/70 bg-emerald-50/60 p-4">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                  <Volume2 size={16} />
                </span>
                <strong className="text-sm font-bold text-emerald-900">Ânsia — é normal</strong>
              </div>
              <ul className="mt-3 space-y-1.5 text-[13px] leading-relaxed text-stone-700">
                <li>Faz barulho: tosse, engasgo alto, ruído de golfada</li>
                <li>Rosto fica vermelho, olhos lacrimejam</li>
                <li>Ela projeta a língua e empurra a comida para frente</li>
                <li>Resolve sozinha em segundos</li>
              </ul>
              <p className="mt-3 rounded-xl bg-white/70 px-3 py-2 text-[13px] font-medium text-emerald-800">
                O que fazer: nada. Fique perto, mantenha a calma e conte até dez. Interferir e enfiar
                o dedo na boca pode empurrar o alimento mais para dentro.
              </p>
            </div>

            <div className="rounded-3xl border border-rose-200/70 bg-rose-50/60 p-4">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-100 text-rose-700">
                  <VolumeX size={16} />
                </span>
                <strong className="text-sm font-bold text-rose-900">Engasgo — é emergência</strong>
              </div>
              <ul className="mt-3 space-y-1.5 text-[13px] leading-relaxed text-stone-700">
                <li>Silêncio total: não tosse, não chora, não faz som</li>
                <li>Boca aberta, olhos arregalados, expressão de pânico</li>
                <li>Lábios e rosto ficam azulados ou acinzentados</li>
                <li>Pode levar as mãos ao pescoço</li>
              </ul>
              <p className="mt-3 rounded-xl bg-white/70 px-3 py-2 text-[13px] font-medium text-rose-800">
                O que fazer: agir na hora com as manobras de desengasgo e chamar o SAMU (192). Cada
                segundo conta.
              </p>
            </div>
          </div>

          <div className="mt-3 flex gap-2.5 rounded-2xl border border-stone-200/70 bg-stone-50 px-4 py-3">
            <TriangleAlert size={16} className="mt-0.5 shrink-0 text-stone-400" />
            <p className="text-[13px] leading-relaxed text-stone-600">
              Este app não ensina manobras de desengasgo — elas precisam ser treinadas com as mãos,
              não lidas. Procure um curso presencial de primeiros socorros para bebês. É a coisa mais
              útil que você pode fazer antes de começar a introdução alimentar.
            </p>
          </div>
        </section>

        {/* Regra do formato */}
        <section className="rounded-3xl border border-stone-200/60 bg-white p-5 shadow-card">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
              <Ruler size={18} />
            </span>
            <h3 className="font-display text-lg font-bold text-stone-900">A regra do formato</h3>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-stone-600">
            O perigo quase nunca está no alimento em si — está no formato dele. Três regras resolvem
            a maioria dos casos:
          </p>
          <ul className="mt-3 space-y-2.5">
            {[
              "Redondo é o pior formato. Nada de esfera do tamanho da traqueia: corte sempre no comprimento.",
              "Se passa por um tubo de papel higiênico (cerca de 4,4 cm), cabe na via aérea de uma criança pequena.",
              "Até 9 meses, ofereça em bastão do tamanho de dois dedos. Depois da pinça, pedaços pequenos e macios.",
            ].map((t) => (
              <li key={t} className="flex gap-2.5 text-[13px] leading-relaxed text-stone-600">
                <Check size={15} className="mt-0.5 shrink-0 text-orange-500" />
                {t}
              </li>
            ))}
          </ul>
        </section>

        {/* Alimentos de risco */}
        <section>
          <h3 className="font-display mb-1 text-lg font-bold text-stone-900">
            Alimentos de risco e como cortar
          </h3>
          <p className="mb-3 text-sm text-stone-600">
            {ALIMENTOS_RISCO.length} alimentos que causam a maior parte dos acidentes, com a forma
            errada e a forma segura de servir cada um.
          </p>

          <div className="space-y-3">
            {[...alto, ...medio].map((a) => (
              <article
                key={a.nome}
                className="overflow-hidden rounded-3xl border border-stone-200/60 bg-white shadow-card"
              >
                <div className="flex items-center justify-between gap-3 border-b border-stone-100 px-4 py-3">
                  <h4 className="font-semibold text-stone-900">{a.nome}</h4>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wide uppercase",
                      NIVEL[a.nivel].chip
                    )}
                  >
                    {NIVEL[a.nivel].rotulo}
                  </span>
                </div>

                <div className="px-4 py-3">
                  <p className="text-[13px] leading-relaxed text-stone-500">{a.porque}</p>

                  <div className="mt-3 space-y-2">
                    <div className="flex gap-2.5 rounded-2xl bg-rose-50 px-3.5 py-2.5">
                      <X size={15} className="mt-0.5 shrink-0 text-rose-600" />
                      <p className="text-[13px] leading-relaxed text-rose-900">
                        <strong className="font-semibold">Nunca assim:</strong> {a.errado}
                      </p>
                    </div>
                    <div className="flex gap-2.5 rounded-2xl bg-emerald-50 px-3.5 py-2.5">
                      <Check size={15} className="mt-0.5 shrink-0 text-emerald-600" />
                      <p className="text-[13px] leading-relaxed text-emerald-900">
                        <strong className="font-semibold">Assim sim:</strong> {a.certo}
                      </p>
                    </div>
                  </div>

                  <p className="mt-2.5 text-[11px] font-medium tracking-wide text-stone-400 uppercase">
                    {a.ateQuando}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Proibidos por idade */}
        <section>
          <h3 className="font-display mb-1 flex items-center gap-2 text-lg font-bold text-stone-900">
            <Ban size={18} className="text-stone-400" /> Limites por idade
          </h3>
          <p className="mb-3 text-sm text-stone-600">
            Aqui o risco não é engasgo — é o organismo do bebê ainda não dar conta.
          </p>
          <div className="divide-y divide-stone-100 overflow-hidden rounded-3xl border border-stone-200/60 bg-white shadow-card">
            {PROIBIDOS_POR_IDADE.map((r) => (
              <div key={r.item} className="px-4 py-3.5">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <strong className="font-semibold text-stone-900">{r.item}</strong>
                  <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-[11px] font-semibold text-stone-600">
                    {r.regra}
                  </span>
                </div>
                <p className="mt-1.5 text-[13px] leading-relaxed text-stone-500">{r.porque}</p>
                <p className="mt-1.5 text-[11px] font-medium text-emerald-600">
                  Libera: {r.liberaEm}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Regras da mesa */}
        <section>
          <h3 className="font-display mb-3 text-lg font-bold text-stone-900">
            Como a refeição deve acontecer
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {REGRAS_MESA.map((r, i) => (
              <div
                key={r.titulo}
                className="relative rounded-2xl border border-stone-200/60 bg-white p-4 shadow-card"
              >
                <span className="absolute -top-2.5 -left-2.5 flex h-6 w-6 items-center justify-center rounded-full bg-stone-900 text-[11px] font-bold text-white">
                  {i + 1}
                </span>
                <div className="font-semibold text-stone-800">{r.titulo}</div>
                <p className="mt-1 text-[13px] leading-relaxed text-stone-500">{r.texto}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Volta para as papinhas */}
        <Link
          href="/papinhas"
          className="flex items-center justify-between gap-3 rounded-3xl border border-stone-200/60 bg-white p-4 shadow-card transition active:scale-[0.99]"
        >
          <p className="text-sm text-stone-600">
            Ver as <strong className="text-stone-900">fases da introdução alimentar</strong> e os
            métodos de oferecer.
          </p>
          <ArrowRight size={18} className="shrink-0 text-orange-500" />
        </Link>

        {/* Fontes + aviso */}
        <section className="rounded-3xl border border-stone-200/60 bg-stone-50 p-5">
          <h3 className="text-xs font-semibold tracking-wide text-stone-400 uppercase">
            De onde vem esta informação
          </h3>
          <ul className="mt-3 space-y-2">
            {FONTES.map((f) => (
              <li key={f.url}>
                <a
                  href={f.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-1.5 text-[13px] leading-relaxed font-medium text-orange-600 hover:underline"
                >
                  <ExternalLink size={13} className="mt-0.5 shrink-0" />
                  {f.nome}
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-4 border-t border-stone-200 pt-3 text-[12px] leading-relaxed text-stone-400">
            Conteúdo educativo. Não substitui a orientação do pediatra que acompanha seu filho, nem
            um curso presencial de primeiros socorros. Em emergência, ligue 192 (SAMU).
          </p>
        </section>
      </div>
    </>
  );
}
