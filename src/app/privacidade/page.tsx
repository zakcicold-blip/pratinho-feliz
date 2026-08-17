import Link from "next/link";

export default function PrivacidadePage() {
  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-12">
      <Link href="/" className="text-sm text-orange-600 hover:underline">
        ← Voltar
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-stone-900">Privacidade e dados da criança</h1>

      <div className="mt-6 space-y-4 text-sm leading-relaxed text-stone-600">
        <p>
          O Pratinho Feliz coleta apenas os dados necessários para montar e adaptar o plano
          alimentar: rotina, preferências, recusas, restrições e o histórico de uso da criança.
        </p>
        <p>
          O cadastro do perfil infantil exige consentimento específico e em destaque do
          responsável legal, conforme o Art. 14 da Lei nº 13.709/2018 (LGPD), que determina que o
          tratamento de dados de crianças e adolescentes considere seu melhor interesse.
        </p>
        <p>
          Você pode atualizar ou excluir o perfil da criança e sua conta a qualquer momento nas
          Configurações. Não utilizamos o perfil da criança para publicidade direcionada.
        </p>
        <p>
          O Pratinho Feliz é uma ferramenta de organização e apoio à rotina alimentar. Ele não
          diagnostica condições de saúde, não substitui pediatra ou nutricionista e não faz
          promessas de tratamento clínico.
        </p>
      </div>
    </main>
  );
}
