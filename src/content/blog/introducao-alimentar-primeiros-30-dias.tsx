import type { Post } from "@/lib/blog";
import { Destaque, CTAInline, Tabela } from "@/components/blog/Blocos";

function Corpo() {
  return (
    <>
      <p>
        A introdução alimentar começa por volta dos 6 meses e é, ao mesmo tempo, um marco enorme e
        uma fonte infinita de dúvida. Amassar ou dar em pedaço? Sal pode? E se ela engasgar? Este
        guia organiza o primeiro mês — o suficiente para você começar com segurança e ir ajustando
        com o pediatra.
      </p>

      <h2 id="quando-comecar">Quando começar</h2>
      <p>
        A recomendação do Ministério da Saúde e da Sociedade Brasileira de Pediatria é aleitamento
        materno exclusivo até os 6 meses completos, com a introdução de outros alimentos a partir
        daí — mantendo o leite materno até os 2 anos ou mais.
      </p>
      <p>Além da idade, olhe os sinais de prontidão. Em geral o bebê já:</p>
      <ul>
        <li>Senta com apoio mínimo e sustenta bem a cabeça e o tronco;</li>
        <li>Perdeu o reflexo de protrusão (aquele de empurrar tudo para fora com a língua);</li>
        <li>Demonstra interesse ativo pela comida dos adultos — olha, se inclina, tenta pegar;</li>
        <li>Consegue levar objetos à boca com alguma coordenação.</li>
      </ul>

      <Destaque tom="atencao" titulo="Antes dos 6 meses, só com orientação">
        <p>
          Antecipar a introdução por conta própria aumenta risco de alergias, infecções e desmame
          precoce. Se houver indicação de começar antes — por questões de crescimento ou de
          aleitamento — quem define é o pediatra que acompanha o bebê.
        </p>
      </Destaque>

      <h2 id="como-oferecer">Amassado ou pedaço: o que muda</h2>
      <p>
        Existem dois caminhos principais, e os dois funcionam quando bem executados. O que{" "}
        <em>não</em> é recomendado hoje é a papinha ultraliquidificada, que atrasa a mastigação e
        esconde os sabores individuais.
      </p>
      <Tabela>
        <thead className="bg-stone-50 text-xs uppercase tracking-wide text-stone-400">
          <tr>
            <th className="px-4 py-3 font-semibold">Abordagem</th>
            <th className="px-4 py-3 font-semibold">Como é</th>
            <th className="px-4 py-3 font-semibold">Pontos de atenção</th>
          </tr>
        </thead>
        <tbody className="text-stone-600">
          <tr className="border-t border-stone-100">
            <td className="px-4 py-3 font-medium text-stone-800">Amassado com garfo</td>
            <td className="px-4 py-3">
              Alimentos cozidos e amassados, separados no prato, com pedaços reconhecíveis.
            </td>
            <td className="px-4 py-3">
              Não bata no liquidificador nem misture tudo — cada alimento tem seu sabor.
            </td>
          </tr>
          <tr className="border-t border-stone-100">
            <td className="px-4 py-3 font-medium text-stone-800">BLW (guiada pelo bebê)</td>
            <td className="px-4 py-3">
              Pedaços macios em formato de bastão, do tamanho de dois dedos, que o bebê leva à boca
              sozinho.
            </td>
            <td className="px-4 py-3">
              Exige sinais de prontidão bem estabelecidos e adulto treinado em desengasgo.
            </td>
          </tr>
          <tr className="border-t border-stone-100">
            <td className="px-4 py-3 font-medium text-stone-800">Mista</td>
            <td className="px-4 py-3">
              Parte amassada na colher, parte em pedaço para o bebê explorar com a mão.
            </td>
            <td className="px-4 py-3">
              É o que a maioria das famílias acaba fazendo na prática — e é uma escolha válida.
            </td>
          </tr>
        </tbody>
      </Tabela>

      <h2 id="primeiro-mes">Como montar o primeiro mês</h2>
      <p>
        Comece com <strong>uma refeição por dia</strong>, no horário em que o bebê está desperto e
        de bom humor — normalmente o almoço. O leite continua sendo a base da nutrição; a comida,
        nesse começo, é aprendizado.
      </p>
      <ul>
        <li>
          <strong>Semana 1 e 2:</strong> uma refeição por dia. Um alimento novo a cada 2 ou 3 dias,
          para conseguir identificar qualquer reação.
        </li>
        <li>
          <strong>Semana 3:</strong> mantenha uma refeição, mas com o prato já completo — os quatro
          grupos juntos.
        </li>
        <li>
          <strong>Semana 4 em diante:</strong> introduza a segunda refeição (jantar) e comece a
          oferecer fruta como lanche.
        </li>
      </ul>
      <p>
        O prato completo tem quatro grupos, sempre presentes: um{" "}
        <strong>cereal ou tubérculo</strong> (arroz, batata, mandioca, macarrão), uma{" "}
        <strong>leguminosa</strong> (feijão, lentilha, grão-de-bico), uma{" "}
        <strong>proteína animal</strong> (carne, frango, peixe, ovo, fígado) e um{" "}
        <strong>legume ou verdura</strong>.
      </p>

      <Destaque tom="dica" titulo="O caldo do feijão não conta">
        <p>
          Ofereça o grão amassado, não só o caldo. É no grão que está o ferro, e a carne junto no
          mesmo prato melhora bastante o aproveitamento desse ferro pelo organismo.
        </p>
      </Destaque>

      <h2 id="o-que-evitar">O que evitar no primeiro ano</h2>
      <ul>
        <li>
          <strong>Açúcar</strong>, em qualquer forma — inclusive mel, que também traz risco de
          botulismo antes de 1 ano;
        </li>
        <li>
          <strong>Sal</strong> acrescentado. Tempere com alho, cebola, azeite e ervas à vontade;
        </li>
        <li>
          <strong>Ultraprocessados</strong>: biscoito, salgadinho, macarrão instantâneo, iogurte
          adoçado, suco de caixinha;
        </li>
        <li>
          <strong>Leite de vaca</strong> como bebida principal antes de 1 ano;
        </li>
        <li>
          <strong>Alimentos com risco de engasgo</strong> inteiros: uva, tomate-cereja, salsicha em
          rodela, pipoca, castanhas inteiras, cenoura crua dura.
        </li>
      </ul>
      <p>
        Água, sim: a partir do início da introdução alimentar, ofereça água filtrada em copo aberto
        ou de transição, ao longo do dia e nas refeições.
      </p>

      <Destaque tom="atencao" titulo="Ânsia não é engasgo">
        <p>
          Ânsia (gag reflex) é barulhenta, o bebê fica vermelho, tosse e resolve sozinho — é um
          mecanismo de proteção e faz parte do aprendizado. Engasgo real é silencioso: o bebê não
          emite som, não tosse e muda de cor. Fazer um curso de primeiros socorros para bebês antes
          de começar a introdução alimentar é uma das melhores decisões que uma família pode tomar.
        </p>
      </Destaque>

      <h2 id="alergenicos">Alimentos alergênicos: adiar não protege</h2>
      <p>
        A orientação mudou nos últimos anos. Adiar ovo, peixe, amendoim, trigo, soja ou frutos do
        mar <em>não</em> reduz o risco de alergia — em alguns casos, aumenta. A recomendação atual é
        introduzir esses alimentos dentro do período normal, um de cada vez, em quantidade pequena e
        em casa, em dia de bebê saudável.
      </p>
      <p>
        Se houver histórico familiar forte de alergia alimentar ou dermatite atópica importante,
        converse com o pediatra antes — em alguns casos a introdução é feita com acompanhamento.
      </p>

      <CTAInline
        titulo="Do 6º mês em diante, organizado"
        texto="O Pratinho Feliz monta o cardápio da introdução alimentar respeitando a idade do bebê, os quatro grupos no prato e o ritmo de novos alimentos — e vai anotando o que ele já provou e aceitou."
      />

      <h2 id="expectativas">O que esperar de verdade</h2>
      <p>
        No começo, quase nada entra. O bebê brinca, cospe, faz careta, amassa na mão e come três
        colheres. Isso é o processo funcionando: os primeiros meses são sobre textura, sabor,
        coordenação e vínculo com a mesa — não sobre volume.
      </p>
      <p>
        Sirva porções pequenas, sem insistir, e encerre quando ele desviar o rosto ou perder o
        interesse. A quantidade se resolve sozinha ao longo dos meses, desde que a oferta seja
        constante e a experiência seja tranquila.
      </p>
    </>
  );
}

export const post: Post = {
  slug: "introducao-alimentar-primeiros-30-dias",
  titulo: "Introdução alimentar: um guia prático para os primeiros 30 dias",
  resumo:
    "Quando começar, amassado ou BLW, como montar o prato dos quatro grupos, o que evitar antes de 1 ano e por que adiar alimentos alergênicos não protege o bebê.",
  categoria: "introducao-alimentar",
  publicadoEm: "2026-08-14",
  minutos: 9,
  tags: ["introdução alimentar", "BLW", "6 meses", "papinha", "bebê"],
  sumario: [
    { id: "quando-comecar", texto: "Quando começar" },
    { id: "como-oferecer", texto: "Amassado ou pedaço" },
    { id: "primeiro-mes", texto: "Como montar o primeiro mês" },
    { id: "o-que-evitar", texto: "O que evitar no primeiro ano" },
    { id: "alergenicos", texto: "Alimentos alergênicos" },
    { id: "expectativas", texto: "O que esperar de verdade" },
  ],
  faq: [
    {
      pergunta: "Com quantos meses começar a introdução alimentar?",
      resposta:
        "Aos 6 meses completos, mantendo o leite materno. Além da idade, o bebê deve apresentar sinais de prontidão: sentar com apoio mínimo, sustentar a cabeça, ter perdido o reflexo de empurrar a comida com a língua e demonstrar interesse pela comida.",
    },
    {
      pergunta: "Pode colocar sal na comida do bebê?",
      resposta:
        "Não no primeiro ano. Os rins do bebê ainda não lidam bem com sobrecarga de sódio e o paladar se acostuma com o excesso. Use alho, cebola, azeite e ervas frescas para temperar — sabor não falta.",
    },
    {
      pergunta: "Qual a diferença entre BLW e papinha amassada?",
      resposta:
        "No BLW o bebê leva à boca pedaços macios em formato de bastão, sozinho, desde o início. Na abordagem tradicional, o adulto oferece na colher alimentos cozidos e amassados com garfo. As duas funcionam; o que não é recomendado é a papinha batida no liquidificador, que atrasa a mastigação.",
    },
    {
      pergunta: "Preciso adiar ovo, peixe e amendoim para evitar alergia?",
      resposta:
        "Não. A orientação atual é introduzir alimentos alergênicos dentro do período normal da introdução alimentar, um de cada vez, em pequena quantidade e em casa. Adiar não reduz o risco de alergia. Com histórico familiar importante, converse antes com o pediatra.",
    },
    {
      pergunta: "Meu bebê quase não come na introdução alimentar. É normal?",
      resposta:
        "Sim. Nos primeiros meses o leite continua sendo a principal fonte de nutrição e a comida é aprendizado de textura, sabor e coordenação. Comer três colheres, brincar e cuspir faz parte. O que importa é a oferta constante e uma experiência tranquila na mesa.",
    },
  ],
  Corpo,
};
