# Pratinho Feliz

SaaS que organiza 30 dias de alimentação infantil, adapta a rotina da família e aprende com o
histórico de aceitação de cada criança. Implementado a partir do documento de escopo funcional e
técnico (v1.0).

## Stack

- Next.js 16 (App Router, Server Actions) + TypeScript + Tailwind CSS
- Prisma + PostgreSQL
- Autenticação própria (NextAuth v5 / Credentials + bcrypt)
- Motor de recomendação baseado em regras (sem depender de chamadas a LLM), conforme seção 14 do
  escopo: regras duras de restrição → ranking por afinidade/histórico/variedade → seleção →
  explicação curta.
- PWA: pode ser instalado na tela de início (iOS/Android) via `manifest.webmanifest` + ícones em
  `public/icons` (gerados por `npm run icons:generate`).
- Informação nutricional real, calculada a partir da
  [TACO](https://www.nepa.unicamp.br/taco/) (NEPA/UNICAMP, 4ª ed.).

## Rodando localmente

1. Crie um banco Postgres gratuito (ex.: [Neon](https://neon.tech)) e copie as connection strings
   (pooled → `DATABASE_URL`, direta → `DIRECT_URL`).
2. Copie `.env.example` para `.env` e preencha `DATABASE_URL`, `DIRECT_URL` e `AUTH_SECRET`.

```bash
npm install
npx prisma migrate dev --name init   # cria as tabelas
npm run db:seed                      # receitas, ingredientes e a conta admin
npm run db:nutricao                  # composição TACO nos ingredientes
npm run db:gramas                    # converte medidas caseiras em gramas
npm run dev
```

Abra http://localhost:3000.

## Conteúdo: como alimentar o app

**Uma receita por vez** — `/admin/receitas/nova`.

**Em massa** — `/admin/receitas/importar` aceita CSV ou JSON. O arquivo é validado e
pré-visualizado antes de gravar qualquer coisa; linhas com erro são listadas e ignoradas, e
receitas com nome já existente são puladas (o import é seguro de repetir). Ingrediente
desconhecido é criado em "Outros" — depois ajuste a categoria e rode `npm run db:nutricao`
para ele entrar no cálculo nutricional.

**Fotos** — campo "Foto da receita" no formulário do admin, ou coluna `imagemUrl` no import.
Aceita apenas URLs `https`. Sem foto, o app usa o ícone do tipo de refeição.

### Como a nutrição é calculada

1. `prisma/tacoMap.ts` liga cada ingrediente do catálogo a um alimento da TACO (`tacoId`), e
   guarda o peso de 1 medida usual (`gramasPorUnidade`).
2. `src/lib/medidas.ts` converte "1 xícara", "2 fatias", "200 ml" em gramas.
3. `src/lib/nutricao.ts` soma a composição e divide pelo número de porções.

Ingrediente sem correspondente na TACO ou com medida não convertível ("a gosto") fica de fora,
e a interface avisa que o cálculo é parcial. Hoje: 56 dos 63 ingredientes têm dado real.

## Deploy (Vercel)

1. Suba o código para um repositório no GitHub.
2. Em [vercel.com](https://vercel.com), importe o repositório.
3. Nas variáveis de ambiente do projeto, adicione `DATABASE_URL`, `DIRECT_URL` e `AUTH_SECRET`
   (gere um novo `AUTH_SECRET` só para produção — nunca reaproveite o de desenvolvimento).
4. Deploy. O `postinstall` já roda `prisma generate` automaticamente.
5. Rode as migrações contra o banco de produção uma vez (`npx prisma migrate deploy`, com o
   `DATABASE_URL`/`DIRECT_URL` de produção no ambiente) e depois `npm run db:seed` para popular o
   catálogo de receitas.
6. **Troque a senha da conta admin padrão (`admin@pratinhofeliz.com` / `admin123`) assim que possível** —
   ela existe apenas para desenvolvimento local.

## Contas de teste

- **Admin (backoffice em `/admin`):** `admin@pratinhofeliz.com` / `admin123`
- Crie sua própria conta de responsável em `/cadastro` para passar pelo onboarding.

## Estrutura principal

- `prisma/schema.prisma` — modelo de dados (seção 15 do escopo)
- `prisma/seed.ts` — catálogo de receitas/ingredientes + usuário admin
- `src/lib/planEngine.ts` — motor de personalização e geração do plano de 30 dias
- `src/lib/actions/*` — Server Actions (onboarding, plano, feedback, favoritos, despensa, compras, admin)
- `src/app/(app)/*` — telas autenticadas (Hoje, Plano, Receita, Compras, Favoritos, Descobertas, Relatório, Perfil, Configurações)
- `src/app/admin/*` — backoffice (métricas, receitas, ingredientes, usuários)

## Simplificações do MVP

- Pagamento/assinatura: estrutura de dados pronta (`Subscription`), mas sem gateway real integrado.
- Lista de compras é calculada dinamicamente a partir do plano ativo (não é uma entidade persistida) —
  fica sempre em sincronia após trocas.
- E-mail transacional/lembretes: preferência salva no perfil, mas envio real não implementado.
