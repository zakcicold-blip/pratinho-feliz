import { baseDoSite, requireParceira } from "@/lib/parceiraSessao";
import Extrato from "../_visao/Extrato";

export const dynamic = "force-dynamic";
export const metadata = { title: "Pagamentos" };

export default async function PagamentosParceiraPage() {
  const [{ parceira }, base] = await Promise.all([requireParceira(), baseDoSite()]);
  return <Extrato parceira={parceira} base={base} />;
}
