import Spinner from "@/components/Spinner";

// Mostrado instantaneamente ao navegar entre telas do app, enquanto o servidor
// prepara os dados — evita a sensação de clique "travado".
export default function Loading() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
      <Spinner size={30} />
      <p className="text-sm text-stone-400">Carregando…</p>
    </div>
  );
}
