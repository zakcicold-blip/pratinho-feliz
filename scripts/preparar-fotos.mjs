import sharp from "sharp";
import { readFileSync, writeFileSync } from "node:fs";

/**
 * Prepara as fotos da landing para a web.
 *
 * As originais chegam como saem do banco de imagens: 3 a 12 MB e ate 5616px
 * de largura. Isso nao e detalhe de performance — o Next otimiza a imagem sob
 * demanda, mas o arquivo original ainda viaja para a CDN e passa pelo
 * otimizador, e um JPEG de 12 MB deixa a primeira visita lenta justamente em
 * celular, que e de onde vem quase todo o trafego.
 *
 * O corte NAO e centralizado. Cada foto tem um assunto em lugar diferente, e
 * corte cego decapita o que importa: na foto da recusa, o rosto esta em cima
 * e a tigela de brocolis embaixo — as duas coisas precisam sobreviver, senao
 * vira "crianca triste" em vez de "crianca recusando comida".
 *
 * Rodar com: node scripts/preparar-fotos.mjs
 */

const LARGURA_MAXIMA = 1600;
const QUALIDADE = 80;

/**
 * `topo` e a fracao da altura original onde o recorte comeca (0 = topo).
 * Quando ausente, o recorte e centralizado.
 */
const FOTOS = [
  {
    entrada: "criança recusando.jpg",
    saida: "recusa.jpg",
    proporcao: 3 / 4,
    // Rosto entre 20% e 60% da altura, tigela entre 72% e 95%. Comecando em
    // 10% o recorte segura os dois.
    topo: 0.1,
  },
  {
    entrada: "mulher abrindo a geladeira.jpg",
    saida: "geladeira.jpg",
    proporcao: 3 / 2,
  },
  {
    entrada: "o almoço que ja estava decidido.jpg",
    saida: "almoco-decidido.jpg",
    // Quadrada na origem, e fica quadrada: a 4:3 os dois rostos cabiam mas os
    // legumes da bancada sumiam, e sem comida a cena vira "mae e filho rindo
    // na cozinha" — numa secao sobre refeicao isso nao serve.
    proporcao: 1,
  },
  {
    entrada: "mãe aliviada.jpg",
    saida: "mae-aliviada.jpg",
    // Ja e 3:2 exata: nao ha nada a cortar.
    proporcao: 3 / 2,
  },
];

const dir = "public/fotos";

for (const foto of FOTOS) {
  const original = sharp(readFileSync(`${dir}/${foto.entrada}`));
  const { width, height } = await original.metadata();
  if (!width || !height) throw new Error(`Sem dimensões: ${foto.entrada}`);

  // Maior retangulo na proporcao pedida que cabe na imagem original.
  let larguraCorte = width;
  let alturaCorte = Math.round(width / foto.proporcao);
  if (alturaCorte > height) {
    alturaCorte = height;
    larguraCorte = Math.round(height * foto.proporcao);
  }

  const esquerda = Math.round((width - larguraCorte) / 2);
  const cima =
    foto.topo === undefined
      ? Math.round((height - alturaCorte) / 2)
      : Math.min(Math.round(height * foto.topo), height - alturaCorte);

  const larguraFinal = Math.min(LARGURA_MAXIMA, larguraCorte);

  const buffer = await sharp(readFileSync(`${dir}/${foto.entrada}`))
    .extract({ left: esquerda, top: cima, width: larguraCorte, height: alturaCorte })
    .resize(larguraFinal)
    // mozjpeg encolhe mais no mesmo nivel de qualidade visual.
    .jpeg({ quality: QUALIDADE, mozjpeg: true, progressive: true })
    .toBuffer();

  writeFileSync(`${dir}/${foto.saida}`, buffer);

  const antes = readFileSync(`${dir}/${foto.entrada}`).length;
  const kb = (n) => `${Math.round(n / 1024)} KB`;
  console.log(
    `${foto.saida}: ${larguraFinal}x${Math.round(larguraFinal / foto.proporcao)} · ${kb(antes)} → ${kb(buffer.length)}`,
  );
}
