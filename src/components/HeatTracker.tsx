"use client";

import { useEffect } from "react";

// Rastreador anônimo de comportamento na página (mapa de calor).
// Captura, sem PII:
//  - cliques (coordenadas relativas + rótulo do elemento + seção)
//  - profundidade máxima de rolagem
//  - tempo de atenção por seção (IntersectionObserver)
// Envia em lotes via sendBeacon para /api/heat.

type Evento = {
  tipo: "click" | "scroll" | "secao";
  secao?: string | null;
  rotulo?: string | null;
  xRel?: number;
  yRel?: number;
  scrollPct?: number;
  dwellMs?: number;
};

const SID_KEY = "pf_heat_sid";
const OPTOUT_KEY = "pf_heat_optout";

// Decide se este navegador deve ser ignorado no mapa de calor.
// - ?noheat=1 marca opt-out (e ?noheat=0 reativa) — útil em aparelhos onde você
//   não faz login. A flag persiste no localStorage.
// - quem já entrou no app/admin também é marcado (ver HeatOptOut).
function deveIgnorar(): boolean {
  try {
    const p = new URLSearchParams(window.location.search).get("noheat");
    if (p === "1") localStorage.setItem(OPTOUT_KEY, "1");
    if (p === "0") localStorage.removeItem(OPTOUT_KEY);
    return localStorage.getItem(OPTOUT_KEY) === "1";
  } catch {
    return false;
  }
}

function getSessionId(): string {
  try {
    let sid = localStorage.getItem(SID_KEY);
    if (!sid) {
      sid = Math.random().toString(36).slice(2) + Date.now().toString(36);
      localStorage.setItem(SID_KEY, sid);
    }
    return sid;
  } catch {
    return "anon-" + Date.now().toString(36);
  }
}

export default function HeatTracker({ path = "/" }: { path?: string }) {
  useEffect(() => {
    if (deveIgnorar()) return; // navegador do dono/usuário — não contabiliza

    const sessionId = getSessionId();
    const viewport = window.innerWidth < 768 ? "mobile" : "desktop";

    let buffer: Evento[] = [];
    const pendingDwell = new Map<string, number>(); // secao -> ms acumulados
    const emitidoSeen = new Set<string>();
    const ativa = new Map<string, number>(); // secao -> timestamp de entrada (>=50% visível)
    let maxScroll = 0;
    let scrollEmitido = -1;

    const agora = () => performance.now();

    function fecharDwellsAbertos() {
      const t = agora();
      for (const [secao, entrada] of ativa) {
        pendingDwell.set(secao, (pendingDwell.get(secao) ?? 0) + (t - entrada));
        ativa.set(secao, t); // continua contando a partir de agora
      }
    }

    function prepararLote(): Evento[] {
      fecharDwellsAbertos();

      // tempo por seção
      for (const [secao, ms] of pendingDwell) {
        if (ms > 0 || !emitidoSeen.has(secao)) {
          buffer.push({ tipo: "secao", secao, dwellMs: Math.round(ms) });
          emitidoSeen.add(secao);
        }
      }
      pendingDwell.clear();

      // profundidade de rolagem (só quando avança)
      if (maxScroll > scrollEmitido) {
        buffer.push({ tipo: "scroll", scrollPct: maxScroll });
        scrollEmitido = maxScroll;
      }

      const lote = buffer;
      buffer = [];
      return lote;
    }

    function flush() {
      const events = prepararLote();
      if (events.length === 0) return;
      const payload = JSON.stringify({ sessionId, viewport, path, events });
      try {
        if (navigator.sendBeacon) {
          navigator.sendBeacon("/api/heat", new Blob([payload], { type: "application/json" }));
        } else {
          fetch("/api/heat", { method: "POST", body: payload, keepalive: true });
        }
      } catch {
        /* ignora */
      }
    }

    // ---- Cliques ----
    function onClick(e: MouseEvent) {
      const alvo = e.target as Element | null;
      if (!alvo || typeof alvo.closest !== "function") return;

      const docW = document.documentElement.scrollWidth || window.innerWidth;
      const docH = document.documentElement.scrollHeight || window.innerHeight;
      const xRel = e.pageX / docW;
      const yRel = e.pageY / docH;

      const secao = alvo.closest("[data-section]")?.getAttribute("data-section") ?? null;
      const heatEl = alvo.closest("[data-heat]");
      const interativo = alvo.closest("a,button,summary,[role='button']");
      let rotulo: string | null = null;
      if (heatEl) {
        rotulo = heatEl.getAttribute("data-heat");
      } else if (interativo) {
        rotulo =
          interativo.getAttribute("aria-label") ||
          (interativo.textContent || "").trim().slice(0, 60) ||
          null;
      }

      buffer.push({ tipo: "click", secao, rotulo, xRel, yRel });

      // Cliques em links/botões podem navegar embora — descarrega já.
      if (heatEl || interativo) flush();
    }

    // ---- Rolagem ----
    function onScroll() {
      const docH = document.documentElement.scrollHeight || 1;
      const pct = Math.round(((window.scrollY + window.innerHeight) / docH) * 100);
      if (pct > maxScroll) maxScroll = Math.min(100, pct);
    }

    // ---- Tempo por seção ----
    const observer = new IntersectionObserver(
      (entries) => {
        const t = agora();
        for (const entry of entries) {
          const secao = (entry.target as HTMLElement).dataset.section;
          if (!secao) continue;
          const visivel = entry.intersectionRatio >= 0.5;
          const estava = ativa.has(secao);
          if (visivel && !estava) {
            ativa.set(secao, t);
          } else if (!visivel && estava) {
            pendingDwell.set(secao, (pendingDwell.get(secao) ?? 0) + (t - ativa.get(secao)!));
            ativa.delete(secao);
          }
          // marca como vista mesmo com pouca visibilidade (para o funil)
          if (entry.intersectionRatio > 0 && !pendingDwell.has(secao) && !ativa.has(secao)) {
            pendingDwell.set(secao, pendingDwell.get(secao) ?? 0);
          }
        }
      },
      { threshold: [0, 0.5] },
    );

    document.querySelectorAll<HTMLElement>("[data-section]").forEach((el) => observer.observe(el));

    document.addEventListener("click", onClick, { capture: true });
    window.addEventListener("scroll", onScroll, { passive: true });

    function onHidden() {
      if (document.visibilityState === "hidden") flush();
    }
    document.addEventListener("visibilitychange", onHidden);
    window.addEventListener("pagehide", flush);

    const intervalo = window.setInterval(flush, 12_000);

    return () => {
      flush();
      window.clearInterval(intervalo);
      observer.disconnect();
      document.removeEventListener("click", onClick, { capture: true });
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onHidden);
      window.removeEventListener("pagehide", flush);
    };
  }, [path]);

  return null;
}
