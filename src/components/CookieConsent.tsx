"use client";

import Link from "next/link";
import { Cookie } from "lucide-react";
import { setConsent, useConsent } from "@/lib/consent";

// Só faz sentido pedir consentimento onde há rastreamento configurado (produção).
const TEM_RASTREAMENTO =
  Boolean(process.env.NEXT_PUBLIC_META_PIXEL_ID) ||
  process.env.NEXT_PUBLIC_ENABLE_UTMIFY === "1";

/**
 * Banner de consentimento de cookies (LGPD), fixo no rodapé. Aparece só na
 * primeira visita; depois de escolher, some. Enquanto não há escolha, o
 * rastreamento fica desligado.
 */
export default function CookieConsent() {
  const consent = useConsent();

  // undefined = ainda montando (evita piscar no SSR); só mostra sem escolha feita.
  if (!TEM_RASTREAMENTO || consent === undefined || consent !== null) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] px-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-3">
      <div className="mx-auto max-w-2xl rounded-2xl border border-stone-200 bg-white p-4 shadow-float">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 shrink-0 rounded-xl bg-orange-50 p-2 text-orange-500">
            <Cookie size={18} />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-semibold text-stone-800">A gente usa cookies</h2>
            <p className="mt-1 text-[13px] leading-relaxed text-stone-500">
              Usamos cookies essenciais para o app funcionar e, com a sua permissão, cookies de
              medição (Meta, Utmify) para entender de onde vêm as visitas e melhorar nossos anúncios.
              Você pode recusar os de medição sem perder nenhuma função.
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                onClick={() => setConsent("accepted")}
                className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-orange-600"
              >
                Aceitar
              </button>
              <button
                onClick={() => setConsent("rejected")}
                className="rounded-xl bg-stone-100 px-4 py-2 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-200"
              >
                Recusar medição
              </button>
            </div>
          </div>
        </div>

        {/* Rodapé do banner: info e link para a política. */}
        <div className="mt-3 border-t border-stone-100 pt-2 text-[11px] leading-relaxed text-stone-400">
          Seus dados são tratados conforme a LGPD. Saiba mais na{" "}
          <Link href="/privacidade" className="font-medium text-stone-500 underline-offset-2 hover:underline">
            Política de Privacidade
          </Link>
          . Você pode mudar sua escolha limpando os dados do site.
        </div>
      </div>
    </div>
  );
}
