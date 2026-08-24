import Image from "next/image";
import { ImagePlus } from "lucide-react";
import { caminhoDaFoto, type FotoSite } from "@/lib/fotosSite";

/**
 * Um espaco de foto da landing.
 *
 * Sem arquivo definido, some para quem visita e vira um placeholder em
 * desenvolvimento — assim da para ver o buraco enquanto as fotos nao chegam,
 * sem publicar um retangulo cinza para o cliente.
 */
export default function FotoDoSite({
  foto,
  className,
  sizes = "(min-width: 768px) 33vw, 100vw",
  prioridade = false,
}: {
  foto: FotoSite;
  className?: string;
  sizes?: string;
  prioridade?: boolean;
}) {
  const src = caminhoDaFoto(foto);

  if (!src) {
    if (process.env.NODE_ENV === "production") return null;
    return (
      <div
        className={`flex flex-col items-center justify-center gap-1.5 rounded-3xl border-2 border-dashed border-stone-300 bg-stone-100/70 p-4 text-center ${className ?? ""}`}
        style={{ aspectRatio: foto.proporcao }}
      >
        <ImagePlus size={22} className="text-stone-400" />
        <span className="text-xs font-semibold text-stone-500">Espaço de foto</span>
        <span className="text-[11px] leading-tight text-stone-400">{foto.dica}</span>
        <span className="text-[11px] leading-tight text-stone-400">public/fotos/</span>
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden rounded-3xl bg-stone-100 ${className ?? ""}`}
      style={{ aspectRatio: foto.proporcao }}
    >
      <Image
        src={src}
        alt={foto.alt}
        fill
        sizes={sizes}
        priority={prioridade}
        className="object-cover"
      />
      {foto.legenda && (
        <span className="absolute bottom-3 left-3 rounded-full bg-stone-900/70 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
          {foto.legenda}
        </span>
      )}
    </div>
  );
}
