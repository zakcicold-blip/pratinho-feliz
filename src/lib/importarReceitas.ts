import { TipoRefeicao } from "@prisma/client";

/**
 * Formato aceito na importação em massa. Uma receita por objeto.
 * O mesmo shape vale para JSON (array) e CSV (uma linha por receita).
 */
export type ReceitaImportada = {
  nome: string;
  resumo: string;
  tipoRefeicao: TipoRefeicao;
  tempoPreparoMin: number;
  dificuldade: string;
  rendimento: string;
  /** Passos separados por quebra de linha (JSON) ou por " | " (CSV). */
  passos: string[];
  tags: string[];
  restricoes: string[];
  idadeMinimaMeses: number;
  imagemUrl: string | null;
  fonte: string | null;
  /** "Banana:1 unidade" no CSV; {nome, quantidade} no JSON. */
  ingredientes: { nome: string; quantidade: string }[];
};

export type LinhaValidada = {
  linha: number;
  receita: ReceitaImportada | null;
  erros: string[];
  avisos: string[];
};

const TIPOS_VALIDOS = new Set<string>(Object.values(TipoRefeicao));

const ALIAS_TIPO: Record<string, TipoRefeicao> = {
  "cafe da manha": TipoRefeicao.CAFE_DA_MANHA,
  "café da manhã": TipoRefeicao.CAFE_DA_MANHA,
  cafe: TipoRefeicao.CAFE_DA_MANHA,
  almoco: TipoRefeicao.ALMOCO,
  almoço: TipoRefeicao.ALMOCO,
  lanche: TipoRefeicao.LANCHE,
  jantar: TipoRefeicao.JANTAR,
};

function normalizarTipo(valor: string): TipoRefeicao | null {
  const bruto = (valor ?? "").trim();
  if (!bruto) return null;
  const upper = bruto.toUpperCase().replace(/\s+/g, "_");
  if (TIPOS_VALIDOS.has(upper)) return upper as TipoRefeicao;
  return ALIAS_TIPO[bruto.toLowerCase()] ?? null;
}

function listaDeTexto(valor: unknown, separador = ","): string[] {
  if (Array.isArray(valor)) return valor.map(String).map((s) => s.trim()).filter(Boolean);
  if (typeof valor === "string") {
    return valor
      .split(separador)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

function parseIngredientes(valor: unknown): { nome: string; quantidade: string }[] {
  // JSON: [{ nome, quantidade }]
  if (Array.isArray(valor)) {
    return valor
      .map((item) => {
        if (typeof item === "string") {
          const [nome, ...resto] = item.split(":");
          return { nome: (nome ?? "").trim(), quantidade: resto.join(":").trim() };
        }
        const obj = item as { nome?: unknown; quantidade?: unknown };
        return {
          nome: String(obj?.nome ?? "").trim(),
          quantidade: String(obj?.quantidade ?? "").trim(),
        };
      })
      .filter((i) => i.nome);
  }

  // CSV: "Banana:1 unidade | Aveia:2 colheres de sopa"
  if (typeof valor === "string") {
    return valor
      .split("|")
      .map((par) => {
        const [nome, ...resto] = par.split(":");
        return { nome: (nome ?? "").trim(), quantidade: resto.join(":").trim() };
      })
      .filter((i) => i.nome);
  }

  return [];
}

function parseInteiro(valor: unknown): number | null {
  if (typeof valor === "number") return Number.isFinite(valor) ? Math.trunc(valor) : null;
  const n = Number(String(valor ?? "").replace(",", "."));
  return Number.isFinite(n) ? Math.trunc(n) : null;
}

/**
 * Valida uma receita vinda do arquivo. Nunca lança: devolve os erros
 * para a interface poder mostrar linha a linha antes de gravar nada.
 */
export function validarReceita(bruta: Record<string, unknown>, linha: number): LinhaValidada {
  const erros: string[] = [];
  const avisos: string[] = [];

  const nome = String(bruta.nome ?? "").trim();
  if (!nome) erros.push("nome é obrigatório");
  if (nome.length > 120) erros.push("nome muito longo (máx. 120)");

  const resumo = String(bruta.resumo ?? "").trim();
  if (!resumo) avisos.push("sem resumo");

  const tipoRefeicao = normalizarTipo(String(bruta.tipoRefeicao ?? ""));
  if (!tipoRefeicao) {
    erros.push("tipoRefeicao inválido (use CAFE_DA_MANHA, ALMOCO, LANCHE ou JANTAR)");
  }

  const tempo = parseInteiro(bruta.tempoPreparoMin);
  if (tempo === null || tempo <= 0) erros.push("tempoPreparoMin deve ser um número maior que zero");
  else if (tempo > 240) avisos.push("tempo de preparo acima de 4 h");

  const dificuldadeBruta = String(bruta.dificuldade ?? "").trim();
  const dificuldade = /m[ée]dia/i.test(dificuldadeBruta)
    ? "Média"
    : /f[áa]cil/i.test(dificuldadeBruta)
      ? "Fácil"
      : "";
  if (!dificuldade) erros.push('dificuldade deve ser "Fácil" ou "Média"');

  const rendimento = String(bruta.rendimento ?? "").trim();
  if (!rendimento) erros.push("rendimento é obrigatório (ex.: \"2 porções\")");

  const passos = listaDeTexto(bruta.passos, "|").flatMap((p) =>
    p.split("\n").map((s) => s.trim()).filter(Boolean)
  );
  if (passos.length === 0) erros.push("passos é obrigatório");

  const idade = parseInteiro(bruta.idadeMinimaMeses);
  const idadeMinimaMeses = idade === null ? 8 : idade;
  if (idade === null) avisos.push("idadeMinimaMeses ausente — assumindo 8 meses");
  else if (idade < 6) avisos.push("idade abaixo de 6 meses — confira a indicação");

  const ingredientes = parseIngredientes(bruta.ingredientes);
  if (ingredientes.length === 0) erros.push("ingredientes é obrigatório");
  const semQuantidade = ingredientes.filter((i) => !i.quantidade).map((i) => i.nome);
  if (semQuantidade.length) avisos.push(`sem quantidade: ${semQuantidade.join(", ")}`);

  const imagemBruta = String(bruta.imagemUrl ?? "").trim();
  let imagemUrl: string | null = null;
  if (imagemBruta) {
    if (/^https:\/\//i.test(imagemBruta)) imagemUrl = imagemBruta;
    else erros.push("imagemUrl deve começar com https://");
  }

  if (erros.length > 0) return { linha, receita: null, erros, avisos };

  return {
    linha,
    erros,
    avisos,
    receita: {
      nome,
      resumo,
      tipoRefeicao: tipoRefeicao!,
      tempoPreparoMin: tempo!,
      dificuldade,
      rendimento,
      passos,
      tags: listaDeTexto(bruta.tags),
      restricoes: listaDeTexto(bruta.restricoes),
      idadeMinimaMeses,
      imagemUrl,
      fonte: String(bruta.fonte ?? "").trim() || null,
      ingredientes,
    },
  };
}

/** CSV simples com suporte a campos entre aspas e vírgulas dentro delas. */
export function parseCsv(texto: string): Record<string, string>[] {
  const linhas: string[][] = [];
  let campo = "";
  let linha: string[] = [];
  let dentroDeAspas = false;

  const conteudo = texto.replace(/^﻿/, "").replace(/\r\n/g, "\n");

  for (let i = 0; i < conteudo.length; i++) {
    const c = conteudo[i];

    if (dentroDeAspas) {
      if (c === '"') {
        if (conteudo[i + 1] === '"') {
          campo += '"';
          i++;
        } else {
          dentroDeAspas = false;
        }
      } else {
        campo += c;
      }
      continue;
    }

    if (c === '"') dentroDeAspas = true;
    else if (c === ",") {
      linha.push(campo);
      campo = "";
    } else if (c === "\n") {
      linha.push(campo);
      linhas.push(linha);
      linha = [];
      campo = "";
    } else campo += c;
  }

  if (campo || linha.length) {
    linha.push(campo);
    linhas.push(linha);
  }

  const naoVazias = linhas.filter((l) => l.some((c) => c.trim() !== ""));
  if (naoVazias.length < 2) return [];

  const cabecalho = naoVazias[0].map((h) => h.trim());
  return naoVazias.slice(1).map((valores) => {
    const obj: Record<string, string> = {};
    cabecalho.forEach((h, i) => {
      obj[h] = (valores[i] ?? "").trim();
    });
    return obj;
  });
}

/** Lê o arquivo (JSON ou CSV) e devolve as linhas já validadas. */
export function analisarArquivo(conteudo: string, nomeArquivo: string): LinhaValidada[] {
  const ehJson = /\.json$/i.test(nomeArquivo) || conteudo.trim().startsWith("[");

  let brutas: Record<string, unknown>[];

  if (ehJson) {
    const dados = JSON.parse(conteudo);
    if (!Array.isArray(dados)) throw new Error("O JSON precisa ser uma lista de receitas.");
    brutas = dados;
  } else {
    brutas = parseCsv(conteudo);
    if (brutas.length === 0) {
      throw new Error("CSV vazio ou sem linhas de dados abaixo do cabeçalho.");
    }
  }

  return brutas.map((b, i) => validarReceita(b, i + 1));
}
