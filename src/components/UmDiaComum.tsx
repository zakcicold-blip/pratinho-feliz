import { CENAS_DO_DIA, caminhoDaFoto } from "@/lib/fotosSite";
import FotoDoSite from "@/components/FotoDoSite";
import Revelar from "@/components/Revelar";
import LinhaDoDia from "@/components/LinhaDoDia";

/**
 * "Um dia comum" — a seção de reconhecimento.
 *
 * O resto da página argumenta: o que o app faz, o que vem junto, quanto
 * custa. Argumento só funciona depois que a pessoa se reconhece, e nenhuma
 * grade de cards com ícone consegue fazer isso. Aqui a leitura é vertical e
 * lenta, em quatro cenas com hora marcada, alternando lado — o oposto do
 * resto da página, de propósito.
 *
 * As duas primeiras cenas são a dor e as duas últimas o alívio. A virada
 * acontece no meio, sem que a seção precise anunciar que virou.
 *
 * Funciona sem foto nenhuma. Enquanto as imagens não chegam, a linha do
 * tempo carrega a seção sozinha — melhor uma seção de texto que existe do
 * que uma seção de fotos que sumiu.
 */
export default function UmDiaComum() {
  return (
    <section className="bg-white">
      <div className="mx-auto w-full max-w-5xl px-6 py-16">
        <Revelar className="mx-auto max-w-2xl text-center">
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-orange-500">
            Um dia comum
          </div>
          <h2 className="font-display mt-2 text-3xl font-extrabold leading-tight text-stone-900 sm:text-4xl">
            Você já viveu essa terça-feira
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-stone-500">
            Não é falta de cuidado, e não é birra. É decisão demais para tomar no fim do dia.
          </p>
        </Revelar>

        <LinhaDoDia>
        <ol className="mt-12 space-y-16 sm:space-y-24">
          {CENAS_DO_DIA.map((cena, i) => {
            const invertida = i % 2 === 1;
            const temFoto = caminhoDaFoto(cena.foto) !== null;
            const emDesenvolvimento = process.env.NODE_ENV !== "production";
            const mostraColunaDeFoto = temFoto || emDesenvolvimento;

            return (
              <li
                key={cena.titulo}
                className={`grid items-center gap-6 sm:gap-10 ${
                  mostraColunaDeFoto ? "md:grid-cols-2" : ""
                }`}
              >
                {mostraColunaDeFoto && (
                  /*
                    A foto entra pelo lado em que ela está, e o texto vem 120ms
                    depois. Chegarem juntos parece um bloco piscando; em
                    sequência, parece uma cena sendo contada.
                  */
                  <Revelar
                    direcao={invertida ? "direita" : "esquerda"}
                    distancia={20}
                    className={invertida ? "md:order-2" : undefined}
                  >
                    <FotoDoSite
                      foto={cena.foto}
                      sizes="(min-width: 768px) 50vw, 100vw"
                      className="w-full"
                    />
                  </Revelar>
                )}

                <Revelar
                  atraso={120}
                  className={`${invertida ? "md:order-1" : ""} ${
                    mostraColunaDeFoto ? "" : "mx-auto max-w-2xl"
                  }`}
                >
                  {/* A hora é o que amarra as quatro cenas num dia só. */}
                  <div className="flex items-center gap-2.5">
                    <span className="h-px w-6 origin-left bg-orange-300" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-orange-500">
                      {cena.etapa}
                    </span>
                  </div>
                  <h3 className="font-display mt-3 text-xl font-bold leading-snug text-stone-900 sm:text-2xl">
                    {cena.titulo}
                  </h3>
                  <p className="mt-3 text-[15px] leading-relaxed text-stone-600">{cena.texto}</p>
                </Revelar>
              </li>
            );
          })}
        </ol>
        </LinhaDoDia>
      </div>
    </section>
  );
}
