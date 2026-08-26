import type { Metadata } from "next";
import DocumentoLegal, { Destaque, Secao } from "@/components/DocumentoLegal";
import { IDENTIFICACAO } from "@/lib/identificacao";

/**
 * Termos de uso.
 *
 * Escrito para um app que (a) e vendido por assinatura ao consumidor, (b)
 * trata dados de criancas e (c) fala de alimentacao. Cada um dos tres traz
 * uma exigencia propria, e as tres estao aqui: direito de arrependimento do
 * Art. 49 do CDC, consentimento do Art. 14 da LGPD e o limite de que isto e
 * organizacao de rotina, nao conduta clinica.
 *
 * O que NAO esta aqui, de proposito: clausula de exclusao de responsabilidade
 * ampla e clausula de foro em outra comarca. As duas sao nulas em contrato de
 * consumo (CDC, Art. 51, I e Art. 101, I) e a unica coisa que fazem e sinalizar
 * ma-fe quando o contrato e lido por um juiz.
 */
export const metadata: Metadata = {
  title: "Termos de uso",
  description:
    "As regras de uso do Pratinho Feliz: assinatura, cancelamento, direito de arrependimento e os limites do que o aplicativo faz.",
};

export default function TermosPage() {
  return (
    <DocumentoLegal
      titulo="Termos de uso"
      resumo="Em resumo: o Pratinho Feliz organiza a alimentação da sua criança — ele não é consulta, não diagnostica e não substitui pediatra ou nutricionista. A assinatura é mensal, você cancela quando quiser e tem 7 dias para desistir com devolução integral. Os dados da criança só são tratados com o seu consentimento e nunca são vendidos."
    >
      <Secao numero="1" titulo="Quem oferece este serviço">
        <p>
          O {IDENTIFICACAO.produto} é operado por <strong>{IDENTIFICACAO.razaoSocial}</strong>,
          inscrita sob o nº {IDENTIFICACAO.documento}, com endereço em {IDENTIFICACAO.endereco}.
          Contato oficial: {IDENTIFICACAO.email}.
        </p>
        <p>
          Ao criar uma conta ou assinar, você concorda com estes Termos. Se não concordar com algum
          ponto, não use o serviço — e, se já tiver assinado, o item 7 explica como desistir.
        </p>
      </Secao>

      <Secao numero="2" titulo="O que o Pratinho Feliz é — e o que não é">
        <p>
          O {IDENTIFICACAO.produto} é uma ferramenta de <strong>organização e apoio à rotina
          alimentar</strong>. Ele monta sugestões de cardápio, calcula estimativas nutricionais com
          base na tabela TACO (NEPA/UNICAMP), gera lista de compras e acompanha o que a criança
          aceita ou recusa.
        </p>

        <Destaque>
          <p className="font-semibold text-stone-900">Este aplicativo não é um serviço de saúde.</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-stone-700">
            <li>Não realiza diagnóstico nem avaliação clínica.</li>
            <li>Não prescreve dieta, suplemento, medicamento ou conduta terapêutica.</li>
            <li>Não substitui pediatra, nutricionista ou qualquer profissional de saúde.</li>
            <li>
              Não deve ser usado para decidir sobre alergia alimentar, restrição médica, ganho ou
              perda de peso da criança sem orientação profissional.
            </li>
          </ul>
          <p className="mt-3 text-stone-700">
            Os valores nutricionais são <strong>estimativas</strong> calculadas a partir de tabelas
            públicas de composição de alimentos. Eles variam conforme o alimento real, o preparo e a
            porção efetivamente consumida.
          </p>
          <p className="mt-3 text-stone-700">
            Em caso de sintoma persistente, perda de peso, recusa alimentar prolongada, engasgo
            frequente ou qualquer preocupação com a saúde da criança, procure atendimento
            profissional. Não espere pelo aplicativo.
          </p>
        </Destaque>
      </Secao>

      <Secao numero="3" titulo="Quem pode usar">
        <p>
          A conta é de uso de <strong>pessoa maior de 18 anos</strong> que seja mãe, pai,
          responsável legal ou cuidador autorizado da criança cujo perfil for cadastrado. Não
          criamos contas para crianças e o aplicativo não é destinado ao uso direto por elas.
        </p>
        <p>
          Você é responsável por manter a senha em sigilo e por tudo que acontece na sua conta.
          Se suspeitar de acesso indevido, troque a senha e nos avise.
        </p>
      </Secao>

      <Secao numero="4" titulo="Dados da criança">
        <Destaque>
          <p className="font-semibold text-stone-900">
            Consentimento específico do responsável (LGPD, Art. 14, § 1º)
          </p>
          <p className="mt-2 text-stone-700">
            Ao cadastrar o perfil da criança, você declara ser mãe, pai ou responsável legal e
            autoriza expressamente o tratamento dos dados dela para a finalidade única de montar e
            adaptar o plano alimentar dentro do aplicativo.
          </p>
          <p className="mt-2 text-stone-700">
            Pedimos apenas o que é estritamente necessário para essa finalidade — faixa etária,
            preferências, recusas, restrições alimentares e rotina. Nenhuma dessas informações é
            usada para publicidade dirigida à criança, e nenhuma é vendida.
          </p>
          <p className="mt-2 text-stone-700">
            Você pode retirar esse consentimento a qualquer momento excluindo o perfil da criança
            nas Configurações. A retirada não afeta o que já foi feito antes dela.
          </p>
        </Destaque>
        <p>
          O detalhamento de quais dados coletamos, por quê e com quem compartilhamos está na{" "}
          <a href="/privacidade" className="text-orange-600 hover:underline">
            Política de Privacidade
          </a>
          , que faz parte destes Termos.
        </p>
      </Secao>

      <Secao numero="5" titulo="Conta gratuita e assinatura">
        <p>
          Criar conta é gratuito. Na conta gratuita você usa o cardápio do dia e registra a rotina.
          Recursos como o cardápio completo dos 30 dias, a lista de compras da semana, o modo
          cozinha e o relatório fazem parte do plano pago.
        </p>
        <p>
          A assinatura é <strong>mensal e de renovação automática</strong>. O preço vigente é
          sempre o exibido na tela de pagamento no momento da contratação. O pagamento é processado
          por parceiro de pagamentos, e não recebemos nem armazenamos os dados do seu cartão.
        </p>
        <p>
          Mudanças de preço não se aplicam ao ciclo já pago e são avisadas com antecedência mínima
          de 30 dias antes da renovação seguinte.
        </p>
      </Secao>

      <Secao numero="6" titulo="Cancelamento">
        <p>
          Você pode cancelar a assinatura a qualquer momento, pelas Configurações do aplicativo ou
          escrevendo para {IDENTIFICACAO.email}. Não há multa, fidelidade nem período mínimo.
        </p>
        <p>
          O cancelamento interrompe as cobranças seguintes. O acesso pago continua até o fim do
          período já pago — você não perde o que contratou.
        </p>
      </Secao>

      <Secao numero="7" titulo="Direito de arrependimento (7 dias)">
        <Destaque>
          <p className="font-semibold text-stone-900">
            Você tem 7 dias para desistir, sem precisar justificar.
          </p>
          <p className="mt-2 text-stone-700">
            Como a contratação acontece pela internet, aplica-se o Art. 49 do Código de Defesa do
            Consumidor: dentro de <strong>7 dias corridos contados da confirmação da compra</strong>,
            você pode desistir e receber de volta <strong>tudo que pagou</strong>, corrigido, sem
            retenção de qualquer taxa.
          </p>
          <p className="mt-2 text-stone-700">
            Basta escrever para {IDENTIFICACAO.email} pedindo o cancelamento por arrependimento. A
            devolução é feita pelo mesmo meio de pagamento usado na compra.
          </p>
          <p className="mt-2 text-stone-700">
            Este direito é irrenunciável e nada nestes Termos o limita.
          </p>
        </Destaque>
      </Secao>

      <Secao numero="8" titulo="Uso adequado">
        <p>Ao usar o {IDENTIFICACAO.produto}, você se compromete a não:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>compartilhar sua conta com terceiros ou revender o acesso;</li>
          <li>
            copiar, extrair em massa ou redistribuir o conteúdo do aplicativo — receitas, textos e
            base de dados são protegidos por direito autoral;
          </li>
          <li>
            tentar burlar limites técnicos, acessar áreas restritas ou dados de outras pessoas;
          </li>
          <li>usar o serviço para qualquer finalidade ilícita ou que ponha crianças em risco.</li>
        </ul>
        <p>
          O descumprimento pode levar à suspensão da conta. Se a suspensão acontecer sem motivo
          justo, devolvemos proporcionalmente o valor do período não usado.
        </p>
      </Secao>

      <Secao numero="9" titulo="Disponibilidade do serviço">
        <p>
          Trabalhamos para manter o aplicativo disponível, mas ele depende de internet, de serviços
          de terceiros e de manutenções. Interrupções podem acontecer.
        </p>
        <p>
          Se uma indisponibilidade relevante for causada por nós e impedir o uso do serviço pago
          por período prolongado, você tem direito ao abatimento proporcional do valor
          correspondente.
        </p>
      </Secao>

      <Secao numero="10" titulo="Responsabilidade">
        <p>
          Respondemos pelos defeitos do serviço nos termos do Código de Defesa do Consumidor. Nada
          nestes Termos exclui ou limita essa responsabilidade — cláusula nesse sentido seria nula
          (CDC, Art. 51, I).
        </p>
        <p>
          O que definimos aqui é o <strong>alcance do serviço</strong>: como descrito no item 2, o
          aplicativo organiza rotina alimentar e apresenta estimativas. Decisões sobre a saúde da
          criança são suas, idealmente com orientação profissional, e não decorrem de recomendação
          clínica nossa — porque não fazemos recomendação clínica.
        </p>
      </Secao>

      <Secao numero="11" titulo="Mudanças nestes Termos">
        <p>
          Podemos alterar estes Termos. Mudanças relevantes — especialmente as que afetem preço,
          cancelamento ou tratamento de dados — são comunicadas por e-mail e dentro do aplicativo
          com pelo menos <strong>30 dias</strong> de antecedência.
        </p>
        <p>
          Se você não concordar com a nova versão, pode cancelar antes que ela entre em vigor, com
          devolução proporcional do período não usado.
        </p>
      </Secao>

      <Secao numero="12" titulo="Lei aplicável e foro">
        <p>
          Estes Termos são regidos pela lei brasileira. Eventuais disputas podem ser levadas ao
          foro do <strong>seu domicílio</strong>, conforme o Art. 101, I do Código de Defesa do
          Consumidor — não impomos comarca diferente da sua.
        </p>
        <p>
          Antes disso, escreva para {IDENTIFICACAO.email}: a maior parte das questões se resolve
          por ali, e mais rápido.
        </p>
      </Secao>
    </DocumentoLegal>
  );
}
