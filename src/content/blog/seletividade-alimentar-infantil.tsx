import type { Post } from "@/lib/blog";
import { Destaque, CTAInline, Passos } from "@/components/blog/Blocos";

function Corpo() {
  return (
    <>
      <p>
        Você cozinha, senta na mesa, oferece — e vem o &ldquo;não quero&rdquo;. No dia seguinte, o
        mesmo prato que ela amava na semana passada volta intocado. Se isso soa familiar, você não
        está fazendo nada de errado: a recusa alimentar é uma das fases mais comuns da infância, e
        na maioria das vezes ela tem explicação e tem saída.
      </p>

      <h2 id="o-que-e">O que é seletividade alimentar</h2>
      <p>
        Seletividade alimentar é quando a criança restringe de forma persistente o que aceita comer
        — por grupo, por textura, por cor ou até pelo formato do corte. É diferente da recusa
        pontual (aquele dia em que ela simplesmente não quis o almoço) porque se repete e vai
        estreitando o cardápio ao longo do tempo.
      </p>
      <p>
        Um marcador prático usado por pediatras: se a criança aceita menos de 15 a 20 alimentos
        diferentes no total, ou se ela elimina um grupo inteiro (nenhuma fruta, nenhuma proteína,
        nenhum vegetal) por semanas seguidas, vale investigar com mais atenção.
      </p>

      <h2 id="por-que-acontece">Por que acontece</h2>
      <p>
        Entre 2 e 6 anos, quase toda criança passa por algum grau de seletividade. Os motivos mais
        comuns se acumulam:
      </p>
      <ul>
        <li>
          <strong>Neofobia alimentar.</strong> Uma fase natural de desconfiança do que é novo, que
          protegia a espécie de comer algo perigoso. Ela costuma aparecer perto dos 2 anos e vai
          cedendo com a exposição repetida.
        </li>
        <li>
          <strong>Desaceleração do crescimento.</strong> Depois do primeiro ano, o ganho de peso
          desacelera muito. A criança come proporcionalmente menos porque precisa de menos — e os
          adultos interpretam isso como &ldquo;parou de comer&rdquo;.
        </li>
        <li>
          <strong>Autonomia.</strong> Recusar comida é uma das primeiras formas que a criança
          descobre de exercer controle sobre o próprio corpo. Muitas vezes o &ldquo;não&rdquo; é
          sobre poder, não sobre o brócolis.
        </li>
        <li>
          <strong>Sensibilidade sensorial.</strong> Algumas crianças reagem intensamente a texturas
          moles, alimentos misturados, molhos ou cheiros fortes. Não é frescura — é como o sistema
          sensorial delas processa a informação.
        </li>
        <li>
          <strong>Excesso de líquidos e petiscos entre refeições.</strong> Suco, leite e biscoito no
          meio da tarde chegam à mesa como fome já resolvida.
        </li>
      </ul>

      <Destaque tom="info" titulo="A divisão de responsabilidades">
        <p>
          Uma referência clássica da área, formulada pela nutricionista e terapeuta Ellyn Satter,
          resume bem: <strong>o adulto decide o quê, quando e onde</strong> se come;{" "}
          <strong>a criança decide se vai comer e quanto</strong>. Quando o adulto invade a segunda
          parte, a mesa vira disputa.
        </p>
      </Destaque>

      <h2 id="o-que-nao-funciona">O que costuma piorar</h2>
      <p>
        Antes das estratégias, vale desarmar o que a maioria de nós tenta por instinto — e que a
        literatura mostra ter efeito contrário no médio prazo:
      </p>
      <ul>
        <li>
          <strong>Obrigar a comer &ldquo;mais três colheradas&rdquo;.</strong> Aumenta a aceitação
          naquela refeição e reduz a aceitação daquele alimento no futuro.
        </li>
        <li>
          <strong>Usar sobremesa como moeda.</strong> &ldquo;Se comer o feijão, ganha o doce&rdquo;
          ensina que o feijão é o preço e o doce é o prêmio. O valor relativo dos dois muda na
          cabeça da criança.
        </li>
        <li>
          <strong>Cozinhar um prato separado.</strong> Quando a recusa garante o macarrão de sempre,
          ela vira uma estratégia que funciona.
        </li>
        <li>
          <strong>Esconder o vegetal.</strong> Bater cenoura no molho pode melhorar a nutrição do
          dia, mas não ensina a criança a aceitar cenoura — e, se ela descobre, custa confiança.
        </li>
        <li>
          <strong>Comentar sobre o quanto ela comeu.</strong> Elogio e cobrança colocam plateia numa
          decisão que deveria ser interna.
        </li>
      </ul>

      <h2 id="estrategias">Seis estratégias que funcionam</h2>
      <Passos
        itens={[
          {
            titulo: "Exposição sem pressão, muitas vezes",
            texto:
              "Um alimento novo pode precisar de 8 a 15 apresentações até ser aceito. Coloque no prato, não comente, e retire sem drama se voltar intacto. A conta é de meses, não de jantares.",
          },
          {
            titulo: "Sirva o novo junto com o conhecido",
            texto:
              "Prato com dois ou três itens que ela já aceita mais uma porção pequena do alimento em teste. Segurança primeiro, novidade depois.",
          },
          {
            titulo: "Deixe ela se servir",
            texto:
              "Travessa na mesa e prato vazio na frente. Escolher a própria porção reduz a sensação de imposição e costuma aumentar o que é efetivamente comido.",
          },
          {
            titulo: "Envolva antes da mesa",
            texto:
              "Escolher no mercado, lavar folhas, quebrar ovo, montar o próprio sanduíche. Criança que participa do preparo prova mais — e isso vale desde os 2 anos.",
          },
          {
            titulo: "Proteja a janela de fome",
            texto:
              "Um intervalo de 2 a 3 horas sem petiscos nem líquidos calóricos antes da refeição principal. Fome real é o melhor tempero que existe.",
          },
          {
            titulo: "Coma junto, comendo a mesma coisa",
            texto:
              "Modelo importa mais que discurso. Ver o adulto comer aquilo com naturalidade, na mesma mesa, é a intervenção mais consistente que existe na literatura.",
          },
        ]}
      />

      <Destaque tom="dica" titulo="A regra dos 20 minutos">
        <p>
          Refeição de criança pequena rende entre 20 e 30 minutos. Passou disso, o rendimento cai e
          a tensão sobe. Encerre com tranquilidade, sem substituir por outra coisa, e ofereça de
          novo no próximo horário previsto.
        </p>
      </Destaque>

      <CTAInline
        titulo="Recusa cansa porque é todo dia"
        texto="O Pratinho Feliz registra o que seu filho aceitou e o que rejeitou, e vai reorganizando o cardápio em cima disso — repetindo o que funciona e reintroduzindo o resto aos poucos, sem você ter que lembrar de tudo."
      />

      <h2 id="quando-procurar-ajuda">Quando procurar ajuda profissional</h2>
      <p>
        A maior parte dos casos melhora com tempo, rotina e ambiente sem pressão. Procure o pediatra
        ou um nutricionista infantil se aparecer algum destes sinais:
      </p>
      <ul>
        <li>Perda de peso, ou peso e altura saindo da curva de crescimento;</li>
        <li>Menos de 15 alimentos aceitos, com a lista encolhendo em vez de crescer;</li>
        <li>Recusa total de um grupo alimentar por mais de um mês;</li>
        <li>Engasgo frequente, vômito ou náusea diante de determinadas texturas;</li>
        <li>Sinais de carência: cansaço fora do comum, palidez, queda de cabelo, irritabilidade;</li>
        <li>A hora da refeição virou fonte de sofrimento real para a criança ou para a família.</li>
      </ul>
      <p>
        Nesses casos, a avaliação costuma envolver mais gente do que só a nutrição — fonoaudiologia
        e terapia ocupacional entram quando há componente sensorial ou de deglutição. Pedir ajuda
        cedo encurta muito o caminho.
      </p>

      <h2 id="resumo">Em resumo</h2>
      <p>
        Seletividade é fase para a maioria e some com exposição repetida, mesa tranquila e adulto
        comendo junto. O trabalho não é convencer a criança a comer hoje — é manter a oferta
        constante e sem pressão até que ela decida sozinha. É mais lento e muito mais eficaz.
      </p>
    </>
  );
}

export const post: Post = {
  slug: "seletividade-alimentar-infantil",
  titulo: "Seletividade alimentar: por que a criança recusa comida (e o que fazer)",
  resumo:
    "Recusa, birra e cardápio que só encolhe têm explicação. Entenda o que está por trás da seletividade alimentar e seis estratégias com respaldo para virar o jogo sem transformar a mesa em campo de batalha.",
  categoria: "rotina",
  publicadoEm: "2026-08-20",
  minutos: 8,
  destaque: true,
  tags: ["seletividade alimentar", "recusa alimentar", "birra", "rotina alimentar"],
  sumario: [
    { id: "o-que-e", texto: "O que é seletividade alimentar" },
    { id: "por-que-acontece", texto: "Por que acontece" },
    { id: "o-que-nao-funciona", texto: "O que costuma piorar" },
    { id: "estrategias", texto: "Seis estratégias que funcionam" },
    { id: "quando-procurar-ajuda", texto: "Quando procurar ajuda" },
    { id: "resumo", texto: "Em resumo" },
  ],
  faq: [
    {
      pergunta: "É normal criança de 3 anos comer pouco?",
      resposta:
        "Sim. Depois do primeiro ano o crescimento desacelera bastante e o apetite acompanha. Enquanto peso e altura seguem na curva e a criança tem energia e disposição, comer menos do que o adulto espera costuma ser esperado para a idade.",
    },
    {
      pergunta: "Quantas vezes preciso oferecer um alimento novo?",
      resposta:
        "A referência mais usada é de 8 a 15 apresentações do mesmo alimento antes de concluir que a criança não aceita. O importante é oferecer sem pressão e sem comentar a recusa, espaçando as tentativas ao longo de semanas.",
    },
    {
      pergunta: "Posso esconder legumes na comida do meu filho?",
      resposta:
        "Como estratégia isolada, não resolve. Melhora a nutrição daquele dia, mas não ensina a criança a reconhecer e aceitar o alimento. Funciona melhor combinar: usar o vegetal batido no molho e, ao mesmo tempo, servir o mesmo vegetal visível no prato, sem obrigar a comer.",
    },
    {
      pergunta: "Devo obrigar meu filho a experimentar pelo menos um pouco?",
      resposta:
        "Obrigar aumenta a aceitação naquela refeição e reduz a aceitação daquele alimento no longo prazo. O caminho mais eficaz é manter o alimento disponível no prato, comer o mesmo junto com a criança e deixar a decisão de provar com ela.",
    },
    {
      pergunta: "Quando a seletividade alimentar vira caso de médico?",
      resposta:
        "Procure o pediatra se houver perda de peso ou saída da curva de crescimento, menos de 15 alimentos aceitos, recusa de um grupo alimentar inteiro por mais de um mês, engasgos e vômitos ligados a texturas, ou sinais de carência nutricional como palidez e cansaço fora do comum.",
    },
  ],
  Corpo,
};
