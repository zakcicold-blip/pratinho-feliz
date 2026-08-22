"use client";

import { useState } from "react";
import { Utensils, Hand, HeartHandshake, Check, TriangleAlert, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

type MetodoId = "tradicional" | "participativo" | "blw";

type Metodo = {
  id: MetodoId;
  nome: string;
  subtitulo: string;
  icon: LucideIcon;
  cor: string;
  corSoft: string;
  textura: string;
  comoFunciona: string;
  comoServir: string[];
  atencao: string;
  selo?: string;
};

const METODOS: Metodo[] = [
  {
    id: "tradicional",
    nome: "Papa amassada",
    subtitulo: "Método tradicional",
    icon: Utensils,
    cor: "from-sky-500 to-sky-400",
    corSoft: "text-sky-700 bg-sky-50",
    textura: "Amassada com garfo — grossa, não escorre da colher",
    comoFunciona:
      "Você oferece na colher. O bebê aprende sabor e textura enquanto você garante o volume que ele come.",
    comoServir: [
      "Amasse com o garfo. Nunca use liquidificador nem peneira.",
      "A papa tem que ficar grossa: na colher virada, ela não pode escorrer.",
      "Deixe cada alimento separado no prato, sem misturar tudo numa massa só.",
      "Comece com uma refeição por dia e um alimento novo a cada 2 ou 3 dias.",
    ],
    atencao:
      "A papinha batida no liquidificador é o que saiu de moda — ela atrasa a mastigação e dilui os nutrientes. Amassada com garfo continua totalmente recomendada.",
  },
  {
    id: "participativo",
    nome: "Participativo",
    subtitulo: "Colher + pedaços",
    icon: HeartHandshake,
    cor: "from-emerald-500 to-emerald-400",
    corSoft: "text-emerald-700 bg-emerald-50",
    textura: "Papa amassada na colher e pedaços macios na mão, na mesma refeição",
    comoFunciona:
      "Junta os dois mundos: você oferece a papa na colher e, ao lado, deixa pedaços macios para o bebê pegar sozinho.",
    comoServir: [
      "Monte o prato com a papa amassada e 2 ou 3 bastões macios ao lado.",
      "Deixe o bebê explorar com as mãos enquanto você oferece a colher.",
      "Se ele recusar a colher, siga com os pedaços — e vice-versa.",
      "Nunca force a colher quando ele virar o rosto ou fechar a boca.",
    ],
    atencao:
      "É o caminho que a Sociedade Brasileira de Pediatria recomenda: ela não indica BLW exclusivo, e sim combinar os dois de acordo com a realidade de cada família.",
    selo: "Recomendado pela SBP",
  },
  {
    id: "blw",
    nome: "BLW / BLISS",
    subtitulo: "Guiado pelo bebê",
    icon: Hand,
    cor: "from-violet-500 to-violet-400",
    corSoft: "text-violet-700 bg-violet-50",
    textura: "Pedaços em bastão, macios o bastante para amassar entre os dedos",
    comoFunciona:
      "Sem colher: o bebê leva a comida à boca sozinho, no ritmo dele. O BLISS é a versão com regras de segurança nutricional — é a que vale seguir.",
    comoServir: [
      "Corte em bastão do tamanho de dois dedos adultos, para sobrar ponta fora da mão fechada.",
      "Cozinhe até amassar entre o polegar e o indicador sem esforço.",
      "Regra do BLISS: uma fonte de ferro em toda refeição (carne desfiada, feijão amassado, gema).",
      "Regra do BLISS: uma fonte de energia em toda refeição (batata, abacate, azeite, arroz).",
      "Nunca ofereça alimento redondo, duro ou que esfarele — a lista completa está na página de segurança.",
    ],
    atencao:
      "Exige sinais de prontidão bem estabelecidos e um adulto treinado em desengasgo. O risco maior do BLW puro não é engasgo, e sim o bebê brincar mais do que comer e ficar com pouco ferro e poucas calorias.",
  },
];

/**
 * Seletor de método da fase de 6 meses.
 * A comida é a mesma — o que muda é a textura e quem leva à boca.
 */
export default function MetodoInicio() {
  const [ativo, setAtivo] = useState<MetodoId>("tradicional");
  const metodo = METODOS.find((m) => m.id === ativo) ?? METODOS[0];
  const Icon = metodo.icon;

  return (
    <div>
      {/* Abas */}
      <div className="scrollbar-none -mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
        {METODOS.map((m) => {
          const MIcon = m.icon;
          const on = m.id === ativo;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => setAtivo(m.id)}
              aria-pressed={on}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-[13px] font-semibold transition",
                on
                  ? "bg-stone-900 text-white shadow-sm"
                  : "bg-white text-stone-500 ring-1 ring-stone-200 hover:text-stone-800"
              )}
            >
              <MIcon size={14} /> {m.nome}
            </button>
          );
        })}
      </div>

      {/* Cabeçalho do método */}
      <div
        className={cn(
          "mt-3 overflow-hidden rounded-3xl bg-gradient-to-br p-5 text-white shadow-card",
          metodo.cor
        )}
      >
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-bold">
            {metodo.subtitulo}
          </span>
          {metodo.selo && (
            <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
              <Check size={11} /> {metodo.selo}
            </span>
          )}
        </div>
        <h3 className="font-display mt-2 flex items-center gap-2 text-xl font-bold">
          <Icon size={20} /> {metodo.nome}
        </h3>
        <p className="mt-1.5 text-[13px] leading-relaxed text-white/85">{metodo.textura}</p>
      </div>

      {/* Detalhe */}
      <div className="mt-3 rounded-3xl border border-stone-200/60 bg-white p-4 shadow-card">
        <p className="text-sm leading-relaxed text-stone-600">{metodo.comoFunciona}</p>

        <p className="mt-4 mb-2 text-xs font-semibold tracking-wide text-stone-400 uppercase">
          Como servir
        </p>
        <ul className="space-y-2">
          {metodo.comoServir.map((passo) => (
            <li key={passo} className="flex gap-2.5 text-[13px] leading-relaxed text-stone-600">
              <Check size={14} className={cn("mt-0.5 shrink-0", metodo.corSoft.split(" ")[0])} />
              {passo}
            </li>
          ))}
        </ul>

        <div className="mt-4 flex gap-2.5 rounded-2xl border border-amber-200/70 bg-amber-50 px-3.5 py-3">
          <TriangleAlert size={15} className="mt-0.5 shrink-0 text-amber-600" />
          <p className="text-[13px] leading-relaxed text-amber-900">{metodo.atencao}</p>
        </div>
      </div>
    </div>
  );
}
