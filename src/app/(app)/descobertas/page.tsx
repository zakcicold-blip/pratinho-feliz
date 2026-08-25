import { getCurrentChild } from "@/lib/currentChild";
import { db } from "@/lib/db";
import { ESTADO_FEEDBACK_LABEL } from "@/lib/constants";
import TopBar from "@/components/TopBar";
import AddDesejadoForm from "./AddDesejadoForm";
import { ReactionIcon } from "@/components/reactionIcons";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import { Sparkles } from "lucide-react";
import Bloqueado from "@/components/Bloqueado";
import { getConta } from "@/lib/currentChild";
import { podeUsar } from "@/lib/plano";

export default async function DescobertasPage() {
  const { conta } = await getConta();
  if (!podeUsar("catalogo", conta.subscription)) return <Bloqueado recurso="catalogo" />;

  const { child } = await getCurrentChild();

  const desejados = await db.foodPreference.findMany({
    where: { childProfileId: child.id, status: "DESEJADA" },
    include: { ingredient: true },
  });

  const journeys = await db.foodJourney.findMany({
    where: { childProfileId: child.id },
  });
  const journeyMap = new Map(journeys.map((j) => [j.ingredientId, j]));

  const todosIngredientes = await db.ingredient.findMany({ orderBy: { nome: "asc" } });
  const preferenciasExistentes = await db.foodPreference.findMany({
    where: { childProfileId: child.id },
  });
  const idsComPreferencia = new Set(preferenciasExistentes.map((p) => p.ingredientId));
  const opcoes = todosIngredientes.filter((i) => !idsComPreferencia.has(i.id));

  return (
    <>
      <TopBar title="Descobertas" subtitle="Novos alimentos em apresentação" back />

      <div className="space-y-4 px-4 py-4">
        <Card>
          <h2 className="mb-3 text-sm font-semibold text-stone-700">Apresentar um novo alimento</h2>
          <AddDesejadoForm childId={child.id} opcoes={opcoes} />
        </Card>

        {desejados.length === 0 ? (
          <EmptyState
            icon={Sparkles}
            title="Nenhum alimento em apresentação ainda"
            description="Escolha um alimento acima para começar a acompanhar a jornada de descoberta."
          />
        ) : (
          <div className="space-y-2">
            {desejados.map((d) => {
              const jornada = journeyMap.get(d.ingredientId);
              return (
                <Card key={d.id} padding="sm" className="flex items-center justify-between px-4">
                  <div>
                    <p className="font-semibold text-stone-800">{d.ingredient.nome}</p>
                    <p className="text-xs text-stone-500">
                      {jornada ? `${jornada.exposicoes} exposição(ões)` : "Ainda não foi servido"}
                    </p>
                  </div>
                  {jornada?.ultimoEstado && (
                    <div className="text-right">
                      <ReactionIcon estado={jornada.ultimoEstado} size={24} active />
                      <p className="text-[11px] text-stone-400">
                        {ESTADO_FEEDBACK_LABEL[jornada.ultimoEstado]}
                      </p>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
