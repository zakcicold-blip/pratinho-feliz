import { describe, expect, it } from "vitest";
import { avaliarSenha, MINIMO } from "./senha";

const erro = (r: ReturnType<typeof avaliarSenha>) => (r.ok ? null : r.erro);

describe("avaliarSenha", () => {
  it("aceita uma senha comum e razoável", () => {
    expect(avaliarSenha("abacaxi com hortelã").ok).toBe(true);
    expect(avaliarSenha("Mel0ncia!").ok).toBe(true);
  });

  it(`recusa abaixo de ${MINIMO} caracteres`, () => {
    expect(erro(avaliarSenha("abc123"))).toMatch(/8 caracteres/);
  });

  /**
   * bcrypt ignora tudo além de 72 bytes. Aceitar mais daria à pessoa a
   * impressão de uma senha longa que na prática está truncada.
   */
  it("recusa acima do teto do bcrypt", () => {
    expect(erro(avaliarSenha("a".repeat(80)))).toMatch(/máximo/);
  });

  it("recusa as senhas que lideram qualquer vazamento", () => {
    expect(avaliarSenha("12345678").ok).toBe(false);
    expect(avaliarSenha("senha123").ok).toBe(false);
    expect(avaliarSenha("SENHA123").ok).toBe(false); // normalizada
  });

  it("recusa caractere repetido e sequência de teclado", () => {
    expect(avaliarSenha("aaaaaaaa").ok).toBe(false);
    expect(avaliarSenha("qwertyuiop").ok).toBe(false);
  });

  it("recusa a senha que é o próprio e-mail", () => {
    const r = avaliarSenha("mariana2026", { email: "mariana@gmail.com" });
    expect(erro(r)).toMatch(/e-mail/);
  });

  it("recusa a senha que é o próprio nome", () => {
    expect(erro(avaliarSenha("mariana", { nome: "Mariana Silva" }))).toBeTruthy();
  });

  /** Nome curto não pode virar uma regra que barra senha boa. */
  it("não confunde nome curto com senha fraca", () => {
    expect(avaliarSenha("ana com farofa", { nome: "Ana" }).ok).toBe(true);
  });
});
