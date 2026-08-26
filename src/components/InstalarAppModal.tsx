"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import {
  Smartphone,
  X,
  ArrowRight,
  ArrowLeft,
  Share,
  PlusSquare,
  MoreVertical,
  Download,
  CircleCheck,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Tutorial de instalacao do PWA — botao flutuante + modal em passos.
 *
 * Some sozinho quando o site ja esta rodando instalado (display-mode
 * standalone), que e justamente quando o tutorial nao tem mais o que ensinar.
 * So aparece no celular: o passo a passo e de Android e iPhone.
 */

const CHAVE_OCULTO = "pwa-tutorial-oculto-ate";
const DIAS_OCULTO = 30;

type Plataforma = "android" | "ios";
type Passo = { icon: LucideIcon; titulo: string; texto: string };

const PASSOS: Record<Plataforma, Passo[]> = {
  android: [
    {
      icon: MoreVertical,
      titulo: "Abra o menu do navegador",
      texto: "No Chrome, toque nos três pontinhos no canto superior direito da tela.",
    },
    {
      icon: Download,
      titulo: 'Toque em "Instalar aplicativo"',
      texto: 'Em alguns aparelhos o nome é "Adicionar à tela inicial". É a mesma coisa.',
    },
    {
      icon: CircleCheck,
      titulo: "Confirme e pronto",
      texto: "O ícone do Pratinho Feliz vai para a sua tela inicial e abre em tela cheia, sem a barra do navegador.",
    },
  ],
  ios: [
    {
      icon: Share,
      titulo: "Toque em Compartilhar",
      texto: "É o quadradinho com a seta para cima, na barra de baixo do Safari.",
    },
    {
      icon: PlusSquare,
      titulo: 'Escolha "Adicionar à Tela de Início"',
      texto: "Role a lista de opções para baixo — a opção fica na segunda parte do menu.",
    },
    {
      icon: CircleCheck,
      titulo: 'Toque em "Adicionar"',
      texto: "No canto superior direito. O ícone aparece na tela de início como um aplicativo.",
    },
  ],
};

function detectarPlataforma(): Plataforma {
  if (typeof navigator === "undefined") return "android";
  return /iphone|ipad|ipod/i.test(navigator.userAgent) ? "ios" : "android";
}

/** Instagram, Facebook e afins nao instalam PWA — precisa abrir no navegador. */
function navegadorDeApp(): boolean {
  if (typeof navigator === "undefined") return false;
  return /FBAN|FBAV|Instagram|Line\/|Twitter/i.test(navigator.userAgent);
}

function jaInstalado(): boolean {
  if (typeof window === "undefined") return false;
  const standalone = window.matchMedia?.("(display-mode: standalone)").matches;
  const iosStandalone = (window.navigator as { standalone?: boolean }).standalone === true;
  return !!standalone || iosStandalone;
}

function ocultoAgora(): boolean {
  try {
    const ate = Number(localStorage.getItem(CHAVE_OCULTO) ?? 0);
    return Date.now() < ate;
  } catch {
    return false;
  }
}

/**
 * Telas publicas nao tem o menu inferior; todo o resto tem. A lista aponta
 * para o lado seguro: rota nova desconhecida cai no "tem menu" e o botao so
 * flutua um pouco mais alto, em vez de cobrir a navegacao.
 */
const ROTAS_SEM_MENU = ["/blog", "/login", "/cadastro", "/oferta", "/privacidade", "/termos", "/bem-vindo", "/onboarding", "/assinar"];

function temMenuInferior(pathname: string): boolean {
  if (pathname === "/") return false;
  return !ROTAS_SEM_MENU.some((r) => pathname.startsWith(r));
}

/**
 * O botao so pode aparecer no cliente: o servidor nao sabe se o site ja esta
 * instalado nem o que tem no localStorage. useSyncExternalStore da esse "so
 * depois da hidratacao" sem setState dentro de efeito — na hidratacao o
 * snapshot do servidor devolve false e o HTML bate.
 */
const OUVINTES = new Set<() => void>();

function avisarOuvintes() {
  OUVINTES.forEach((fn) => fn());
}

function assinarDisponibilidade(cb: () => void): () => void {
  OUVINTES.add(cb);
  window.addEventListener("appinstalled", cb);
  return () => {
    OUVINTES.delete(cb);
    window.removeEventListener("appinstalled", cb);
  };
}

/** Navegador sem storage (aba privada em iOS antigo): some ao menos na visita. */
let ocultoNestaVisita = false;

function podeAparecer(): boolean {
  return !ocultoNestaVisita && !jaInstalado() && !ocultoAgora();
}

function esconder() {
  ocultoNestaVisita = true;
  try {
    localStorage.setItem(CHAVE_OCULTO, String(Date.now() + DIAS_OCULTO * 864e5));
  } catch {
    // Sem storage o "nao mostrar de novo" vale so ate recarregar a pagina.
  }
  avisarOuvintes();
}

type PromptDeInstalacao = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export default function InstalarAppModal() {
  const visivel = useSyncExternalStore(assinarDisponibilidade, podeAparecer, () => false);
  const [aberto, setAberto] = useState(false);
  // Detectados na primeira renderizacao no cliente, onde navigator ja existe.
  const [plataforma, setPlataforma] = useState<Plataforma>(detectarPlataforma);
  const [passo, setPasso] = useState(0);
  const [dentroDeApp] = useState(navegadorDeApp);
  const [promptNativo, setPromptNativo] = useState<PromptDeInstalacao | null>(null);
  const acimaDaNav = temMenuInferior(usePathname() ?? "/");
  const dialogoRef = useRef<HTMLDivElement>(null);
  const gatilhoRef = useRef<HTMLButtonElement>(null);

  // O Chrome avisa quando a instalacao esta disponivel. Guardamos o evento para
  // oferecer o botao que instala de uma vez, sem passo a passo.
  useEffect(() => {
    const capturar = (e: Event) => {
      e.preventDefault();
      setPromptNativo(e as PromptDeInstalacao);
    };
    window.addEventListener("beforeinstallprompt", capturar);
    return () => window.removeEventListener("beforeinstallprompt", capturar);
  }, []);

  const fechar = useCallback(() => {
    setAberto(false);
    gatilhoRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!aberto) return;
    const tecla = (e: KeyboardEvent) => {
      if (e.key === "Escape") fechar();
    };
    document.addEventListener("keydown", tecla);
    dialogoRef.current?.focus();
    return () => document.removeEventListener("keydown", tecla);
  }, [aberto, fechar]);

  function naoMostrarMais() {
    esconder();
    setAberto(false);
  }

  async function instalarAgora() {
    if (!promptNativo) return;
    await promptNativo.prompt();
    const { outcome } = await promptNativo.userChoice;
    setPromptNativo(null);
    // Aceitou: o "appinstalled" avisa o store e o botao some sozinho.
    if (outcome === "accepted") setAberto(false);
  }

  if (!visivel) return null;

  const passos = PASSOS[plataforma];
  const atual = passos[passo];
  const ultimo = passo === passos.length - 1;

  return (
    <div className="md:hidden">
      <button
        ref={gatilhoRef}
        type="button"
        onClick={() => setAberto(true)}
        aria-haspopup="dialog"
        className={cn(
          "fixed right-4 z-30 flex items-center gap-1.5 rounded-full bg-stone-900 py-2.5 pl-3.5 pr-4 text-[13px] font-semibold text-white shadow-float transition active:scale-[0.97]",
          acimaDaNav
            ? "bottom-[calc(env(safe-area-inset-bottom)+5.25rem)]"
            : "bottom-[calc(env(safe-area-inset-bottom)+1rem)]",
        )}
      >
        <Smartphone size={15} />
        Instalar o app
      </button>

      {aberto && (
        <div className="fixed inset-0 z-40 flex items-end justify-center">
          <button
            type="button"
            aria-label="Fechar tutorial"
            onClick={fechar}
            className="absolute inset-0 bg-stone-900/45 backdrop-blur-[2px]"
          />

          <div
            ref={dialogoRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-instalar-app"
            tabIndex={-1}
            className="relative m-3 w-full max-w-sm rounded-3xl border border-stone-200/60 bg-white p-5 shadow-float outline-none"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 id="titulo-instalar-app" className="font-display text-lg font-extrabold text-stone-900">
                  Deixe na tela inicial
                </h2>
                <p className="mt-0.5 text-[13px] leading-snug text-stone-500">
                  Abre em tela cheia, como um aplicativo — e você chega no cardápio em um toque.
                </p>
              </div>
              <button
                type="button"
                onClick={fechar}
                aria-label="Fechar"
                className="-mr-1 -mt-1 rounded-full p-1.5 text-stone-400 transition hover:bg-stone-100 hover:text-stone-600"
              >
                <X size={18} />
              </button>
            </div>

            {dentroDeApp && (
              <p className="mt-4 flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-[12.5px] leading-snug text-amber-900">
                <TriangleAlert size={15} className="mt-px shrink-0" />
                Você está no navegador de dentro do Instagram/Facebook, que não instala aplicativos.
                Toque no menu e escolha “Abrir no {plataforma === "ios" ? "Safari" : "Chrome"}”.
              </p>
            )}

            <div className="mt-4 flex rounded-full bg-stone-100 p-1 text-[13px] font-semibold">
              {(["android", "ios"] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => {
                    setPlataforma(p);
                    setPasso(0);
                  }}
                  className={cn(
                    "flex-1 rounded-full py-1.5 transition",
                    plataforma === p ? "bg-white text-stone-900 shadow-sm" : "text-stone-500",
                  )}
                >
                  {p === "android" ? "Android" : "iPhone"}
                </button>
              ))}
            </div>

            {promptNativo && plataforma === "android" && (
              <button
                type="button"
                onClick={instalarAgora}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-orange-500 py-3 text-sm font-semibold text-white transition active:scale-[0.98] hover:bg-orange-600"
              >
                <Download size={16} /> Instalar agora
              </button>
            )}

            <div className="mt-4 rounded-2xl bg-[#fdfaf6] p-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
                  <atual.icon size={19} />
                </span>
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-stone-400">
                    Passo {passo + 1} de {passos.length}
                  </div>
                  <h3 className="font-semibold leading-tight text-stone-800">{atual.titulo}</h3>
                </div>
              </div>
              <p className="mt-2.5 text-[13.5px] leading-relaxed text-stone-600">{atual.texto}</p>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <div className="flex flex-1 gap-1.5" aria-hidden>
                {passos.map((_, i) => (
                  <span
                    key={i}
                    className={cn(
                      "h-1.5 flex-1 rounded-full transition-colors",
                      i <= passo ? "bg-orange-400" : "bg-stone-200",
                    )}
                  />
                ))}
              </div>
              {passo > 0 && (
                <button
                  type="button"
                  onClick={() => setPasso((p) => p - 1)}
                  className="flex items-center gap-1 rounded-full px-3 py-2 text-[13px] font-semibold text-stone-500 transition hover:bg-stone-100"
                >
                  <ArrowLeft size={15} /> Voltar
                </button>
              )}
              <button
                type="button"
                onClick={() => (ultimo ? naoMostrarMais() : setPasso((p) => p + 1))}
                className="flex items-center gap-1.5 rounded-full bg-stone-900 px-4 py-2.5 text-[13px] font-semibold text-white transition active:scale-[0.97] hover:bg-stone-800"
              >
                {ultimo ? "Já instalei" : "Próximo"}
                {ultimo ? <CircleCheck size={15} /> : <ArrowRight size={15} />}
              </button>
            </div>

            <button
              type="button"
              onClick={naoMostrarMais}
              className="mt-3 w-full text-center text-[12px] font-medium text-stone-400 underline-offset-2 hover:text-stone-600 hover:underline"
            >
              Não mostrar de novo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
