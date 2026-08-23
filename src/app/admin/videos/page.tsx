import { db } from "@/lib/db";
import { roteiroDisponivel } from "@/lib/roteiroVideo";
import GeradorRoteiro from "./GeradorRoteiro";

export const metadata = { title: "Roteiros de vídeo" };

export default async function VideosPage() {
  const receitas = await db.recipe.findMany({
    where: { ativo: true },
    select: { id: true, nome: true, tipoRefeicao: true, tempoPreparoMin: true, idadeMinimaMeses: true },
    orderBy: { nome: "asc" },
  });

  return (
    <div>
      <h1 className="mb-1 text-xl font-bold text-stone-800">Roteiros de vídeo</h1>
      <p className="mb-6 max-w-2xl text-sm text-stone-500">
        Escolha uma receita e gere o roteiro completo do Reel: gancho, três cenas de 8 segundos
        com o prompt pronto para o Veo, texto de tela, legenda e hashtags.
      </p>

      {!roteiroDisponivel() ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Falta a chave <strong>ANTHROPIC_API_KEY</strong> no ambiente.
        </div>
      ) : (
        <GeradorRoteiro receitas={receitas} />
      )}
    </div>
  );
}
