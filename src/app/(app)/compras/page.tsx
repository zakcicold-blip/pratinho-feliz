import Link from "next/link";
import { getCurrentChild } from "@/lib/currentChild";
import { db } from "@/lib/db";
import { addDiasChave, hojeChave } from "@/lib/dates";
import { CATEGORIA_INGREDIENTE_LABEL, CATEGORIA_INGREDIENTE_ORDEM } from "@/lib/constants";
import TopBar from "@/components/TopBar";
import ShoppingItemRow from "./ShoppingItemRow";
import PantryChip from "./PantryChip";
import CopiarListaButton from "./CopiarListaButton";
import ItemManualForm from "./ItemManualForm";
import ExtraItemRow from "./ExtraItemRow";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import ProgressBar from "@/components/ui/ProgressBar";
import { CategoriaIcon } from "@/components/categoryIcons";
import { ShoppingCart, PackageCheck } from "lucide-react";
import { cn } from "@/lib/cn";

export default async function ComprasPage({
  searchParams,
}: {
  searchParams: Promise<{ semana?: string }>;
}) {
  const { semana } = await searchParams;
  const { child } = await getCurrentChild();

  const plano = await db.mealPlan.findFirst({
    where: { childProfileId: child.id, ativo: true },
    orderBy: { cicloNumero: "desc" },
  });

  if (!plano) {
    return (
      <>
        <TopBar title="Lista de compras" back />
        <EmptyState icon={ShoppingCart} title="Nenhum plano ativo ainda" />
      </>
    );
  }

  const inicioCiclo = plano.dataInicio;
  const hojeIdx = Math.round((hojeChave().getTime() - inicioCiclo.getTime()) / 86400000);
  const semanaAtualIdx = Math.min(4, Math.max(0, Math.floor(hojeIdx / 7)));
  const semanaIdx = semana ? Math.min(4, Math.max(0, Number(semana))) : semanaAtualIdx;

  const semanaInicio = addDiasChave(inicioCiclo, semanaIdx * 7);
  const semanaFim = addDiasChave(semanaInicio, 6);

  const slots = await db.mealSlot.findMany({
    where: {
      mealPlanId: plano.id,
      data: { gte: semanaInicio, lte: semanaFim },
      status: { not: "FORA_DE_CASA" },
      recipeId: { not: null },
    },
    include: { recipe: { include: { ingredients: { include: { ingredient: true } } } } },
  });

  const pantryItems = await db.pantryItem.findMany({
    where: { childProfileId: child.id },
    include: { ingredient: true },
  });
  const pantryIds = new Set(pantryItems.map((p) => p.ingredientId));

  const extras = await db.shoppingExtra.findMany({
    where: { childProfileId: child.id, semanaInicio },
    orderBy: { createdAt: "asc" },
  });

  const checks = await db.shoppingCheck.findMany({
    where: { childProfileId: child.id, semanaInicio },
  });
  const compradoMap = new Map(checks.map((c) => [c.ingredientId, c.comprado]));

  type Item = {
    ingredientId: string;
    nome: string;
    categoria: string;
    quantidades: string[];
  };
  const itensMap = new Map<string, Item>();

  for (const slot of slots) {
    if (!slot.recipe) continue;
    for (const ri of slot.recipe.ingredients) {
      if (pantryIds.has(ri.ingredientId)) continue;
      const atual = itensMap.get(ri.ingredientId);
      if (atual) {
        atual.quantidades.push(ri.quantidade);
      } else {
        itensMap.set(ri.ingredientId, {
          ingredientId: ri.ingredientId,
          nome: ri.ingredient.nome,
          categoria: ri.ingredient.categoria,
          quantidades: [ri.quantidade],
        });
      }
    }
  }

  const grupos = CATEGORIA_INGREDIENTE_ORDEM.map((categoria) => ({
    categoria,
    itens: Array.from(itensMap.values())
      .filter((i) => i.categoria === categoria)
      .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR")),
    extras: extras.filter((e) => e.categoria === categoria),
  })).filter((g) => g.itens.length > 0 || g.extras.length > 0);

  // Itens manuais entram na contagem: para a familia, e tudo a mesma lista.
  const totalItens = itensMap.size + extras.length;
  const totalComprados =
    Array.from(itensMap.keys()).filter((id) => compradoMap.get(id)).length +
    extras.filter((e) => e.comprado).length;

  const textoLista = grupos
    .map(
      (g) =>
        `${CATEGORIA_INGREDIENTE_LABEL[g.categoria]}\n` +
        [
          ...g.itens.map((i) => `- ${i.nome} (${i.quantidades.length}x)`),
          ...g.extras.map((e) => `- ${e.nome}${e.quantidade ? ` (${e.quantidade})` : ""}`),
        ].join("\n")
    )
    .join("\n\n");

  return (
    <>
      <TopBar title="Lista de compras" subtitle={`Semana ${semanaIdx + 1} de 5`} back />

      <div className="space-y-4 px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            {Array.from({ length: 5 }, (_, i) => i).map((i) => (
              <Link
                key={i}
                href={`/compras?semana=${i}`}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition",
                  i === semanaIdx
                    ? "bg-orange-500 text-white shadow-card"
                    : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                )}
              >
                {i + 1}
              </Link>
            ))}
          </div>
          {grupos.length > 0 && <CopiarListaButton texto={textoLista} />}
        </div>

        {totalItens > 0 && (
          <Card padding="sm" className="px-4">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 font-semibold text-stone-600">
                <PackageCheck size={14} className="text-emerald-500" /> Comprados
              </span>
              <span className="text-stone-400">
                {totalComprados}/{totalItens}
              </span>
            </div>
            <ProgressBar
              value={totalComprados}
              max={totalItens}
              className="mt-1.5"
              barClassName="bg-emerald-500"
            />
          </Card>
        )}

        {grupos.length === 0 ? (
          <EmptyState
            icon={PackageCheck}
            title="Nada para comprar nessa semana"
            description="Tudo já está na despensa ou os dias estão marcados como fora de casa."
          />
        ) : (
          <div className="space-y-4">
            {grupos.map((g) => (
              <Card key={g.categoria} padding="sm" className="px-4">
                <h2 className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-stone-400">
                  <CategoriaIcon categoria={g.categoria} size={13} />
                  {CATEGORIA_INGREDIENTE_LABEL[g.categoria]}
                </h2>
                <div className="divide-y divide-stone-100">
                  {g.itens.map((item) => (
                    <ShoppingItemRow
                      key={item.ingredientId}
                      childId={child.id}
                      semanaInicioISO={semanaInicio.toISOString()}
                      ingredientId={item.ingredientId}
                      nome={item.nome}
                      detalhe={`(${item.quantidades.length}x)`}
                      compradoInicial={compradoMap.get(item.ingredientId) ?? false}
                    />
                  ))}
                  {g.extras.map((e) => (
                    <ExtraItemRow
                      key={e.id}
                      extraId={e.id}
                      nome={e.nome}
                      quantidade={e.quantidade}
                      compradoInicial={e.comprado}
                    />
                  ))}
                </div>
              </Card>
            ))}
          </div>
        )}

        <ItemManualForm childId={child.id} semanaInicioISO={semanaInicio.toISOString()} />

        {pantryItems.length > 0 && (
          <div>
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-400">
              Já em casa
            </h2>
            <div className="flex flex-wrap gap-2">
              {pantryItems.map((p) => (
                <PantryChip
                  key={p.ingredientId}
                  childId={child.id}
                  ingredientId={p.ingredientId}
                  nome={p.ingredient.nome}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
