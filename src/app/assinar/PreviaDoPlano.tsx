import { db } from "@/lib/db";
import { TIPO_REFEICAO_LABEL } from "@/lib/constants";
import { MealTypeIcon, MEAL_COLOR } from "@/components/mealIcons";
import RecipeThumb from "@/components/RecipeThumb";
import { Sparkles, Lock } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Prévia do plano que já foi gerado no onboarding.
 *
 * A pessoa preencheu 7 etapas antes de chegar aqui; mostrar o resultado com o
 * nome do filho transforma o paywall de "muro" em "olha o que ficou pronto".
 * Só as primeiras refeições aparecem — o resto fica atrás do teste grátis.
 */
export default async function PreviaDoPlano({ userId }: { userId: string }) {
  const child = await db.childProfile.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: { id: true, nome: true },
  });
  if (!child) return null;

  const plano = await db.mealPlan.findFirst({
    where: { childProfileId: child.id, ativo: true },
    orderBy: { cicloNumero: "desc" },
    select: { id: true },
  });
  if (!plano) return null;

  const slots = await db.mealSlot.findMany({
    where: { mealPlanId: plano.id, recipeId: { not: null } },
    orderBy: [{ data: "asc" }, { tipo: "asc" }],
    take: 4,
    include: {
      recipe: { select: { nome: true, tempoPreparoMin: true, imagemUrl: true, tipoRefeicao: true } },
    },
  });
  if (slots.length === 0) return null;

  const totalRefeicoes = await db.mealSlot.count({
    where: { mealPlanId: plano.id, recipeId: { not: null } },
  });
  const restantes = Math.max(0, totalRefeicoes - slots.length);

  return (
    <div className="overflow-hidden rounded-3xl border border-stone-200/70 bg-white shadow-card">
      <div className="border-b border-stone-100 bg-gradient-to-br from-emerald-50 to-white px-5 py-4">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
          <Sparkles size={12} /> Plano pronto
        </span>
        <h2 className="font-display mt-2.5 text-lg leading-snug font-extrabold text-stone-900">
          O cardápio de {child.nome} já está montado
        </h2>
        <p className="mt-1 text-[13px] leading-relaxed text-stone-600">
          São {totalRefeicoes} refeições montadas a partir do que você contou — idade, rotina, o que ele
          aceita e o que tem na sua cozinha. Estas são as primeiras:
        </p>
      </div>

      <ul className="divide-y divide-stone-100 px-5">
        {slots.map((slot) => (
          <li key={slot.id} className="flex items-center gap-3 py-2.5">
            <RecipeThumb
              tipo={slot.recipe!.tipoRefeicao}
              imagemUrl={slot.recipe!.imagemUrl}
              nome={slot.recipe!.nome}
              size={38}
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-stone-800">{slot.recipe!.nome}</p>
              <p className="flex items-center gap-1 text-[11px] text-stone-400">
                <span className={MEAL_COLOR[slot.tipo].text}>
                  <MealTypeIcon tipo={slot.tipo} size={11} />
                </span>
                {TIPO_REFEICAO_LABEL[slot.tipo]} · {slot.recipe!.tempoPreparoMin} min
              </p>
            </div>
          </li>
        ))}
      </ul>

      {restantes > 0 && (
        <div
          className={cn(
            "relative flex items-center justify-center gap-2 px-5 py-3.5",
            "border-t border-dashed border-stone-200 bg-stone-50/70"
          )}
        >
          <Lock size={13} className="text-stone-400" />
          <span className="text-[13px] font-medium text-stone-500">
            + {restantes} refeições liberadas no teste grátis
          </span>
        </div>
      )}
    </div>
  );
}
