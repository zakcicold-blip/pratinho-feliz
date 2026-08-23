import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import MetaPixel from "@/components/MetaPixel";
import TrackingHead from "@/components/TrackingHead";
import RegistrarServiceWorker from "@/components/RegistrarServiceWorker";

// Sans geométrica moderna, usada em todo o app (títulos e corpo). Sem serifas.
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  // Base para resolver URLs relativas de canonical, OG e sitemap.
  metadataBase: new URL("https://www.pratinhofeliz.online"),
  title: "Pratinho Feliz",
  description:
    "Plataforma que organiza 30 dias de alimentação infantil e aprende com os gostos da criança.",
  openGraph: {
    siteName: "Pratinho Feliz",
    locale: "pt_BR",
    type: "website",
  },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icons/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/favicon-16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Pratinho Feliz",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Zoom liberado por acessibilidade (quem precisa aproximar consegue). O
  // "efeito elástico" continua contido pelo CSS (overscroll-behavior/touch-action).
  viewportFit: "cover",
  themeColor: "#f97316",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`h-full antialiased ${jakarta.variable}`}>
      <body className="min-h-full flex flex-col bg-stone-50 text-stone-800">
        {/* Pixel + Utmify: beforeInteractive, carregam antes do app (vão pro <head>). */}
        <TrackingHead />
        <Suspense fallback={null}>
          <MetaPixel />
        </Suspense>
        <RegistrarServiceWorker />
        {children}
      </body>
    </html>
  );
}
