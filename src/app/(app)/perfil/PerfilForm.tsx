"use client";

import { useState } from "react";
import { atualizarPerfilCrianca } from "@/lib/actions/childProfile";
import {
  CATEGORIA_INGREDIENTE_LABEL,
  CATEGORIA_INGREDIENTE_ORDEM,
  FAIXAS_ETARIAS,
  OBJETIVO_LABEL,
  PRATICIDADE_LABEL,
} from "@/lib/constants";
import AddCustomFoodInput, { type IngredienteBasico } from "@/components/AddCustomFoodInput";
import EquipamentosSelect from "@/components/EquipamentosSelect";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";

type Ingrediente = { id: string; nome: string; categoria: string };
type Grupo = { categoria: string; itens: Ingrediente[] };
type ListKey = "aceitos" | "recusados" | "desejados" | "restricoes";

function inserirNoCatalogo(catalogo: Grupo[], ingrediente: IngredienteBasico): Grupo[] {
  if (catalogo.some((g) => g.itens.some((i) => i.id === ingrediente.id))) return catalogo;

  const existe = catalogo.some((g) => g.categoria === ingrediente.categoria);
  if (existe) {
    return catalogo.map((g) =>
      g.categoria === ingrediente.categoria ? { ...g, itens: [...g.itens, ingrediente] } : g
    );
  }

  const novoCatalogo = [...catalogo, { categoria: ingrediente.categoria, itens: [ingrediente] }];
  return novoCatalogo.sort(
    (a, b) =>
      CATEGORIA_INGREDIENTE_ORDEM.indexOf(a.categoria) -
      CATEGORIA_INGREDIENTE_ORDEM.indexOf(b.categoria)
  );
}

export default function PerfilForm({
  child,
  grupos: gruposIniciais,
  inicial,
}: {
  child: {
    id: string;
    nome: string;
    faixaEtaria: string;
    refeicoesPorDia: number;
    tempoDisponivel: number;
    praticidade: string;
    objetivo: string;
    equipamentos: string;
  };
  grupos: Grupo[];
  inicial: Record<ListKey, string[]>;
}) {
  const [nome, setNome] = useState(child.nome);
  const [faixaEtaria, setFaixaEtaria] = useState(child.faixaEtaria);
  const [refeicoesPorDia, setRefeicoesPorDia] = useState(child.refeicoesPorDia);
  const [tempoDisponivel, setTempoDisponivel] = useState(child.tempoDisponivel);
  const [praticidade, setPraticidade] = useState(child.praticidade);
  const [objetivo, setObjetivo] = useState(child.objetivo);
  const [equipamentos, setEquipamentos] = useState(child.equipamentos);
  const [catalogo, setCatalogo] = useState<Grupo[]>(gruposIniciais);
  const [listas, setListas] = useState<Record<ListKey, string[]>>(inicial);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  function toggle(listName: ListKey, id: string) {
    setListas((prev) => {
      const outras = (["aceitos", "recusados", "desejados", "restricoes"] as ListKey[]).filter(
        (k) => k !== listName
      );
      const next = { ...prev };
      for (const k of outras) next[k] = prev[k].filter((x) => x !== id);
      const atual = prev[listName];
      next[listName] = atual.includes(id) ? atual.filter((x) => x !== id) : [...atual, id];
      return next;
    });
  }

  function adicionarAlimentoCustomizado(listName: ListKey, ingrediente: IngredienteBasico) {
    setCatalogo((prev) => inserirNoCatalogo(prev, ingrediente));
    setListas((prev) => ({ ...prev, [listName]: [...prev[listName], ingrediente.id] }));
  }

  async function salvar() {
    setStatus("saving");
    const result = await atualizarPerfilCrianca(child.id, {
      nome,
      faixaEtaria,
      refeicoesPorDia,
      tempoDisponivel,
      praticidade: praticidade as never,
      objetivo: objetivo as never,
      equipamentos,
      ...listas,
    });
    setStatus(result?.error ? "error" : "saved");
    setTimeout(() => setStatus("idle"), 2000);
  }

  return (
    <div className="space-y-4">
      <Card padding="lg" className="space-y-3">
        <Field label="Nome ou apelido">
          <input value={nome} onChange={(e) => setNome(e.target.value)} className="input" />
        </Field>
        <Field label="Faixa etária">
          <select value={faixaEtaria} onChange={(e) => setFaixaEtaria(e.target.value)} className="input">
            {FAIXAS_ETARIAS.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </Field>
        <Field label={`Refeições em casa por dia: ${refeicoesPorDia}`}>
          <input
            type="range"
            min={2}
            max={6}
            value={refeicoesPorDia}
            onChange={(e) => setRefeicoesPorDia(Number(e.target.value))}
            className="w-full accent-orange-500"
          />
        </Field>
        <Field label={`Tempo médio disponível: ${tempoDisponivel} min`}>
          <input
            type="range"
            min={10}
            max={60}
            step={5}
            value={tempoDisponivel}
            onChange={(e) => setTempoDisponivel(Number(e.target.value))}
            className="w-full accent-orange-500"
          />
        </Field>
        <Field label="O que você tem na cozinha? (opcional)">
          <EquipamentosSelect value={equipamentos} onChange={setEquipamentos} />
          <p className="mt-2 text-xs text-stone-400">
            O cardápio só sugere receitas possíveis com o que estiver marcado. Fogão e panela já
            entram por padrão.
          </p>
        </Field>
        <Field label="Praticidade">
          <div className="grid gap-2 sm:grid-cols-3">
            {Object.entries(PRATICIDADE_LABEL).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setPraticidade(value)}
                className={cn(
                  "rounded-xl border px-3 py-2 text-sm font-medium transition",
                  praticidade === value
                    ? "border-orange-500 bg-orange-50 text-orange-700"
                    : "border-stone-200 text-stone-600 hover:bg-stone-50"
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </Field>
        <Field label="Objetivo principal">
          <div className="grid gap-2 sm:grid-cols-2">
            {Object.entries(OBJETIVO_LABEL).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setObjetivo(value)}
                className={cn(
                  "rounded-xl border px-3 py-2 text-sm font-medium transition",
                  objetivo === value
                    ? "border-orange-500 bg-orange-50 text-orange-700"
                    : "border-stone-200 text-stone-600 hover:bg-stone-50"
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </Field>
      </Card>

      <PreferenceGroup
        titulo="Aceita bem"
        grupos={catalogo}
        selecionados={listas.aceitos}
        onToggle={(id) => toggle("aceitos", id)}
        onCustomAdded={(ing) => adicionarAlimentoCustomizado("aceitos", ing)}
        cor="bg-emerald-500 border-emerald-500 text-white"
      />
      <PreferenceGroup
        titulo="Costuma recusar"
        grupos={catalogo}
        selecionados={listas.recusados}
        onToggle={(id) => toggle("recusados", id)}
        onCustomAdded={(ing) => adicionarAlimentoCustomizado("recusados", ing)}
        cor="bg-amber-500 border-amber-500 text-white"
      />
      <PreferenceGroup
        titulo="Apresentando aos poucos"
        grupos={catalogo}
        selecionados={listas.desejados}
        onToggle={(id) => toggle("desejados", id)}
        onCustomAdded={(ing) => adicionarAlimentoCustomizado("desejados", ing)}
        cor="bg-blue-500 border-blue-500 text-white"
      />
      <PreferenceGroup
        titulo="Restrições e alergias"
        grupos={catalogo}
        selecionados={listas.restricoes}
        onToggle={(id) => toggle("restricoes", id)}
        onCustomAdded={(ing) => adicionarAlimentoCustomizado("restricoes", ing)}
        cor="bg-red-500 border-red-500 text-white"
      />

      <Button onClick={salvar} disabled={status === "saving"} size="lg" className="w-full">
        {status === "saving" ? "Salvando..." : status === "saved" ? "Salvo!" : "Salvar alterações"}
      </Button>

      <style jsx global>{`
        .input {
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid #d6d3d1;
          padding: 0.625rem 1rem;
          outline: none;
        }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-stone-700">{label}</label>
      {children}
    </div>
  );
}

function PreferenceGroup({
  titulo,
  grupos,
  selecionados,
  onToggle,
  onCustomAdded,
  cor,
}: {
  titulo: string;
  grupos: Grupo[];
  selecionados: string[];
  onToggle: (id: string) => void;
  onCustomAdded: (ingrediente: IngredienteBasico) => void;
  cor: string;
}) {
  const [aberto, setAberto] = useState(false);
  return (
    <Card>
      <button
        onClick={() => setAberto((v) => !v)}
        className="flex w-full items-center justify-between text-left"
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-stone-700">
          {titulo}
          <Badge tone="neutral">{selecionados.length}</Badge>
        </span>
        <ChevronDown
          size={16}
          className={cn("text-stone-400 transition-transform", aberto && "rotate-180")}
        />
      </button>
      {aberto && (
        <div className="mt-3 space-y-3">
          <div className="max-h-64 space-y-3 overflow-y-auto">
            {grupos.map((g) => (
              <div key={g.categoria}>
                <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-stone-400">
                  {CATEGORIA_INGREDIENTE_LABEL[g.categoria]}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {g.itens.map((ing) => {
                    const ativo = selecionados.includes(ing.id);
                    return (
                      <button
                        key={ing.id}
                        type="button"
                        onClick={() => onToggle(ing.id)}
                        className={cn(
                          "rounded-full border px-2.5 py-1 text-xs transition",
                          ativo ? cor : "border-stone-200 text-stone-600 hover:bg-stone-50"
                        )}
                      >
                        {ing.nome}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          <AddCustomFoodInput onAdded={onCustomAdded} />
        </div>
      )}
    </Card>
  );
}
