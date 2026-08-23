import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

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
      authorize: async (credentials) => {
        const email = String(credentials?.email ?? "").toLowerCase().trim();
        const password = String(credentials?.password ?? "");
        if (!email || !password) return null;

        const user = await db.user.findUnique({ where: { email } });
        if (!user) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

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
