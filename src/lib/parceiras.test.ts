import { describe, expect, it } from "vitest";
import { codigoValido, mascararEmail, mesDe, normalizarCodigo, primeiroNome } from "./parceiras";

describe("normalizarCodigo", () => {
  it("tira acento, espaço e maiúscula", () => {
    expect(normalizarCodigo("Nutri Ação Materna")).toBe("nutri-acao-materna");
  });

  it("não deixa hífen sobrando nas pontas nem repetido", () => {
    expect(normalizarCodigo("  -- olá   mundo -- ")).toBe("ola-mundo");
  });

  it("descarta caractere que não cabe numa URL", () => {
    expect(normalizarCodigo("maria@insta/2026")).toBe("maria-insta-2026");
  });
});

describe("codigoValido", () => {
  it("recusa código curto demais para ser um link", () => {
    expect(codigoValido("ab").ok).toBe(false);
  });

  /** Um link /p/admin passaria por página oficial e colidiria com a rota. */
  it("recusa código reservado do sistema", () => {
    expect(codigoValido("admin").ok).toBe(false);
    expect(codigoValido("checkout").ok).toBe(false);
  });

  it("aceita um código comum", () => {
    expect(codigoValido("marina-nutri").ok).toBe(true);
  });
});

describe("privacidade da lista de indicados", () => {
  /**
   * A parceira precisa saber QUANTAS pessoas vieram, nao QUEM sao: entregar
   * nome completo e e-mail de terceiro seria compartilhar dado pessoal sem
   * base legal.
   */
  it("mostra só o primeiro nome", () => {
    expect(primeiroNome("Ana Paula de Souza")).toBe("Ana");
  });

  it("mascara o e-mail mantendo o domínio", () => {
    const m = mascararEmail("anapaula@gmail.com");
    expect(m.startsWith("an")).toBe(true);
    expect(m.endsWith("@gmail.com")).toBe(true);
    expect(m).not.toContain("anapaula");
  });

  it("não quebra com e-mail malformado", () => {
    expect(mascararEmail("semarroba")).toBe("—");
  });
});

describe("mesDe", () => {
  it("pega o mês inteiro, do dia 1 ao último instante do último dia", () => {
    const m = mesDe(new Date("2026-02-14T12:00:00Z"));
    expect(m.de.toISOString()).toBe("2026-02-01T00:00:00.000Z");
    expect(m.ate.toISOString()).toBe("2026-02-28T23:59:59.999Z");
  });

  it("acerta o fim de mês de 31 dias", () => {
    expect(mesDe(new Date("2026-08-26T12:00:00Z")).ate.toISOString()).toBe(
      "2026-08-31T23:59:59.999Z",
    );
  });
});

/* --------------------------------------------------------------- comissão -- */

import { vi } from "vitest";
import { resumirParceira } from "./parceiras";

/**
 * O cálculo de comissão é a única parte deste arquivo que mexe com dinheiro,
 * então vale prendê-lo com o banco fingido em vez de confiar na leitura.
 */
vi.mock("@/lib/db", () => ({
  db: {
    indicacao: { findMany: vi.fn() },
    linkParceira: { findMany: vi.fn() },
    compraCakto: { findMany: vi.fn() },
  },
}));

const { db } = await import("@/lib/db");

const MES = { de: new Date("2026-08-01T00:00:00Z"), ate: new Date("2026-08-31T23:59:59Z") };

function prepararBanco(opcoes: {
  indicacoes: { userId: string; comissaoPct: number; status?: string; cortesia?: boolean }[];
  compras: { userId: string; evento: string; valor: number; createdAt: string }[];
  cliques?: number;
}) {
  vi.mocked(db.indicacao.findMany).mockResolvedValue(
    opcoes.indicacoes.map((i) => ({
      userId: i.userId,
      comissaoPct: i.comissaoPct,
      user: {
        subscription: i.status
          ? { status: i.status, acessoCortesia: i.cortesia ?? false }
          : null,
      },
    })) as never,
  );
  vi.mocked(db.linkParceira.findMany).mockResolvedValue([
    { cliques: opcoes.cliques ?? 0 },
  ] as never);
  vi.mocked(db.compraCakto.findMany).mockResolvedValue(
    opcoes.compras.map((c) => ({ ...c, createdAt: new Date(c.createdAt) })) as never,
  );
}

describe("resumirParceira", () => {
  it("aplica o percentual de cada indicação sobre o que foi pago", async () => {
    prepararBanco({
      cliques: 100,
      indicacoes: [
        { userId: "u1", comissaoPct: 30, status: "ATIVA" },
        { userId: "u2", comissaoPct: 30, status: "ATIVA" },
      ],
      compras: [
        { userId: "u1", evento: "purchase_approved", valor: 29.9, createdAt: "2026-08-05" },
        { userId: "u2", evento: "purchase_approved", valor: 29.9, createdAt: "2026-08-09" },
      ],
    });

    const r = await resumirParceira("p1", MES);
    expect(r.comissaoPeriodo).toBe(17.94); // 2 × 29,90 × 30%
    expect(r.brutoPeriodo).toBe(59.8);
    expect(r.pagamentosPeriodo).toBe(2);
    expect(r.ativos).toBe(2);
  });

  /**
   * O percentual fica congelado na indicação. Renegociar para 40% não pode
   * reprecificar o que já foi indicado a 30%.
   */
  it("respeita o percentual congelado de cada indicação", async () => {
    prepararBanco({
      indicacoes: [
        { userId: "antiga", comissaoPct: 20, status: "ATIVA" },
        { userId: "nova", comissaoPct: 40, status: "ATIVA" },
      ],
      compras: [
        { userId: "antiga", evento: "purchase_approved", valor: 100, createdAt: "2026-08-05" },
        { userId: "nova", evento: "purchase_approved", valor: 100, createdAt: "2026-08-05" },
      ],
    });

    expect((await resumirParceira("p1", MES)).comissaoPeriodo).toBe(60);
  });

  it("desconta estorno e chargeback", async () => {
    prepararBanco({
      indicacoes: [{ userId: "u1", comissaoPct: 50, status: "CANCELADA" }],
      compras: [
        { userId: "u1", evento: "purchase_approved", valor: 100, createdAt: "2026-08-02" },
        { userId: "u1", evento: "refund", valor: 100, createdAt: "2026-08-20" },
      ],
    });

    const r = await resumirParceira("p1", MES);
    expect(r.comissaoPeriodo).toBe(0);
    expect(r.comissaoTotal).toBe(0);
  });

  /**
   * Cancelar não estorna: a pessoa usou os meses que pagou. Descontar aqui
   * seria cobrar da parceira um trabalho que ela já entregou.
   */
  it("cancelamento não retira a comissão já paga", async () => {
    prepararBanco({
      indicacoes: [{ userId: "u1", comissaoPct: 30, status: "CANCELADA" }],
      compras: [
        { userId: "u1", evento: "purchase_approved", valor: 100, createdAt: "2026-08-02" },
        { userId: "u1", evento: "subscription_canceled", valor: 100, createdAt: "2026-08-25" },
      ],
    });

    const r = await resumirParceira("p1", MES);
    expect(r.comissaoPeriodo).toBe(30);
    expect(r.cancelados).toBe(1);
  });

  it("não conta pagamento de fora do mês no valor do mês", async () => {
    prepararBanco({
      indicacoes: [{ userId: "u1", comissaoPct: 30, status: "ATIVA" }],
      compras: [
        { userId: "u1", evento: "purchase_approved", valor: 100, createdAt: "2026-07-15" },
        { userId: "u1", evento: "subscription_renewed", valor: 100, createdAt: "2026-08-15" },
      ],
    });

    const r = await resumirParceira("p1", MES);
    expect(r.comissaoPeriodo).toBe(30);
    expect(r.comissaoTotal).toBe(60);
  });

  /** Cortesia não gera pagamento — não pode aparecer como receita. */
  it("conta cortesia como ativa, mas sem comissão", async () => {
    prepararBanco({
      indicacoes: [{ userId: "u1", comissaoPct: 30, status: "TESTE", cortesia: true }],
      compras: [],
    });

    const r = await resumirParceira("p1", MES);
    expect(r.ativos).toBe(1);
    expect(r.comissaoPeriodo).toBe(0);
  });

  it("ignora compra de quem não é indicado dela", async () => {
    prepararBanco({
      indicacoes: [{ userId: "u1", comissaoPct: 30, status: "ATIVA" }],
      compras: [{ userId: "estranho", evento: "purchase_approved", valor: 500, createdAt: "2026-08-05" }],
    });

    expect((await resumirParceira("p1", MES)).comissaoPeriodo).toBe(0);
  });
});
