import { redirect } from "next/navigation";

/**
 * O cadastro gratuito saiu do funil.
 *
 * Agora a conta nasce do pagamento: a pessoa assina, volta do Stripe em
 * /bem-vindo e cria a senha ali. Esta rota sobrevive só como redirecionamento,
 * para os links ja publicados — posts do blog, anuncios, mensagens — nao
 * caírem em 404 e para ninguem entrar no app sem passar pelo checkout.
 */
export default function CadastroRedirect() {
  redirect("/#planos");
}
