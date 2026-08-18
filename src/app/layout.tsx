import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pratinho Feliz",
  description:
    "Plataforma que organiza 30 dias de alimentação infantil e aprende com os gostos da criança.",
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
  // Trava o zoom para dar sensação de app nativo (sem pinça nem duplo-toque).
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#f97316",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-stone-50 text-stone-800">{children}</body>
    </html>
  );
}
