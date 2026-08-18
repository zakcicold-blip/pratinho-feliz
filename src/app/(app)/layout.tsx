import { redirect } from "next/navigation";
import { requireSession } from "@/lib/currentChild";
import { podeAcessarApp } from "@/lib/assinatura";
import BottomNav from "@/components/BottomNav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();

  // Paywall: sem teste/assinatura ativos, o app inteiro fica atrás de /assinar.
  if (!(await podeAcessarApp(session.user.id))) {
    redirect("/assinar");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="mx-auto w-full max-w-2xl flex-1 pb-4">{children}</div>
      <BottomNav />
    </div>
  );
}
