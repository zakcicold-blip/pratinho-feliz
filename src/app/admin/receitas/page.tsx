import Link from "next/link";
import { db } from "@/lib/db";
import { TIPO_REFEICAO_LABEL } from "@/lib/constants";
import { MealTypeIcon, MEAL_COLOR } from "@/components/mealIcons";
import ToggleAtivoButton from "./ToggleAtivoButton";
import Button from "@/components/ui/Button";
import { Plus, Pencil, Upload } from "lucide-react";

export default async function AdminReceitasPage() {
  const receitas = await db.recipe.findMany({ orderBy: { nome: "asc" } });

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-stone-800">Receitas ({receitas.length})</h1>
        <div className="flex gap-2">
          <Button href="/admin/receitas/importar" variant="outline">
            <Upload size={15} /> Importar
          </Button>
          <Button href="/admin/receitas/nova">
            <Plus size={15} /> Nova receita
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-stone-200/70 bg-white shadow-card">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 text-left text-xs uppercase tracking-wide text-stone-400">
            <tr>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3">Tempo</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {receitas.map((r) => (
              <tr key={r.id} className="border-t border-stone-100 hover:bg-stone-50/60">
                <td className="px-4 py-3 font-medium text-stone-800">
                  <span className="flex items-center gap-2">
                    <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg ${MEAL_COLOR[r.tipoRefeicao].bg}`}>
                      <MealTypeIcon tipo={r.tipoRefeicao} size={12} />
                    </span>
                    {r.nome}
                  </span>
                </td>
                <td className="px-4 py-3 text-stone-500">{TIPO_REFEICAO_LABEL[r.tipoRefeicao]}</td>
                <td className="px-4 py-3 text-stone-500">{r.tempoPreparoMin} min</td>
                <td className="px-4 py-3">
                  <ToggleAtivoButton id={r.id} ativoInicial={r.ativo} />
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/receitas/${r.id}`}
                    className="inline-flex items-center gap-1 text-orange-600 hover:underline"
                  >
                    <Pencil size={12} /> Editar
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
