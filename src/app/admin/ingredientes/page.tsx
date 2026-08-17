import { db } from "@/lib/db";
import { CATEGORIA_INGREDIENTE_LABEL, CATEGORIA_INGREDIENTE_ORDEM } from "@/lib/constants";
import NovoIngredienteForm from "./NovoIngredienteForm";
import Card from "@/components/ui/Card";
import { CategoriaIcon } from "@/components/categoryIcons";

export default async function AdminIngredientesPage() {
  const ingredientes = await db.ingredient.findMany({ orderBy: { nome: "asc" } });
  const grupos = CATEGORIA_INGREDIENTE_ORDEM.map((categoria) => ({
    categoria,
    itens: ingredientes.filter((i) => i.categoria === categoria),
  })).filter((g) => g.itens.length > 0);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-stone-800">Ingredientes ({ingredientes.length})</h1>

      <Card padding="lg">
        <NovoIngredienteForm />
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        {grupos.map((g) => (
          <Card key={g.categoria}>
            <h2 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-stone-400">
              <CategoriaIcon categoria={g.categoria} size={13} />
              {CATEGORIA_INGREDIENTE_LABEL[g.categoria]}
            </h2>
            <div className="flex flex-wrap gap-1.5">
              {g.itens.map((i) => (
                <span key={i.id} className="rounded-full bg-stone-100 px-2.5 py-1 text-xs text-stone-600">
                  {i.nome}
                </span>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
