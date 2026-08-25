import { db } from "@/lib/db";
import TopBar from "@/components/TopBar";
import BibliotecaReceitas from "./BibliotecaReceitas";
import Bloqueado from "@/components/Bloqueado";
import { getConta } from "@/lib/currentChild";
import { podeUsar } from "@/lib/plano";

export default async function ReceitasPage() {
  const { conta } = await getConta();
  if (!podeUsar("catalogo", conta.subscription)) return <Bloqueado recurso="catalogo" />;

  const receitas = await db.recipe.findMany({
    where: { ativo: true },
    orderBy: { nome: "asc" },
    select: {
      id: true,
      nome: true,
      resumo: true,
      tipoRefeicao: true,
      tempoPreparoMin: true,
      imagemUrl: true,
    },
  });

  return (
    <>
      <TopBar title="Receitas" subtitle={`${receitas.length} receitas na biblioteca`} back />
      <div className="px-4 py-4">
        <BibliotecaReceitas receitas={receitas} />
      </div>
    </>
  );
}
