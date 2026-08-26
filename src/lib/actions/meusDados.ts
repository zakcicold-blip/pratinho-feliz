"use server";

import { db } from "@/lib/db";
import { requireSession } from "@/lib/currentChild";
import { signOut } from "@/auth";

/**
 * Direitos do titular, executados pela propria pessoa.
 *
 * A LGPD (Art. 18) da o direito de acessar, portar e eliminar. Um formulario
 * de e-mail atende a lei na letra, mas nao na pratica: quem pede por e-mail
 * espera dias e desiste. Estes dois botoes resolvem na hora, e sao os que a
 * politica de privacidade promete.
 */

/**
 * Tudo que guardamos sobre a conta, em JSON.
 *
 * JSON e nao PDF porque o Art. 18, V fala em "formato de uso comum e
 * interoperavel": um PDF nao pode ser importado em lugar nenhum, e o direito
 * a portabilidade existe justamente para os dados poderem ir embora com a
 * pessoa.
 *
 * A montagem e explicita, campo a campo, em vez de despejar o objeto do
 * Prisma. Dump automatico exportaria o hash da senha na primeira vez que
 * alguem esquecesse de filtrar.
 */
export async function exportarMeusDados(): Promise<{ arquivo: string; nome: string }> {
  const session = await requireSession();

  const usuario = await db.user.findUniqueOrThrow({
    where: { id: session.user.id },
    select: {
      name: true,
      email: true,
      telefone: true,
      lembretes: true,
      createdAt: true,
      subscription: {
        select: {
          plano: true,
          status: true,
          renovaEm: true,
          acessoCortesia: true,
          currentPeriodEnd: true,
          createdAt: true,
        },
      },
      children: {
        select: {
          nome: true,
          faixaEtaria: true,
          refeicoesPorDia: true,
          tempoDisponivel: true,
          praticidade: true,
          objetivo: true,
          equipamentos: true,
          horarioDormirHabitual: true,
          horarioAcordarHabitual: true,
          consentimentoLgpd: true,
          createdAt: true,
          preferences: {
            select: { status: true, ingredient: { select: { nome: true } } },
          },
          foodJourneys: {
            select: {
              exposicoes: true,
              ultimoEstado: true,
              ingredient: { select: { nome: true } },
            },
          },
          favorites: { select: { createdAt: true, recipe: { select: { nome: true } } } },
          pantryItems: {
            select: { createdAt: true, ingredient: { select: { nome: true } } },
          },
          routineEntries: {
            select: {
              data: true,
              horasSono: true,
              qualidadeSono: true,
              atividadeMinutos: true,
              tipoAtividade: true,
              disposicao: true,
              observacao: true,
            },
            orderBy: { data: "desc" },
            take: 730,
          },
        },
      },
    },
  });

  const conteudo = {
    exportadoEm: new Date().toISOString(),
    aviso:
      "Arquivo gerado a pedido do titular, conforme o Art. 18 da Lei 13.709/2018 (LGPD). Não inclui a senha, que é guardada apenas como hash irreversível.",
    conta: {
      nome: usuario.name,
      email: usuario.email,
      telefone: usuario.telefone,
      recebeLembretes: usuario.lembretes,
      contaCriadaEm: usuario.createdAt,
    },
    assinatura: usuario.subscription,
    criancas: usuario.children.map((c) => ({
      apelido: c.nome,
      faixaEtaria: c.faixaEtaria,
      rotina: {
        refeicoesPorDia: c.refeicoesPorDia,
        tempoDisponivelMin: c.tempoDisponivel,
        praticidade: c.praticidade,
        objetivo: c.objetivo,
        equipamentos: c.equipamentos,
        horarioDormirHabitual: c.horarioDormirHabitual,
        horarioAcordarHabitual: c.horarioAcordarHabitual,
      },
      consentimentoDoResponsavel: c.consentimentoLgpd,
      perfilCriadoEm: c.createdAt,
      preferenciasAlimentares: c.preferences.map((p) => ({
        alimento: p.ingredient.nome,
        situacao: p.status,
      })),
      alimentosEmDescoberta: c.foodJourneys.map((j) => ({
        alimento: j.ingredient.nome,
        vezesApresentado: j.exposicoes,
        ultimaReacao: j.ultimoEstado,
      })),
      receitasFavoritas: c.favorites.map((f) => ({
        receita: f.recipe.nome,
        salvaEm: f.createdAt,
      })),
      despensa: c.pantryItems.map((i) => ({
        item: i.ingredient.nome,
        marcadoEm: i.createdAt,
      })),
      rotinaDiaria: c.routineEntries,
    })),
  };

  const data = new Date().toISOString().slice(0, 10);
  return {
    arquivo: JSON.stringify(conteudo, null, 2),
    nome: `pratinho-feliz-meus-dados-${data}.json`,
  };
}

/**
 * Exclui a conta.
 *
 * O delete em cascata leva perfis, registros e preferencias. O que ele NAO
 * alcanca sao duas tabelas que guardam e-mail solto:
 *
 * - EventoFunil, que grava o e-mail para casar a compra com a visita. Sem
 *   limpar, o e-mail de quem pediu exclusao continua no banco — exatamente o
 *   que o Art. 18, VI proibe.
 * - CompraCakto, que fica. Nota fiscal tem prazo legal de guarda, e o
 *   Art. 16, I permite manter o que a obrigacao legal exige. O vinculo com a
 *   conta e cortado; o registro fiscal permanece.
 */
export async function excluirMinhaConta(): Promise<void> {
  const session = await requireSession();
  const id = session.user.id;

  const usuario = await db.user.findUnique({ where: { id }, select: { email: true } });

  await db.$transaction(async (tx) => {
    if (usuario?.email) {
      await tx.eventoFunil.updateMany({
        where: { email: usuario.email },
        data: { email: null, userId: null },
      });
      await tx.compraCakto.updateMany({ where: { userId: id }, data: { userId: null } });
    }

    // Sem userId no registro: guardar quem foi apagado dentro do log da
    // exclusao recriaria o dado que a pessoa pediu para sumir.
    await tx.auditLog.create({
      data: {
        evento: "conta_excluida_pelo_titular",
        detalhes: "Conta e perfis apagados a pedido do titular (LGPD, Art. 18, VI).",
      },
    });

    await tx.user.delete({ where: { id } });
  });

  await signOut({ redirectTo: "/" });
}
