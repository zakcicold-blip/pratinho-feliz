import { baseDoSite, requireParceira } from "@/lib/parceiraSessao";
import Links from "../_visao/Links";

export const dynamic = "force-dynamic";
export const metadata = { title: "Meus links" };

export default async function LinksParceiraPage() {
  const [{ parceira }, base] = await Promise.all([requireParceira(), baseDoSite()]);
  return <Links parceira={parceira} base={base} />;
}
