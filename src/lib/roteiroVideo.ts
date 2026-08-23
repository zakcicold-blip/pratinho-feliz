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
  /** A fala em português que a pessoa diz nesta cena. */
  fala: string;
  /** Prompt pronto para colar no Veo. Já inclui a âncora e a fala. */
  promptVeo: string;
  /** Texto que entra por cima do vídeo na edição. */
  textoNaTela: string;
};

export type RoteiroVideo = {
  receita: string;
  /** Frase dos primeiros 3 segundos — é ela que segura ou perde a pessoa. */
  gancho: string;
  /**
   * Descrição da pessoa e da cozinha, repetida PALAVRA POR PALAVRA nos três
   * prompts. O Veo não tem memória entre gerações: sem isso, cada clipe sai
   * com outra pessoa em outra cozinha.
   */
  ancora: string;
  /** Em qual cena entra a menção ao app (varia para não ficar repetitivo). */
  cenaComApp: number;
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

## FORMATO (não negociável)
- 3 cenas de no máximo 8 segundos cada. O Veo não gera mais que isso por clipe.
- Cena 1: o prato PRONTO e apetitoso na tela, e a pessoa já falando — abrindo uma curiosidade que ela NÃO responde ainda. Nunca comece pelo preparo: quem rola o feed decide em 3 segundos.
- Cena 2: responde a curiosidade da cena 1 e mostra o preparo no ponto mais satisfatório de ver (amassar, derreter, virar, polvilhar).
- Cena 3: a criança comendo e gostando, ou o prato sendo servido. Fecha com emoção.
- Vertical 9:16.

## A ÂNCORA (o que garante que os 3 clipes pareçam o mesmo vídeo)
O Veo NÃO tem memória entre gerações. Cada clipe é gerado do zero: sem âncora, sai outra pessoa, em outra cozinha, com outra luz.

Escreva no campo "ancora" uma descrição em INGLÊS, específica e visual, da pessoa e do cenário. Quanto mais específica, melhor a continuidade. Inclua: idade aproximada, cabelo, roupa com cor, a cozinha, a luz.
Exemplo: "A Brazilian woman in her early 30s with dark wavy shoulder-length hair, wearing a mustard-yellow t-shirt, in a small bright Brazilian home kitchen with white tiles and a wooden countertop, soft natural window light from the left"

Essa âncora tem que aparecer PALAVRA POR PALAVRA no começo dos três prompts. Não reescreva, não resuma, não varie.

## OS PROMPTS DO VEO
Estrutura de cada prompt, nesta ordem:
1. A âncora, copiada exatamente.
2. O que acontece nesta cena (câmera, ação, comida). Em inglês.
3. A fala, neste formato exato: She says in Brazilian Portuguese: <a fala, em português, SEM aspas>
4. Termine sempre com: (no subtitles)

Regras que não podem ser quebradas:
- A fala vem depois de dois-pontos e SEM aspas. Aspas confundem o modelo.
- "(no subtitles)" no fim, sempre. Sem isso o Veo escreve legenda errada por cima do vídeo.
- Nunca peça texto dentro do vídeo — o Veo erra letras. Texto entra na edição.
- Da cena 2 em diante, comece a parte da ação dizendo o que continua: "Continuing in the same kitchen, now she...".
- Comida brasileira de verdade, cozinha de casa comum brasileira. Nada de cozinha de revista americana.
- Criança sempre de forma genérica e respeitosa ("a toddler's hands", "a child in a high chair"), sem rosto detalhado e sem nomear ninguém real.

## AS FALAS (português do Brasil)
As três falas são UMA CONVERSA CONTÍNUA, não três frases soltas. A cena 2 termina o que a cena 1 começou.

REGRA DA CENA 1 — LOOP ABERTO (é o que segura a pessoa):
A primeira fala chama a mãe e ABRE uma curiosidade que ela NÃO resolve. Corta no meio, com reticências. A resposta só chega na cena 2.

Modelo: chamar + fato curioso da receita + cortar antes da resposta.
Exemplos bons:
- "Mãe, você sabia que se você espremer meio limão no feijão..."
- "Mãe, se o seu filho recusa brócolis, tem um jeito de cortar que muda tudo..."
- "Olha, tem um detalhe nessa banana que quase ninguém faz..."
- "Mãe, essa papinha fica muito mais nutritiva se você fizer uma coisa antes..."

Exemplos ruins (não use): "Oi gente, hoje vou ensinar...", "Receita fácil e rápida!", "Bora fazer?"

O fato precisa ser VERDADEIRO e sair da própria receita — ingrediente, ponto de preparo, combinação nutricional, corte seguro. Nunca invente curiosidade para gerar clique: é conteúdo de alimentação infantil, e a confiança é o ativo.

REGRA DA CENA 2 — FECHA O LOOP:
Começa exatamente respondendo o que ficou no ar, e já mostra como faz.
Exemplo, seguindo o gancho do limão: "...a vitamina C faz o corpo aproveitar até três vezes mais o ferro do feijão. Espreme na hora de servir."

REGRA DA CENA 3 — FECHA COM EMOÇÃO:
Curta, sobre a criança comendo ou o resultado. Nada de informação nova.

VALE PARA TODAS:
- No máximo 18 PALAVRAS por cena. Fala natural em português corre a ~3 palavras por segundo — passar disso corta no meio dos 8 segundos.
- Tom de amiga contando, não de apresentadora de TV.
- Juntas, as três ensinam a receita de verdade: quem assistir consegue fazer.
- Fale com a pessoa: "você", "seu filho".

## A MENÇÃO AO APP
Uma das três falas menciona que a receita veio do Pratinho Feliz. Escolha a cena 1 OU a cena 2 — varie entre as receitas, não coloque sempre no mesmo lugar. Nunca na cena 3.

Tem que soar como recomendação de amiga, encaixada na fala, nunca como anúncio colado. Varie a forma. Bons exemplos:
- "Peguei essa no Pratinho Feliz, que já monta o cardápio do mês inteiro"
- "Essa veio do Pratinho Feliz, o app que aprende o que seu filho aceita"
- "Tava no plano de hoje do Pratinho Feliz e salvou meu almoço"
Ruins (não use): "baixe o app", "link na bio", "acesse agora".

Informe em "cenaComApp" o número da cena escolhida.

## TEXTO NA TELA E LEGENDA (português)
- Gancho (campo "gancho"): é o texto que aparece ESCRITO no primeiro frame, no máximo 8 palavras. Reforça a curiosidade da fala da cena 1, com outras palavras — não repete a fala.
- Texto na tela: 3 a 6 palavras por cena. Complementa a fala, não repete.
- Legenda: 2 a 4 linhas, com a receita resumida e um motivo real para salvar.
- O algoritmo do Reels premia SALVAMENTO e COMPARTILHAMENTO. Escreva para fazer salvar.

Responda SOMENTE com JSON válido, sem cercas de código, neste formato exato:
{"gancho":"","ancora":"","cenaComApp":1,"cenas":[{"numero":1,"descricao":"","fala":"","promptVeo":"","textoNaTela":""}],"legenda":"","hashtags":[],"chamada":"","audio":""}`;

/**
 * Garante as regras do Veo no código, em vez de confiar que o modelo obedeceu.
 *
 * Três invariantes que, se falharem, estragam o clipe:
 * - a âncora precisa abrir o prompt, senão o clipe sai com outra pessoa;
 * - a fala precisa estar no prompt, senão o vídeo sai mudo;
 * - "(no subtitles)" precisa fechar, senão o Veo escreve legenda errada por
 *   cima do vídeo.
 *
 * Aqui a gente conserta o que faltou, sem gastar outra chamada.
 */
export { normalizarCenas as __normalizarCenasParaTeste };

function normalizarCenas(roteiro: Omit<RoteiroVideo, "receita">): Omit<RoteiroVideo, "receita"> {
  const ancora = roteiro.ancora?.trim() ?? "";

  const cenas = (roteiro.cenas ?? []).map((cena) => {
    let prompt = cena.promptVeo?.trim() ?? "";
    const fala = cena.fala?.trim() ?? "";

    if (ancora && !prompt.includes(ancora)) {
      prompt = `${ancora}. ${prompt}`;
    }

    // Tira o "(no subtitles)" do fim ANTES de mexer no resto: se a fala for
    // acrescentada depois dele, ela sai fora do lugar e o marcador duplica.
    prompt = prompt.replace(/\(no subtitles\)/gi, "").trim();

    if (fala && !prompt.includes(fala)) {
      prompt = `${prompt.replace(/[.\s]+$/, "")}. She says in Brazilian Portuguese: ${fala}`;
    }

    // Aspas na fala confundem o modelo — a regra é dois-pontos e texto solto.
    prompt = prompt.replace(/(says[^:]*:)\s*["“”']+/gi, "$1 ").replace(/["“”]+/g, "");

    // E só então fecha com o marcador, exatamente uma vez.
    prompt = `${prompt.replace(/[.\s]+$/, "")}. (no subtitles)`;

    return { ...cena, promptVeo: prompt.replace(/\s{2,}/g, " ").trim() };
  });

  return { ...roteiro, cenas };
}

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
    const normalizado = normalizarCenas(bruto);
    return { ok: true, roteiro: { ...normalizado, receita: receita.nome } };
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
