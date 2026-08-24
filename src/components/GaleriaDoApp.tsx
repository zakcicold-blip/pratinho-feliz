import Image from "next/image";

/**
 * Prints reais do app, lado a lado.
 *
 * O carrossel do hero mostra uma tela por vez; aqui a pessoa ve o conjunto de
 * uma vez, que e o que responde "como isso e por dentro?" antes de decidir.
 * Os arquivos sao os mesmos de public/screens — para atualizar: npm run screens
 */
const TELAS = [
  { src: "/screens/hoje.png", titulo: "As refeições de hoje", texto: "Café, almoço, lanche e jantar, já montados." },
  { src: "/screens/plano.png", titulo: "O mês inteiro", texto: "30 dias no calendário, com troca em um toque." },
  { src: "/screens/rotina.png", titulo: "Rotina da criança", texto: "Sono e disposição entram na conta do cardápio." },
  { src: "/screens/compras.png", titulo: "Lista de compras", texto: "Gerada da semana, item por item." },
];

export default function GaleriaDoApp() {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-5">
      {TELAS.map((t, i) => (
        <figure key={t.src} className="flex flex-col">
          <div className="rounded-[1.6rem] border-4 border-stone-900 bg-stone-900 shadow-card">
            <div className="relative aspect-[9/18] overflow-hidden rounded-[1.2rem] bg-white">
              <Image
                src={t.src}
                alt={t.titulo}
                fill
                sizes="(min-width: 768px) 22vw, 45vw"
                // As duas primeiras aparecem cedo na rolagem do celular.
                loading={i < 2 ? "eager" : "lazy"}
                className="object-cover object-top"
              />
            </div>
          </div>
          <figcaption className="mt-3 px-0.5">
            <div className="text-sm font-semibold text-stone-800">{t.titulo}</div>
            <p className="mt-0.5 text-xs leading-snug text-stone-500">{t.texto}</p>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
