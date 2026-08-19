# Pratinho Feliz — Guia do Projeto

Documento vivo de tudo que o SaaS faz: cada tela, cada botão, para onde cada
resposta leva, e como as peças se conectam. Serve como referência para manter o
projeto organizado.

> Última revisão feita junto com a implementação do rastreamento (Meta CAPI),
> das receitas de sono/energia e das fotos de prato. Ao mudar o produto,
> atualize este arquivo.

---

## 1. O que é o produto

Planejador de alimentação infantil. A família cadastra a criança e recebe um
**cardápio de 30 dias** (café, almoço, lanche e jantar) sob medida para a idade,
os gostos e a **rotina** (sono, atividade física, disposição). O cardápio
aprende com o uso, gera a **lista de compras** e se adapta quando a rotina muda.

- **Faixa etária:** 6 meses a 12 anos (inclui papinhas de introdução alimentar).
- **Monetização:** teste grátis de 7 dias (cartão exigido na entrada) e depois
  **R$ 29,90/mês** ou **R$ 59,90 a cada 3 meses**.
- **Posicionamento:** apoio à rotina alimentar — **não substitui** pediatra ou
  nutricionista.

## 2. Stack e infraestrutura

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 16 (App Router, Server Actions, Turbopack), React 19, TypeScript |
| Estilo | Tailwind CSS v4 |
| Banco | PostgreSQL na **Neon** (região `sa-east-1`, São Paulo) |
| ORM | Prisma 6 |
| Auth | NextAuth v5 (Credentials + bcrypt, sessão JWT) |
| Pagamento | Stripe (Checkout hospedado + webhook) |
| Rastreamento | Meta Pixel + Conversions API (CAPI); Utmify (UTMs) |
| Ícones | lucide-react |
| Hospedagem | **Vercel**, funções na região `gru1` (São Paulo, junto do banco) |

Domínio de produção: **https://pratinho-feliz.vercel.app**

## 3. Mapa de rotas

### Público (sem login)
| Rota | O que é |
|---|---|
| `/` | Landing page (herói com carrossel de prints, bento de recursos, preços, FAQ). Se logado, redireciona para `/hoje` — a menos que seja `/?site=1`. |
| `/login` | Entrar. |
| `/cadastro` | Criar conta. Ao concluir, vai para `/onboarding?novo=1`. |
| `/privacidade` | Política de privacidade (LGPD). |
| `/assinar` | Paywall / teste grátis (fora do grupo `(app)` para não cair no próprio bloqueio). |

### Onboarding
| Rota | O que é |
|---|---|
| `/onboarding` | Wizard de 7 passos que cria o perfil da criança e o primeiro plano. |

### App (exige login **e** assinatura/teste ativos)
| Rota | O que é |
|---|---|
| `/hoje` | Refeições do dia. Tela inicial. |
| `/plano` | Cardápio em semana ou mês inteiro. |
| `/rotina` | Sono/atividade/disposição e o cardápio que a rotina indica. |
| `/compras` | Lista de compras da semana. |
| `/favoritos` | Receitas favoritadas. |
| `/perfil` | Perfil da criança, seletor de filhos e atalhos. |
| `/receita/[id]` | Detalhe da receita (foto, ingredientes, modo de preparo, nutrição). |
| `/relatorio` | Estatísticas de aceitação do ciclo. |
| `/descobertas` | Alimentos que a criança foi conhecendo. |
| `/configuracoes` | Lembretes, sair, excluir conta. |

### Admin (exige `role = ADMIN`)
| Rota | O que é |
|---|---|
| `/admin` | Visão geral: assinaturas e uso. |
| `/admin/receitas` · `/admin/receitas/nova` · `/admin/receitas/[id]` · `/admin/receitas/importar` | Gestão e importação de receitas. |
| `/admin/ingredientes` | Catálogo de ingredientes. |
| `/admin/usuarios` | Usuários. |

### API
| Rota | O que faz |
|---|---|
| `/api/auth/[...nextauth]` | Autenticação (NextAuth). |
| `/api/stripe/webhook` | Recebe eventos do Stripe: sincroniza a assinatura e dispara eventos do Meta CAPI. |

## 4. Navegação

- **Barra inferior (BottomNav):** Hoje · Plano · Rotina · Favoritos · Perfil.
- **Menu ⋮ (TopBar / UserMenu):** Configurações (`/configuracoes`) · Página
  inicial (`/?site=1`) · Sair da conta.
- **Atalhos no Perfil:** Relatório · Descobertas · Compras · Ajustes. Para
  **admin**, aparece também o botão **"Painel administrativo"** (`/admin`).

## 5. Fluxo do novo usuário (ponta a ponta)

1. `/cadastro` → cria a conta → login automático → **`/onboarding?novo=1`**
   (o `novo=1` dispara `CompleteRegistration` no pixel).
2. **Onboarding** (7 passos) → gera o plano de 30 dias → `router.push("/hoje")`.
3. O layout do app vê que **não há assinatura ativa** → redireciona para
   **`/assinar`**.
4. Na `/assinar`, a pessoa inicia o teste → **Stripe Checkout** → volta por
   `/assinar?sucesso=1` (reconcilia a assinatura) → **`/hoje?assinatura=ok`**.
5. A partir daí tem acesso ao app por 7 dias; depois o Stripe cobra sozinho.

## 6. Onboarding — passos e para onde as respostas vão

Componente: `src/app/onboarding/OnboardingWizard.tsx`. O rascunho é salvo no
`localStorage` **por usuário** (`pratinho_onboarding_draft_<userId>`) e limpo ao
concluir — contas diferentes nunca herdam dados.

| Passo | Pergunta | Vira o quê |
|---|---|---|
| 1 | Sobre a criança: nome, faixa etária, refeições/dia, tempo p/ cozinhar, equipamentos | Campos do `ChildProfile`. Equipamentos filtram receitas no motor. |
| 2 | O que já come | Preferências `ACEITA` (pontuam +) |
| 3 | O que recusa | Preferências `RECUSA` (pontuam −) |
| 4 | Novidades para apresentar | Preferências `DESEJADA` (bônus, ainda mais com objetivo "apresentar novos alimentos") |
| 5 | Restrições e alergias | Preferências `RESTRICAO` — **bloqueio duro** no motor |
| 6 | Rotina e objetivo | Praticidade + objetivo principal + consentimento LGPD |
| 7 | Resumo | Confirma e gera o plano |

Botões: **Continuar** / **Pular por enquanto** (passos 2–6) / **Voltar**. No
passo 1, se a pessoa **já tem outro filho**, aparece **Cancelar** (volta ao
`/perfil`); no cadastro inicial não há cancelar. **Gerar meu plano de 30 dias**
(passo 7) mostra a tela de loading com **animação Lottie** (~3,8s) e leva ao app.

Ação: `completarOnboarding` (`src/lib/actions/onboarding.ts`) — cria o perfil,
grava as preferências, gera o plano (`gerarPlano30Dias`) e define a criança
ativa no cookie.

## 7. Tela **Hoje** (`/hoje`)

Mostra as 4 refeições do dia (do plano ativo) e uma prévia de "Amanhã".
Cada refeição é um **MealCard** com:

- **Ver receita** → `/receita/[id]`.
- **Trocar** → abre modal com duas abas:
  - **Sugestões** → outras receitas ranqueadas (`buscarAlternativas`).
  - **Da despensa** → receitas que dão para fazer com o que a família tem
    (`buscarAlternativasComDespensa`). Escolher aplica `trocarRefeicao`.
- **Mais** (menu) → **Favoritar**, **Fora de casa** (`marcarForaDeCasa`),
  **Sem tempo hoje** (`marcarSemTempo`), e desfazer (`desfazerStatusSlot`).
- **Reações**: **Gostou / Aceitou / Experimentou / Recusou**
  (`registrarFeedback`). Cada reação vira um `MealFeedback` e **realimenta o
  motor**: o próximo ciclo prioriza o que foi bem aceito e evita o que foi
  recusado.

"Dia X de 30". Ao passar dos 30 dias, aparece **Gerar próximo ciclo**
(`gerarProximoCiclo`), que reaproveita tudo que foi aprendido.

## 8. Tela **Plano** (`/plano`)

- Alterna **Semana** e **Mês inteiro**.
- **Semana**: fita de dias; toque troca o dia exibido.
- **Mês**: grade de 30 dias alinhada pelos dias da semana; marca **hoje** e os
  dias com refeições bem aceitas (coração). Toque abre o dia.
- Cada refeição do dia é um MealCard (mesmas ações da tela Hoje).

## 9. Tela **Rotina** (`/rotina`) — o diferencial

Registra três pilares e transforma em cardápio. Ação `registrarRotina` grava um
`RoutineEntry` do dia; `atualizarHorariosHabituais` guarda os horários.

- **Indicadores (7 dias):** média de sono e atividade total.
- **Formulário de hoje:** horas de sono, qualidade (Ruim/Regular/Boa), minutos
  de atividade, disposição (Baixa/Normal/Alta), observação.
- **Card de leitura:** lê os últimos 7 dias (`rotinaSinais.ts` +
  `objetivosRotina.ts`) e mostra o **objetivo detectado** e as **receitas
  indicadas hoje** (uma por refeição), com botão **Aplicar ao cardápio** (gera
  um novo ciclo com essa leitura).

**Como a leitura decide o objetivo** (`lerRotina`), em ordem de prioridade:

| Situação | Objetivo | Cardápio |
|---|---|---|
| Agitação + sono ruim/irregular | `CALMA` | leve, fibras, absorção lenta |
| Só sono ruim | `SONO` | magnésio, cálcio, carbo lento |
| Só agitação | `CALMA` | leve |
| Disposição baixa ou < 30 min de atividade | `ENERGIA` | ferro, proteína, complexo B |
| Sono irregular | `SONO` | — |
| Tudo dentro do esperado | `EQUILIBRIO` | variedade |

Responder só um pilar já funciona — o que estiver vazio não pesa.

## 10. Motor de recomendação (`src/lib/planEngine.ts`)

Regra-base do spec: **dados estruturados**, não LLM por requisição. Duas etapas:

1. **Regras duras** (`passaRegrasDuras`) — elimina o que não pode:
   - **Idade** (`idadeMinimaMeses`): mel só ≥ 12 meses (botulismo), oleaginosas
     inteiras ≥ 36 meses (engasgo), pipoca ≥ 48 meses.
   - **Restrições/alergias** da criança.
   - **Praticidade** "muito rápido" corta receitas longas; tempo disponível.
   - **Equipamentos**: se a família declarou o que tem, receita que exige
     aparelho ausente sai.
2. **Pontuação** (`scoreRecipe`) — soma sinais: aceita (+), desejada (bônus),
   recusa (−), histórico de feedback, **favoritos** (peso alto), praticidade e
   o **objetivo da rotina** (score de SONO/ENERGIA/CALMA calculado da
   composição TACO). Penaliza repetição recente. A maior nota vence por slot.

`gerarPlano30Dias` monta 120 slots (30 dias × 4 refeições) de uma vez.

## 11. Nutrição e segurança

- Valores nutricionais vêm da **TACO** (Tabela Brasileira de Composição de
  Alimentos, NEPA/UNICAMP, 4ª ed.). Nada é inventado; quando falta dado, a
  receita mostra "cálculo parcial".
- Scores de rotina (SONO/ENERGIA/CALMA) são derivados de magnésio, ferro,
  fibra, proteína, complexo B, razão fibra/carboidrato e penalidade para
  refeição pesada (`objetivosRotina.ts` + `npm run db:rotina`).
- **Fotos** das receitas: banco aberto TheMealDB, atribuídas por tipo de prato
  (`npm run db:fotos`). São ilustrativas.

## 12. Assinatura e paywall (Stripe)

- **Gate:** o layout de `(app)` chama `podeAcessarApp`. Libera quem está `ATIVA`
  ou `TESTE` **com** assinatura real no Stripe. Cadastro novo nasce `TESTE` sem
  Stripe → cai no `/assinar`.
- **`/assinar`:** dois botões — **teste grátis 7 dias** (mensal) e **Assinar 3
  meses — R$ 59,90** (trimestral). Ambos abrem o **Stripe Checkout** com trial
  de 7 dias e cartão exigido na entrada.
- **Retorno:** `success_url` → `/assinar?sucesso=1&plano=…` → reconcilia a
  assinatura na hora (`reconciliarAssinatura`, sem esperar o webhook) →
  `/hoje?assinatura=ok`.
- **Webhook** (`/api/stripe/webhook`): sincroniza status
  (`sincronizarAssinaturaStripe`) e dispara os eventos do Meta (ver abaixo).
- **Estados** (`StatusAssinatura`): `TESTE` (trial), `ATIVA`, `CARENCIA`
  (pagamento pendente), `CANCELADA`.
- **Provisão no Stripe:** `npm run stripe:setup` cria produto, os dois preços e
  o webhook (com os eventos certos, incluindo `invoice.payment_succeeded`).

## 13. Rastreamento de marketing

**Consentimento (LGPD):** banner de cookies (`src/lib/consent.ts`). Pixel e
Utmify só carregam com `consent === "accepted"`.

**Meta Pixel (navegador):**
| Evento | Quando |
|---|---|
| `PageView` | toda tela |
| `CompleteRegistration` | `/onboarding?novo=1` |
| `InitiateCheckout` | clique no botão de assinar (com valor) |
| `StartTrial` | volta do checkout (`/hoje?assinatura=ok`), com `eventID` p/ dedup |

**Meta Conversions API (servidor, `src/lib/metaCapi.ts`, disparado no webhook):**
- `StartTrial` no `checkout.session.completed` (dedup com o pixel via mesmo
  `event_id`).
- `Purchase` no `invoice.payment_succeeded` com valor > 0 (cobrança real ao fim
  do trial e renovações). Enriquecido com e-mail (hash) e cookies `_fbp/_fbc`.

**Utmify:** script de captura de UTMs (`src/components/UtmifyScript.tsx`). As
vendas são atribuídas pela **integração nativa Stripe** configurada no painel da
Utmify.

## 14. Painel admin

- **`/admin`** (visão geral): bloco **Assinaturas** (ativas pagando, em teste,
  mensais × trimestrais, canceladas, receita recorrente estimada) e bloco
  **Uso** (contas totais, ativas na semana, perfis, planos, feedbacks) + eventos
  recentes.
- **Receitas / Ingredientes / Usuários:** gestão e importação em massa
  (CSV/JSON) com pré-visualização antes de gravar.
- Acesso restrito por `requireAdmin` (`role = ADMIN`).

## 15. Vários filhos por conta

- No **Perfil**, um seletor lista as crianças. `selecionarCrianca` troca a
  criança ativa (cookie `pf_crianca`, validado contra os filhos do usuário).
- **Adicionar criança** reabre o onboarding. **Remover** apaga o filho e tudo
  dele (cascade), nunca deixando a conta sem nenhum.
- Cada criança tem seu próprio plano, lista, rotina e favoritos.

## 16. Modelo de dados (principais tabelas)

- **User** — conta (nome, e-mail, hash, `role`).
- **Subscription** — plano e status + campos do Stripe
  (`stripeCustomerId`, `stripeSubscriptionId`, `stripePriceId`,
  `currentPeriodEnd`, `trialEnd`, `cancelAtPeriodEnd`).
- **ChildProfile** — a criança (faixa etária, praticidade, objetivo,
  equipamentos, horários habituais).
- **FoodPreference** — ACEITA / RECUSA / DESEJADA / RESTRICAO por ingrediente.
- **Ingredient** — catálogo (81) com composição TACO e `gramasPorUnidade`.
- **Recipe** / **RecipeIngredient** — receitas (115), com `idadeMinimaMeses`,
  `imagemUrl`, `porcoes`, scores `scoreSono/Energia/Calma`, `equipamentos`.
- **MealPlan** / **MealSlot** — o ciclo de 30 dias e os slots (data, tipo,
  receita, status, explicação).
- **MealFeedback** — reações às refeições.
- **RoutineEntry** — registro diário de sono/atividade/disposição.
- **PantryItem** / **ShoppingCheck** / **ShoppingExtra** — despensa e lista de
  compras (itens marcados e itens manuais).
- **Favorite**, **AuditLog**, **MonthlyReport**, **FoodJourney**.

## 17. Datas e fuso (importante)

Todas as datas de dia usam **"chave" = meia-noite UTC do dia-calendário de São
Paulo** (`src/lib/dates.ts`: `hojeChave`, `chaveDoDia`, `addDiasChave`,
`diffDiasChave`, `chaveUtc`). Isso evita que o "hoje" dependa do fuso do
servidor (Vercel roda em UTC). Os slots são gravados por chave e comparados por
chave; os rótulos de dia formatam em UTC.

## 18. Scripts e comandos

| Comando | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` / `start` | Build e produção |
| `npm run db:seed` | Semeia ingredientes e receitas |
| `npm run db:nutricao` | Popula composição TACO nos ingredientes |
| `npm run db:gramas` | Deriva gramas por ingrediente e porções |
| `npm run db:rotina` | Calcula scores SONO/ENERGIA/CALMA das receitas |
| `npm run db:fotos` | Atribui foto de prato a cada receita |
| `npm run stripe:setup` | Cria/atualiza produto, preços e webhook no Stripe |
| `npm run screens` | Captura prints do app (para o carrossel da landing) |
| `npm run db:migrate` | Aplica migrações (`prisma migrate deploy`) |

## 19. Variáveis de ambiente

| Variável | Para quê | Segredo? |
|---|---|---|
| `DATABASE_URL` / `DIRECT_URL` | Postgres (pooled / direto) | sim |
| `AUTH_SECRET` | NextAuth | sim |
| `STRIPE_SECRET_KEY` | API do Stripe | sim |
| `STRIPE_PRICE_ID` / `STRIPE_PRICE_ID_TRIMESTRAL` | Preços | não |
| `STRIPE_WEBHOOK_SECRET` | Verificação do webhook | sim |
| `NEXT_PUBLIC_META_PIXEL_ID` | Pixel (navegador e CAPI) | não |
| `META_CAPI_TOKEN` | Conversions API (servidor) | sim |
| `META_TEST_EVENT_CODE` | (opcional) modo Test Events | não |
| `NEXT_PUBLIC_ENABLE_UTMIFY` | Liga o script da Utmify | não |
| `NEXT_PUBLIC_APP_URL` | (opcional) URL base para retornos | não |
| `DEMO_MODE` | (só na branch `criativo`) libera o app sem checkout | não |

Segredos ficam no `.env` (gitignored) e nas Environment Variables da Vercel —
nunca no código.

## 20. Modo demonstração (para criativos)

Existe uma branch separada **`criativo`** (não mesclada na `main`) com um bypass
controlado por `DEMO_MODE=1`: na tela de teste, o botão entra direto no app sem
checkout. Serve só para gravar anúncios; a produção real segue exigindo
pagamento. Publicada numa URL de preview própria.

---

### Como manter este guia

Ao adicionar tela, botão, ação ou integração, atualize a seção correspondente.
Cada rota nova entra na seção **3**; cada evento de tracking, na **13**; cada
variável, na **19**.
