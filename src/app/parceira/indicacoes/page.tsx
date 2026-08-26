import { baseDoSite, requireParceira } from "@/lib/parceiraSessao";
import Indicacoes from "../_visao/Indicacoes";

export const dynamic = "force-dynamic";
export const metadata = { title: "Indicações" };

export default async function IndicacoesParceiraPage() {
  const [{ parceira }, base] = await Promise.all([requireParceira(), baseDoSite()]);
  return <Indicacoes parceira={parceira} base={base} />;
}
