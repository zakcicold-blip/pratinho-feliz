import type { Post } from "@/lib/blog";
import { Destaque, CTAInline, Tabela } from "@/components/blog/Blocos";

function Corpo() {
  return (
    <>
      <p>
        A anemia por deficiência de ferro é a carência nutricional mais comum na infância brasileira
        — e a mais silenciosa. Ela não começa com um sintoma claro: começa com uma criança um pouco
        mais cansada, um pouco mais irritada, que rende menos na escola. Entender onde está o ferro
        e como fazer o corpo absorvê-lo muda bastante o resultado.
      </p>

      <h2 id="por-que-importa">Por que o ferro importa tanto nessa fase</h2>
      <p>
        O ferro carrega oxigênio no sangue e participa da formação do sistema nervoso. Entre os 6
        meses e os 2 anos o cérebro cresce em ritmo acelerado, e é justamente aí que as reservas que
        o bebê recebeu na gestação se esgotam — por volta do sexto mês.
      </p>
      <p>
        Por isso os dois períodos de maior risco são o segundo semestre de vida e a fase pré-escolar,
        quando a criança come pouco e seletivamente. Deficiências prolongadas nessa janela podem
        deixar marcas em atenção e aprendizado.
      </p>

      <h2 id="sinais">Sinais de alerta</h2>
      <ul>
        <li>Palidez, especialmente nas pálpebras internas, gengivas e palma da mão;</li>
        <li>Cansaço fora do comum, menos disposição para brincar;</li>
        <li>Irritabilidade e dificuldade de concentração;</li>
        <li>Falta de apetite — que alimenta um ciclo: come menos, absorve menos ferro;</li>
        <li>Infecções de repetição;</li>
        <li>Vontade de comer coisas que não são alimento, como terra ou gelo.</li>
      </ul>

      <Destaque tom="atencao" titulo="Só o exame confirma">
        <p>
          Nenhum sinal isolado fecha diagnóstico. Quem confirma anemia é o hemograma com dosagem de
          ferritina, pedido pelo pediatra. E suplementação de ferro nunca deve ser iniciada por
          conta própria: em excesso, o ferro é tóxico.
        </p>
      </Destaque>

      <h2 id="onde-encontrar">Onde o ferro está de verdade</h2>
      <p>
        Existem dois tipos, e a diferença entre eles é grande. O <strong>ferro heme</strong>, de
        origem animal, é absorvido em torno de 15% a 35%. O <strong>ferro não-heme</strong>, vegetal,
        fica entre 2% e 20% — mas responde muito bem a combinações inteligentes.
      </p>
      <Tabela>
        <thead className="bg-stone-50 text-xs uppercase tracking-wide text-stone-400">
          <tr>
            <th className="px-4 py-3 font-semibold">Alimento</th>
            <th className="px-4 py-3 font-semibold">Tipo</th>
            <th className="px-4 py-3 font-semibold">Como usar no dia a dia</th>
          </tr>
        </thead>
        <tbody className="text-stone-600">
          <tr className="border-t border-stone-100">
            <td className="px-4 py-3 font-medium text-stone-800">Fígado bovino</td>
            <td className="px-4 py-3">Heme</td>
            <td className="px-4 py-3">
              A fonte mais concentrada. Uma vez por semana, moído e misturado ao arroz ou ao molho.
            </td>
          </tr>
          <tr className="border-t border-stone-100">
            <td className="px-4 py-3 font-medium text-stone-800">Carne vermelha</td>
            <td className="px-4 py-3">Heme</td>
            <td className="px-4 py-3">Desfiada ou moída, mais fácil de mastigar que em cubos.</td>
          </tr>
          <tr className="border-t border-stone-100">
            <td className="px-4 py-3 font-medium text-stone-800">Gema de ovo</td>
            <td className="px-4 py-3">Heme</td>
            <td className="px-4 py-3">Prática e barata, ótima no café da manhã.</td>
          </tr>
          <tr className="border-t border-stone-100">
            <td className="px-4 py-3 font-medium text-stone-800">Feijão, lentilha, grão-de-bico</td>
            <td className="px-4 py-3">Não-heme</td>
            <td className="px-4 py-3">
              O grão amassado, não só o caldo. Base do almoço brasileiro e a fonte mais acessível.
            </td>
          </tr>
          <tr className="border-t border-stone-100">
            <td className="px-4 py-3 font-medium text-stone-800">Folhas verde-escuras</td>
            <td className="px-4 py-3">Não-heme</td>
            <td className="px-4 py-3">
              Couve, espinafre, brócolis. Bem picados, refogados com alho e azeite.
            </td>
          </tr>
          <tr className="border-t border-stone-100">
            <td className="px-4 py-3 font-medium text-stone-800">Aveia e cereais fortificados</td>
            <td className="px-4 py-3">Não-heme</td>
            <td className="px-4 py-3">Verifique o rótulo — nem todo cereal infantil é fortificado.</td>
          </tr>
        </tbody>
      </Tabela>

      <h2 id="absorcao">O que multiplica (e o que bloqueia) a absorção</h2>
      <p>
        Aqui está a parte que quase ninguém aplica, e que muda o resultado sem mudar o cardápio.
      </p>
      <p>
        <strong>Vitamina C na mesma refeição</strong> pode multiplicar a absorção do ferro vegetal em
        até três a quatro vezes. Não precisa de nada exótico: laranja, limão espremido no feijão,
        tomate, pimentão, acerola, morango, goiaba, kiwi ou mamão de sobremesa.
      </p>
      <p>
        <strong>Carne junto com feijão</strong> tem efeito parecido: a proteína animal melhora o
        aproveitamento do ferro vegetal do mesmo prato. O clássico arroz com feijão e carne não é
        tradição por acaso.
      </p>
      <p>Do outro lado, três coisas atrapalham quando estão na mesma refeição:</p>
      <ul>
        <li>
          <strong>Leite e derivados.</strong> O cálcio compete diretamente com o ferro. Deixe o
          leite para os lanches, longe do almoço e do jantar.
        </li>
        <li>
          <strong>Chá preto, chá mate e café.</strong> Os taninos reduzem bastante a absorção.
        </li>
        <li>
          <strong>Excesso de leite de vaca</strong> ao longo do dia. Acima de 500 ml, ele desloca
          alimentos ricos em ferro e ainda pode causar micro-sangramentos intestinais em bebês.
        </li>
      </ul>

      <Destaque tom="dica" titulo="Uma mudança de 30 segundos">
        <p>
          Espremer meio limão sobre o feijão na hora de servir e trocar o copo de leite do almoço por
          água, deixando o leite para o lanche da tarde. Duas mudanças mínimas, efeito real sobre
          quanto ferro o corpo aproveita.
        </p>
      </Destaque>

      <CTAInline
        titulo="Ferro no prato, sem planilha"
        texto="O Pratinho Feliz calcula os valores nutricionais do plano do seu filho com base na tabela TACO e combina os alimentos considerando essas interações — o feijão vem com a fonte de vitamina C do lado."
      />

      <h2 id="dia-tipico">Um dia bem montado</h2>
      <ul>
        <li>
          <strong>Café da manhã:</strong> ovo mexido, pão integral e mamão. (Ferro heme + vitamina C.)
        </li>
        <li>
          <strong>Lanche:</strong> iogurte natural com banana. (O laticínio fica aqui, longe do almoço.)
        </li>
        <li>
          <strong>Almoço:</strong> arroz, feijão amassado, carne moída, brócolis e uma laranja de
          sobremesa. Água para beber.
        </li>
        <li>
          <strong>Lanche da tarde:</strong> pão com pasta de amendoim e morango.
        </li>
        <li>
          <strong>Jantar:</strong> lentilha com legumes, frango desfiado e salada de tomate.
        </li>
      </ul>
      <p>
        Nenhum ingrediente caro, nenhuma preparação complicada. O ganho está na combinação e na
        separação — o que anda junto e o que fica para outro horário.
      </p>
    </>
  );
}

export const post: Post = {
  slug: "ferro-na-alimentacao-infantil",
  titulo: "Ferro na alimentação infantil: onde está e como fazer o corpo absorver",
  resumo:
    "A carência nutricional mais comum da infância brasileira é silenciosa. Veja os sinais, as melhores fontes de ferro e as combinações simples que multiplicam a absorção em até quatro vezes.",
  categoria: "nutricao",
  publicadoEm: "2026-07-30",
  minutos: 8,
  tags: ["ferro", "anemia infantil", "nutrientes", "TACO"],
  sumario: [
    { id: "por-que-importa", texto: "Por que o ferro importa" },
    { id: "sinais", texto: "Sinais de alerta" },
    { id: "onde-encontrar", texto: "Onde o ferro está" },
    { id: "absorcao", texto: "O que multiplica a absorção" },
    { id: "dia-tipico", texto: "Um dia bem montado" },
  ],
  faq: [
    {
      pergunta: "Quais alimentos são ricos em ferro para crianças?",
      resposta:
        "As fontes mais concentradas são fígado bovino, carne vermelha e gema de ovo (ferro heme, melhor absorvido). Entre as vegetais, feijão, lentilha, grão-de-bico, folhas verde-escuras como couve e espinafre, aveia e cereais fortificados.",
    },
    {
      pergunta: "Como aumentar a absorção de ferro na alimentação infantil?",
      resposta:
        "Ofereça uma fonte de vitamina C na mesma refeição — laranja, limão espremido no feijão, tomate, morango, goiaba ou mamão. Isso pode multiplicar a absorção do ferro vegetal em três a quatro vezes. Servir carne junto com feijão tem efeito parecido.",
    },
    {
      pergunta: "Leite atrapalha a absorção de ferro?",
      resposta:
        "Sim. O cálcio do leite e derivados compete com o ferro na absorção. O ideal é oferecer leite e iogurte nos lanches, afastados do almoço e do jantar, e manter o consumo diário de leite de vaca abaixo de 500 ml em crianças pequenas.",
    },
    {
      pergunta: "Quais são os sintomas de anemia em crianças?",
      resposta:
        "Palidez em pálpebras, gengivas e palma da mão, cansaço fora do comum, irritabilidade, dificuldade de concentração, falta de apetite e infecções de repetição. O diagnóstico só é confirmado por hemograma com dosagem de ferritina solicitado pelo pediatra.",
    },
    {
      pergunta: "Posso dar suplemento de ferro para meu filho por conta própria?",
      resposta:
        "Não. Ferro em excesso é tóxico e a suplementação precisa de dose e duração definidas por um médico após avaliação. Mesmo a suplementação profilática recomendada para lactentes deve ser orientada pelo pediatra que acompanha a criança.",
    },
  ],
  Corpo,
};
