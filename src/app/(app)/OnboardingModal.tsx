"use client";

import { UtensilsCrossed } from "lucide-react";
import OnboardingWizard from "@/app/onboarding/OnboardingWizard";
import type { ComponentProps } from "react";

type Grupos = ComponentProps<typeof OnboardingWizard>["grupos"];

/**
 * Cadastro da crianca, agora dentro do app.
 *
 * Nao tem como fechar e nao tem rota para escapar: enquanto nao existir um
 * filho cadastrado, este modal cobre qualquer tela do app. Sem os dados da
 * crianca nao ha o que mostrar em nenhuma delas — cardapio, compras e rotina
 * sao todos derivados daqui.
 */
export default function OnboardingModal({
  grupos,
  userId,
  nome,
}: {
  grupos: Grupos;
  userId: string;
  nome: string;
}) {
  const primeiroNome = nome.trim().split(" ")[0];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#fdfaf6]">
      <div className="mx-auto w-full max-w-2xl px-4 py-8">
        <div className="mb-6 text-center">
          <div className="flex items-center justify-center gap-2 text-base font-bold text-stone-800">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500 text-white">
              <UtensilsCrossed size={16} />
            </span>
            Pratinho Feliz
          </div>
          <h1 className="font-display mt-4 text-2xl font-extrabold text-stone-900">
            Boas-vindas, {primeiroNome}!
          </h1>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-stone-600">
            Antes de abrir o app, conte sobre seu filho — é com isso que o cardápio dele é montado.
            Leva menos de 5 minutos.
          </p>
        </div>

        <OnboardingWizard grupos={grupos} userId={userId} podeCancelar={false} />
      </div>
    </div>
  );
}
