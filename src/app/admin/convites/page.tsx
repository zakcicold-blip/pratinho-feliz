import { headers } from "next/headers";
import { db } from "@/lib/db";
import Badge from "@/components/ui/Badge";
import { avaliarConvite, urlDoConvite } from "@/lib/convites";
import { dataBR } from "@/lib/dates";
import NovoConviteForm from "./NovoConviteForm";
import LinkConvite from "./LinkConvite";
import RevogarConviteButton from "./RevogarConviteButton";

/** Base publica do link — o mesmo host que o admin esta usando agora. */
async function baseDoSite(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "https";
  if (host) return `${proto}://${host}`;
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

function dataCurta(d: Date | null): string {
  return d ? dataBR(d) : "—";
}

export default async function AdminConvitesPage() {
  const [convites, base] = await Promise.all([
    db.conviteCortesia.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        criadoPor: { select: { name: true } },
        assinaturas: { select: { user: { select: { name: true, email: true } } } },
      },
    }),
    baseDoSite(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-stone-800">Convites de cortesia</h1>
        <p className="mt-1 text-sm text-stone-500">
          Quem se cadastrar por um destes links entra sem cartão e sem cobrança — o acesso já vem
          liberado, sem passar pelo paywall.
        </p>
      </div>

      <NovoConviteForm />

      <div className="overflow-hidden rounded-2xl border border-stone-200/70 bg-white shadow-card">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 text-left text-xs uppercase tracking-wide text-stone-400">
            <tr>
              <th className="px-4 py-3">Para quem</th>
              <th className="px-4 py-3">Link</th>
              <th className="px-4 py-3">Usos</th>
              <th className="px-4 py-3">Validade</th>
              <th className="px-4 py-3">Situação</th>
              <th className="px-4 py-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {convites.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-stone-400">
                  Nenhum convite criado ainda.
                </td>
              </tr>
            )}
            {convites.map((c) => {
              const situacao = avaliarConvite(c);
              return (
                <tr key={c.id} className="border-t border-stone-100 align-top hover:bg-stone-50/60">
                  <td className="px-4 py-3">
                    <div className="font-medium text-stone-800">{c.rotulo}</div>
                    {c.motivo && <div className="text-xs text-stone-400">{c.motivo}</div>}
                    <div className="mt-0.5 text-xs text-stone-400">
                      por {c.criadoPor.name} · {dataCurta(c.createdAt)}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <LinkConvite url={urlDoConvite(base, c.token)} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-stone-700">
                      {c.usos} de {c.maxUsos}
                    </div>
                    {c.assinaturas.length > 0 && (
                      <ul className="mt-1 space-y-0.5 text-xs text-stone-400">
                        {c.assinaturas.map((a) => (
                          <li key={a.user.email}>{a.user.name} · {a.user.email}</li>
                        ))}
                      </ul>
                    )}
                  </td>
                  <td className="px-4 py-3 text-stone-500">{dataCurta(c.expiraEm)}</td>
                  <td className="px-4 py-3">
                    {situacao.ok ? (
                      <Badge tone="emerald">Ativo</Badge>
                    ) : (
                      <Badge tone="neutral">
                        {situacao.motivo === "revogado"
                          ? "Revogado"
                          : situacao.motivo === "expirado"
                            ? "Vencido"
                            : "Esgotado"}
                      </Badge>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {!c.revogadoEm && <RevogarConviteButton conviteId={c.id} rotulo={c.rotulo} />}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
