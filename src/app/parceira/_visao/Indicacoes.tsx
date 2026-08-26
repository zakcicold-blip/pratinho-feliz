import { ShieldCheck } from "lucide-react";
import { db } from "@/lib/db";
import { dataBR } from "@/lib/dates";
import { mascararEmail, primeiroNome } from "@/lib/parceiras";
import Badge from "@/components/ui/Badge";
import type { PropsVisao } from "./tipos";

/**
 * Quem veio por ela.
 *
 * A tela mostra QUANTAS pessoas e em que situacao estao — nunca quem sao.
 * Nome completo, e-mail inteiro e telefone dos assinantes nao pertencem a
 * parceira: entregar isso seria compartilhar dado pessoal de terceiro sem
 * base legal (LGPD, Art. 7) e transformaria o painel numa lista de contatos
 * para prospeccao. Primeiro nome e e-mail mascarado bastam para ela
 * reconhecer alguem que escreveu "meu cadastro chegou?".
 */
type Situacao = { rotulo: string; tom: "emerald" | "amber" | "neutral" | "red" };

function situacaoDe(sub: {
  status: string;
  acessoCortesia: boolean;
} | null): Situacao {
  if (!sub) return { rotulo: "Sem assinatura", tom: "neutral" };
  if (sub.acessoCortesia) return { rotulo: "Cortesia", tom: "neutral" };
  if (sub.status === "ATIVA") return { rotulo: "Assinante", tom: "emerald" };
  if (sub.status === "CANCELADA") return { rotulo: "Cancelou", tom: "red" };
  if (sub.status === "CARENCIA") return { rotulo: "Pagamento pendente", tom: "amber" };
  return { rotulo: "Ainda não assinou", tom: "amber" };
}

export default async function Indicacoes({ parceira, somenteLeitura = false }: PropsVisao) {
  const indicacoes = await db.indicacao.findMany({
    where: { parceiraId: parceira.id },
    orderBy: { createdAt: "desc" },
    take: 300,
    select: {
      id: true,
      createdAt: true,
      link: { select: { rotulo: true } },
      // Seleção deliberadamente estreita: só o que a tela pode mostrar.
      // Puxar o objeto inteiro aqui e filtrar no JSX seria o jeito clássico de
      // um dado pessoal acabar vazando pelo HTML do servidor.
      user: {
        select: {
          name: true,
          email: true,
          subscription: { select: { status: true, acessoCortesia: true } },
        },
      },
    },
  });

  return (
    <div className="space-y-6">
      {!somenteLeitura && (
        <div>
          <h1 className="text-xl font-bold text-stone-800">Indicações</h1>
          <p className="mt-1 text-sm text-stone-500">
            Todo mundo que criou conta pelos seus links, na ordem de chegada.
          </p>
        </div>
      )}

      <div className="flex items-start gap-2.5 rounded-2xl border border-stone-200/70 bg-white p-4 text-sm text-stone-600">
        <ShieldCheck size={16} className="mt-0.5 shrink-0 text-stone-400" />
        <p className="leading-relaxed">
          Os nomes aparecem abreviados e os e-mails, parciais. Os dados de quem assina não são
          nossos para repassar — nem para você, nem para ninguém. O que o painel mostra é o
          suficiente para você acompanhar o seu trabalho.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-stone-200/70 bg-white shadow-card">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 text-left text-xs uppercase tracking-wide text-stone-400">
            <tr>
              <th className="px-4 py-3">Pessoa</th>
              <th className="px-4 py-3">Veio por</th>
              <th className="px-4 py-3">Entrou em</th>
              <th className="px-4 py-3">Situação</th>
            </tr>
          </thead>
          <tbody>
            {indicacoes.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-stone-400">
                  Nenhuma indicação ainda. Divulgue seu link e elas aparecem aqui.
                </td>
              </tr>
            )}
            {indicacoes.map((i) => {
              const situacao = situacaoDe(i.user.subscription);
              return (
                <tr key={i.id} className="border-t border-stone-100">
                  <td className="px-4 py-3">
                    <div className="font-medium text-stone-800">{primeiroNome(i.user.name)}</div>
                    <div className="text-xs text-stone-400">{mascararEmail(i.user.email)}</div>
                  </td>
                  <td className="px-4 py-3 text-stone-500">{i.link?.rotulo ?? "—"}</td>
                  <td className="px-4 py-3 text-stone-500">{dataBR(i.createdAt)}</td>
                  <td className="px-4 py-3">
                    <Badge tone={situacao.tom}>{situacao.rotulo}</Badge>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {indicacoes.length >= 300 && (
        <p className="text-xs text-stone-400">
          Mostrando as 300 indicações mais recentes.
        </p>
      )}
    </div>
  );
}
