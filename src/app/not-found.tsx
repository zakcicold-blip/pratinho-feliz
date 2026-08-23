import { Compass } from "lucide-react";
import TelaDeAviso, { BotaoPrimario, BotaoSecundario } from "@/components/ui/TelaDeAviso";

export const metadata = { title: "Página não encontrada" };

export default function NaoEncontrado() {
  return (
    <TelaDeAviso
      icon={Compass}
      titulo="Essa página saiu do cardápio"
      texto="O endereço que você abriu não existe mais, ou o link veio quebrado. Nada de errado com a sua conta."
    >
      <BotaoPrimario href="/hoje">Ir para o plano de hoje</BotaoPrimario>
      <BotaoSecundario href="/blog">Ver o blog</BotaoSecundario>
    </TelaDeAviso>
  );
}
