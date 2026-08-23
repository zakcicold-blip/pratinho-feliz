import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

/**
 * Cliente do Prisma.
 *
 * Com PRISMA_LOG=1 no ambiente, registra cada consulta com a duracao. Serve
 * para achar N+1 e consulta repetida sem precisar adivinhar — foi assim que
 * medimos o custo real de cada tela.
 */
export const db =
  globalForPrisma.prisma ??
  new PrismaClient(
    process.env.PRISMA_LOG === "1"
      ? { log: [{ emit: "event", level: "query" }] }
      : undefined
  );

if (process.env.PRISMA_LOG === "1" && !globalForPrisma.prisma) {
  // @ts-expect-error o tipo do evento so existe quando o log esta ligado
  db.$on("query", (e: { duration: number; query: string }) => {
    const tabela = e.query.match(/(?:FROM|INTO|UPDATE)\s+"public"\."(\w+)"/)?.[1] ?? "?";
    console.log(`[sql ${String(e.duration).padStart(4)}ms] ${tabela}`);
  });
}

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
