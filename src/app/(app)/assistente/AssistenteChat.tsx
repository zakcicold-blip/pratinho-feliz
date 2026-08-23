"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Send, Sparkles, UtensilsCrossed, ShieldCheck } from "lucide-react";
import { perguntar } from "@/lib/actions/assistente";
import { cn } from "@/lib/cn";

type Mensagem = { de: "pessoa" | "pratinho"; texto: string };

const SUGESTOES = [
  "Ele só quer macarrão. O que eu faço?",
  "Como aumentar o ferro nas refeições?",
  "Ideias de lanche para levar na escola",
  "Ele cospe tudo que é verde. É fase?",
];

export default function AssistenteChat({ nomeCrianca }: { nomeCrianca: string }) {
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [texto, setTexto] = useState("");
  const [pendente, iniciar] = useTransition();
  const fim = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fim.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens, pendente]);

  function enviar(pergunta: string) {
    const limpo = pergunta.trim();
    if (!limpo || pendente) return;

    setMensagens((m) => [...m, { de: "pessoa", texto: limpo }]);
    setTexto("");

    iniciar(async () => {
      const r = await perguntar(limpo);
      setMensagens((m) => [
        ...m,
        { de: "pratinho", texto: r.ok ? r.texto : r.erro },
      ]);
    });
  }

  return (
    <div className="flex min-h-[calc(100vh-9rem)] flex-col">
      <div className="flex-1 space-y-3 px-4 pt-4">
        {mensagens.length === 0 && (
          <div className="rounded-3xl border border-stone-200/60 bg-white p-5 shadow-card">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-500 text-white">
              <Sparkles size={20} />
            </span>
            <p className="font-display mt-3 text-lg font-extrabold text-stone-900">
              Pergunte o que quiser sobre a comida de {nomeCrianca}
            </p>
            <p className="mt-1.5 text-[13px] leading-relaxed text-stone-500">
              Ele já sabe a idade, as restrições e o que {nomeCrianca} aceita ou recusa — e responde
              usando as receitas que existem aqui dentro.
            </p>

            <div className="mt-4 flex flex-col gap-2">
              {SUGESTOES.map((s) => (
                <button
                  key={s}
                  onClick={() => enviar(s)}
                  className="rounded-2xl border border-stone-200 px-4 py-2.5 text-left text-[13px] text-stone-600 transition hover:border-orange-300 hover:bg-orange-50/50"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {mensagens.map((m, i) => (
          <div
            key={i}
            className={cn("flex gap-2.5", m.de === "pessoa" ? "justify-end" : "justify-start")}
          >
            {m.de === "pratinho" && (
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-orange-500 text-white">
                <UtensilsCrossed size={15} />
              </span>
            )}
            <div
              className={cn(
                "max-w-[85%] rounded-3xl px-4 py-3 text-[14px] leading-relaxed whitespace-pre-wrap",
                m.de === "pessoa"
                  ? "bg-stone-900 text-white"
                  : "border border-stone-200/60 bg-white text-stone-700 shadow-card"
              )}
            >
              {m.texto}
            </div>
          </div>
        ))}

        {pendente && (
          <div className="flex gap-2.5">
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-orange-500 text-white">
              <UtensilsCrossed size={15} />
            </span>
            <div className="flex items-center gap-1.5 rounded-3xl border border-stone-200/60 bg-white px-4 py-3.5 shadow-card">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="h-1.5 w-1.5 animate-bounce rounded-full bg-stone-300"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        )}

        <div ref={fim} />
      </div>

      {mensagens.length > 0 && (
        <p className="mx-4 mt-4 flex items-start gap-1.5 text-[11px] leading-relaxed text-stone-400">
          <ShieldCheck size={12} className="mt-0.5 shrink-0" />
          Orientação geral, não substitui o pediatra ou o nutricionista que acompanha {nomeCrianca}.
        </p>
      )}

      {/* Campo */}
      <div className="sticky bottom-0 mt-3 bg-gradient-to-t from-[#fdfaf6] via-[#fdfaf6] to-transparent px-4 pt-3 pb-2">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            enviar(texto);
          }}
          className="flex items-end gap-2 rounded-3xl border border-stone-200 bg-white p-2 shadow-card"
        >
          <textarea
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                enviar(texto);
              }
            }}
            rows={1}
            maxLength={600}
            placeholder="Escreva a sua dúvida…"
            className="max-h-32 flex-1 resize-none bg-transparent px-2.5 py-2 text-sm outline-none"
          />
          <button
            type="submit"
            disabled={pendente || !texto.trim()}
            aria-label="Enviar pergunta"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-500 text-white transition active:scale-95 disabled:opacity-40"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
