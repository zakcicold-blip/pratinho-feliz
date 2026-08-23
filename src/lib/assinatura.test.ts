import { describe, expect, it, vi, beforeEach } from "vitest";

/**
 * O paywall é o ponto de maior consequência financeira do projeto: um erro aqui
 * ou libera o app de graça, ou tranca quem está pagando. Estes testes fixam a
 * regra de acesso e a tradução de status do Stripe.
 */

const findUnique = vi.fn();

vi.mock("@/lib/db", () => ({
  db: { subscription: { findUnique: (...args: unknown[]) => findUnique(...args) } },
}));

// Nao queremos que importar o modulo tente instanciar o Stripe.
vi.mock("@/lib/stripe", () => ({
  getStripe: () => {
    throw new Error("Stripe nao deve ser chamado neste teste.");
  },
  DIAS_TESTE_GRATIS: 7,
}));

const { podeAcessarApp, traduzStatus } = await import("@/lib/assinatura");

type SubFalsa = {
  status: string;
  stripeSubscriptionId?: string | null;
  acessoCortesia?: boolean;
};

function comAssinatura(sub: SubFalsa | null) {
  findUnique.mockResolvedValue(
    sub && {
      acessoCortesia: false,
      stripeSubscriptionId: null,
      ...sub,
    }
  );
}

beforeEach(() => findUnique.mockReset());

describe("podeAcessarApp", () => {
  it("bloqueia quem não tem assinatura nenhuma", async () => {
    comAssinatura(null);
    expect(await podeAcessarApp("u1")).toBe(false);
  });

  it("bloqueia conta recém-criada: status TESTE sem passar pelo Stripe", async () => {
    // Esta é a regra que sustenta o paywall — cadastro novo nasce TESTE.
    comAssinatura({ status: "TESTE", stripeSubscriptionId: null });
    expect(await podeAcessarApp("u1")).toBe(false);
  });

  it("libera TESTE quando existe assinatura real no Stripe", async () => {
    comAssinatura({ status: "TESTE", stripeSubscriptionId: "sub_123" });
    expect(await podeAcessarApp("u1")).toBe(true);
  });

  it("libera ATIVA", async () => {
    comAssinatura({ status: "ATIVA" });
    expect(await podeAcessarApp("u1")).toBe(true);
  });

  it("bloqueia CANCELADA e CARENCIA", async () => {
    comAssinatura({ status: "CANCELADA", stripeSubscriptionId: "sub_123" });
    expect(await podeAcessarApp("u1")).toBe(false);

    comAssinatura({ status: "CARENCIA", stripeSubscriptionId: "sub_123" });
    expect(await podeAcessarApp("u1")).toBe(false);
  });

  it("cortesia passa na frente de qualquer status", async () => {
    comAssinatura({ status: "CANCELADA", acessoCortesia: true });
    expect(await podeAcessarApp("u1")).toBe(true);

    comAssinatura({ status: "TESTE", acessoCortesia: true, stripeSubscriptionId: null });
    expect(await podeAcessarApp("u1")).toBe(true);
  });

  it("cortesia desligada não libera sozinha", async () => {
    comAssinatura({ status: "CARENCIA", acessoCortesia: false });
    expect(await podeAcessarApp("u1")).toBe(false);
  });
});

describe("traduzStatus", () => {
  it("mapeia os status que liberam o app", () => {
    expect(traduzStatus("trialing")).toBe("TESTE");
    expect(traduzStatus("active")).toBe("ATIVA");
  });

  it("mapeia os status que encerram a assinatura", () => {
    expect(traduzStatus("canceled")).toBe("CANCELADA");
    expect(traduzStatus("incomplete_expired")).toBe("CANCELADA");
  });

  it("trata pagamento pendente como carência, nunca como acesso liberado", () => {
    for (const status of ["past_due", "unpaid", "incomplete", "paused"] as const) {
      expect(traduzStatus(status)).toBe("CARENCIA");
    }
  });
});
