import { redirect } from "next/navigation";
import { getConta } from "@/lib/currentChild";
import { liberaAcesso } from "@/lib/assinatura";
import BottomNav from "@/components/BottomNav";
import HeatOptOut from "@/components/HeatOptOut";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  // Uma consulta so, memoizada por requisicao: as paginas dentro deste layout
  // reaproveitam a mesma conta em vez de consultar sessao, assinatura e
  // perfil de novo.
  const { conta } = await getConta();

  // Paywall: sem teste/assinatura ativos, o app inteiro fica atras de /assinar.
  if (!liberaAcesso(conta.subscription)) {
    redirect("/assinar");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <HeatOptOut />
      <div className="mx-auto w-full max-w-2xl flex-1 pb-4">{children}</div>
      <BottomNav />
    </div>
  );
}
