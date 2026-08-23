import { describe, expect, it } from "vitest";
import { __normalizarCenasParaTeste as normalizar } from "@/lib/roteiroVideo";

/**
 * As três invariantes do Veo. Se qualquer uma falhar, o clipe sai errado:
 * sem âncora vem outra pessoa, sem a fala vem mudo, sem "(no subtitles)"
 * o Veo escreve legenda com erro de português por cima do vídeo.
 */

const ANCORA =
  "A Brazilian woman in her early 30s with dark wavy hair, in a small bright home kitchen";

function roteiro(promptVeo: string, fala = "Amasse a banana com o garfo") {
  return {
    gancho: "g",
    ancora: ANCORA,
    cenaComApp: 1,
    cenas: [{ numero: 1, descricao: "d", fala, promptVeo, textoNaTela: "t" }],
    legenda: "l",
    hashtags: [],
    chamada: "c",
    audio: "a",
  };
}

describe("normalizar cenas do roteiro", () => {
  it("adiciona a âncora quando o modelo esqueceu", () => {
    const r = normalizar(roteiro("Close-up of a bowl. (no subtitles)"));
    expect(r.cenas[0].promptVeo.startsWith(ANCORA)).toBe(true);
  });

  it("não duplica a âncora quando ela já está lá", () => {
    const r = normalizar(roteiro(`${ANCORA}. Close-up of a bowl. (no subtitles)`));
    const ocorrencias = r.cenas[0].promptVeo.split(ANCORA).length - 1;
    expect(ocorrencias).toBe(1);
  });

  it("acrescenta a fala quando ela não está no prompt", () => {
    const r = normalizar(roteiro(`${ANCORA}. Close-up. (no subtitles)`));
    expect(r.cenas[0].promptVeo).toContain("She says in Brazilian Portuguese:");
    expect(r.cenas[0].promptVeo).toContain("Amasse a banana com o garfo");
  });

  it("sempre termina com (no subtitles)", () => {
    const r = normalizar(roteiro(`${ANCORA}. Close-up of a bowl.`));
    expect(r.cenas[0].promptVeo.trim().endsWith("(no subtitles)")).toBe(true);
  });

  it("não duplica o (no subtitles) que já existe", () => {
    const r = normalizar(roteiro(`${ANCORA}. Close-up. (no subtitles)`));
    expect(r.cenas[0].promptVeo.match(/\(no subtitles\)/gi)?.length).toBe(1);
  });

  it("tira as aspas da fala — aspas confundem o Veo", () => {
    const r = normalizar(
      roteiro(
        `${ANCORA}. She says in Brazilian Portuguese: "Amasse a banana com o garfo" (no subtitles)`
      )
    );
    expect(r.cenas[0].promptVeo).not.toContain('"');
    expect(r.cenas[0].promptVeo).toContain("Amasse a banana com o garfo");
  });

  it("aguenta cena sem prompt sem quebrar", () => {
    const r = normalizar(roteiro(""));
    expect(r.cenas[0].promptVeo).toContain(ANCORA);
    expect(r.cenas[0].promptVeo.endsWith("(no subtitles)")).toBe(true);
  });
});
