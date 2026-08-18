# Configuração do Stripe

Assinatura com **teste grátis de 7 dias** e cobrança automática depois. O cartão
é exigido já na entrada; a primeira cobrança só acontece ao fim do trial.

## O que já está pronto no código

- Checkout hospedado do Stripe (`mode: subscription`, `trial_period_days: 7`,
  `payment_method_collection: "always"`).
- Paywall em `/assinar` — o app inteiro fica bloqueado sem trial/assinatura ativos.
- Webhook em `/api/stripe/webhook` que sincroniza renovação, falha de pagamento e
  cancelamento.
- Reconciliação imediata no retorno do checkout (não depende do webhook chegar).

Falta só ligar a **sua** conta Stripe através de três variáveis de ambiente.

## Passo a passo

### 1. Pegue sua chave secreta
Painel do Stripe → **Developers → API keys** → copie a **Secret key**.
Comece pela de **teste** (`sk_test_...`).

### 2. Ponha a chave no `.env`
```
STRIPE_SECRET_KEY=sk_test_...
```

### 3. Rode o setup automático
```bash
npm run stripe:setup
```
Isso cria, na sua conta, o **produto**, o **preço de R$ 29,90/mês** e o
**webhook** apontando para produção. No final ele imprime as duas linhas que
faltam:
```
STRIPE_PRICE_ID=price_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 4. Cole as três variáveis
No `.env` local **e** na Vercel (*Settings → Environment Variables → Production*):
```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PRICE_ID=price_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 5. Deploy
Depois que as três estiverem na Vercel, publique a produção.

## Testando (modo teste)

No checkout, use o cartão de teste do Stripe:
- Número: `4242 4242 4242 4242`
- Validade: qualquer data futura · CVC: qualquer 3 dígitos

O fluxo esperado: cadastro → onboarding → `/assinar` → checkout → volta liberado,
com status `TESTE` (trialing) por 7 dias.

## Virar para produção (live)

1. Troque a chave por `sk_live_...` no `.env`.
2. Rode `npm run stripe:setup` de novo (cria produto/preço/webhook no modo live).
3. Atualize as três variáveis na Vercel com os valores **live** e faça deploy.

> As chaves (`sk_...`, `whsec_...`) são segredos: ficam só no `.env` (que é
> gitignored) e nas variáveis da Vercel. Nunca no código nem no git.
