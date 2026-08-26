import bcrypt from "bcryptjs";
import { z } from "zod";

/**
 * Politica de senha, num lugar so.
 *
 * Antes cada tela repetia `min(6)` — quatro copias que iam divergir na
 * primeira mudanca. E seis caracteres nao passa numa revisao de loja de
 * aplicativo nem protege ninguem: as senhas realmente usadas no Brasil com
 * seis digitos sao data de nascimento e sequencia de teclado.
 *
 * As regras aqui seguem a linha do NIST SP 800-63B, que e o que as diretrizes
 * modernas recomendam: exigir COMPRIMENTO e barrar senha sabidamente comum,
 * em vez de obrigar simbolo e numero — obrigacao de simbolo produz
 * "Senha@123" e um post-it no monitor.
 */

export const MINIMO = 8;
/** bcrypt tem teto proprio em 72 bytes; cortar antes evita erro silencioso. */
export const MAXIMO = 72;

/**
 * Custo do bcrypt.
 *
 * 12 em vez de 10: cada ponto dobra o trabalho de quem tentar quebrar um
 * vazamento de hashes offline. O custo para nos e alguns milissegundos por
 * login, uma vez.
 */
export const CUSTO_BCRYPT = 12;

/**
 * Senhas que aparecem no topo de qualquer vazamento brasileiro.
 *
 * Lista curta de proposito: ela existe para pegar o caso obvio, nao para ser
 * um banco de dados. Comparacao normalizada, entao "Senha123" tambem cai.
 */
const PROIBIDAS = new Set([
  "12345678",
  "123456789",
  "1234567890",
  "senha123",
  "password",
  "password1",
  "qwertyui",
  "abc12345",
  "11111111",
  "00000000",
  "pratinhofeliz",
  "brasil123",
  "familia123",
  "mudar123",
  "teste123",
  "admin123",
]);

export type Veredito = { ok: true } | { ok: false; erro: string };

export function avaliarSenha(bruta: string, contexto: { nome?: string; email?: string } = {}): Veredito {
  const senha = bruta.trim();

  if (senha.length < MINIMO) {
    return { ok: false, erro: `A senha precisa ter ao menos ${MINIMO} caracteres.` };
  }
  if (senha.length > MAXIMO) {
    return { ok: false, erro: `A senha pode ter no máximo ${MAXIMO} caracteres.` };
  }

  const normalizada = senha.toLowerCase();

  if (PROIBIDAS.has(normalizada)) {
    return { ok: false, erro: "Essa senha é muito comum. Escolha outra." };
  }

  // Um caractere repetido do começo ao fim, ou uma sequência do teclado.
  if (/^(.)\1+$/.test(senha)) {
    return { ok: false, erro: "Essa senha é fácil demais de adivinhar. Escolha outra." };
  }
  if (normalizada.includes("12345678") || normalizada.includes("qwerty")) {
    return { ok: false, erro: "Essa senha é fácil demais de adivinhar. Escolha outra." };
  }

  // A senha não pode ser o próprio e-mail ou o próprio nome: é a primeira
  // coisa que alguém tenta, e é o que mais aparece em suporte.
  const usuarioDoEmail = contexto.email?.split("@")[0]?.toLowerCase();
  if (usuarioDoEmail && usuarioDoEmail.length >= 4 && normalizada.includes(usuarioDoEmail)) {
    return { ok: false, erro: "A senha não pode conter o seu e-mail." };
  }
  const primeiroNome = contexto.nome?.trim().split(/\s+/)[0]?.toLowerCase();
  if (primeiroNome && primeiroNome.length >= 4 && normalizada === primeiroNome) {
    return { ok: false, erro: "A senha não pode ser o seu nome." };
  }

  return { ok: true };
}

/** Campo Zod reutilizavel. As regras de conteudo rodam depois, com contexto. */
export const campoSenha = z
  .string()
  .min(MINIMO, `A senha precisa ter ao menos ${MINIMO} caracteres.`)
  .max(MAXIMO, `A senha pode ter no máximo ${MAXIMO} caracteres.`);

export function gerarHash(senha: string): Promise<string> {
  return bcrypt.hash(senha, CUSTO_BCRYPT);
}
