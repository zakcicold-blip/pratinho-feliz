import Link from "next/link";
import { ArrowRight, MousePointerClick, UserPlus, Wallet, XCircle } from "lucide-react";
import { db } from "@/lib/db";
import { requireParceira, baseDoSite } from "@/lib/parceiraSessao";
import { mesDe, reais, resumirParceira } from "@/lib/parceiras";
import CopiarLink from "./CopiarLink";

/**
 * O painel.
 *
 * Responde as quatro perguntas que a parceira faz toda semana, nessa ordem:
 * quantas pessoas clicaram, quantas criaram conta, quantas estao pagando e
 * quanto ela recebe este mes. O resto e detalhe e mora nas outras abas.
 */
export const dynamic = "force-dynamic";

export default async function PainelParceiraPage() {
  const { parceira } = await requireParceira();
  const mes = mesDe(new Date());

  const [resumo, base, primeiroLink] = await Promise.all([
    resumirParceira(parceira.id, mes),
    baseDoSite(),
    db.linkParceira.findFirst({
      where: { parceiraId: parceira.id, revogadoEm: null },
      orderBy: { createdAt: "asc" },
      select: { slug: true, rotulo: true },
    }),
  ]);

  const conversao =
    resumo.cliques > 0 ? Math.round((resumo.indicacoes / resumo.cliques) * 100) : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-stone-800">Olá, {parceira.nome}</h1>
        <p className="mt-1 text-sm text-stone-500">
          Seus números de <span className="capitalize">{mes.rotulo}</span>. Sua comissão é de{" "}
          {parceira.comissaoPct.toString().replace(".", ",")}% sobre cada pagamento confirmado de
          quem entrou pelo seu link — inclusive nas renovações dos meses seguintes.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Cartao
          icone={<MousePointerClick size={16} />}
          rotulo="Cliques nos links"
          valor={String(resumo.cliques)}
          detalhe={conversao !== null ? `${conversao}% viraram cadastro` : "desde o início"}
        />
        <Cartao
          icone={<UserPlus size={16} />}
          rotulo="Pessoas indicadas"
          valor={String(resumo.indicacoes)}
          detalhe={`${resumo.emTeste} ainda sem assinar`}
        />
        <Cartao
          icone={<Wallet size={16} />}
          rotulo="Assinantes ativos"
          valor={String(resumo.ativos)}
          detalhe="pagando agora"
          destaque
        />
        <Cartao
          icone={<XCircle size={16} />}
          rotulo="Cancelamentos"
          valor={String(resumo.cancelados)}
          detalhe="desde o início"
        />
      </div>

      <div className="rounded-2xl border border-orange-200/70 bg-orange-50/60 p-6">
        <div className="text-xs font-semibold uppercase tracking-wide text-orange-700">
          A receber por {mes.rotulo}
        </div>
        <div className="mt-1 text-3xl font-extrabold text-stone-900">
          {reais(resumo.comissaoPeriodo)}
        </div>
        <p className="mt-2 text-sm leading-relaxed text-stone-600">
          De {reais(resumo.brutoPeriodo)} em {resumo.pagamentosPeriodo}{" "}
          {resumo.pagamentosPeriodo === 1 ? "pagamento confirmado" : "pagamentos confirmados"} neste
          mês. Acumulado desde o início: {reais(resumo.comissaoTotal)}.
        </p>
        <p className="mt-2 text-xs leading-relaxed text-stone-500">
          O valor sobe quando um pagamento é confirmado e desce se houver estorno ou contestação.
          Cancelamento não retira o que já foi pago — apenas interrompe as próximas renovações.
        </p>
        <Link
          href="/parceira/pagamentos"
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-orange-600 hover:text-orange-700"
        >
          Ver como o repasse funciona <ArrowRight size={14} />
        </Link>
      </div>

      <div className="rounded-2xl border border-stone-200/70 bg-white p-6 shadow-card">
        <h2 className="font-semibold text-stone-800">Seu link</h2>
        {primeiroLink ? (
          <>
            <p className="mt-1 text-sm text-stone-500">
              {primeiroLink.rotulo} — cole na bio, no story ou mande direto.
            </p>
            <div className="mt-3">
              <CopiarLink url={`${base}/p/${primeiroLink.slug}`} />
            </div>
            <Link
              href="/parceira/links"
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-stone-500 hover:text-stone-700"
            >
              Criar outro link ou ver o desempenho de cada um <ArrowRight size={14} />
            </Link>
          </>
        ) : (
          <>
            <p className="mt-1 text-sm text-stone-500">
              Você ainda não criou nenhum link. É por ele que sabemos quem chegou por você.
            </p>
            <Link
              href="/parceira/links"
              className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600"
            >
              Criar meu primeiro link <ArrowRight size={14} />
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

function Cartao({
  icone,
  rotulo,
  valor,
  detalhe,
  destaque = false,
}: {
  icone: React.ReactNode;
  rotulo: string;
  valor: string;
  detalhe: string;
  destaque?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-stone-200/70 bg-white p-5 shadow-card">
      <span
        className={`flex h-8 w-8 items-center justify-center rounded-xl ${
          destaque ? "bg-orange-50 text-orange-600" : "bg-stone-100 text-stone-500"
        }`}
      >
        {icone}
      </span>
      <div className="mt-3 text-xs font-semibold uppercase tracking-wide text-stone-400">
        {rotulo}
      </div>
      <div className="text-2xl font-extrabold text-stone-900">{valor}</div>
      <div className="mt-0.5 text-xs text-stone-400">{detalhe}</div>
    </div>
  );
}
