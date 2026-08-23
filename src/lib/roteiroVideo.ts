import Anthropic from "@anthropic-ai/sdk";
import { db } from "@/lib/db";

/**
 * Gera o ROTEIRO de um Reel de receita a partir do catálogo do próprio app.
 *
 * Por que isso existe: o gargalo de fazer vídeo com IA não é a renderização,
 * é decidir o que filmar. Com 319 receitas no banco — nome, ingredientes,
 * passos, tempo, idade mínima — o roteiro pode sair pronto, e a pessoa só
 * cola os prompts no Veo.
 *
 * A restrição que molda tudo: o Veo gera no máximo 8 SEGUNDOS por clipe.
 * Um Reel de 24 s são três clipes separados, montados depois. Por isso o
 * roteiro já sai fatiado em cenas de 8 s, cada uma com o prompt pronto.
 *
 * Os prompts de vídeo saem em INGLÊS de propósito: o Veo responde bem melhor
 * a descrição visual em inglês. O texto na tela e a legenda saem em português.
 */

const MODELO = "claude-sonnet-5";

export type Cena = {
  /** Ordem da cena no vídeo. */
  numero: number;
  /** O que acontece, em português, para você conferir antes de gerar. */
  descricao: string;
  /** Prompt pronto para colar no Veo (inglês). */
  promptVeo: string;
  /** Texto que entra por cima do vídeo na edição. */
  textoNaTela: string;
};

export type RoteiroVideo = {
  receita: string;
  /** Frase dos primeiros 3 segundos — é ela que segura ou perde a pessoa. */
  gancho: string;
  cenas: Cena[];
  /** Legenda do post, em português. */
  legenda: string;
  hashtags: string[];
  /** O que falar no fim para levar ao app. */
  chamada: string;
  /** Sugestão de trilha/áudio. */
  audio: string;
};

const INSTRUCOES = `Você cria roteiros de Reels de receita infantil para o Pratinho Feliz, um app brasileiro de planejamento alimentar para crianças.

Público: mães e pais de crianças de 6 meses a 12 anos, cansados, no celular, rolando o feed.

REGRAS DO FORMATO (não negociáveis):
- O vídeo tem 3 cenas de no máximo 8 segundos cada. O Veo não gera mais que isso por clipe.
- Cena 1 é o GANCHO: mostra o prato PRONTO e apetitoso, nunca o começo do preparo. Quem rola o feed decide em 3 segundos.
- Cena 2 é o preparo, no ponto mais satisfatório visualmente (algo sendo amassado, derretendo, virando, polvilhando).
- Cena 3 é a criança comendo e gostando, ou o prato sendo servido. Fecha com emoção, não com informação.
- Vertical 9:16 sempre.

SOBRE OS PROMPTS DO VEO (escreva em INGLÊS):
- Descreva câmera, luz, textura e movimento. Ex: "close-up, shallow depth of field, natural window light, slow motion".
- Comida brasileira de verdade, cozinha de casa comum brasileira — não cozinha de revista americana.
- Quando aparecer criança, descreva de forma genérica e respeitosa ("a toddler's hands", "a child seated in a high chair"), sem descrever rosto em detalhe e sem nomear ninguém real.
- Nunca peça texto dentro do vídeo: o Veo erra letras. O texto entra na edição.

SOBRE O TEXTO E A LEGENDA (em PORTUGUÊS do Brasil):
- Gancho: no máximo 8 palavras, na cara da mãe cansada. Nada de "confira a receita incrível".
- Texto na tela: curtíssimo, 3 a 6 palavras por cena.
- Legenda: 2 a 4 linhas, com a receita resumida e um motivo real para salvar o post.
- O algoritmo do Reels premia SALVAMENTO e COMPARTILHAMENTO. Escreva pensando em fazer a pessoa salvar.

Responda SOMENTE com JSON válido, sem cercas de código, neste formato exato:
{"gancho":"","cenas":[{"numero":1,"descricao":"","promptVeo":"","textoNaTela":""}],"legenda":"","hashtags":[],"chamada":"","audio":""}`;

export function roteiroDisponivel(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

export async function gerarRoteiro(
  recipeId: string
): Promise<{ ok: true; roteiro: RoteiroVideo } | { ok: false; erro: string }> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return { ok: false, erro: "Falta a chave da Anthropic no ambiente." };
  }

  const receita = await db.recipe.findUnique({
    where: { id: recipeId },
    select: {
      nome: true,
      resumo: true,
      passos: true,
      tempoPreparoMin: true,
      idadeMinimaMeses: true,
      tipoRefeicao: true,
      nutricao: true,
      ingredients: {
        select: { quantidade: true, ingredient: { select: { nome: true } } },
      },
    },
  });
  if (!receita) return { ok: false, erro: "Receita não encontrada." };

  const ficha = `Receita: ${receita.nome}
Resumo: ${receita.resumo}
Refeição: ${receita.tipoRefeicao}
Tempo de preparo: ${receita.tempoPreparoMin} min
Idade mínima: ${receita.idadeMinimaMeses} meses
Destaque nutricional: ${receita.nutricao || "não informado"}

Ingredientes:
${receita.ingredients.map((i) => `- ${i.ingredient.nome}: ${i.quantidade}`).join("\n")}

Modo de preparo:
${receita.passos}`;

  try {
    const resposta = await new Anthropic().messages.create({
      model: MODELO,
      max_tokens: 2000,
      output_config: { effort: "medium" },
      system: [
        // Estável entre todas as receitas: fica no cache.
        { type: "text", text: INSTRUCOES, cache_control: { type: "ephemeral" } },
      ],
      messages: [{ role: "user", content: ficha }],
    });

    if (resposta.stop_reason === "refusal") {
      return { ok: false, erro: "O modelo recusou esta receita. Tente outra." };
    }

    const texto = resposta.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("")
      .trim()
      // Rede de segurança: se vier cercado por ```json, limpa.
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/, "");

    const bruto = JSON.parse(texto) as Omit<RoteiroVideo, "receita">;
    return { ok: true, roteiro: { ...bruto, receita: receita.nome } };
  } catch (erro) {
    if (erro instanceof SyntaxError) {
      return { ok: false, erro: "A resposta não veio em JSON válido. Tente de novo." };
    }
    if (erro instanceof Anthropic.APIError) {
      return { ok: false, erro: `Erro da API (${erro.status}). Tente de novo.` };
    }
    console.error("Roteiro de vídeo:", erro);
    return { ok: false, erro: "Não deu para gerar agora." };
  }
}
