"use client";

import { useEffect } from "react";

/**
 * Registra o service worker depois que a pagina carrega.
 *
 * So em producao: em desenvolvimento o cache atrapalha o hot reload e mascara
 * mudanca de codigo.
 */
export default function RegistrarServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    const registrar = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Falhar o registro nao pode derrubar o app — offline e um extra.
      });
    };

    if (document.readyState === "complete") registrar();
    else window.addEventListener("load", registrar, { once: true });
  }, []);

  return null;
}
