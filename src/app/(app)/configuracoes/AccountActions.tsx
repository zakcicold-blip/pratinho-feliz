"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { signOutAction } from "@/lib/actions/auth-signout";
import { limparCacheDoApp } from "@/components/RegistrarServiceWorker";
import { excluirConta } from "@/lib/actions/childProfile";
import Button from "@/components/ui/Button";
import { LogOut, Trash2 } from "lucide-react";

export default function AccountActions() {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <div className="space-y-2">
      <Button
        onClick={() => {
          limparCacheDoApp();
          startTransition(() => signOutAction());
        }}
        disabled={pending}
        variant="outline"
        size="lg"
        className="w-full"
      >
        <LogOut size={15} /> Sair da conta
      </Button>
      <Button
        onClick={() => {
          if (
            window.confirm(
              "Tem certeza que deseja excluir sua conta? Todos os dados e perfis serão apagados permanentemente."
            )
          ) {
            startTransition(async () => {
              await excluirConta();
              router.refresh();
            });
          }
        }}
        disabled={pending}
        variant="danger"
        size="lg"
        className="w-full"
      >
        <Trash2 size={15} /> Excluir conta
      </Button>
    </div>
  );
}
