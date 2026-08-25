import { Lock } from "lucide-react";
import Link from "next/link";

/**
 * Lugar do modo cozinha no plano gratuito.
 *
 * Fica no mesmo ponto da tela, com o mesmo peso visual — a pessoa precisa ver
 * que existe. O detalhe do que e e por que vale fica na tela de bloqueio, uma
 * navegacao adiante, para nao transformar a receita num anuncio.
 */
export default function ModoCozinhaBloqueado() {
  return (
    <Link
      href="/assinar"
      className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-orange-300 bg-orange-50/60 py-3 text-sm font-semibold text-orange-700 transition hover:bg-orange-50"
    >
      <Lock size={15} /> Modo cozinha — liberar
    </Link>
  );
}
