import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { consumir, ipDaRequisicao, liberar } from "@/lib/rateLimit";

/**
 * Login de desenvolvimento, sem senha.
 *
 * Existe para dar acesso as telas logadas durante o desenvolvimento, sem
 * ninguem precisar digitar credencial. E uma porta dos fundos, entao ela tem
 * DUAS travas independentes e so entra na lista de provedores quando as duas
 * passam:
 *
 *   1. NODE_ENV !== "production" — na Vercel isso e sempre "production",
 *      entao o provedor nem existe no app publicado.
 *   2. DEV_LOGIN === "1" — precisa ser ligado explicitamente no .env local,
 *      que nao vai para o repositorio.
 *
 * Se alguem esquecer a variavel ligada e publicar, a trava 1 segura.
 */
const loginDeDesenvolvimentoLiberado =
  process.env.NODE_ENV !== "production" && process.env.DEV_LOGIN === "1";

const provedorDesenvolvimento = Credentials({
  id: "dev",
  name: "Desenvolvimento",
  credentials: { email: {} },
  authorize: async (credentials) => {
    // Checagem repetida de proposito: se o provedor vazar para producao por
    // engano, ele ainda recusa aqui.
    if (process.env.NODE_ENV === "production" || process.env.DEV_LOGIN !== "1") return null;

    const email = String(credentials?.email ?? "").toLowerCase().trim();
    if (!email) return null;

    const user = await db.user.findUnique({ where: { email } });
    if (!user) return null;

    console.warn(`[dev-login] sessao aberta como ${user.email} sem senha`);
    return { id: user.id, name: user.name, email: user.email, role: user.role };
  },
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      /**
       * O limite de tentativas mora AQUI, e nao na server action de login.
       *
       * A action era o unico lugar protegido, e um teste mostrou o obvio:
       * POST direto em /api/auth/callback/credentials aceita as mesmas
       * credenciais e nunca passa por ela. Seis tentativas erradas seguidas
       * passaram sem encostar em nada.
       *
       * Este authorize e o funil por onde os dois caminhos passam — o
       * formulario do site e qualquer cliente HTTP. E o unico ponto onde a
       * contagem realmente vale.
       */
      authorize: async (credentials) => {
        const email = String(credentials?.email ?? "").toLowerCase().trim();
        const password = String(credentials?.password ?? "");
        if (!email || !password) return null;

        const ip = await ipDaRequisicao();

        // Por e-mail: forca bruta contra UMA conta.
        // Por IP: lista de e-mails vazados testada em sequencia, que passaria
        // pelo primeiro limite sem encostar nele.
        const porEmail = await consumir("login_email", email);
        if (!porEmail.ok) return null;
        const porIp = await consumir("login_ip", ip);
        if (!porIp.ok) return null;

        const user = await db.user.findUnique({ where: { email } });
        if (!user) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        // Acertou: zera a contagem daquele e-mail para que quem so tinha
        // esquecido a senha nao fique preso pelo resto da janela.
        await liberar("login_email", email);

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
    ...(loginDeDesenvolvimentoLiberado ? [provedorDesenvolvimento] : []),
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id as string;
        token.role = (user as { role?: string }).role ?? "RESPONSAVEL";
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as { role?: string }).role = token.role as string;
      }
      return session;
    },
  },
});
