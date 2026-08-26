"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Download, LogOut, Trash2 } from "lucide-react";
import { signOutAction } from "@/lib/actions/auth-signout";
import { limparCacheDoApp } from "@/components/RegistrarServiceWorker";
import { excluirMinhaConta, exportarMeusDados } from "@/lib/actions/meusDados";
import Button from "@/components/ui/Button";

/**
 * Os direitos do titular, com botao.
 *
 * A LGPD garante acesso, portabilidade e eliminacao (Art. 18). Ficar so no
 * "escreva para o nosso e-mail" atende a letra e falha na pratica — quem pede
 * por e-mail espera dias e desiste. Aqui os dois resolvem na hora.
 *
 * A confirmacao de exclusao pede a palavra digitada em vez de um window.confirm:
 * apagar a conta apaga tambem o historico da crianca, e um clique distraido
 * nao volta atras.
 */
export default function AccountActions() {
  const [pendente, iniciar] = useTransition();
  const [baixando, setBaixando] = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  const [texto, setTexto] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const router = useRouter();

  async function baixarDados() {
    setBaixando(true);
    setErro(null);
    try {
      const { arquivo, nome } = await exportarMeusDados();
      const url = URL.createObjectURL(new Blob([arquivo], { type: "application/json" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = nome;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setErro("Não consegui gerar o arquivo agora. Tente de novo em instantes.");
    } finally {
      setBaixando(false);
    }
  }

  return (
    <div className="space-y-2">
      <Button
        onClick={() => {
          limparCacheDoApp();
          iniciar(() => signOutAction());
        }}
        disabled={pendente}
        variant="outline"
        size="lg"
        className="w-full"
      >
        <LogOut size={15} /> Sair da conta
      </Button>

      <Button
        onClick={baixarDados}
        disabled={baixando}
        variant="outline"
        size="lg"
        className="w-full"
      >
        <Download size={15} /> {baixando ? "Preparando…" : "Baixar meus dados"}
      </Button>
      <p className="px-1 text-[11px] leading-relaxed text-stone-400">
        Um arquivo com tudo que guardamos sobre você e a criança, em formato aberto.
      </p>

      {!confirmando ? (
        <Button
          onClick={() => setConfirmando(true)}
          disabled={pendente}
          variant="danger"
          size="lg"
          className="w-full"
        >
          <Trash2 size={15} /> Excluir conta
        </Button>
      ) : (
        <div className="rounded-2xl border border-red-200 bg-red-50/60 p-4">
          <p className="text-sm font-semibold text-stone-800">Excluir a conta apaga tudo</p>
          <p className="mt-1 text-[13px] leading-relaxed text-stone-600">
            O perfil da criança, o histórico, as preferências e o cardápio somem e não têm como
            voltar. Se quiser guardar uma cópia, baixe seus dados antes.
          </p>
          <p className="mt-2 text-[12px] leading-relaxed text-stone-500">
            Os registros de pagamento são mantidos pelo prazo que a lei fiscal exige, sem vínculo
            com a sua conta.
          </p>

          <label className="mt-3 block text-[12px] font-medium text-stone-600">
            Digite <strong>EXCLUIR</strong> para confirmar
            <input
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm outline-none focus:border-red-400"
              autoComplete="off"
            />
          </label>

          {erro && <p className="mt-2 text-[13px] text-red-600">{erro}</p>}

          <div className="mt-3 flex gap-2">
            <Button
              onClick={() => {
                setConfirmando(false);
                setTexto("");
              }}
              variant="outline"
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={() =>
                iniciar(async () => {
                  await excluirMinhaConta();
                  router.refresh();
                })
              }
              disabled={pendente || texto.trim().toUpperCase() !== "EXCLUIR"}
              variant="danger"
              className="flex-1"
            >
              {pendente ? "Excluindo…" : "Excluir"}
            </Button>
          </div>
        </div>
      )}

      <p className="px-1 pt-2 text-[11px] leading-relaxed text-stone-400">
        <Link href="/termos" className="underline hover:text-stone-600">
          Termos de uso
        </Link>{" "}
        ·{" "}
        <Link href="/privacidade" className="underline hover:text-stone-600">
          Política de privacidade
        </Link>
      </p>
    </div>
  );
}
