import Link from "next/link";
import { redirect } from "next/navigation";
import { Check, ShieldCheck, CreditCard, Lock, Sparkles } from "lucide-react";
import { db } from "@/lib/db";
import { getConta } from "@/lib/currentChild";
import { contaPaga, linkDeUpgrade } from "@/lib/plano";
import { registrarEtapa } from "@/lib/funil";
import BotaoUpgrade from "@/components/BotaoUpgrade";
import PreviaDoPlano from "./PreviaDoPlano";

/**
 * Upgrade de dentro do app.
 *
 * Nao e mais um paywall: quem chega aqui ja esta usando o produto e esbarrou
 * em algo fechado. Por isso a tela fala do que abre, nao do que falta pagar —
 * e o teste de 7 dias saiu de cena junto com o Stripe.
 *
 * Os links vao com e-mail e nome ja preenchidos: e assim que o webhook da
 * Cakto reconhece de quem e a compra.
 */
export const metadata = { title: "Liberar o plano completo" };

const BENEFICIOS = [
  "Os 30 dias completos, não só o cardápio de hoje",
  "Lista de compras automática da semana",
  "Rotina: o cardápio se ajusta ao sono e à disposição",
  "Modo cozinha, passo a passo em tela cheia",
  "Trocas de refeição sem limite",
  "Relatório de aceitação e nutrição",
  "Catálogo completo de receitas e papinhas",
  "Vários filhos, cada um com seu plano",
];

export default async function AssinarPage() {
  const { conta } = await getConta();
  if (contaPaga(conta.subscription)) redirect("/hoje");

  const usuario = await db.user.findUnique({
    where: { id: conta.id },
    select: { name: true, email: true, telefone: true },
  });
  const dados = {
    email: usuario?.email,
    nome: usuario?.name,
    telefone: usuario?.telefone,
  };

  void registrarEtapa("paywall_visto", { userId: conta.id, path: "/assinar" });

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-lg flex-col justify-center px-5 py-10">
      <div className="rounded-3xl border border-stone-200/70 bg-white p-6 shadow-card">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-600">
          <Sparkles size={14} /> Plano completo
        </span>

        <h1 className="mt-4 text-2xl font-bold text-stone-800">Abra o mês inteiro</h1>
        <p className="mt-2 text-sm leading-relaxed text-stone-500">
          Seu cardápio de hoje continua liberado de graça. O plano completo abre o resto — e é o
          que economiza o trabalho de todo dia.
        </p>

        <ul className="mt-5 space-y-2.5">
          {BENEFICIOS.map((b) => (
            <li key={b} className="flex items-start gap-2.5 text-sm text-stone-600">
              <Check size={17} className="mt-0.5 shrink-0 text-emerald-500" />
              {b}
            </li>
          ))}
        </ul>

        <div className="mt-6 space-y-2.5">
          <BotaoUpgrade
            url={linkDeUpgrade("MENSAL", dados)}
            plano="MENSAL"
            rotulo="Assinar por R$ 29,90 por mês"
            className="w-full"
          />
          <BotaoUpgrade
            url={linkDeUpgrade("TRIMESTRAL", dados)}
            plano="TRIMESTRAL"
            variante="discreto"
            rotulo="Trimestral — R$ 59,90 (3 meses pelo preço de 2)"
            className="w-full"
          />
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-[11px] text-stone-400">
          <span className="flex items-center gap-1">
            <Lock size={13} /> Conexão criptografada
          </span>
          <span className="flex items-center gap-1">
            <ShieldCheck size={13} /> Processado pela Cakto
          </span>
          <span className="flex items-center gap-1">
            <CreditCard size={13} /> Sem fidelidade
          </span>
        </div>
        <p className="mt-3 text-center text-[11px] leading-snug text-stone-400">
          Use o mesmo e-mail da sua conta no pagamento — é assim que o acesso é liberado
          automaticamente.
        </p>
      </div>

      {/* Lembrete do que ja existe montado do outro lado do upgrade. */}
      <div className="mt-6">
        <p className="mb-2.5 text-center text-[13px] font-medium text-stone-500">
          O que já está montado esperando você:
        </p>
        <PreviaDoPlano userId={conta.id} />
      </div>

      <p className="mt-6 text-center text-sm">
        <Link href="/hoje" className="font-medium text-stone-500 hover:text-stone-700">
          Continuar no plano gratuito
        </Link>
      </p>
    </main>
  );
}
