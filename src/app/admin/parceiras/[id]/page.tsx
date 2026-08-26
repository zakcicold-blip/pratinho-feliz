import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Eye } from "lucide-react";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";
import { baseDoSite } from "@/lib/parceiraSessao";
import Resumo from "@/app/parceira/_visao/Resumo";
import Links from "@/app/parceira/_visao/Links";
import Indicacoes from "@/app/parceira/_visao/Indicacoes";
import Extrato from "@/app/parceira/_visao/Extrato";

/**
 * A tela da parceira, vista pelo admin.
 *
 * Existe para o suporte: quando ela escreve "nao esta aparecendo nada", a
 * unica resposta util e olhar exatamente o que ela olha. Trocar de conta a
 * cada duvida e o caminho que ninguem percorre — e a duvida fica sem resposta.
 *
 * Sao os MESMOS componentes de /parceira, nao uma copia. Copia comeca igual e
 * termina diferente, e uma previa que mostra outra coisa e pior do que
 * nenhuma previa.
 *
 * `somenteLeitura` desliga tudo que escreve. Ver e suporte; mexer no link de
 * alguem sem que ela saiba e o tipo de coisa que quebra uma parceria.
 */
export const dynamic = "force-dynamic";

export default async function PreviaParceiraPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const [parceira, base] = await Promise.all([
    db.parceira.findUnique({
      where: { id },
      select: {
        id: true,
        nome: true,
        codigo: true,
        comissaoPct: true,
        ativa: true,
        user: { select: { email: true } },
      },
    }),
    baseDoSite(),
  ]);

  if (!parceira) notFound();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/admin/parceiras"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-500 hover:text-stone-700"
        >
          <ArrowLeft size={15} /> Parceiras
        </Link>
        <Link
          href={`${base}/p/${parceira.codigo}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-stone-400 hover:text-stone-600"
        >
          /p/{parceira.codigo}
        </Link>
      </div>

      <div className="flex items-start gap-3 rounded-2xl border border-orange-200 bg-orange-50 p-4">
        <Eye size={18} className="mt-0.5 shrink-0 text-orange-600" />
        <div className="text-sm leading-relaxed text-stone-700">
          <p className="font-semibold text-stone-900">
            Você está vendo o painel de {parceira.nome} exatamente como ela vê.
          </p>
          <p className="mt-0.5 text-stone-600">
            {parceira.user.email} · comissão de{" "}
            {parceira.comissaoPct.toString().replace(".", ",")}% ·{" "}
            {parceira.ativa ? "parceria ativa" : "parceria pausada"}
          </p>
          <p className="mt-1 text-xs text-stone-500">
            Prévia somente leitura: os botões de criar link, desligar link e salvar chave PIX não
            aparecem aqui. Ela mesma faz isso no painel dela.
          </p>
        </div>
      </div>

      <Bloco titulo="Painel">
        <Resumo parceira={parceira} base={base} somenteLeitura />
      </Bloco>

      <Bloco titulo="Meus links">
        <Links parceira={parceira} base={base} somenteLeitura />
      </Bloco>

      <Bloco titulo="Indicações">
        <Indicacoes parceira={parceira} base={base} somenteLeitura />
      </Bloco>

      <Bloco titulo="Pagamentos">
        <Extrato parceira={parceira} base={base} somenteLeitura />
      </Bloco>
    </div>
  );
}

function Bloco({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-stone-400">
        {titulo}
      </h2>
      {children}
    </section>
  );
}
