import { baseDoSite, requireParceira } from "@/lib/parceiraSessao";
import Resumo from "./_visao/Resumo";

export const dynamic = "force-dynamic";

export default async function PainelParceiraPage() {
  const [{ parceira }, base] = await Promise.all([requireParceira(), baseDoSite()]);
  return <Resumo parceira={parceira} base={base} />;
}
