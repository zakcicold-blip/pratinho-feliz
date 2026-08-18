import Link from "next/link";
import { getCurrentChild } from "@/lib/currentChild";
import { db } from "@/lib/db";
import { CATEGORIA_INGREDIENTE_ORDEM } from "@/lib/constants";
import TopBar from "@/components/TopBar";
import PerfilForm from "./PerfilForm";
import { ChartColumn, Sparkles, ShoppingCart, Settings } from "lucide-react";

export default async function PerfilPage() {
  const { child } = await getCurrentChild();

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
        <div className="mb-5 grid grid-cols-4 gap-2">
          <QuickLink href="/relatorio" label="Relatório" Icon={ChartColumn} />
          <QuickLink href="/descobertas" label="Descobertas" Icon={Sparkles} />
          <QuickLink href="/compras" label="Compras" Icon={ShoppingCart} />
          <QuickLink href="/configuracoes" label="Ajustes" Icon={Settings} />
        </div>

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
      className="flex flex-col items-center gap-1 rounded-xl border border-stone-200 bg-white py-2.5 text-center"
    >
      <Icon size={17} className="text-orange-500" />
      <span className="text-[11px] font-medium text-stone-600">{label}</span>
    </Link>
  );
}
