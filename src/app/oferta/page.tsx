import { redirect } from "next/navigation";

/**
 * A pagina de oferta virou a home.
 *
 * Este redirecionamento existe para os links ja publicados — anuncios, posts,
 * mensagens enviadas — continuarem funcionando, e para nao ficarem duas URLs
 * com o mesmo conteudo disputando a mesma busca no Google.
 */
export default function OfertaRedirect() {
  redirect("/");
}
