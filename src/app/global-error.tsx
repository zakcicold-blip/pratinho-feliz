"use client";

import { useEffect } from "react";

/**
 * Última rede de segurança: pega erro que estoura no próprio layout raiz,
 * quando o <html>/<body> do app ainda não existe. Por isso ela precisa
 * renderizar o documento inteiro e não pode depender de nada do projeto —
 * nem do Tailwind, que também é carregado pelo layout raiz.
 */
export default function ErroGlobal({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Erro global:", error.digest ?? error.message);
  }, [error]);

  return (
    <html lang="pt-BR">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
          padding: "2rem",
          textAlign: "center",
          background: "#fdfaf6",
          color: "#292524",
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: "#f97316",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 22,
          }}
          aria-hidden
        >
          !
        </div>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, margin: 0, letterSpacing: "-0.02em" }}>
          O aplicativo não conseguiu carregar
        </h1>
        <p style={{ margin: 0, maxWidth: "26rem", lineHeight: 1.6, color: "#57534e" }}>
          Foi uma falha nossa, não sua. Seus dados continuam salvos. Tente recarregar — se
          persistir, volte daqui a alguns minutos.
        </p>
        <button
          onClick={reset}
          style={{
            marginTop: "0.5rem",
            border: 0,
            borderRadius: 999,
            padding: "0.85rem 1.6rem",
            background: "#f97316",
            color: "#fff",
            fontSize: "0.9rem",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Tentar de novo
        </button>
      </body>
    </html>
  );
}
