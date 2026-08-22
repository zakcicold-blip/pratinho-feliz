import type { Post } from "@/lib/blog";
import { Destaque, CTAInline, Passos } from "@/components/blog/Blocos";

function Corpo() {
  return (
    <>
      <p>
        Quando o sono da criança desanda, a investigação costuma girar em torno de rotina, tela e
        horário de dormir. O que come e <em>quando</em> come entra bem menos na conversa — e tem
        influência maior do que parece, nos dois sentidos: a alimentação afeta o sono, e o sono ruim
        muda o apetite no dia seguinte.
      </p>

      <h2 id="via-de-mao-dupla">Uma via de mão dupla</h2>
      <p>
        A relação não é linear. Noites curtas alteram os hormônios que regulam fome e saciedade —
        grelina sobe, leptina cai — e o resultado prático é uma criança que no dia seguinte pede
        mais comida, principalmente doce e carboidrato rápido. Isso desorganiza as refeições, que
        por sua vez atrapalham o sono da noite seguinte.
      </p>
      <p>
        Quebrar esse ciclo raramente exige mudança drástica. Costuma bastar mexer em horários e na
        composição de duas refeições.
      </p>

      <h2 id="triptofano">O caminho até a melatonina</h2>
      <p>
        A melatonina, hormônio que sinaliza ao corpo que é hora de dormir, é produzida a partir da
        serotonina, que por sua vez vem de um aminoácido chamado <strong>triptofano</strong> — que o
        corpo não fabrica e precisa vir da comida.
      </p>
      <p>Fontes acessíveis de triptofano no cardápio infantil:</p>
      <ul>
        <li>Leite, iogurte natural e queijos;</li>
        <li>Ovo;</li>
        <li>Banana e abacate;</li>
        <li>Aveia e arroz integral;</li>
        <li>Frango e peixe;</li>
        <li>Grão-de-bico e lentilha;</li>
        <li>Castanhas e pasta de amendoim (respeitando a idade e o risco de engasgo).</li>
      </ul>
      <p>
        Um detalhe pouco conhecido: o triptofano precisa de <strong>carboidrato junto</strong> para
        chegar bem ao cérebro. Por isso a combinação clássica funciona melhor que o item isolado —
        banana com aveia rende mais que banana sozinha, e leite com um pedaço de pão rende mais que
        só o leite.
      </p>

      <Destaque tom="info" titulo="Magnésio e cálcio ajudam no relaxamento">
        <p>
          Ambos participam do relaxamento muscular e da regulação do sistema nervoso. Estão em
          folhas verde-escuras, sementes de abóbora, aveia, banana, iogurte e queijo — os mesmos
          alimentos da lista acima, o que facilita bastante a vida.
        </p>
      </Destaque>

      <h2 id="o-que-atrapalha">O que atrapalha o sono</h2>
      <ul>
        <li>
          <strong>Cafeína escondida.</strong> Chocolate, achocolatado, refrigerante à base de cola,
          chá preto e chá mate. Em criança, o efeito dura mais tempo que no adulto — evite depois
          das 15h.
        </li>
        <li>
          <strong>Açúcar no fim do dia.</strong> Sobremesa doce no jantar dá pico de glicose e uma
          queda algumas horas depois, que pode provocar despertar noturno.
        </li>
        <li>
          <strong>Jantar muito pesado ou muito gorduroso.</strong> Frituras e porções grandes deixam
          a digestão ativa na hora de dormir e aumentam o desconforto.
        </li>
        <li>
          <strong>Jantar cedo demais sem lanche.</strong> Jantar às 18h e dormir às 21h abre uma
          janela de fome que costuma virar despertar de madrugada.
        </li>
        <li>
          <strong>Muito líquido perto de deitar.</strong> Previsível, mas frequentemente esquecido.
        </li>
      </ul>

      <h2 id="rotina">Como montar o fim do dia</h2>
      <Passos
        itens={[
          {
            titulo: "Jantar entre 2h e 3h antes de dormir",
            texto:
              "Tempo suficiente para digerir sem chegar com fome na cama. Se a criança dorme às 20h30, o jantar fica entre 17h30 e 18h30.",
          },
          {
            titulo: "Jantar leve e completo",
            texto:
              "Uma proteína magra, um carboidrato e um legume. Evite fritura, molho pesado e porção grande.",
          },
          {
            titulo: "Ceia leve se o intervalo for grande",
            texto:
              "Iogurte natural com banana, leite morno com aveia ou uma fatia de pão com queijo. Combinação de triptofano com carboidrato, cerca de 30 a 45 minutos antes de deitar.",
          },
          {
            titulo: "Corte cafeína depois das 15h",
            texto:
              "Chocolate e achocolatado incluídos. Se a criança toma achocolatado à noite por hábito, troque gradualmente por leite puro ou com canela.",
          },
          {
            titulo: "Mantenha os horários no fim de semana",
            texto:
              "Refeições em horários estáveis funcionam como sincronizador do relógio biológico, junto com a luz. Variar demais no sábado e domingo bagunça a semana toda.",
          },
        ]}
      />

      <CTAInline
        titulo="A rotina alimentar organiza o dia inteiro"
        texto="No Pratinho Feliz você define os horários das refeições do seu filho e o plano se ajusta a eles — inclusive com jantares mais leves e ceia quando o intervalo até a hora de dormir é grande."
      />

      <h2 id="quando-investigar">Quando o problema não é a comida</h2>
      <p>
        Ajustar alimentação ajuda, mas não resolve tudo. Vale conversar com o pediatra se houver:
      </p>
      <ul>
        <li>Ronco frequente, respiração pela boca ou pausas na respiração durante o sono;</li>
        <li>Sono muito agitado com sudorese intensa;</li>
        <li>Refluxo, dor abdominal ou desconforto recorrente à noite;</li>
        <li>Coceira noturna, que pode indicar alergia ou dermatite;</li>
        <li>Sonolência excessiva durante o dia mesmo com horas suficientes de sono.</li>
      </ul>
      <p>
        Nesses casos, a causa costuma ser respiratória, digestiva ou alérgica — e nenhuma ceia bem
        montada substitui a investigação certa.
      </p>

      <h2 id="resumo">Em resumo</h2>
      <p>
        Jantar leve dentro de uma janela previsível, uma ceia que combine triptofano com
        carboidrato, cafeína fora da tarde e horários estáveis inclusive no fim de semana. São
        ajustes pequenos, mas se sustentam — e sono melhor devolve apetite mais regular no dia
        seguinte, o que faz o ciclo trabalhar a favor.
      </p>
    </>
  );
}

export const post: Post = {
  slug: "alimentacao-e-sono-infantil",
  titulo: "Alimentação e sono infantil: o que servir no fim do dia",
  resumo:
    "Sono ruim muda o apetite e apetite desregulado piora o sono. Entenda o caminho do triptofano até a melatonina, o que cortar à tarde e como montar jantar e ceia para a noite render.",
  categoria: "desenvolvimento",
  publicadoEm: "2026-07-22",
  minutos: 7,
  tags: ["sono infantil", "melatonina", "triptofano", "rotina noturna"],
  sumario: [
    { id: "via-de-mao-dupla", texto: "Uma via de mão dupla" },
    { id: "triptofano", texto: "O caminho até a melatonina" },
    { id: "o-que-atrapalha", texto: "O que atrapalha o sono" },
    { id: "rotina", texto: "Como montar o fim do dia" },
    { id: "quando-investigar", texto: "Quando o problema não é a comida" },
    { id: "resumo", texto: "Em resumo" },
  ],
  faq: [
    {
      pergunta: "O que dar para a criança comer antes de dormir?",
      resposta:
        "Uma ceia leve que combine triptofano com carboidrato, cerca de 30 a 45 minutos antes de deitar: iogurte natural com banana, leite morno com aveia ou uma fatia de pão com queijo. O carboidrato junto ajuda o triptofano a chegar ao cérebro.",
    },
    {
      pergunta: "Qual o intervalo ideal entre o jantar e a hora de dormir?",
      resposta:
        "Entre 2 e 3 horas. É tempo suficiente para digerir sem que a criança chegue com fome na cama. Se o intervalo for maior que isso, ofereça uma ceia leve para evitar despertar de madrugada.",
    },
    {
      pergunta: "Chocolate atrapalha o sono das crianças?",
      resposta:
        "Sim. Chocolate e achocolatado contêm cafeína e teobromina, estimulantes cujo efeito dura mais tempo em crianças do que em adultos. O ideal é evitar depois das 15h, junto com refrigerante à base de cola, chá preto e chá mate.",
    },
    {
      pergunta: "Dormir mal faz a criança comer mais?",
      resposta:
        "Sim. A privação de sono altera os hormônios que regulam fome e saciedade: a grelina aumenta e a leptina diminui. Na prática, a criança sente mais fome no dia seguinte e tende a preferir doces e carboidratos de absorção rápida.",
    },
  ],
  Corpo,
};
