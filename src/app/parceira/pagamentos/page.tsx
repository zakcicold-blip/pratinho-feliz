import { db } from "@/lib/db";
import { requireParceira } from "@/lib/parceiraSessao";
import { mesDe, reais, resumirParceira } from "@/lib/parceiras";
import ChavePixForm from "./ChavePixForm";

/**
 * Extrato e repasse.
 *
 * Os seis ultimos meses fechados, calculados na hora a partir dos pagamentos
 * reais. Nada de saldo gravado: saldo gravado e onde um estorno vira
 * divergencia silenciosa entre o que o painel promete e o que existe.
 *
 * O repasse em si e manual, por PIX, e a tela diz isso em voz alta. Prometer
 * automatico e depois pagar na mao e como uma parceria comeca errada.
 */
export const dynamic = "force-dynamic";
export const metadata = { title: "Pagamentos" };

const MESES = 6;

export default async function PagamentosParceiraPage() {
  const { parceira } = await requireParceira();

  const agora = new Date();
  const meses = Array.from({ length: MESES }, (_, i) =>
    mesDe(new Date(Date.UTC(agora.getUTCFullYear(), agora.getUTCMonth() - i, 1))),
  );

  const resumos = await Promise.all(meses.map((m) => resumirParceira(parceira.id, m)));

  const chaveAtual = await db.parceira.findUnique({
    where: { id: parceira.id },
    select: { chavePix: true },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-stone-800">Pagamentos</h1>
        <p className="mt-1 text-sm text-stone-500">
          Sua comissão é de {parceira.comissaoPct.toString().replace(".", ",")}% sobre cada
          pagamento confirmado de quem entrou pelos seus links.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-stone-200/70 bg-white shadow-card">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 text-left text-xs uppercase tracking-wide text-stone-400">
            <tr>
              <th className="px-4 py-3">Mês</th>
              <th className="px-4 py-3">Pagamentos</th>
              <th className="px-4 py-3">Faturamento gerado</th>
              <th className="px-4 py-3 text-right">Sua comissão</th>
            </tr>
          </thead>
          <tbody>
            {meses.map((m, i) => (
              <tr key={m.rotulo} className="border-t border-stone-100">
                <td className="px-4 py-3 capitalize text-stone-700">
                  {m.rotulo}
                  {i === 0 && (
                    <span className="ml-2 text-[11px] font-semibold text-orange-600">em aberto</span>
                  )}
                </td>
                <td className="px-4 py-3 text-stone-500">{resumos[i].pagamentosPeriodo}</td>
                <td className="px-4 py-3 text-stone-500">{reais(resumos[i].brutoPeriodo)}</td>
                <td className="px-4 py-3 text-right font-semibold text-stone-800">
                  {reais(resumos[i].comissaoPeriodo)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-2xl border border-stone-200/70 bg-white p-5 shadow-card">
        <h2 className="font-semibold text-stone-800">Como o repasse acontece</h2>
        <ul className="mt-2 space-y-1.5 text-sm leading-relaxed text-stone-600">
          <li>
            A comissão entra quando o pagamento é <strong>confirmado</strong> pelo meio de
            pagamento, não quando a pessoa cria a conta.
          </li>
          <li>
            Estorno e contestação <strong>descontam</strong> a comissão correspondente — o dinheiro
            voltou para o cliente.
          </li>
          <li>
            Cancelamento <strong>não</strong> retira o que já foi pago. Ele só interrompe as
            renovações seguintes.
          </li>
          <li>
            O mês fecha no último dia e o repasse é feito por PIX até o dia 10 do mês seguinte.
          </li>
        </ul>
      </div>

      <ChavePixForm chaveAtual={chaveAtual?.chavePix ?? ""} />
    </div>
  );
}
