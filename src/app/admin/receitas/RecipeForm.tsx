"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { criarReceita, atualizarReceita, type ReceitaInput } from "@/lib/actions/admin";
import { TIPO_REFEICAO_LABEL } from "@/lib/constants";
import type { TipoRefeicao } from "@prisma/client";

type Ingrediente = { id: string; nome: string };

export default function RecipeForm({
  ingredientesDisponiveis,
  receita,
}: {
  ingredientesDisponiveis: Ingrediente[];
  receita?: {
    id: string;
    nome: string;
    resumo: string;
    tipoRefeicao: TipoRefeicao;
    tempoPreparoMin: number;
    dificuldade: string;
    rendimento: string;
    passos: string;
    tags: string;
    restricoes: string;
    nutricao: string;
    idadeMinimaMeses: number;
    ingredientes: { ingredientId: string; quantidade: string }[];
  };
}) {
  const router = useRouter();
  const [nome, setNome] = useState(receita?.nome ?? "");
  const [resumo, setResumo] = useState(receita?.resumo ?? "");
  const [tipoRefeicao, setTipoRefeicao] = useState<TipoRefeicao>(receita?.tipoRefeicao ?? "CAFE_DA_MANHA");
  const [tempoPreparoMin, setTempoPreparoMin] = useState(receita?.tempoPreparoMin ?? 15);
  const [dificuldade, setDificuldade] = useState(receita?.dificuldade ?? "Fácil");
  const [rendimento, setRendimento] = useState(receita?.rendimento ?? "1 porção");
  const [passos, setPassos] = useState(receita?.passos ?? "");
  const [tags, setTags] = useState(receita?.tags ?? "");
  const [restricoes, setRestricoes] = useState(receita?.restricoes ?? "");
  const [nutricao, setNutricao] = useState(receita?.nutricao ?? "");
  const [idadeMinimaMeses, setIdadeMinimaMeses] = useState(receita?.idadeMinimaMeses ?? 6);
  const [ingredientes, setIngredientes] = useState(
    receita?.ingredientes.length ? receita.ingredientes : [{ ingredientId: "", quantidade: "" }]
  );
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function updateIngrediente(index: number, field: "ingredientId" | "quantidade", value: string) {
    setIngredientes((prev) => prev.map((ing, i) => (i === index ? { ...ing, [field]: value } : ing)));
  }

  async function salvar() {
    setSaving(true);
    setError(null);
    const input: ReceitaInput = {
      nome,
      resumo,
      tipoRefeicao,
      tempoPreparoMin,
      dificuldade,
      rendimento,
      passos,
      tags,
      restricoes,
      nutricao,
      idadeMinimaMeses,
      ingredientes: ingredientes.filter((i) => i.ingredientId),
    };

    const result = receita
      ? await atualizarReceita(receita.id, input)
      : await criarReceita(input);

    if (result?.error) {
      setError(result.error);
      setSaving(false);
      return;
    }
    setSaving(false);
    router.push("/admin/receitas");
    router.refresh();
  }

  return (
    <div className="max-w-2xl space-y-4">
      <Field label="Nome">
        <input value={nome} onChange={(e) => setNome(e.target.value)} className="input" />
      </Field>
      <Field label="Resumo">
        <input value={resumo} onChange={(e) => setResumo(e.target.value)} className="input" />
      </Field>
      <div className="grid grid-cols-3 gap-3">
        <Field label="Tipo de refeição">
          <select
            value={tipoRefeicao}
            onChange={(e) => setTipoRefeicao(e.target.value as TipoRefeicao)}
            className="input"
          >
            {Object.entries(TIPO_REFEICAO_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Tempo (min)">
          <input
            type="number"
            value={tempoPreparoMin}
            onChange={(e) => setTempoPreparoMin(Number(e.target.value))}
            className="input"
          />
        </Field>
        <Field label="Dificuldade">
          <select value={dificuldade} onChange={(e) => setDificuldade(e.target.value)} className="input">
            <option value="Fácil">Fácil</option>
            <option value="Média">Média</option>
          </select>
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Rendimento">
          <input value={rendimento} onChange={(e) => setRendimento(e.target.value)} className="input" />
        </Field>
        <Field label="Idade mínima recomendada (meses)">
          <input
            type="number"
            value={idadeMinimaMeses}
            onChange={(e) => setIdadeMinimaMeses(Number(e.target.value))}
            className="input"
          />
        </Field>
      </div>
      <Field label="Nota nutricional (ex.: Rica em ferro e vitamina C)">
        <input value={nutricao} onChange={(e) => setNutricao(e.target.value)} className="input" />
      </Field>
      <Field label="Passos (um por linha)">
        <textarea
          value={passos}
          onChange={(e) => setPassos(e.target.value)}
          rows={4}
          className="input"
        />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Tags (separadas por vírgula)">
          <input value={tags} onChange={(e) => setTags(e.target.value)} className="input" />
        </Field>
        <Field label="Tags de restrição/alergia (separadas por vírgula)">
          <input value={restricoes} onChange={(e) => setRestricoes(e.target.value)} className="input" />
        </Field>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-stone-700">Ingredientes</label>
        <div className="space-y-2">
          {ingredientes.map((ing, i) => (
            <div key={i} className="flex gap-2">
              <select
                value={ing.ingredientId}
                onChange={(e) => updateIngrediente(i, "ingredientId", e.target.value)}
                className="input flex-1"
              >
                <option value="">Selecione...</option>
                {ingredientesDisponiveis.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.nome}
                  </option>
                ))}
              </select>
              <input
                placeholder="Quantidade"
                value={ing.quantidade}
                onChange={(e) => updateIngrediente(i, "quantidade", e.target.value)}
                className="input w-32"
              />
              <button
                type="button"
                onClick={() => setIngredientes((prev) => prev.filter((_, idx) => idx !== i))}
                className="flex items-center justify-center rounded-xl bg-stone-100 px-3 text-stone-500"
              >
                <X size={15} />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setIngredientes((prev) => [...prev, { ingredientId: "", quantidade: "" }])}
          className="mt-2 text-sm font-medium text-orange-600 hover:underline"
        >
          + Adicionar ingrediente
        </button>
      </div>

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

      <button
        onClick={salvar}
        disabled={saving}
        className="rounded-xl bg-orange-500 px-6 py-2.5 font-semibold text-white hover:bg-orange-600 disabled:opacity-60"
      >
        {saving ? "Salvando..." : "Salvar receita"}
      </button>

      <style jsx global>{`
        .input {
          border-radius: 0.75rem;
          border: 1px solid #d6d3d1;
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          width: 100%;
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
