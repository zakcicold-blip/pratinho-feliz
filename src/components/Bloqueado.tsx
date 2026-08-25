import Link from "next/link";
import { Lock, Check } from "lucide-react";
import { getConta } from "@/lib/currentChild";
import { MOTIVO_BLOQUEIO, linkDeUpgrade, type Recurso } from "@/lib/plano";
import { registrarEtapa } from "@/lib/funil";
import BotaoUpgrade from "@/components/BotaoUpgrade";
import { db } from "@/lib/db";

/**
 * O que aparece no lugar de um recurso pago.
 *
 * Mostra o que a pessoa esta perdendo — nao um "acesso negado". A tela de
 * bloqueio e o principal argumento de venda de dentro do app, entao explica o
 * recurso, lista o que vem junto e leva ao checkout com os dados prontos.
 */

const INCLUSO = [
  "Os 30 dias completos do cardápio",
  "Lista de compras da semana",
  "Rotina, modo cozinha e relatório",
  "Trocas de refeição sem limite",
];

export default async function Bloqueado({
  recurso,
  compacto = false,
}: {
  recurso: Recurso;
  compacto?: boolean;
}) {
  const { conta } = await getConta();
  const usuario = await db.user.findUnique({
    where: { id: conta.id },
    select: { name: true, email: true, telefone: true },
  });

  const motivo = MOTIVO_BLOQUEIO[recurso];
  const url = linkDeUpgrade("MENSAL", {
    email: usuario?.email,
    nome: usuario?.name,
    telefone: usuario?.telefone,
  });

  // Marca no funil que a pessoa esbarrou num bloqueio: e o que mostra qual
  // recurso puxa upgrade.
  void registrarEtapa("paywall_visto", { userId: conta.id, path: `bloqueio:${recurso}` });

  if (compacto) {
    return (
      <div className="rounded-3xl border border-orange-200/70 bg-orange-50/50 p-5 text-center">
        <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-orange-500 shadow-sm">
          <Lock size={18} />
        </span>
        <h3 className="mt-3 font-semibold text-stone-800">{motivo.titulo}</h3>
        <p className="mx-auto mt-1 max-w-sm text-sm leading-relaxed text-stone-600">{motivo.texto}</p>
        <div className="mt-4 flex justify-center">
          <BotaoUpgrade url={url} />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-md px-5 py-10">
      <div className="rounded-3xl border border-stone-200/70 bg-white p-6 text-center shadow-card">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
          <Lock size={24} />
        </span>
        <h1 className="font-display mt-4 text-xl font-extrabold text-stone-900">{motivo.titulo}</h1>
        <p className="mt-2 text-sm leading-relaxed text-stone-600">{motivo.texto}</p>

        <ul className="mt-5 space-y-2 rounded-2xl bg-[#fdfaf6] p-4 text-left">
          {INCLUSO.map((item) => (
            <li key={item} className="flex items-start gap-2 text-[13px] leading-snug text-stone-700">
              <Check size={14} className="mt-0.5 shrink-0 text-emerald-500" />
              {item}
            </li>
          ))}
        </ul>

        <div className="mt-5 flex justify-center">
          <BotaoUpgrade url={url} />
        </div>
        <p className="mt-3 text-[11px] text-stone-400">
          Assinatura mensal, cancele quando quiser. Seu cardápio de hoje continua liberado.
        </p>
      </div>

      <p className="mt-5 text-center text-sm">
        <Link href="/hoje" className="font-medium text-stone-500 hover:text-stone-700">
          Voltar para o cardápio de hoje
        </Link>
      </p>
    </div>
  );
}
