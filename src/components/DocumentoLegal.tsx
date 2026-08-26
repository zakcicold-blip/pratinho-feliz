import Link from "next/link";
import { TriangleAlert } from "lucide-react";
import { IDENTIFICACAO, VIGENCIA, pendencias } from "@/lib/identificacao";

/**
 * Casca compartilhada dos documentos legais.
 *
 * Os dois textos precisam da MESMA identificacao do controlador e da mesma
 * data de vigencia — divergir entre termos e politica e o tipo de detalhe que
 * derruba a defesa inteira num questionamento.
 *
 * O aviso de pendencia aparece em desenvolvimento e some quando os dados
 * reais estiverem preenchidos. Ele existe para nao ser publicado um documento
 * dizendo "PENDENTE" onde deveria estar o CNPJ.
 */
export default function DocumentoLegal({
  titulo,
  resumo,
  children,
}: {
  titulo: string;
  resumo: string;
  children: React.ReactNode;
}) {
  const faltando = pendencias();

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-12">
      <Link href="/" className="text-sm text-orange-600 hover:underline">
        ← Voltar
      </Link>

      <h1 className="mt-4 text-3xl font-bold text-stone-900">{titulo}</h1>
      <p className="mt-2 text-sm text-stone-500">
        Vigente desde {VIGENCIA} · {IDENTIFICACAO.produto}
      </p>
      <p className="mt-4 rounded-2xl bg-stone-100 p-4 text-sm leading-relaxed text-stone-600">
        {resumo}
      </p>

      {faltando.length > 0 && (
        <div className="mt-4 flex items-start gap-2.5 rounded-2xl border border-amber-300 bg-amber-50 p-4">
          <TriangleAlert size={18} className="mt-0.5 shrink-0 text-amber-600" />
          <p className="text-sm leading-relaxed text-amber-900">
            <strong>Documento incompleto.</strong> Faltam os dados de identificação do
            responsável: {faltando.join(", ")}. Preencha em{" "}
            <code className="text-xs">src/lib/identificacao.ts</code> antes de publicar nas lojas —
            sem eles o documento não identifica o controlador, que é exigência da LGPD e do CDC.
          </p>
        </div>
      )}

      <article className="documento mt-8 space-y-6 text-[15px] leading-relaxed text-stone-700">
        {children}
      </article>

      <footer className="mt-12 border-t border-stone-200 pt-6 text-sm text-stone-500">
        <p>
          Dúvidas sobre este documento:{" "}
          <a href={`mailto:${IDENTIFICACAO.email}`} className="text-orange-600 hover:underline">
            {IDENTIFICACAO.email}
          </a>
        </p>
        <p className="mt-3 flex gap-4">
          <Link href="/termos" className="hover:text-stone-700">
            Termos de uso
          </Link>
          <Link href="/privacidade" className="hover:text-stone-700">
            Política de privacidade
          </Link>
        </p>
      </footer>
    </main>
  );
}

/** Um item numerado do documento. A numeracao facilita citar em suporte. */
export function Secao({
  numero,
  titulo,
  children,
}: {
  numero: string;
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-bold text-stone-900">
        {numero}. {titulo}
      </h2>
      {children}
    </section>
  );
}

/** Bloco de destaque — usado onde a lei exige clausula destacada. */
export function Destaque({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border-2 border-orange-300 bg-orange-50/70 p-5">{children}</div>
  );
}
