import type { Post } from "@/lib/blog";

import { post as seletividade } from "./seletividade-alimentar-infantil";
import { post as introducao } from "./introducao-alimentar-primeiros-30-dias";
import { post as lancheEscolar } from "./lanche-escolar-saudavel-ideias";
import { post as ferro } from "./ferro-na-alimentacao-infantil";
import { post as sono } from "./alimentacao-e-sono-infantil";

/**
 * Registro de artigos publicados.
 * Para publicar um post novo: crie o arquivo .tsx nesta pasta exportando `post`
 * e adicione-o aqui. A ordenação por data é feita em `@/lib/blog`.
 */
export const POSTS: Post[] = [seletividade, introducao, lancheEscolar, ferro, sono];
