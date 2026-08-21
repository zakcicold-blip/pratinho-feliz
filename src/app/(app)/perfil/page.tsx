import Link from "next/link";
import { getCurrentChild, listarCriancas } from "@/lib/currentChild";
import { db } from "@/lib/db";
import { CATEGORIA_INGREDIENTE_ORDEM } from "@/lib/constants";
import TopBar from "@/components/TopBar";
import PerfilForm from "./PerfilForm";
import SeletorCrianca from "./SeletorCrianca";
import { ChartColumn, Sparkles, ShoppingCart, Settings, ShieldCheck, BookOpen, Baby } from "lucide-react";

export default async function PerfilPage() {
  const { session, child } = await getCurrentChild();
  const ehAdmin = (session.user as { role?: string }).role === "ADMIN";
  const criancas = await listarCriancas(session.user.id);

  const ingredientes = await db.ingredient.findMany({ orderBy: { nome: "asc" } });
  const grupos = CATEGORIA_INGREDIENTE_ORDEM.map((categoria) => ({
    categoria,
    itens: ingredientes.filter((i) => i.categoria === categoria),
  })).filter((g) => g.itens.length > 0);

  const preferencias = await db.foodPreference.findMany({ where: { childProfileId: child.id } });
  const porStatus = (status: string) =>
    preferencias.filter((p) => p.status === status).map((p) => p.ingredientId);

  return (
    <>
      <TopBar title={`Perfil de ${child.nome}`} />
      <div className="px-4 py-4">
        <div className="mb-4">
          <SeletorCrianca criancas={criancas} ativaId={child.id} />
        </div>

        <div className="mb-5 grid grid-cols-3 gap-2">
          <QuickLink href="/receitas" label="Receitas" Icon={BookOpen} />
          <QuickLink href="/papinhas" label="Papinhas" Icon={Baby} />
          <QuickLink href="/relatorio" label="Relatório" Icon={ChartColumn} />
          <QuickLink href="/descobertas" label="Descobertas" Icon={Sparkles} />
          <QuickLink href="/compras" label="Compras" Icon={ShoppingCart} />
          <QuickLink href="/configuracoes" label="Ajustes" Icon={Settings} />
        </div>

        {ehAdmin && (
          <Link
            href="/admin"
            className="mb-5 flex items-center justify-center gap-2 rounded-full border border-stone-900 bg-stone-900 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-stone-800"
          >
            <ShieldCheck size={16} /> Painel administrativo
          </Link>
        )}

        <PerfilForm
          child={{
            id: child.id,
            nome: child.nome,
            faixaEtaria: child.faixaEtaria,
            refeicoesPorDia: child.refeicoesPorDia,
            tempoDisponivel: child.tempoDisponivel,
            praticidade: child.praticidade,
            objetivo: child.objetivo,
            equipamentos: child.equipamentos ?? "",
          }}
          grupos={grupos}
          inicial={{
            aceitos: porStatus("ACEITA"),
            recusados: porStatus("RECUSA"),
            desejados: porStatus("DESEJADA"),
            restricoes: porStatus("RESTRICAO"),
          }}
        />
      </div>
    </>
  );
}

function QuickLink({
  href,
  label,
  Icon,
}: {
  href: string;
  label: string;
  Icon: typeof ChartColumn;
}) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center gap-1.5 rounded-2xl border border-stone-200/60 bg-white py-3 text-center shadow-card transition active:scale-95 hover:border-orange-200"
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-50 text-orange-500">
        <Icon size={17} />
      </span>
      <span className="text-[11px] font-medium text-stone-600">{label}</span>
    </Link>
  );
}
