"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { completarOnboarding, type OnboardingInput } from "@/lib/actions/onboarding";
import {
  CATEGORIA_INGREDIENTE_LABEL,
  CATEGORIA_INGREDIENTE_ORDEM,
  FAIXAS_ETARIAS,
  OBJETIVO_LABEL,
  PRATICIDADE_LABEL,
} from "@/lib/constants";
import AddCustomFoodInput, { type IngredienteBasico } from "@/components/AddCustomFoodInput";
import EquipamentosSelect from "@/components/EquipamentosSelect";
import PlanoLoading from "./PlanoLoading";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import {
  Baby,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  ShieldAlert,
  SlidersHorizontal,
  ClipboardCheck,
  Check,
  type LucideIcon,
} from "lucide-react";

type Ingrediente = { id: string; nome: string; categoria: string };
type Grupo = { categoria: string; itens: Ingrediente[] };

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

const DRAFT_KEY = "pratinho_onboarding_draft";

const STEPS: { label: string; icon: LucideIcon }[] = [
  { label: "Sobre a criança", icon: Baby },
  { label: "O que ela já come", icon: ThumbsUp },
  { label: "O que costuma recusar", icon: ThumbsDown },
  { label: "Novidades para apresentar", icon: Sparkles },
  { label: "Restrições e alergias", icon: ShieldAlert },
  { label: "Rotina e objetivo", icon: SlidersHorizontal },
  { label: "Resumo", icon: ClipboardCheck },
];

type Draft = Omit<OnboardingInput, "consentimento"> & { consentimento: boolean };

const initialDraft: Draft = {
  nome: "",
  faixaEtaria: FAIXAS_ETARIAS[1],
  refeicoesPorDia: 4,
  tempoDisponivel: 30,
  praticidade: "EQUILIBRADO",
  objetivo: "ORGANIZAR_ROTINA",
  equipamentos: "",
  aceitos: [],
  recusados: [],
  desejados: [],
  restricoes: [],
  consentimento: false,
};

export default function OnboardingWizard({
  grupos: gruposIniciais,
  userId,
  podeCancelar = false,
}: {
  grupos: Grupo[];
  userId: string;
  /** Verdadeiro quando o responsável já tem outro filho (está adicionando mais um). */
  podeCancelar?: boolean;
}) {
  const router = useRouter();
  // Rascunho é por usuário: uma conta nunca herda o que outra deixou no navegador.
  const draftKey = `${DRAFT_KEY}_${userId}`;

  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<Draft>(initialDraft);
  const [hidratado, setHidratado] = useState(false);
  const [catalogo, setCatalogo] = useState<Grupo[]>(gruposIniciais);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(draftKey);
    if (saved) {
      try {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- hidrata rascunho do localStorage uma única vez, no mount
        setDraft(JSON.parse(saved));
      } catch {
        // ignora rascunho corrompido
      }
    }
    setHidratado(true);
  }, [draftKey]);

  useEffect(() => {
    // Só persiste depois de hidratar, para não sobrescrever o rascunho salvo
    // com o estado inicial em branco no primeiro render.
    if (hidratado) localStorage.setItem(draftKey, JSON.stringify(draft));
  }, [draft, draftKey, hidratado]);

  const todosIngredientes = useMemo(() => catalogo.flatMap((g) => g.itens), [catalogo]);
  const nomePorId = useMemo(
    () => new Map(todosIngredientes.map((i) => [i.id, i.nome])),
    [todosIngredientes]
  );

  function toggle(listName: "aceitos" | "recusados" | "desejados" | "restricoes", id: string) {
    setDraft((prev) => {
      const outras = (["aceitos", "recusados", "desejados", "restricoes"] as const).filter(
        (k) => k !== listName
      );
      const next: Draft = { ...prev };
      for (const k of outras) {
        next[k] = prev[k].filter((x) => x !== id);
      }
      const atual = prev[listName];
      next[listName] = atual.includes(id) ? atual.filter((x) => x !== id) : [...atual, id];
      return next;
    });
  }

  function adicionarAlimentoCustomizado(
    listName: "aceitos" | "recusados" | "desejados" | "restricoes",
    ingrediente: IngredienteBasico
  ) {
    setCatalogo((prev) => inserirNoCatalogo(prev, ingrediente));
    setDraft((prev) => ({ ...prev, [listName]: [...prev[listName], ingrediente.id] }));
  }

  function next() {
    if (step === 0 && !draft.nome.trim()) {
      setError("Informe o nome ou apelido da criança.");
      return;
    }
    setError(null);
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function back() {
    setError(null);
    setStep((s) => Math.max(s - 1, 0));
  }

  async function finalizar() {
    if (!draft.consentimento) {
      setError("É necessário confirmar o consentimento para continuar.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      // Gera o plano e, em paralelo, segura a tela de loading por ~3,8s para a
      // animação aparecer por inteiro antes de abrir o teste grátis.
      const [result] = await Promise.all([
        completarOnboarding(draft),
        new Promise((r) => setTimeout(r, 3800)),
      ]);
      if (result?.error) {
        setError(result.error);
        setSubmitting(false);
        return;
      }
      // Sucesso: limpa o rascunho ANTES de sair. Antes o redirect acontecia no
      // servidor e esta linha nunca rodava, deixando o rascunho vazar para a
      // próxima conta criada no mesmo navegador.
      localStorage.removeItem(draftKey);
      router.push("/hoje");
      // O modal de cadastro vive no layout do app, que e do servidor: sem o
      // refresh ele continuaria na tela mesmo com a crianca ja criada.
      router.refresh();
    } catch {
      // Falha transitória (ex.: banco acordando). Não deixa a tela de loading
      // travada — devolve o controle e permite tentar de novo.
      setError("Não conseguimos montar o plano agora. Tente de novo em alguns segundos.");
      setSubmitting(false);
    }
  }

  const StepIcon = STEPS[step].icon;

  // Enquanto o plano é montado, cobre a tela inteira com a animação de progresso.
  if (submitting) {
    return <PlanoLoading nome={draft.nome} />;
  }

  return (
    <div>
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-sm font-semibold text-stone-700">
            <StepIcon size={15} className="text-orange-500" />
            {STEPS[step].label}
          </span>
          <span className="text-xs font-medium text-stone-400">
            {step + 1} / {STEPS.length}
          </span>
        </div>
        <div className="flex gap-1.5">
          {STEPS.map((s, i) => (
            <div
              key={s.label}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-colors duration-300",
                i <= step ? "bg-orange-500" : "bg-stone-200"
              )}
            />
          ))}
        </div>
      </div>

      <Card padding="lg" className="animate-fade-in">
        {step === 0 && (
          <div className="space-y-4">
            <h2 className="font-display text-xl font-bold text-stone-900">Sobre a criança</h2>
            <Field label="Nome ou apelido">
              <input
                autoFocus
                value={draft.nome}
                onChange={(e) => setDraft({ ...draft, nome: e.target.value })}
                className="input"
                placeholder="Ex.: Théo"
              />
            </Field>
            <Field label="Faixa etária">
              <select
                value={draft.faixaEtaria}
                onChange={(e) => setDraft({ ...draft, faixaEtaria: e.target.value })}
                className="input"
              >
                {FAIXAS_ETARIAS.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </Field>
            <div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-stone-700">Refeições em casa por dia</label>
                <span className="rounded-full bg-orange-50 px-2.5 py-0.5 text-sm font-bold text-orange-600">
                  {draft.refeicoesPorDia}
                </span>
              </div>
              <input
                type="range"
                min={2}
                max={4}
                value={draft.refeicoesPorDia}
                onChange={(e) => setDraft({ ...draft, refeicoesPorDia: Number(e.target.value) })}
                className="mt-2 w-full accent-orange-500"
              />
              <p className="mt-1 text-xs text-stone-400">De 2 a 4 refeições preparadas em casa.</p>
            </div>
            <div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-stone-700">Tempo pra cozinhar</label>
                <span className="rounded-full bg-orange-50 px-2.5 py-0.5 text-sm font-bold text-orange-600">
                  {draft.tempoDisponivel} min
                </span>
              </div>
              <input
                type="range"
                min={10}
                max={60}
                step={5}
                value={draft.tempoDisponivel}
                onChange={(e) => setDraft({ ...draft, tempoDisponivel: Number(e.target.value) })}
                className="mt-2 w-full accent-orange-500"
              />
              <p className="mt-1 text-xs text-stone-400">
                Quanto tempo você tem, em média, para preparar cada refeição. O cardápio se ajusta ao seu ritmo.
              </p>
            </div>
            <Field label="O que você tem na cozinha? (opcional)">
              <EquipamentosSelect
                value={draft.equipamentos}
                onChange={(equipamentos) => setDraft({ ...draft, equipamentos })}
              />
              <p className="mt-2 text-xs text-stone-400">
                Só sugerimos receitas que dá para fazer com o que você marcar. Fogão e panela já
                entram por padrão.
              </p>
            </Field>
          </div>
        )}

        {step === 1 && (
          <IngredientStep
            titulo="O que ela já costuma aceitar bem?"
            dica="Toque nos alimentos que fazem parte da rotina hoje, ou digite um que não está na lista. Você pode pular esta etapa."
            grupos={catalogo}
            selecionados={draft.aceitos}
            onToggle={(id) => toggle("aceitos", id)}
            onCustomAdded={(ing) => adicionarAlimentoCustomizado("aceitos", ing)}
            corSelecionado="bg-emerald-500 border-emerald-500 text-white"
          />
        )}

        {step === 2 && (
          <IngredientStep
            titulo="O que ela costuma recusar?"
            dica="Isso nos ajuda a evitar repetir o que não funciona. Pode pular."
            grupos={catalogo}
            selecionados={draft.recusados}
            onToggle={(id) => toggle("recusados", id)}
            onCustomAdded={(ing) => adicionarAlimentoCustomizado("recusados", ing)}
            corSelecionado="bg-amber-500 border-amber-500 text-white"
          />
        )}

        {step === 3 && (
          <IngredientStep
            titulo="Alimentos para apresentar aos poucos"
            dica="Coisas novas que a família gostaria de introduzir com calma."
            grupos={catalogo}
            selecionados={draft.desejados}
            onToggle={(id) => toggle("desejados", id)}
            onCustomAdded={(ing) => adicionarAlimentoCustomizado("desejados", ing)}
            corSelecionado="bg-blue-500 border-blue-500 text-white"
          />
        )}

        {step === 4 && (
          <IngredientStep
            titulo="Restrições e alergias"
            dica="Esses itens funcionam como bloqueio: nunca serão sugeridos. Informação do responsável — não substitui avaliação médica."
            grupos={catalogo}
            selecionados={draft.restricoes}
            onToggle={(id) => toggle("restricoes", id)}
            onCustomAdded={(ing) => adicionarAlimentoCustomizado("restricoes", ing)}
            corSelecionado="bg-red-500 border-red-500 text-white"
          />
        )}

        {step === 5 && (
          <div className="space-y-5">
            <h2 className="font-display text-xl font-bold text-stone-900">Rotina e objetivo</h2>
            <Field label="Nível de praticidade">
              <div className="grid gap-2 sm:grid-cols-3">
                {Object.entries(PRATICIDADE_LABEL).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setDraft({ ...draft, praticidade: value as Draft["praticidade"] })}
                    className={cn(
                      "rounded-2xl border px-3 py-2.5 text-sm font-medium transition active:scale-[0.98]",
                      draft.praticidade === value
                        ? "border-orange-400 bg-orange-50 text-orange-700"
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
                    onClick={() => setDraft({ ...draft, objetivo: value as Draft["objetivo"] })}
                    className={cn(
                      "rounded-2xl border px-3 py-2.5 text-sm font-medium transition active:scale-[0.98]",
                      draft.objetivo === value
                        ? "border-orange-400 bg-orange-50 text-orange-700"
                        : "border-stone-200 text-stone-600 hover:bg-stone-50"
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-xs text-stone-400">
                Nos ajuda a entender por que você usa o app — não muda o cardápio.
              </p>
            </Field>
            <label className="flex items-start gap-3 rounded-xl bg-orange-50 p-4 text-sm text-stone-700">
              <input
                type="checkbox"
                checked={draft.consentimento}
                onChange={(e) => setDraft({ ...draft, consentimento: e.target.checked })}
                className="mt-0.5 accent-orange-500"
              />
              <span>
                Como responsável legal, autorizo o uso destes dados para personalizar a alimentação
                da criança, conforme a{" "}
                <a href="/privacidade" target="_blank" className="underline">
                  política de privacidade
                </a>
                .
              </span>
            </label>
          </div>
        )}

        {step === 6 && (
          <div className="space-y-4">
            <h2 className="font-display text-xl font-bold text-stone-900">Montando o plano de {draft.nome}</h2>
            <div className="divide-y divide-stone-100 rounded-xl bg-stone-50/60 px-4">
              <ResumoLinha label="Faixa etária" valor={draft.faixaEtaria} />
              <ResumoLinha label="Refeições por dia" valor={String(draft.refeicoesPorDia)} />
              <ResumoLinha label="Tempo disponível" valor={`${draft.tempoDisponivel} min`} />
              <ResumoLinha label="Praticidade" valor={PRATICIDADE_LABEL[draft.praticidade]} />
              <ResumoLinha label="Objetivo" valor={OBJETIVO_LABEL[draft.objetivo]} />
              <ResumoLinha
                label="Aceita bem"
                valor={draft.aceitos.map((id) => nomePorId.get(id)).join(", ") || "—"}
              />
              <ResumoLinha
                label="Restrições"
                valor={draft.restricoes.map((id) => nomePorId.get(id)).join(", ") || "Nenhuma"}
              />
            </div>
            <p className="text-sm text-stone-500">
              Vamos gerar os 30 dias com base nessas respostas. Você pode trocar qualquer refeição
              depois, a qualquer momento.
            </p>
          </div>
        )}

        {error && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

        <div className="mt-6 flex items-center justify-between">
          {step === 0 ? (
            // No primeiro passo não há passo anterior. Se a pessoa já tem outro
            // filho, ela está apenas adicionando mais um: oferece cancelar e
            // voltar ao perfil. No cadastro inicial não há para onde cancelar.
            podeCancelar ? (
              <Button type="button" onClick={() => router.push("/perfil")} variant="ghost">
                Cancelar
              </Button>
            ) : (
              <span className="invisible">
                <Button type="button" variant="ghost">
                  Voltar
                </Button>
              </span>
            )
          ) : (
            <Button type="button" onClick={back} variant="ghost">
              Voltar
            </Button>
          )}

          {step < STEPS.length - 1 ? (
            <div className="flex gap-2">
              {step > 0 && (
                <Button type="button" onClick={next} variant="ghost">
                  Pular por enquanto
                </Button>
              )}
              <Button type="button" onClick={next}>
                Continuar
              </Button>
            </div>
          ) : (
            <Button type="button" onClick={finalizar} disabled={submitting} size="lg">
              {submitting ? "Montando plano..." : "Gerar meu plano de 30 dias"}
            </Button>
          )}
        </div>
      </Card>

      <style jsx global>{`
        .input {
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid #d6d3d1;
          padding: 0.625rem 1rem;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .input:focus {
          border-color: #fb923c;
          box-shadow: 0 0 0 3px rgba(251, 146, 60, 0.15);
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

function ResumoLinha({ label, valor }: { label: string; valor: string }) {
  return (
    <div className="flex justify-between py-2 text-sm">
      <span className="text-stone-500">{label}</span>
      <span className="text-right font-medium text-stone-800">{valor}</span>
    </div>
  );
}

function IngredientStep({
  titulo,
  dica,
  grupos,
  selecionados,
  onToggle,
  onCustomAdded,
  corSelecionado,
}: {
  titulo: string;
  dica: string;
  grupos: Grupo[];
  selecionados: string[];
  onToggle: (id: string) => void;
  onCustomAdded: (ingrediente: IngredienteBasico) => void;
  corSelecionado: string;
}) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-xl font-bold text-stone-900">{titulo}</h2>
        <p className="mt-1 text-sm text-stone-500">{dica}</p>
      </div>
      <div className="max-h-96 space-y-4 overflow-y-auto pr-1">
        {grupos.map((g) => (
          <div key={g.categoria}>
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-400">
              {CATEGORIA_INGREDIENTE_LABEL[g.categoria]}
            </div>
            <div className="flex flex-wrap gap-2">
              {g.itens.map((ing) => {
                const ativo = selecionados.includes(ing.id);
                return (
                  <button
                    key={ing.id}
                    type="button"
                    onClick={() => onToggle(ing.id)}
                    className={cn(
                      "flex items-center gap-1 rounded-full border px-3 py-1.5 text-sm transition",
                      ativo ? corSelecionado : "border-stone-200 text-stone-600 hover:bg-stone-50"
                    )}
                  >
                    {ativo && <Check size={13} />}
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
  );
}
