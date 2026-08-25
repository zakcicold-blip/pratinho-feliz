import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { CATEGORIA_INGREDIENTE_ORDEM } from "@/lib/constants";
import OnboardingWizard from "./OnboardingWizard";
import Bloqueado from "@/components/Bloqueado";
import { podeUsar } from "@/lib/plano";

export default async function OnboardingPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [ingredientes, filhosExistentes] = await Promise.all([
    db.ingredient.findMany({ orderBy: { nome: "asc" } }),
    db.childProfile.count({ where: { userId: session.user.id } }),
  ]);
  const porCategoria = CATEGORIA_INGREDIENTE_ORDEM.map((categoria) => ({
    categoria,
    itens: ingredientes.filter((i) => i.categoria === categoria),
  })).filter((g) => g.itens.length > 0);

  // Adicionar OUTRO filho e do plano completo. O primeiro cadastro acontece no
  // modal dentro do app, mas esta rota continua valendo — e para onde
  // getCurrentChild manda quem ainda nao tem crianca, e uma pagina que
  // funciona e melhor do que um redirect que pode virar loop.
  if (filhosExistentes > 0) {
    const assinatura = await db.subscription.findUnique({
      where: { userId: session.user.id },
      select: { status: true, stripeSubscriptionId: true, acessoCortesia: true },
    });
    if (!podeUsar("varios_filhos", assinatura)) return <Bloqueado recurso="varios_filhos" />;
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-2xl px-4 py-8">
      <OnboardingWizard
        grupos={porCategoria}
        userId={session.user.id}
        podeCancelar={filhosExistentes > 0}
      />
    </main>
  );
}
