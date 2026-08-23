import { describe, expect, it } from "vitest";
import {
  agregarCompras,
  formatarMedida,
  formatarQuantidadeCompra,
  medirCompra,
  type IngredienteCompra,
} from "@/lib/compras";

/**
 * A lista de compras converte gramas do plano em quantidade de mercado. Um erro
 * de unidade aqui manda a pessoa comprar 10x mais ou 10x menos do que precisa.
 */

const ABACATE: IngredienteCompra = {
  unidadeCompra: "UNIDADE",
  gramasCompra: 200,
  gramasPorUnidade: 200,
  rotuloCompra: null,
};
const ALHO: IngredienteCompra = {
  unidadeCompra: "UNIDADE",
  gramasCompra: 50,
  gramasPorUnidade: 3,
  rotuloCompra: "cabeça",
};
const BROCOLIS: IngredienteCompra = {
  unidadeCompra: "UNIDADE",
  gramasCompra: 400,
  gramasPorUnidade: 90,
  rotuloCompra: "maço",
};
const FRANGO: IngredienteCompra = {
  unidadeCompra: "GRAMAS",
  gramasCompra: null,
  gramasPorUnidade: 100,
  rotuloCompra: null,
};
const LEITE: IngredienteCompra = {
  unidadeCompra: "ML",
  gramasCompra: null,
  gramasPorUnidade: 200,
  rotuloCompra: null,
};
const SEM_REFERENCIA: IngredienteCompra = {
  unidadeCompra: "UNIDADE",
  gramasCompra: null,
  gramasPorUnidade: null,
  rotuloCompra: null,
};

describe("formatarQuantidadeCompra", () => {
  it("conta unidades inteiras e arredonda para cima", () => {
    // 5 abacates de 200 g = 1000 g; 1010 g nao pode virar 5.
    expect(formatarQuantidadeCompra(ABACATE, 1000)).toBe("5 un");
    expect(formatarQuantidadeCompra(ABACATE, 1010)).toBe("6 un");
  });

  it("usa o peso de COMPRA, não o da receita", () => {
    // 6 g de alho sao 2 dentes, mas ninguem compra dente: compra 1 cabeca.
    expect(formatarQuantidadeCompra(ALHO, 6)).toBe("1 cabeça");
    expect(formatarQuantidadeCompra(BROCOLIS, 990)).toBe("3 maços");
  });

  it("pluraliza o rótulo, mas nunca a abreviação un", () => {
    expect(formatarQuantidadeCompra(ALHO, 60)).toBe("2 cabeças");
    expect(formatarQuantidadeCompra(ABACATE, 4000)).toBe("20 un");
  });

  it("passa para kg acima de 1 kg", () => {
    expect(formatarQuantidadeCompra(FRANGO, 580)).toBe("580 g");
    expect(formatarQuantidadeCompra(FRANGO, 2400)).toBe("2,4 kg");
  });

  it("usa ml e L para líquidos, com passo fino em volume pequeno", () => {
    expect(formatarQuantidadeCompra(LEITE, 51)).toBe("60 ml");
    expect(formatarQuantidadeCompra(LEITE, 5750)).toBe("5,8 L");
  });

  it("chama de tempero o que é quantidade insignificante", () => {
    expect(formatarQuantidadeCompra(FRANGO, 2)).toBe("a gosto");
    expect(formatarQuantidadeCompra(FRANGO, 0)).toBe("a gosto");
  });

  it("cai no peso bruto quando falta referência de unidade, sem inventar contagem", () => {
    expect(formatarQuantidadeCompra(SEM_REFERENCIA, 300)).toBe("300 g");
  });
});

describe("medirCompra + formatarMedida (ida e volta do que o usuário digita)", () => {
  it("mantém a unidade ao gravar e reexibir", () => {
    const casos: [IngredienteCompra, number, string, number, string][] = [
      // ingrediente, gramas sugeridas, digitado, base esperada, texto de volta
      [ABACATE, 3430, "10", 10, "10 un"],
      [LEITE, 5750, "2,5", 2500, "2,5 L"],
      [FRANGO, 2400, "1,5", 1500, "1,5 kg"],
      [FRANGO, 580, "300", 300, "300 g"],
      [ALHO, 6, "2", 2, "2 cabeças"],
    ];

    for (const [ing, gramas, digitado, baseEsperada, textoEsperado] of casos) {
      const medida = medirCompra(ing, gramas);
      const base = Number(digitado.replace(",", ".")) * medida.fator;
      expect(base).toBe(baseEsperada);
      expect(formatarMedida(medida, base)).toBe(textoEsperado);
    }
  });
});

describe("agregarCompras", () => {
  const linha = (id: string, gramas: number | null, ing: IngredienteCompra, nome = id) => ({
    ingredientId: id,
    quantidade: "1 unidade",
    gramas,
    ingredient: { nome, categoria: "HORTIFRUTI", ...ing },
  });

  it("soma os usos do mesmo ingrediente", () => {
    const itens = agregarCompras(
      [linha("a", 200, ABACATE), linha("a", 400, ABACATE), linha("a", 100, ABACATE)],
      new Set()
    );
    const item = itens.get("a")!;
    expect(item.gramas).toBe(700);
    expect(item.usos).toBe(3);
    expect(item.quantidade).toBe("4 un");
  });

  it("ignora o que já está na despensa", () => {
    const itens = agregarCompras(
      [linha("a", 200, ABACATE), linha("b", 300, FRANGO)],
      new Set(["a"])
    );
    expect(itens.has("a")).toBe(false);
    expect(itens.has("b")).toBe(true);
  });

  it("marca como aproximado quando algum uso não tem peso convertível", () => {
    const itens = agregarCompras([linha("a", 200, ABACATE), linha("a", null, ABACATE)], new Set());
    expect(itens.get("a")!.aproximado).toBe(true);
  });

  it("não marca aproximado quando todos os usos têm peso", () => {
    const itens = agregarCompras([linha("a", 200, ABACATE), linha("a", 100, ABACATE)], new Set());
    expect(itens.get("a")!.aproximado).toBe(false);
  });

  it("usa a medida do próprio ingrediente, não a do primeiro da lista", () => {
    // Regressao: uma versao anterior pegava a linha errada para formatar.
    const itens = agregarCompras(
      [linha("frango", 2400, FRANGO), linha("alho", 60, ALHO)],
      new Set()
    );
    expect(itens.get("frango")!.quantidade).toBe("2,4 kg");
    expect(itens.get("alho")!.quantidade).toBe("2 cabeças");
  });
});
