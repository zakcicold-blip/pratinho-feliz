import type { Post } from "@/lib/blog";
import { Destaque, CTAInline } from "@/components/blog/Blocos";

function Corpo() {
  return (
    <>
      <p>
        A lancheira tem um problema específico: ela precisa aguentar horas fora da geladeira,
        sobreviver à mochila, ser comida em 15 minutos de intervalo — e ainda competir com o
        salgadinho do colega. Aqui vão dez combinações que resolvem isso, mais a lógica por trás
        delas, para você criar as suas.
      </p>

      <h2 id="a-formula">A fórmula da lancheira que funciona</h2>
      <p>
        Um lanche que sustenta até a próxima refeição precisa de três coisas. Só carboidrato dá pico
        de energia e fome de novo em uma hora.
      </p>
      <ul>
        <li>
          <strong>Um carboidrato</strong> — pão, tapioca, bolo caseiro, biscoito de polvilho,
          batata-doce;
        </li>
        <li>
          <strong>Uma proteína ou gordura boa</strong> — queijo, ovo, frango desfiado, pasta de
          amendoim, iogurte natural, castanhas (só depois dos 4 anos, picadas);
        </li>
        <li>
          <strong>Uma fruta</strong> — inteira, cortada com gotas de limão, ou desidratada;
        </li>
        <li>
          <strong>Água.</strong> Suco não é hidratação, é sobremesa líquida.
        </li>
      </ul>

      <h2 id="ideias">Dez lanches prontos</h2>

      <h3>1. Panqueca de banana enrolada</h3>
      <p>
        Um ovo, uma banana amassada e uma colher de aveia. Frite como panqueca fina, enrole com uma
        camada de pasta de amendoim sem açúcar. Vai fria, não desmancha e é doce sem açúcar
        adicionado.
      </p>

      <h3>2. Mini sanduíche de frango desfiado</h3>
      <p>
        Pão de forma integral, frango cozido desfiado misturado com um pouco de cream cheese ou
        requeijão e cenoura ralada fina. Corte em quatro quadrados — porção pequena some mais rápido
        que sanduíche inteiro.
      </p>

      <h3>3. Muffin de queijo e abobrinha</h3>
      <p>
        Massa simples de ovo, farinha, azeite e leite, com abobrinha ralada e queijo. Faça uma
        fornada no domingo e congele: sai do congelador direto para a lancheira e descongela até o
        intervalo.
      </p>

      <h3>4. Iogurte natural + granola caseira + morango</h3>
      <p>
        Iogurte natural puro num potinho, granola separada num saquinho para não murchar. A criança
        mistura na hora — o que também vira parte da diversão.
      </p>

      <h3>5. Ovo cozido + tomatinho + pão</h3>
      <p>
        Simples e altamente proteico. Cozinhe vários ovos de uma vez no início da semana; duram até
        7 dias na geladeira com casca.
      </p>

      <h3>6. Tapioca recheada com queijo</h3>
      <p>
        Feita de manhã, dobrada e cortada ao meio. Fria continua boa, ao contrário do pão de queijo,
        que endurece.
      </p>

      <h3>7. Bolo de cenoura sem cobertura + fatia de queijo</h3>
      <p>
        Bolo caseiro com metade do açúcar da receita original. A fatia de queijo do lado transforma
        um lanche doce em um lanche completo.
      </p>

      <h3>8. Wrap de rap10 com pasta de grão-de-bico</h3>
      <p>
        Homus caseiro (grão-de-bico, azeite, limão, alho), cenoura em palito fino e alface. Enrole
        apertado e embrulhe em papel-manteiga para cortar pela metade.
      </p>

      <h3>9. Batata-doce assada em rodelas + frango</h3>
      <p>
        Rodelas assadas com azeite viram um &ldquo;chips&rdquo; macio que agrada bastante. Acompanha
        bem cubos de frango temperado.
      </p>

      <h3>10. Espetinho de frutas + queijo em cubos</h3>
      <p>
        Uva cortada ao meio no comprimento (nunca inteira, pelo risco de engasgo), morango, melão e
        cubos de queijo branco. Comida em formato de espeto tem taxa de aceitação bem maior.
      </p>

      <Destaque tom="dica" titulo="Regra dos dois conhecidos">
        <p>
          Toda lancheira leva pelo menos dois itens que a criança já gosta. Novidade vai como
          terceiro item, em porção pequena. Lancheira 100% nova volta 100% cheia — e ainda cria
          resistência para a próxima.
        </p>
      </Destaque>

      <h2 id="conservacao">Como manter seguro até o intervalo</h2>
      <ul>
        <li>
          <strong>Bolsa térmica com gelo reutilizável</strong> sempre que houver ovo, frango, laticínio
          ou pasta cremosa;
        </li>
        <li>
          <strong>Congele a garrafinha de água</strong> pela metade na noite anterior — ela vira o
          gelo da lancheira e derrete como água gelada até o intervalo;
        </li>
        <li>
          <strong>Fruta cortada com gotas de limão</strong> não escurece (maçã, banana, pera);
        </li>
        <li>
          <strong>Separe o úmido do seco</strong> em potes diferentes: granola, biscoito e pão perdem
          a textura em contato com o resto.
        </li>
      </ul>

      <CTAInline
        titulo="Lancheira da semana inteira em um lugar"
        texto="O Pratinho Feliz monta os lanches junto com as refeições do dia, considerando o que seu filho já aceita, e gera a lista de compras do que falta — sem você repensar tudo toda segunda-feira."
      />

      <h2 id="preparo">Trinta minutos no domingo</h2>
      <p>
        O que separa a semana tranquila da correria das 6h30 é o preparo antecipado. Um bloco curto
        no fim de semana resolve quase tudo:
      </p>
      <ul>
        <li>Cozinhe e desfie o frango da semana (guarda 3 dias na geladeira, 3 meses congelado);</li>
        <li>Asse uma fornada de muffins ou um bolo e congele em porções;</li>
        <li>Cozinhe 6 ovos;</li>
        <li>Lave e corte frutas firmes; deixe as macias para cortar na hora;</li>
        <li>Porcione castanhas e granola em saquinhos individuais.</li>
      </ul>
      <p>
        Com isso na geladeira, montar a lancheira vira uma tarefa de dois minutos — e a chance de o
        biscoito recheado resolver o problema por você cai bastante.
      </p>
    </>
  );
}

export const post: Post = {
  slug: "lanche-escolar-saudavel-ideias",
  titulo: "10 ideias de lanche escolar que a criança realmente come",
  resumo:
    "A fórmula de uma lancheira que sustenta até a próxima refeição, dez combinações prontas que aguentam horas fora da geladeira e o preparo de domingo que salva a semana.",
  categoria: "receitas",
  publicadoEm: "2026-08-08",
  minutos: 7,
  tags: ["lanche escolar", "lancheira", "receitas", "volta às aulas"],
  sumario: [
    { id: "a-formula", texto: "A fórmula da lancheira" },
    { id: "ideias", texto: "Dez lanches prontos" },
    { id: "conservacao", texto: "Como manter seguro" },
    { id: "preparo", texto: "Trinta minutos no domingo" },
  ],
  faq: [
    {
      pergunta: "O que colocar na lancheira escolar de forma saudável?",
      resposta:
        "Combine um carboidrato (pão, tapioca, bolo caseiro), uma proteína ou gordura boa (queijo, ovo, frango desfiado, pasta de amendoim, iogurte natural), uma fruta e água. Só carboidrato dá pico de energia e fome logo em seguida.",
    },
    {
      pergunta: "Posso mandar iogurte na lancheira sem bolsa térmica?",
      resposta:
        "Não é recomendado. Iogurte, queijo, ovo e frango precisam de bolsa térmica com gelo reutilizável. Um truque prático é congelar metade da garrafinha de água na noite anterior: ela refrigera a lancheira e vira água gelada na hora do intervalo.",
    },
    {
      pergunta: "Posso mandar suco de caixinha na lancheira?",
      resposta:
        "O ideal é água. Sucos de caixinha, mesmo os rotulados como integrais, concentram açúcar e não hidratam como água. Se quiser oferecer fruta, prefira a fruta inteira ou cortada, que ainda entrega fibra e mastigação.",
    },
    {
      pergunta: "Meu filho volta com a lancheira cheia. O que fazer?",
      resposta:
        "Monte a lancheira com pelo menos dois itens que ele já gosta e coloque a novidade como terceiro item, em porção pequena. Reduza também o volume total: porções grandes intimidam e o intervalo costuma ter só 15 a 20 minutos.",
    },
  ],
  Corpo,
};
