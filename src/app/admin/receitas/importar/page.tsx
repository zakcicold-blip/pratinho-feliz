import Link from "next/link";
import { ArrowLeft, Download } from "lucide-react";
import { requireAdmin } from "@/lib/admin";
import Card from "@/components/ui/Card";
import ImportForm from "./ImportForm";

const EXEMPLO_CSV = `nome,resumo,tipoRefeicao,tempoPreparoMin,dificuldade,rendimento,passos,tags,restricoes,idadeMinimaMeses,imagemUrl,fonte,ingredientes
Papa de abóbora,Doce e macia,JANTAR,25,Fácil,2 porções,Cozinhe a abóbora | Amasse com garfo,papinha,,8,,Receita da casa,Abóbora:1 xícara | Azeite:1 fio`;

export default async function ImportarReceitasPage() {
  await requireAdmin();

  return (
    <div>
      <Link
        href="/admin/receitas"
        className="mb-3 inline-flex items-center gap-1 text-sm text-stone-500 hover:text-stone-800"
      >
        <ArrowLeft size={14} /> Voltar para receitas
      </Link>

      <h1 className="text-xl font-bold text-stone-800">Importar receitas</h1>
      <p className="mt-1 max-w-2xl text-sm text-stone-500">
        Suba um arquivo CSV ou JSON. Nada é gravado antes de você conferir a pré-visualização.
        Receitas com nome já existente são puladas.
      </p>

      <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        <ImportForm />

        <Card padding="lg" className="text-sm">
          <h2 className="flex items-center gap-1.5 font-semibold text-stone-700">
            <Download size={15} className="text-stone-400" /> Formato esperado
          </h2>

          <dl className="mt-3 space-y-2 text-xs text-stone-600">
            <Campo nome="nome, resumo, rendimento" desc="texto" />
            <Campo
              nome="tipoRefeicao"
              desc="CAFE_DA_MANHA, ALMOCO, LANCHE ou JANTAR"
            />
            <Campo nome="tempoPreparoMin" desc="número em minutos" />
            <Campo nome="dificuldade" desc="Fácil ou Média" />
            <Campo nome="passos" desc="separados por | (barra vertical)" />
            <Campo nome="tags, restricoes" desc="separados por vírgula" />
            <Campo nome="idadeMinimaMeses" desc="número (padrão 8)" />
            <Campo nome="imagemUrl, fonte" desc="opcionais; a URL precisa ser https" />
            <Campo
              nome="ingredientes"
              desc="Nome:Quantidade, separados por | — ex.: Banana:1 unidade | Aveia:2 colheres de sopa"
            />
          </dl>

          <p className="mt-4 text-xs font-semibold text-stone-600">Exemplo (CSV)</p>
          <pre className="mt-1 overflow-x-auto rounded-lg bg-stone-900 p-3 text-[10px] leading-relaxed text-stone-100">
            {EXEMPLO_CSV}
          </pre>

          <p className="mt-3 text-xs text-stone-500">
            Ingrediente que ainda não existe é criado em &ldquo;Outros&rdquo;. Depois ajuste a
            categoria e rode <code className="text-stone-700">npm run db:nutricao</code> para ele
            entrar no cálculo nutricional.
          </p>
        </Card>
      </div>
    </div>
  );
}

function Campo({ nome, desc }: { nome: string; desc: string }) {
  return (
    <div>
      <dt className="font-semibold text-stone-700">{nome}</dt>
      <dd className="text-stone-500">{desc}</dd>
    </div>
  );
}
