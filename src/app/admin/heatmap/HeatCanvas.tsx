"use client";

import { useEffect, useRef } from "react";

type Ponto = { x: number; y: number }; // 0..1
type Marcador = { label: string; y: number }; // y 0..1

// Resolução interna do mapa (proporção de página longa de landing).
const W = 360;
const H = 940;

// Paleta de calor: transparente → azul → ciano → verde → amarelo → vermelho.
function construirPaleta(): Uint8ClampedArray {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 1;
  const ctx = c.getContext("2d")!;
  const g = ctx.createLinearGradient(0, 0, 256, 0);
  g.addColorStop(0.0, "rgba(0,0,255,0)");
  g.addColorStop(0.2, "rgba(0,0,255,1)");
  g.addColorStop(0.45, "rgba(0,255,255,1)");
  g.addColorStop(0.6, "rgba(0,255,0,1)");
  g.addColorStop(0.8, "rgba(255,255,0,1)");
  g.addColorStop(1.0, "rgba(255,0,0,1)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 1);
  return ctx.getImageData(0, 0, 256, 1).data;
}

export default function HeatCanvas({
  pontos,
  marcadores,
}: {
  pontos: Ponto[];
  marcadores: Marcador[];
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Fundo claro.
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#faf7f2";
    ctx.fillRect(0, 0, W, H);

    if (pontos.length > 0) {
      // 1) Camada de intensidade (tons de cinza acumulados).
      const inten = document.createElement("canvas");
      inten.width = W;
      inten.height = H;
      const ictx = inten.getContext("2d")!;
      const R = 26;
      for (const p of pontos) {
        const x = p.x * W;
        const y = p.y * H;
        const g = ictx.createRadialGradient(x, y, 0, x, y, R);
        g.addColorStop(0, "rgba(0,0,0,0.16)");
        g.addColorStop(1, "rgba(0,0,0,0)");
        ictx.fillStyle = g;
        ictx.fillRect(x - R, y - R, R * 2, R * 2);
      }

      // 2) Colorização pela paleta usando o canal alfa como intensidade.
      const paleta = construirPaleta();
      const img = ictx.getImageData(0, 0, W, H);
      const d = img.data;
      for (let i = 0; i < d.length; i += 4) {
        const a = d[i + 3];
        if (a === 0) continue;
        const off = a * 4;
        d[i] = paleta[off];
        d[i + 1] = paleta[off + 1];
        d[i + 2] = paleta[off + 2];
        d[i + 3] = Math.min(255, a * 2.2);
      }
      ictx.putImageData(img, 0, 0);
      ctx.drawImage(inten, 0, 0);
    }

    // 3) Marcadores de seção.
    ctx.font = "600 11px -apple-system, Segoe UI, Roboto, sans-serif";
    ctx.textBaseline = "bottom";
    for (const m of marcadores) {
      const y = Math.max(12, Math.min(H - 2, m.y * H));
      ctx.strokeStyle = "rgba(68,64,60,0.28)";
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
      ctx.setLineDash([]);
      // rótulo com fundo para legibilidade
      const texto = m.label;
      const tw = ctx.measureText(texto).width;
      ctx.fillStyle = "rgba(250,247,242,0.85)";
      ctx.fillRect(4, y - 15, tw + 8, 14);
      ctx.fillStyle = "#57534e";
      ctx.fillText(texto, 8, y - 2);
    }
  }, [pontos, marcadores]);

  return (
    <div>
      <canvas
        ref={ref}
        width={W}
        height={H}
        className="w-full rounded-xl border border-stone-200"
        style={{ maxWidth: W }}
      />
      <div className="mt-3 flex items-center gap-2 text-[10px] text-stone-400">
        <span>menos</span>
        <span className="h-2 flex-1 rounded-full bg-gradient-to-r from-blue-500 via-green-400 via-yellow-400 to-red-500" />
        <span>mais cliques</span>
      </div>
    </div>
  );
}
