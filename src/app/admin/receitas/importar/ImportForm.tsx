"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  FileWarning,
  CircleCheck,
  TriangleAlert,
  ArrowRight,
  RotateCcw,
} from "lucide-react";
import { analisarArquivo, type LinhaValidada } from "@/lib/importarReceitas";
import { importarReceitas } from "@/lib/actions/admin";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { cn } from "@/lib/cn";

type Resultado = {
  criadas: number;
  puladas: string[];
  ingredientesNovos: string[];
};

export default function ImportForm() {
  const router = useRouter();
  const [nomeArquivo, setNomeArquivo] = useState<string | null>(null);
  const [linhas, setLinhas] = useState<LinhaValidada[] | null>(null);
  const [erroArquivo, setErroArquivo] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [resultado, setResultado] = useState<Resultado | null>(null);

  const validas = linhas?.filter((l) => l.receita) ?? [];
  const invalidas = linhas?.filter((l) => !l.receita) ?? [];
  const comAvisos = validas.filter((l) => l.avisos.length > 0);

  async function aoEscolherArquivo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setErroArquivo(null);
    setLinhas(null);
    setResultado(null);
    setNomeArquivo(file.name);

    try {
      const texto = await file.text();
      const analisadas = analisarArquivo(texto, file.name);
      if (analisadas.length === 0) {
        setErroArquivo("Nenhuma receita encontrada no arquivo.");
        return;
      }
      setLinhas(analisadas);
    } catch (err) {
      setErroArquivo(err instanceof Error ? err.message : "Não foi possível ler o arquivo.");
    }
  }

  async function confirmar() {
    if (validas.length === 0) return;
    setSalvando(true);
    const res = await importarReceitas(validas.map((l) => l.receita!));
    setSalvando(false);

    if (res?.error) {
      setErroArquivo(res.error);
      return;
    }
    setResultado({
      criadas: res!.criadas!,
      puladas: res!.puladas!,
      ingredientesNovos: res!.ingredientesNovos!,
    });
    setLinhas(null);
    router.refresh();
  }

  function recomecar() {
    setLinhas(null);
    setResultado(null);
    setErroArquivo(null);
    setNomeArquivo(null);
  }

  if (resultado) {
    return (
      <Card padding="lg" className="max-w-2xl">
        <div className="flex items-center gap-2 text-emerald-600">
          <CircleCheck size={20} />
          <h2 className="font-bold">Importação concluída</h2>
        </div>
        <p className="mt-2 text-sm text-stone-700">
          <strong>{resultado.criadas}</strong>{" "}
          {resultado.criadas === 1 ? "receita criada" : "receitas criadas"}.
        </p>

        {resultado.puladas.length > 0 && (
          <div className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800">
            <p className="font-semibold">
              {resultado.puladas.length} pulada(s) — já existia receita com esse nome:
            </p>
            <p className="mt-1">{resultado.puladas.join(", ")}</p>
          </div>
        )}

        {resultado.ingredientesNovos.length > 0 && (
          <div className="mt-3 rounded-xl bg-blue-50 px-3 py-2 text-xs text-blue-800">
            <p className="font-semibold">
              {resultado.ingredientesNovos.length} ingrediente(s) novo(s), criados em
              &ldquo;Outros&rdquo;:
            </p>
            <p className="mt-1">{resultado.ingredientesNovos.join(", ")}</p>
            <p className="mt-1.5">
              Ajuste a categoria em Ingredientes e rode a nutrição para eles entrarem no cálculo.
            </p>
          </div>
        )}

        <div className="mt-5 flex gap-2">
          <Button href="/admin/receitas">
            Ver receitas <ArrowRight size={14} />
          </Button>
          <Button onClick={recomecar} variant="outline">
            <RotateCcw size={14} /> Importar outro arquivo
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="max-w-3xl space-y-4">
      <Card padding="lg">
        <label className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-stone-300 px-6 py-10 text-center transition hover:border-orange-300 hover:bg-orange-50/40">
          <Upload size={26} className="text-stone-400" />
          <span className="text-sm font-semibold text-stone-700">
            Escolher arquivo CSV ou JSON
          </span>
          <span className="text-xs text-stone-500">
            {nomeArquivo ?? "Nada selecionado ainda"}
          </span>
          <input
            type="file"
            accept=".csv,.json,text/csv,application/json"
            onChange={aoEscolherArquivo}
            className="hidden"
          />
        </label>

        {erroArquivo && (
          <p className="mt-3 flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            <FileWarning size={15} className="shrink-0" /> {erroArquivo}
          </p>
        )}
      </Card>

      {linhas && (
        <>
          <div className="flex flex-wrap gap-2">
            <Badge tone="emerald">{validas.length} prontas para importar</Badge>
            {comAvisos.length > 0 && <Badge tone="amber">{comAvisos.length} com aviso</Badge>}
            {invalidas.length > 0 && <Badge tone="red">{invalidas.length} com erro</Badge>}
          </div>

          {invalidas.length > 0 && (
            <Card padding="lg">
              <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-red-600">
                <FileWarning size={15} /> Linhas com erro (não serão importadas)
              </h3>
              <ul className="space-y-1.5 text-sm">
                {invalidas.map((l) => (
                  <li key={l.linha} className="border-b border-stone-100 pb-1.5 last:border-0">
                    <span className="font-semibold text-stone-700">Linha {l.linha}:</span>{" "}
                    <span className="text-red-600">{l.erros.join("; ")}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {validas.length > 0 && (
            <Card padding="none" className="overflow-hidden">
              <div className="border-b border-stone-100 px-4 py-3">
                <h3 className="text-sm font-semibold text-stone-700">Pré-visualização</h3>
              </div>
              <div className="max-h-96 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-stone-50 text-left text-xs uppercase tracking-wide text-stone-400">
                    <tr>
                      <th className="px-4 py-2">Nome</th>
                      <th className="px-4 py-2">Tipo</th>
                      <th className="px-4 py-2">Tempo</th>
                      <th className="px-4 py-2">Ingr.</th>
                      <th className="px-4 py-2">Avisos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {validas.map((l) => (
                      <tr key={l.linha} className="border-t border-stone-100">
                        <td className="px-4 py-2 font-medium text-stone-800">{l.receita!.nome}</td>
                        <td className="px-4 py-2 text-stone-500">{l.receita!.tipoRefeicao}</td>
                        <td className="px-4 py-2 text-stone-500">
                          {l.receita!.tempoPreparoMin} min
                        </td>
                        <td className="px-4 py-2 text-stone-500">
                          {l.receita!.ingredientes.length}
                        </td>
                        <td
                          className={cn(
                            "px-4 py-2 text-xs",
                            l.avisos.length ? "text-amber-700" : "text-stone-300"
                          )}
                        >
                          {l.avisos.length ? (
                            <span className="flex items-start gap-1">
                              <TriangleAlert size={12} className="mt-0.5 shrink-0" />
                              {l.avisos.join("; ")}
                            </span>
                          ) : (
                            "—"
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          <div className="flex gap-2">
            <Button onClick={confirmar} disabled={salvando || validas.length === 0} size="lg">
              {salvando
                ? "Importando..."
                : `Importar ${validas.length} ${validas.length === 1 ? "receita" : "receitas"}`}
            </Button>
            <Button onClick={recomecar} variant="ghost" size="lg">
              Cancelar
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
