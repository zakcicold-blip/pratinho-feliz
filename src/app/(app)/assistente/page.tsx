import { getCurrentChild } from "@/lib/currentChild";
import { assistenteDisponivel } from "@/lib/assistente";
import TopBar from "@/components/TopBar";
import EmptyState from "@/components/ui/EmptyState";
import AssistenteChat from "./AssistenteChat";
import { Sparkles } from "lucide-react";

export const metadata = { title: "Pergunte ao Pratinho" };

export default async function AssistentePage() {
  const { child } = await getCurrentChild();

  if (!assistenteDisponivel()) {
    return (
      <>
        <TopBar title="Pergunte ao Pratinho" back />
        <EmptyState
          icon={Sparkles}
          title="Assistente ainda não disponível"
          description="Estamos finalizando os ajustes. Em breve você poderá tirar dúvidas por aqui."
        />
      </>
    );
  }

  return (
    <>
      <TopBar title="Pergunte ao Pratinho" subtitle="Dúvidas sobre a comida do dia a dia" back />
      <AssistenteChat nomeCrianca={child.nome} />
    </>
  );
}
