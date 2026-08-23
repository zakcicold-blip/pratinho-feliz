"use client";

import { useEffect, useState, useTransition } from "react";
import { BellRing, BellOff, Check, Loader2, Send, TriangleAlert } from "lucide-react";
import {
  salvarInscricaoPush,
  removerInscricaoPush,
  enviarNotificacaoDeTeste,
} from "@/lib/actions/notificacoes";
import { cn } from "@/lib/cn";

/**
 * Ativa as notificações do navegador (Web Push).
 *
 * O fluxo é deliberadamente explícito porque autorizar notificação é uma
 * decisão que a pessoa só toma uma vez: o navegador só volta a perguntar se
 * ela limpar as configurações do site. Por isso o botão explica antes o que
 * vai chegar, e logo depois de autorizar oferece um teste — sem isso, ela
 * autoriza e fica sem saber se funcionou até o dia seguinte.
 */

/**
 * A chave VAPID vem em base64url e o navegador quer bytes.
 * Devolve ArrayBuffer (e nao Uint8Array) porque e o que a tipagem de
 * applicationServerKey aceita sem ambiguidade.
 */
function chaveParaBytes(base64: string): ArrayBuffer {
  const preenchida = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
  const normal = preenchida.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(normal);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes.buffer;
}

type Estado = "verificando" | "sem-suporte" | "bloqueada" | "desativada" | "ativa";

export default function AtivarNotificacoes({ chavePublica }: { chavePublica: string | null }) {
  const [estado, setEstado] = useState<Estado>("verificando");
  const [pendente, iniciar] = useTransition();
  const [aviso, setAviso] = useState<string | null>(null);

  useEffect(() => {
    async function verificar() {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        setEstado("sem-suporte");
        return;
      }
      if (Notification.permission === "denied") {
        setEstado("bloqueada");
        return;
      }
      const reg = await navigator.serviceWorker.ready;
      const inscricao = await reg.pushManager.getSubscription();
      setEstado(inscricao ? "ativa" : "desativada");
    }
    verificar().catch(() => setEstado("sem-suporte"));
  }, []);

  async function ativar() {
    setAviso(null);
    if (!chavePublica) {
      setAviso("As notificações ainda não foram configuradas no servidor.");
      return;
    }

    const permissao = await Notification.requestPermission();
    if (permissao !== "granted") {
      setEstado(permissao === "denied" ? "bloqueada" : "desativada");
      return;
    }

    const reg = await navigator.serviceWorker.ready;
    const inscricao = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: chaveParaBytes(chavePublica),
    });

    const json = inscricao.toJSON();
    iniciar(async () => {
      await salvarInscricaoPush({
        endpoint: inscricao.endpoint,
        p256dh: json.keys?.p256dh ?? "",
        auth: json.keys?.auth ?? "",
      });
      setEstado("ativa");
    });
  }

  async function desativar() {
    const reg = await navigator.serviceWorker.ready;
    const inscricao = await reg.pushManager.getSubscription();
    if (inscricao) {
      const endpoint = inscricao.endpoint;
      await inscricao.unsubscribe();
      iniciar(async () => {
        await removerInscricaoPush(endpoint);
        setEstado("desativada");
      });
    } else {
      setEstado("desativada");
    }
  }

  function testar() {
    setAviso(null);
    iniciar(async () => {
      const r = await enviarNotificacaoDeTeste();
      if (r.push === "enviado") setAviso("Enviada! Deve aparecer em instantes.");
      else if (r.push === "sem-inscricao") setAviso("Ative as notificações primeiro.");
      else if (r.push === "desativado") setAviso("O servidor ainda não tem as chaves configuradas.");
      else setAviso("Não deu para entregar neste aparelho — mas ela está na lista abaixo.");
    });
  }

  if (estado === "verificando") return null;

  if (estado === "sem-suporte") {
    return (
      <div className="flex gap-3 rounded-2xl border border-stone-200/70 bg-stone-50 p-4">
        <BellOff size={18} className="mt-0.5 shrink-0 text-stone-400" />
        <p className="text-[13px] leading-relaxed text-stone-500">
          Este navegador não suporta notificações. No iPhone, é preciso primeiro adicionar o
          Pratinho Feliz à tela de início e abrir por lá.
        </p>
      </div>
    );
  }

  if (estado === "bloqueada") {
    return (
      <div className="flex gap-3 rounded-2xl border border-amber-200/70 bg-amber-50 p-4">
        <TriangleAlert size={18} className="mt-0.5 shrink-0 text-amber-600" />
        <p className="text-[13px] leading-relaxed text-amber-900">
          As notificações estão bloqueadas para este site. Para liberar, toque no cadeado ao lado do
          endereço, encontre <strong>Notificações</strong> e mude para permitir.
        </p>
      </div>
    );
  }

  if (estado === "ativa") {
    return (
      <div className="rounded-2xl border border-emerald-200/70 bg-emerald-50/60 p-4">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
            <Check size={16} />
          </span>
          <strong className="text-sm font-bold text-emerald-900">Notificações ativas</strong>
        </div>
        <p className="mt-2 text-[13px] leading-relaxed text-stone-600">
          Você recebe o cardápio do dia pela manhã e avisos do plano, mesmo com o app fechado.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            onClick={testar}
            disabled={pendente}
            className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
          >
            {pendente ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            Enviar teste
          </button>
          <button
            onClick={desativar}
            disabled={pendente}
            className="rounded-full px-4 py-2 text-[13px] font-medium text-stone-500 transition hover:bg-stone-100"
          >
            Desativar
          </button>
        </div>
        {aviso && <p className="mt-2 text-[12px] text-stone-500">{aviso}</p>}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-orange-200/70 bg-gradient-to-br from-orange-50 to-amber-50/60 p-5">
      <div className="flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500 text-white">
          <BellRing size={17} />
        </span>
        <strong className="font-display text-base font-extrabold text-stone-900">
          Ativar notificações
        </strong>
      </div>
      <p className="mt-2 text-[13px] leading-relaxed text-stone-600">
        Receba de manhã o que seu filho come hoje, e um aviso quando o ciclo estiver acabando —
        mesmo com o app fechado. Nada de propaganda.
      </p>
      <button
        onClick={ativar}
        disabled={pendente}
        className={cn(
          "mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-orange-500 py-3",
          "text-sm font-semibold text-white shadow-sm shadow-orange-900/20 transition",
          "hover:bg-orange-600 active:scale-[0.99] disabled:opacity-60"
        )}
      >
        {pendente ? <Loader2 size={15} className="animate-spin" /> : <BellRing size={15} />}
        Quero receber
      </button>
      {aviso && <p className="mt-2 text-center text-[12px] text-rose-600">{aviso}</p>}
    </div>
  );
}
