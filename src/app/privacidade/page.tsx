import type { Metadata } from "next";
import DocumentoLegal, { Destaque, Secao } from "@/components/DocumentoLegal";
import { IDENTIFICACAO } from "@/lib/identificacao";

/**
 * Politica de privacidade.
 *
 * A versao anterior tinha quatro paragrafos. Ela nao chegava perto do que a
 * LGPD exige (Art. 9: finalidade, base legal, duracao, compartilhamento e
 * direitos, em linguagem clara) nem do que a Play Store cobra para preencher
 * o formulario de Data Safety, que precisa bater linha a linha com o que
 * estiver escrito aqui.
 *
 * A tabela de finalidade x base legal e o coracao do documento: e a primeira
 * coisa que uma autoridade pede, e e o que impede o erro comum de tratar tudo
 * como "consentimento" — o que fragiliza a operacao inteira, porque
 * consentimento pode ser retirado a qualquer momento, inclusive o de cobrar.
 */
export const metadata: Metadata = {
  title: "Política de privacidade",
  description:
    "Quais dados o Pratinho Feliz coleta, para quê, com quem compartilha, por quanto tempo guarda e como você exerce seus direitos.",
};

type Linha = { dado: string; finalidade: string; base: string };

const TRATAMENTOS: Linha[] = [
  {
    dado: "Nome, e-mail e senha (guardada como hash, nunca em texto)",
    finalidade: "Criar e manter sua conta, autenticar o acesso",
    base: "Execução de contrato (Art. 7º, V)",
  },
  {
    dado: "Telefone, quando informado",
    finalidade: "Atendimento e avisos sobre a assinatura",
    base: "Execução de contrato (Art. 7º, V)",
  },
  {
    dado: "Dados da criança: apelido, faixa etária, preferências, recusas, restrições alimentares e rotina",
    finalidade: "Montar e adaptar o plano alimentar",
    base: "Consentimento específico do responsável (Art. 14, § 1º)",
  },
  {
    dado: "Registros de uso: refeições marcadas, reações, itens de despensa, sono e disposição",
    finalidade: "Ajustar as sugestões e montar o relatório de acompanhamento",
    base: "Execução de contrato (Art. 7º, V)",
  },
  {
    dado: "Dados de pagamento (processados pelo parceiro; recebemos e-mail, valor, status e os 4 últimos dígitos do CPF)",
    finalidade: "Liberar o acesso, emitir cobrança e cumprir obrigação fiscal",
    base: "Execução de contrato e obrigação legal (Art. 7º, V e II)",
  },
  {
    dado: "IP, dispositivo, páginas visitadas, origem da visita e tentativas de acesso",
    finalidade: "Segurança, prevenção a fraude e abuso, e medição de campanhas",
    base: "Legítimo interesse (Art. 7º, IX)",
  },
  {
    dado: "Perguntas feitas ao assistente",
    finalidade: "Gerar a resposta",
    base: "Execução de contrato (Art. 7º, V)",
  },
];

export default function PrivacidadePage() {
  return (
    <DocumentoLegal
      titulo="Política de privacidade"
      resumo="Em resumo: coletamos o mínimo para o aplicativo funcionar, os dados da criança só são usados para montar o cardápio dela, nada é vendido, nada vira publicidade dirigida a criança, e você pode baixar ou apagar tudo quando quiser."
    >
      <Secao numero="1" titulo="Quem trata os seus dados">
        <p>
          O controlador é <strong>{IDENTIFICACAO.razaoSocial}</strong>, nº{" "}
          {IDENTIFICACAO.documento}, com endereço em {IDENTIFICACAO.endereco}.
        </p>
        <p>
          O encarregado pelo tratamento de dados pessoais (LGPD, Art. 41) é{" "}
          {IDENTIFICACAO.encarregado}, que você contata em{" "}
          <a
            href={`mailto:${IDENTIFICACAO.emailEncarregado}`}
            className="text-orange-600 hover:underline"
          >
            {IDENTIFICACAO.emailEncarregado}
          </a>
          .
        </p>
      </Secao>

      <Secao numero="2" titulo="O que coletamos, para quê e com qual base legal">
        <p>
          Cada dado tem uma finalidade declarada e uma base legal. Não coletamos nada “por
          precaução”.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[36rem] border-collapse text-sm">
            <thead>
              <tr className="border-b border-stone-300 text-left">
                <th className="py-2 pr-3 font-semibold text-stone-800">Dado</th>
                <th className="py-2 pr-3 font-semibold text-stone-800">Para quê</th>
                <th className="py-2 font-semibold text-stone-800">Base legal (LGPD)</th>
              </tr>
            </thead>
            <tbody>
              {TRATAMENTOS.map((t) => (
                <tr key={t.dado} className="border-b border-stone-100 align-top">
                  <td className="py-2.5 pr-3 text-stone-700">{t.dado}</td>
                  <td className="py-2.5 pr-3 text-stone-600">{t.finalidade}</td>
                  <td className="py-2.5 text-stone-500">{t.base}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-sm text-stone-500">
          Não coletamos localização precisa, não acessamos câmera, microfone, contatos, fotos nem
          arquivos do seu aparelho.
        </p>
      </Secao>

      <Secao numero="3" titulo="Dados de crianças">
        <Destaque>
          <p className="font-semibold text-stone-900">
            Tratamento no melhor interesse da criança (LGPD, Art. 14)
          </p>
          <ul className="mt-2 list-disc space-y-1.5 pl-5 text-stone-700">
            <li>
              Os dados da criança só são tratados com o <strong>consentimento específico e em
              destaque</strong> de mãe, pai ou responsável legal, dado no cadastro do perfil.
            </li>
            <li>
              Pedimos apenas o <strong>estritamente necessário</strong> para montar o cardápio.
              Nenhum recurso do aplicativo exige dado da criança além disso (Art. 14, § 4º).
            </li>
            <li>
              Não usamos dados de criança para publicidade dirigida, criação de perfil comercial ou
              qualquer finalidade fora do plano alimentar.
            </li>
            <li>
              Não repassamos dados de criança a terceiros, exceto aos provedores de infraestrutura
              listados no item 4, que apenas hospedam a informação sob nossa instrução.
            </li>
            <li>
              O consentimento pode ser retirado a qualquer momento excluindo o perfil da criança
              nas Configurações — isso apaga os dados dela.
            </li>
          </ul>
        </Destaque>
        <p>
          O aplicativo não é destinado ao uso direto por crianças e não criamos contas para
          menores de 18 anos.
        </p>
      </Secao>

      <Secao numero="4" titulo="Com quem compartilhamos">
        <p>
          Nós <strong>não vendemos dados</strong> e não os cedemos para uso próprio de terceiros. O
          compartilhamento acontece apenas com prestadores que executam parte do serviço sob nossa
          instrução:
        </p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            <strong>Processamento de pagamento</strong> (Cakto e Stripe) — recebem os dados que
            você digita no checkout. Os dados do cartão vão direto para eles; nós não os vemos nem
            guardamos.
          </li>
          <li>
            <strong>Hospedagem e banco de dados</strong> (Vercel e Neon) — armazenam a aplicação e
            os dados para que o serviço funcione.
          </li>
          <li>
            <strong>E-mail transacional</strong> (Resend) — envia mensagens sobre a conta e a
            assinatura.
          </li>
          <li>
            <strong>Assistente</strong> (Anthropic) — recebe a pergunta e o contexto do perfil para
            gerar a resposta. As conversas não são usadas para treinar modelos.
          </li>
          <li>
            <strong>Medição de anúncios</strong> (Meta) — recebe eventos de conversão. Enviamos o
            e-mail em forma cifrada (hash) para que a plataforma reconheça a conversão sem receber
            o endereço legível. <strong>Nenhum dado de criança é enviado.</strong>
          </li>
          <li>
            <strong>Parceiras de divulgação</strong> — quando você chega por um link de indicação,
            a parceira vê que houve um cadastro e a situação da assinatura. Ela vê apenas o
            primeiro nome e o e-mail parcialmente ocultado, nunca os dados completos nem qualquer
            informação da criança.
          </li>
        </ul>
        <p>
          Também podemos compartilhar dados quando houver <strong>obrigação legal</strong> ou ordem
          de autoridade competente.
        </p>
      </Secao>

      <Secao numero="5" titulo="Transferência internacional">
        <p>
          Parte dos provedores acima opera servidores fora do Brasil. Nesses casos a transferência
          se apoia no Art. 33 da LGPD e nas cláusulas contratuais firmadas com cada provedor, que
          obrigam a manter o mesmo nível de proteção previsto na lei brasileira.
        </p>
      </Secao>

      <Secao numero="6" titulo="Por quanto tempo guardamos">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            <strong>Conta e perfis:</strong> enquanto a conta existir. Ao excluir a conta, apagamos
            os dados da conta e das crianças.
          </li>
          <li>
            <strong>Registros de pagamento:</strong> mantidos pelo prazo exigido pela legislação
            fiscal, mesmo após a exclusão da conta — é obrigação legal, não escolha nossa.
          </li>
          <li>
            <strong>Registros de acesso:</strong> guardados por 6 meses, conforme o Art. 15 do
            Marco Civil da Internet.
          </li>
          <li>
            <strong>Dados de navegação e campanha:</strong> até 90 dias, depois são descartados ou
            anonimizados.
          </li>
        </ul>
      </Secao>

      <Secao numero="7" titulo="Seus direitos">
        <p>
          A LGPD (Art. 18) garante a você, a qualquer momento e sem custo, o direito de:
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>confirmar que tratamos seus dados e acessar quais são;</li>
          <li>corrigir dado incompleto, inexato ou desatualizado;</li>
          <li>pedir anonimização, bloqueio ou eliminação de dado desnecessário ou excessivo;</li>
          <li>pedir a portabilidade dos dados;</li>
          <li>revogar o consentimento e pedir a eliminação dos dados tratados com base nele;</li>
          <li>saber com quem compartilhamos seus dados;</li>
          <li>opor-se a tratamento feito com base em legítimo interesse.</li>
        </ul>
        <p>
          Dois deles você exerce sozinho, na hora, em <strong>Configurações</strong> do aplicativo:{" "}
          <strong>baixar seus dados</strong> (um arquivo com tudo que guardamos sobre você e a
          criança) e <strong>excluir a conta</strong>. Para os demais, escreva para{" "}
          {IDENTIFICACAO.emailEncarregado} — respondemos em até 15 dias.
        </p>
      </Secao>

      <Secao numero="8" titulo="Como protegemos">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>Todo tráfego é criptografado em trânsito (HTTPS obrigatório).</li>
          <li>
            Senhas são guardadas como hash com bcrypt — nem nós conseguimos ler a sua senha.
          </li>
          <li>
            Tentativas de login são limitadas por conta e por origem, para conter teste de senhas
            em massa.
          </li>
          <li>Acesso administrativo é restrito e registrado.</li>
          <li>
            O banco fica em provedor com criptografia em repouso e backup gerenciado.
          </li>
        </ul>
        <p>
          Nenhum sistema é imune. Se ocorrer incidente de segurança com risco relevante aos seus
          dados, comunicaremos você e a ANPD, como manda o Art. 48 da LGPD.
        </p>
      </Secao>

      <Secao numero="9" titulo="Cookies">
        <p>Usamos poucos cookies, e nenhum deles é de publicidade de terceiros:</p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            <strong>Sessão</strong> — mantém você conectado. Sem ele, não há login.
          </li>
          <li>
            <strong>Origem da visita</strong> — registra de qual campanha ou link de parceira você
            chegou, para medir o que funciona e creditar a indicação. Dura 90 dias.
          </li>
        </ul>
        <p>
          Você pode apagar cookies pelo navegador a qualquer momento; o de sessão apenas encerra o
          login.
        </p>
      </Secao>

      <Secao numero="10" titulo="Mudanças nesta política">
        <p>
          Se mudarmos algo relevante — nova finalidade, novo compartilhamento —, avisamos por
          e-mail e dentro do aplicativo antes de a mudança valer. A data de vigência no topo indica
          a versão atual.
        </p>
      </Secao>

      <Secao numero="11" titulo="Reclamações">
        <p>
          Se entender que tratamos seus dados de forma indevida, fale primeiro com o encarregado em{" "}
          {IDENTIFICACAO.emailEncarregado}. Você também pode registrar reclamação diretamente na{" "}
          <a
            href="https://www.gov.br/anpd/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-orange-600 hover:underline"
          >
            Autoridade Nacional de Proteção de Dados (ANPD)
          </a>
          .
        </p>
      </Secao>
    </DocumentoLegal>
  );
}
