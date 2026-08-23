import { db } from "@/lib/db";

/**
 * Gera variações de receitas trocando um ingrediente por outro equivalente.
 *
 * Motivo: um ciclo consome 30 refeições de cada tipo e o catálogo tem 45
 * almoços e 38 jantares. Sem folga, o segundo mês repete o primeiro. Variação
 * multiplica o catálogo sem escrever receita nova.
 *
 * Regras de segurança:
 * - só troca dentro de grupos que se substituem no preparo (proteína por
 *   proteína, tubérculo por tubérculo);
 * - só troca o ingrediente PRINCIPAL do grupo (o de maior peso na receita);
 * - recalcula `restricoes` a partir dos ingredientes finais, para nunca
 *   esconder um alérgeno introduzido pela troca;
 * - sobe `idadeMinimaMeses` quando o ingrediente novo pede idade maior.
 *
 * Uso:
 *   npm run db:variacoes -- --dry    (só mostra o que seria criado)
 *   npm run db:variacoes             (aplica)
 *   npm run db:variacoes -- --limpar (remove todas as variações geradas)
 */

const GRUPOS: Record<string, string[]> = {
  // Ovo fica DE FORA de proposito: em massa doce ele e liga estrutural, nao
  // proteina. Trocar ovo por carne moida produzia "bolo de banana com carne
  // moida" — o tipo de erro que destroi a confianca no catalogo.
  PROTEINA: ["Frango", "Carne moída", "Patinho bovino", "Filé de peixe", "Atum em lata"],
  TUBERCULO: ["Batata", "Batata-doce", "Inhame", "Mandioca", "Mandioquinha", "Abóbora"],
  // Fruta so entra em cafe e lanche, e as palavras bloqueadas ja tiram bolo,
  // panqueca e afins — onde a banana e liga, nao sabor.
  FRUTA: ["Banana", "Maçã", "Mamão", "Manga", "Pera", "Morango", "Abacate"],
};

/**
 * Onde cada grupo pode ser trocado.
 * Proteina so em refeicao salgada: no cafe e no lanche o preparo costuma ser
 * doce ou de massa, onde a troca nao faz sentido. Tuberculo troca em qualquer
 * refeicao — pure de batata vira pure de inhame sem problema.
 */
const REFEICOES_PERMITIDAS: Record<string, string[] | null> = {
  PROTEINA: ["ALMOCO", "JANTAR"],
  TUBERCULO: null,
  FRUTA: ["CAFE_DA_MANHA", "LANCHE"],
};

/**
 * Termos que descrevem um CORTE inteiro. "Peito de frango" nao pode virar
 * "Peito de carne moida" — moido e enlatado nao existem como corte.
 */
const TERMOS_DE_CORTE = ["peito de", "file de", "coxa de", "sobrecoxa de", "posta de"];

/**
 * Preparos que so funcionam com carne que se desfia ou se corta em cubos.
 * Peixe desmancha em lascas, moida nao desfia, enlatada ja vem desfeita.
 */
const TERMOS_DESFIA_OU_CUBO = ["desfiad", "xadrez", "em cubos", "iscas"];
const SE_DESFIA = ["Frango", "Patinho bovino"];

/** Genero gramatical, para nao gerar "Inhame cozida" a partir de "Mandioca cozida". */
const GENERO: Record<string, "m" | "f"> = {
  Frango: "m",
  "Carne moída": "f",
  "Patinho bovino": "m",
  "Filé de peixe": "m",
  "Atum em lata": "m",
  Batata: "f",
  "Batata-doce": "f",
  Inhame: "m",
  Mandioca: "f",
  Mandioquinha: "f",
  "Abóbora": "f",
  Banana: "f",
  "Maçã": "f",
  "Mamão": "m",
  Manga: "f",
  Pera: "f",
  Morango: "m",
  Abacate: "m",
};

/** Palavra que concorda em genero com o ingrediente (participio, adjetivo). */
const PRECISA_CONCORDANCIA = /[a-z]+(ado|ada|ido|ida|oso|osa)(\s|$)/;

/** Preparos onde nenhuma troca de ingrediente principal se sustenta. */
const PALAVRAS_BLOQUEADAS = ["bolo", "panqueca", "muffin", "pão", "pao", "biscoito", "torta", "waffle", "crepe"];

/** Alérgeno que cada ingrediente introduz na receita. */
const ALERGENO: Record<string, string> = {
  "Filé de peixe": "peixe",
  "Atum em lata": "peixe",
  Sardinha: "peixe",
  Ovo: "ovo",
  Leite: "leite",
  Queijo: "leite",
  "Iogurte natural": "leite",
  Manteiga: "leite",
  "Requeijão": "leite",
  Ricota: "leite",
  "Farinha de trigo": "gluten",
  "Pão de forma": "gluten",
  "Pão francês": "gluten",
  "Macarrão": "gluten",
  Granola: "gluten",
  Aveia: "gluten",
  Mel: "mel",
};

/** Idade mínima que o ingrediente exige, quando maior que a da receita base. */
const IDADE_MINIMA: Record<string, number> = {
  "Filé de peixe": 8,
  "Atum em lata": 12,
};

/** Quantas variações no máximo por receita base. */
const MAX_POR_RECEITA = 2;

function normalizar(t: string) {
  return t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

/** Troca o nome do ingrediente no texto, preservando a caixa da primeira letra. */
function substituirNoTexto(texto: string, de: string, para: string): string {
  const escapado = de.replace(/[.*+?^${}()|[\]\\-]/g, "\\$&");
  return texto.replace(new RegExp(escapado, "gi"), (achado) => {
    const comecaMaiuscula = achado[0] === achado[0].toUpperCase();
    return comecaMaiuscula ? para.charAt(0).toUpperCase() + para.slice(1) : para.toLowerCase();
  });
}

function grupoDe(nome: string): string | null {
  for (const [grupo, itens] of Object.entries(GRUPOS)) {
    if (itens.includes(nome)) return grupo;
  }
  return null;
}

/**
 * So aceita a variacao quando o NOME DA BASE cita o ingrediente trocado.
 *
 * Sem essa regra, o gerador anexava "com frango" a nomes que ja implicavam
 * outra proteina e produzia coisas como "Almondegas com molho de tomate e
 * arroz com frango" — almondega ja e carne moida. Substituicao pura num nome
 * que cita o ingrediente sempre le bem; qualquer outro caso e descartado.
 */
function nomeDaVariacao(nomeBase: string, de: string, para: string): string | null {
  const base = normalizar(nomeBase);
  if (!base.includes(normalizar(de))) return null;
  if (base.includes(normalizar(para))) return null;

  // "Peito de frango", "Filé de peixe": o nome descreve um corte especifico.
  // Nenhuma troca de proteina sobrevive a isso — "Peito de filé de peixe" e
  // tao ruim quanto "Peito de carne moida". Tuberculo passa normalmente.
  const ehCorte = TERMOS_DE_CORTE.some((t) => base.includes(`${t} ${normalizar(de)}`));
  if (ehCorte && grupoDe(para) === "PROTEINA") return null;

  // "desfiado", "xadrez", "em cubos": so carne que desfia ou vira cubo.
  const exigeDesfiar = TERMOS_DESFIA_OU_CUBO.some((t) => base.includes(t));
  if (exigeDesfiar && grupoDe(para) === "PROTEINA" && !SE_DESFIA.includes(para)) return null;

  // Concordancia: se o nome tem participio/adjetivo e o genero muda, descarta
  // em vez de tentar flexionar — errar portugues custa mais que perder variacao.
  if (GENERO[de] && GENERO[para] && GENERO[de] !== GENERO[para]) {
    if (PRECISA_CONCORDANCIA.test(base)) return null;
  }

  return substituirNoTexto(nomeBase, de, para).replace(/\s+/g, " ").trim();
}

async function limpar() {
  const { count } = await db.recipe.deleteMany({ where: { baseRecipeId: { not: null } } });
  console.log(`Removidas ${count} variações.`);
}

async function main() {
  const args = process.argv.slice(2);
  const dry = args.includes("--dry");

  if (args.includes("--limpar")) {
    await limpar();
    return;
  }

  const bases = await db.recipe.findMany({
    where: { ativo: true, baseRecipeId: null },
    include: { ingredients: { include: { ingredient: true } } },
  });

  const nomesExistentes = new Set(
    (await db.recipe.findMany({ select: { nome: true } })).map((r) => normalizar(r.nome))
  );

  // Quantas variacoes cada base ja tem. Sem isso, rodar o script duas vezes
  // gera o proximo par de alternativas e o catalogo incha sem controle.
  const existentesPorBase = new Map<string, number>();
  for (const v of await db.recipe.groupBy({
    by: ["baseRecipeId"],
    where: { baseRecipeId: { not: null } },
    _count: true,
  })) {
    if (v.baseRecipeId) existentesPorBase.set(v.baseRecipeId, v._count);
  }

  const ingredientesPorNome = new Map(
    (await db.ingredient.findMany()).map((i) => [i.nome, i])
  );

  let criadas = 0;
  let puladas = 0;
  const amostra: string[] = [];

  for (const base of bases) {
    // Ingrediente principal de um grupo trocável: o de maior peso.
    const candidatos = base.ingredients
      .filter((ri) => grupoDe(ri.ingredient.nome) !== null)
      .sort((a, b) => (b.gramas ?? 0) - (a.gramas ?? 0));

    const principal = candidatos[0];
    if (!principal) continue;

    const grupo = grupoDe(principal.ingredient.nome)!;

    const permitidas = REFEICOES_PERMITIDAS[grupo];
    if (permitidas && !permitidas.includes(base.tipoRefeicao)) {
      puladas++;
      continue;
    }

    if (PALAVRAS_BLOQUEADAS.some((p) => normalizar(base.nome).includes(p))) {
      puladas++;
      continue;
    }

    const jaUsados = new Set(base.ingredients.map((ri) => ri.ingredient.nome));

    const alternativas = GRUPOS[grupo].filter((nome) => !jaUsados.has(nome));

    // Retoma de onde parou: o total por base nunca passa de MAX_POR_RECEITA.
    let feitasNesta = existentesPorBase.get(base.id) ?? 0;
    if (feitasNesta >= MAX_POR_RECEITA) continue;

    for (const alternativa of alternativas) {
      if (feitasNesta >= MAX_POR_RECEITA) break;

      const novoIngrediente = ingredientesPorNome.get(alternativa);
      if (!novoIngrediente) continue;

      const nome = nomeDaVariacao(base.nome, principal.ingredient.nome, alternativa);
      if (!nome || nomesExistentes.has(normalizar(nome))) {
        puladas++;
        continue;
      }

      // ---- restrições: recalculadas a partir dos ingredientes finais ----
      const ingredientesFinais = base.ingredients.map((ri) =>
        ri.ingredientId === principal.ingredientId ? novoIngrediente.nome : ri.ingredient.nome
      );
      const alergenosDosIngredientes = new Set(
        ingredientesFinais.map((n) => ALERGENO[n]).filter(Boolean)
      );
      // Mantém tags da base que não vinham do ingrediente trocado (ex.: "gluten"
      // por causa de um tempero), e descarta a que saiu junto com ele.
      const alergenoRemovido = ALERGENO[principal.ingredient.nome];
      for (const tag of base.restricoes.split(",").map((t) => t.trim()).filter(Boolean)) {
        if (tag !== alergenoRemovido) alergenosDosIngredientes.add(tag);
      }
      const restricoes = [...alergenosDosIngredientes].sort().join(",");

      const idadeMinimaMeses = Math.max(
        base.idadeMinimaMeses,
        IDADE_MINIMA[alternativa] ?? 0
      );

      const passos = substituirNoTexto(base.passos, principal.ingredient.nome, alternativa);
      const resumo = substituirNoTexto(base.resumo, principal.ingredient.nome, alternativa);

      nomesExistentes.add(normalizar(nome));
      feitasNesta++;
      criadas++;

      if (dry || amostra.length < 25) {
        amostra.push(
          `${base.nome}\n   → ${nome}` +
            `\n     troca: ${principal.ingredient.nome} → ${alternativa}` +
            `\n     restrições: "${base.restricoes}" → "${restricoes}" | idade min: ${idadeMinimaMeses}m`
        );
      }

      if (dry) continue;

      await db.recipe.create({
        data: {
          nome,
          resumo,
          tipoRefeicao: base.tipoRefeicao,
          tempoPreparoMin: base.tempoPreparoMin,
          dificuldade: base.dificuldade,
          rendimento: base.rendimento,
          passos,
          tags: base.tags,
          restricoes,
          nutricao: base.nutricao,
          idadeMinimaMeses,
          equipamentos: base.equipamentos,
          // Foto não é herdada: a variação mostra outro prato.
          imagemUrl: null,
          fonte: base.fonte,
          porcoes: base.porcoes,
          scoreSono: base.scoreSono,
          scoreEnergia: base.scoreEnergia,
          scoreCalma: base.scoreCalma,
          ativo: true,
          baseRecipeId: base.id,
          variacaoTroca: `${principal.ingredient.nome} → ${alternativa}`,
          ingredients: {
            create: base.ingredients.map((ri) => ({
              ingredientId:
                ri.ingredientId === principal.ingredientId
                  ? novoIngrediente.id
                  : ri.ingredientId,
              quantidade:
                ri.ingredientId === principal.ingredientId
                  ? substituirNoTexto(ri.quantidade, principal.ingredient.nome, alternativa)
                  : ri.quantidade,
              gramas: ri.gramas,
            })),
          },
        },
      });
    }
  }

  console.log(`\n=== ${dry ? "SIMULAÇÃO" : "APLICADO"} ===`);
  console.log(`Receitas base analisadas: ${bases.length}`);
  console.log(`Variações ${dry ? "que seriam criadas" : "criadas"}: ${criadas}`);
  console.log(`Puladas (nome repetido ou impossível): ${puladas}`);
  console.log(`\nAmostra:\n`);
  for (const a of amostra) console.log(" • " + a + "\n");
}

main().finally(() => db.$disconnect());
