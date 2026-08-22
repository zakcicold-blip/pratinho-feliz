import Link from "next/link";
import { getCurrentChild } from "@/lib/currentChild";
import { db } from "@/lib/db";
import { addDiasChave, hojeChave } from "@/lib/dates";
import { CATEGORIA_INGREDIENTE_LABEL, CATEGORIA_INGREDIENTE_ORDEM } from "@/lib/constants";
import { agregarCompras, formatarMedida } from "@/lib/compras";
import TopBar from "@/components/TopBar";
import ShoppingItemRow from "./ShoppingItemRow";
import CopiarListaButton from "./CopiarListaButton";
import ItemManualForm from "./ItemManualForm";
import ExtraItemRow from "./ExtraItemRow";
import DespensaLista, { type IngredienteOpcao } from "./DespensaLista";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import ProgressBar from "@/components/ui/ProgressBar";
import { CategoriaIcon } from "@/components/categoryIcons";
import { ShoppingCart, PackageCheck, Home } from "lucide-react";
import { cn } from "@/lib/cn";

type Busca = { semana?: string; aba?: string };

export default async function ComprasPage({
  searchParams,
}: {
  searchParams: Promise<Busca>;
}) {
  const { semana, aba } = await searchParams;
  const { child } = await getCurrentChild();
  const naDespensa = aba === "despensa";

  const plano = await db.mealPlan.findFirst({
    where: { childProfileId: child.id, ativo: true },
    orderBy: { cicloNumero: "desc" },
  });

  if (!plano) {
    return (
      <>
        <TopBar title="Lista de compras" back />
        <EmptyState icon={ShoppingCart} title="Nenhum plano ativo ainda" />
      </>
    );
  }

  const pantryItems = await db.pantryItem.findMany({
    where: { childProfileId: child.id },
    select: { ingredientId: true },
  });
  const pantryIds = new Set(pantryItems.map((p) => p.ingredientId));

  // ---------------------------------------------------------------- despensa
  if (naDespensa) {
    // Todos os ingredientes que aparecem em alguma receita ativa do catálogo.
    const usos = await db.recipeIngredient.findMany({
      where: { recipe: { ativo: true } },
      select: { ingredientId: true, ingredient: { select: { nome: true, categoria: true } } },
    });

    const mapa = new Map<string, IngredienteOpcao>();
    for (const u of usos) {
      const atual = mapa.get(u.ingredientId);
      if (atual) atual.receitas += 1;
      else
        mapa.set(u.ingredientId, {
          id: u.ingredientId,
          nome: u.ingredient.nome,
          categoria: u.ingredient.categoria,
          receitas: 1,
        });
    }

    return (
      <>
        <TopBar title="Lista de compras" subtitle="O que você já tem em casa" back />
        <div className="space-y-4 px-4 py-4">
          <Abas ativa="despensa" semanaIdx={0} />
          <DespensaLista
            childId={child.id}
            ingredientes={[...mapa.values()]}
            selecionadosIniciais={[...pantryIds]}
          />
        </div>
      </>
    );
  }

  // ---------------------------------------------------------------- comprar
  const inicioCiclo = plano.dataInicio;
  const hojeIdx = Math.round((hojeChave().getTime() - inicioCiclo.getTime()) / 86400000);
  const semanaAtualIdx = Math.min(4, Math.max(0, Math.floor(hojeIdx / 7)));

  // "mes" agrega o ciclo inteiro de 30 dias; senão, a semana escolhida.
  const mesInteiro = semana === "mes";
  const semanaIdx = mesInteiro
    ? 0
    : semana
      ? Math.min(4, Math.max(0, Number(semana)))
      : semanaAtualIdx;

  const periodoInicio = mesInteiro ? inicioCiclo : addDiasChave(inicioCiclo, semanaIdx * 7);
  const periodoFim = mesInteiro
    ? addDiasChave(inicioCiclo, 34)
    : addDiasChave(periodoInicio, 6);

  const slots = await db.mealSlot.findMany({
    where: {
      mealPlanId: plano.id,
      data: { gte: periodoInicio, lte: periodoFim },
      status: { not: "FORA_DE_CASA" },
      recipeId: { not: null },
    },
    include: {
      recipe: {
        include: {
          ingredients: {
            include: {
              ingredient: {
                select: {
                  nome: true,
                  categoria: true,
                  unidadeCompra: true,
                  gramasCompra: true,
                  gramasPorUnidade: true,
                  rotuloCompra: true,
                },
              },
            },
          },
        },
      },
    },
  });

  const linhas = slots.flatMap((s) => s.recipe?.ingredients ?? []);
  const itensMap = agregarCompras(linhas, pantryIds);

  const extras = await db.shoppingExtra.findMany({
    where: { childProfileId: child.id, semanaInicio: periodoInicio },
    orderBy: { createdAt: "asc" },
  });

  const checks = await db.shoppingCheck.findMany({
    where: { childProfileId: child.id, semanaInicio: periodoInicio },
  });
  const compradoMap = new Map(checks.map((c) => [c.ingredientId, c.comprado]));
  const quantidadeMap = new Map(checks.map((c) => [c.ingredientId, c.quantidadeComprada]));

  const grupos = CATEGORIA_INGREDIENTE_ORDEM.map((categoria) => ({
    categoria,
    itens: Array.from(itensMap.values())
      .filter((i) => i.categoria === categoria)
      .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR")),
    extras: extras.filter((e) => e.categoria === categoria),
  })).filter((g) => g.itens.length > 0 || g.extras.length > 0);

  // Itens manuais entram na contagem: para a familia, e tudo a mesma lista.
  const totalItens = itensMap.size + extras.length;
  const totalComprados =
    Array.from(itensMap.keys()).filter((id) => compradoMap.get(id)).length +
    extras.filter((e) => e.comprado).length;

  const textoLista = grupos
    .map(
      (g) =>
        `${CATEGORIA_INGREDIENTE_LABEL[g.categoria]}\n` +
        [
          ...g.itens.map((i) => {
            const anotado = quantidadeMap.get(i.ingredientId);
            const texto = anotado != null ? formatarMedida(i.medida, anotado) : i.quantidade;
            return `- ${i.nome} — ${texto}`;
          }),
          ...g.extras.map((e) => `- ${e.nome}${e.quantidade ? ` (${e.quantidade})` : ""}`),
        ].join("\n")
    )
    .join("\n\n");

  return (
    <>
      <TopBar
        title="Lista de compras"
        subtitle={mesInteiro ? "Ciclo completo · 30 dias" : `Semana ${semanaIdx + 1} de 5`}
        back
      />

      <div className="space-y-4 px-4 py-4">
        <Abas ativa="comprar" semanaIdx={semanaIdx} mesInteiro={mesInteiro} />

        {/* Período */}
        <div className="flex items-center justify-between gap-2">
          <div className="scrollbar-none flex gap-1 overflow-x-auto">
            {Array.from({ length: 5 }, (_, i) => i).map((i) => (
              <Link
                key={i}
                href={`/compras?semana=${i}`}
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition",
                  !mesInteiro && i === semanaIdx
                    ? "bg-orange-500 text-white shadow-card"
                    : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                )}
              >
                {i + 1}
              </Link>
            ))}
            <Link
              href="/compras?semana=mes"
              className={cn(
                "flex h-8 shrink-0 items-center justify-center rounded-full px-3 text-sm font-semibold transition",
                mesInteiro
                  ? "bg-orange-500 text-white shadow-card"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              )}
            >
              Mês
            </Link>
          </div>
          {grupos.length > 0 && <CopiarListaButton texto={textoLista} />}
        </div>

        {totalItens > 0 && (
          <Card padding="sm" className="px-4">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 font-semibold text-stone-600">
                <PackageCheck size={14} className="text-emerald-500" /> Comprados
              </span>
              <span className="text-stone-400">
                {totalComprados}/{totalItens}
              </span>
            </div>
            <ProgressBar
              value={totalComprados}
              max={totalItens}
              className="mt-1.5"
              barClassName="bg-emerald-500"
            />
            <p className="mt-2 text-[11px] leading-relaxed text-stone-400">
              Os números em laranja são o que <strong>você pegou</strong>. A sugestão é o total que o plano
              {mesInteiro ? " do ciclo inteiro " : " desta semana "}
              consome, arredondado para cima.
            </p>
          </Card>
        )}

        {grupos.length === 0 ? (
          <EmptyState
            icon={PackageCheck}
            title="Nada para comprar nesse período"
            description="Tudo já está marcado como 'tenho em casa' ou os dias estão como fora de casa."
          />
        ) : (
          <div className="space-y-4">
            {grupos.map((g) => (
              <Card key={g.categoria} padding="sm" className="px-4">
                <h2 className="mb-1 flex items-center gap-1.5 text-xs font-semibold tracking-wide text-stone-400 uppercase">
                  <CategoriaIcon categoria={g.categoria} size={13} />
                  {CATEGORIA_INGREDIENTE_LABEL[g.categoria]}
                </h2>
                <div className="divide-y divide-stone-100">
                  {g.itens.map((item) => (
                    <ShoppingItemRow
                      key={item.ingredientId}
                      childId={child.id}
                      semanaInicioISO={periodoInicio.toISOString()}
                      ingredientId={item.ingredientId}
                      nome={item.nome}
                      sugestao={item.quantidade}
                      sugestaoBase={item.sugestaoBase}
                      medida={item.medida}
                      aproximado={item.aproximado}
                      compradoInicial={compradoMap.get(item.ingredientId) ?? false}
                      quantidadeInicial={quantidadeMap.get(item.ingredientId) ?? null}
                    />
                  ))}
                  {g.extras.map((e) => (
                    <ExtraItemRow
                      key={e.id}
                      extraId={e.id}
                      nome={e.nome}
                      quantidade={e.quantidade}
                      compradoInicial={e.comprado}
                    />
                  ))}
                </div>
              </Card>
            ))}
          </div>
        )}

        <ItemManualForm childId={child.id} semanaInicioISO={periodoInicio.toISOString()} />

        {pantryIds.size > 0 && (
          <Link
            href="/compras?aba=despensa"
            className="flex items-center justify-between gap-3 rounded-2xl border border-stone-200/60 bg-white px-4 py-3 shadow-card transition active:scale-[0.99]"
          >
            <span className="text-sm text-stone-600">
              <strong className="text-stone-900">{pantryIds.size}</strong>{" "}
              {pantryIds.size === 1 ? "item marcado" : "itens marcados"} como já em casa
            </span>
            <span className="shrink-0 text-xs font-semibold text-orange-600">Editar</span>
          </Link>
        )}
      </div>
    </>
  );
}

/** Alterna entre a lista do mercado e a despensa. */
function Abas({
  ativa,
  semanaIdx,
  mesInteiro,
}: {
  ativa: "comprar" | "despensa";
  semanaIdx: number;
  mesInteiro?: boolean;
}) {
  const hrefComprar = mesInteiro ? "/compras?semana=mes" : `/compras?semana=${semanaIdx}`;
  const abas = [
    { id: "comprar" as const, label: "Comprar", href: hrefComprar, Icon: ShoppingCart },
    { id: "despensa" as const, label: "Tenho em casa", href: "/compras?aba=despensa", Icon: Home },
  ];

  return (
    <div className="flex gap-1 rounded-2xl bg-stone-100 p-1">
      {abas.map(({ id, label, href, Icon }) => (
        <Link
          key={id}
          href={href}
          className={cn(
            "flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-[13px] font-semibold transition",
            id === ativa ? "bg-white text-stone-900 shadow-card" : "text-stone-500"
          )}
        >
          <Icon size={14} /> {label}
        </Link>
      ))}
    </div>
  );
}
