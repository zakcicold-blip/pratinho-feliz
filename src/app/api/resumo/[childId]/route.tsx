import { ImageResponse } from "next/og";
import { db } from "@/lib/db";
import { auth } from "@/auth";

export const contentType = "image/png";
/** Formato de story: é onde a imagem costuma ser postada. */
export const size = { width: 1080, height: 1350 };

/**
 * Imagem do resumo do ciclo, para a família compartilhar.
 *
 * Só o dono do perfil consegue gerar — a rota checa a sessão. Fica em
 * /api/resumo/[childId] e o botão na tela de relatório baixa o PNG.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ childId: string }> }
) {
  const { childId } = await params;
  const session = await auth();
  if (!session?.user?.id) return new Response("Não autorizado.", { status: 401 });

  const child = await db.childProfile.findUnique({
    where: { id: childId },
    select: { id: true, nome: true, userId: true },
  });
  if (!child || child.userId !== session.user.id) {
    return new Response("Não encontrado.", { status: 404 });
  }

  const plano = await db.mealPlan.findFirst({
    where: { childProfileId: child.id, ativo: true },
    orderBy: { cicloNumero: "desc" },
    select: { id: true, cicloNumero: true },
  });
  if (!plano) return new Response("Sem ciclo ativo.", { status: 404 });

  const [slots, desejados, journeys] = await Promise.all([
    db.mealSlot.findMany({
      where: { mealPlanId: plano.id },
      select: { data: true, recipeId: true, feedback: { select: { estado: true } } },
    }),
    db.foodPreference.findMany({
      where: { childProfileId: child.id, status: "DESEJADA" },
      select: { ingredientId: true },
    }),
    db.foodJourney.findMany({
      where: { childProfileId: child.id },
      select: { ingredientId: true, exposicoes: true, ultimoEstado: true },
    }),
  ]);

  const idsDesejados = new Set(desejados.map((d) => d.ingredientId));
  const relevantes = journeys.filter((j) => idsDesejados.has(j.ingredientId));

  const diasAcompanhados = new Set(
    slots.filter((s) => s.feedback).map((s) => s.data.toISOString())
  ).size;
  const receitasDiferentes = new Set(slots.filter((s) => s.recipeId).map((s) => s.recipeId)).size;
  const apresentados = relevantes.filter((j) => j.exposicoes > 0).length;
  const aceitos = relevantes.filter(
    (j) => j.ultimoEstado === "GOSTOU" || j.ultimoEstado === "ACEITOU"
  ).length;

  const numeros = [
    { valor: apresentados, rotulo: "alimentos novos\napresentados" },
    { valor: aceitos, rotulo: "aceitos por\nele mesmo" },
    { valor: receitasDiferentes, rotulo: "receitas\ndiferentes" },
    { valor: diasAcompanhados, rotulo: "dias\nacompanhados" },
  ];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#fdfaf6",
          padding: 80,
          fontFamily: "sans-serif",
        }}
      >
        {/* Marca */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: "#f97316",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: 30,
              fontWeight: 700,
            }}
          >
            P
          </div>
          <div style={{ fontSize: 30, fontWeight: 700, color: "#292524" }}>Pratinho Feliz</div>
        </div>

        {/* Título */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: 70,
          }}
        >
          <div style={{ fontSize: 30, color: "#f97316", fontWeight: 600 }}>
            Ciclo {plano.cicloNumero} de {child.nome}
          </div>
          <div
            style={{
              fontSize: 68,
              fontWeight: 800,
              color: "#1c1917",
              lineHeight: 1.1,
              marginTop: 14,
            }}
          >
            Um mês de comida
          </div>
          <div style={{ fontSize: 68, fontWeight: 800, color: "#1c1917", lineHeight: 1.1 }}>
            de verdade.
          </div>
        </div>

        {/* Números */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 24,
            marginTop: 70,
          }}
        >
          {numeros.map((n) => (
            <div
              key={n.rotulo}
              style={{
                display: "flex",
                flexDirection: "column",
                width: 428,
                background: "#ffffff",
                border: "1px solid #e8e2da",
                borderRadius: 28,
                padding: 32,
              }}
            >
              <div style={{ fontSize: 84, fontWeight: 800, color: "#f97316", lineHeight: 1 }}>
                {n.valor}
              </div>
              <div
                style={{
                  fontSize: 26,
                  color: "#57534e",
                  marginTop: 12,
                  lineHeight: 1.3,
                  whiteSpace: "pre-wrap",
                }}
              >
                {n.rotulo}
              </div>
            </div>
          ))}
        </div>

        {/* Rodapé */}
        <div
          style={{
            display: "flex",
            marginTop: "auto",
            fontSize: 26,
            color: "#a8a29e",
          }}
        >
          pratinhofeliz.online
        </div>
      </div>
    ),
    size
  );
}
