# Solo App (Solo Energia)

Plataforma web (responsiva) para clientes de energia solar acompanharem geração, contas de luz, economia e o Clube Solo. Inclui o painel administrativo da Solo Energia.

## Stack

- **Next.js 15** (App Router) + **React** + **Tailwind** + shadcn/ui
- **Node.js 20** e **PostgreSQL 16** via **Prisma**
- **Redis** (filas/jobs) e **MinIO** (S3 compatível, PDFs das faturas)
- Testes com **Vitest** + Testing Library (`npm test`)

## Módulos

| Área | Onde | O que faz |
|---|---|---|
| Autenticação | `src/backend/auth`, `src/app/(auth)` | Login com e-mail e senha (bcrypt + JWT com refresh), cadastro, recuperação de senha por e-mail |
| Controle (cliente) | `src/frontend/controle`, `/controle` | Resumo: economia, geração, retorno do investimento, checklist da conta |
| Geração | `src/backend/generation`, `/dashboard` | Inversores Solis, Solplanet, Deye, Hoymiles e Auxsol: potência em tempo real, histórico diário/mensal/anual, comparação com o período anterior |
| Consumo e faturas | `src/backend/economia`, `/consumo`, `/economia/[id]` | Contas a pagar (PIX e código de barras), histórico, análise da conta por IA (nota, alertas, recomendações, chat sobre a conta) |
| Busca automática de faturas | `src/backend/integrations/faturapi` | Busca mensal das faturas da Enel pela Faturapi (webhook), com o PDF salvo no MinIO |
| Rateio e Geração Distribuída | `src/backend/gd`, `/consumo?tab=gd` | Divisão de créditos entre UCs, cobrança dos responsáveis por e-mail e convite de acesso |
| Clube Solo | `src/backend/club`, `/club`, `/solo-coins` | Ofertas, vouchers, Solo Coins e "Indique e Ganhe" |
| Suporte | `/support` | FAQ e chat com IA |
| Admin | `src/app/(private)/@master` | Dashboard com indicadores, clientes (checklist de configuração), aprovações, validação de faturas, Faturapi, ofertas e FAQ |

As rotas de cliente ficam em `src/app/(private)/@user` e as de admin em `src/app/(private)/@master`. O layout escolhe o slot pelo papel do usuário (`master` ou `user`).

## Rodando localmente

```bash
cp env.example .env          # preencha as variáveis (veja abaixo)
make dev                     # sobe Postgres, Redis e MinIO (docker compose)
npm install
npx prisma generate
npx prisma db push           # cria o schema (veja a nota sobre migrations)
npm run db:seed              # cria admin@solo-energia.com e cliente@teste.com
npm run dev                  # http://localhost:3000
```

> **Migrations:** o histórico em `prisma/migrations` não cria algumas tabelas (`consumer_unit`, `credit_allocation`), porque elas foram criadas com `db push`. Em banco novo use `prisma db push`. O banco de produção já tem o schema completo, e `migrate deploy` aplica apenas as migrations novas.

> **Senhas do seed:** o seed usa a senha padrão `Admin@123456`. **Troque-a em qualquer ambiente acessível pela internet.**

## Variáveis de ambiente principais

A lista completa está em `env.example` (local) e `env.docker.example` (Docker/produção).

| Variável | Para quê |
|---|---|
| `DATABASE_URL`, `REDIS_URL` | Banco e filas |
| `JWT_SECRET`, `APP_ENCRYPTION_KEY` | Tokens de login e criptografia das credenciais dos inversores |
| `NEXT_PUBLIC_BASE_URL` | URL pública do app, usada nos links de e-mail (convite, reset de senha, cobrança) |
| `SMTP_*` | Envio de e-mails |
| `MINIO_*` | Armazenamento dos PDFs das faturas |
| `FATURAPI_KEY`, `FATURAPI_WEBHOOK_SECRET` | Busca automática de faturas |
| `BILL_ANALYZER_PROVIDER` + `ANTHROPIC_API_KEY` (ou `GEMINI_API_KEY`) | Análise da conta por IA. Sem provedor configurado, o padrão é Claude, e sem a chave a análise não roda |
| `OPENAI_API_KEY` | Chat de suporte |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | Pagamento online das cobranças de GD (cartão e PIX). Sem a chave secreta, o recurso fica desligado |
| `GENERATION_SYNC_INTERVAL_MINUTES` | Sync automático dos inversores em segundo plano. Sem ela, a geração só atualiza quando a tela é aberta |
| `SOLIS_*`, `SOLPLANET_*`, `DEYE_*`, `HOYMILES_*`, `AUXSOL_*` | Contas de integração dos inversores |

## Integrações

- **Faturapi:** configure o webhook da conta Faturapi para `https://<seu-domínio>/api/webhooks/faturapi`, com o mesmo segredo de `FATURAPI_WEBHOOK_SECRET` (assinatura HMAC verificada). O fluxo é: a Faturapi extrai a fatura, envia `invoice.received`, o app cria ou atualiza a `EnergyBill` (valor, vencimento, PIX, consumo e créditos), salva o PDF e roda a análise por IA. Pelo painel **Admin → Busca de faturas** dá para ver saldo, UCs monitoradas, conexões e eventos, e reprocessar um evento.
- **Stripe (pagamento das cobranças de GD):** o responsável paga a cobrança com cartão ou PIX pelo Stripe Checkout (botão **Pagar com cartão ou PIX** na aba GD do Consumo), e o titular pode usar **Copiar link de pagamento** (o link do Checkout vale por 24 horas). A baixa é automática pelo webhook. Configuração no painel do Stripe:
  1. Em **Developers → API keys**, copie a chave secreta para `STRIPE_SECRET_KEY`.
  2. Em **Developers → Webhooks**, crie um endpoint para `https://<seu-domínio>/api/webhooks/stripe` com os eventos `checkout.session.completed` e `checkout.session.async_payment_succeeded` (este último é o do PIX). Copie o *signing secret* (`whsec_...`) para `STRIPE_WEBHOOK_SECRET`.
  3. Em **Settings → Payment methods**, ative Cartões e PIX. Se o PIX não estiver disponível na conta, o Checkout oferece só cartão.

  Os links de pagamento do e-mail de cobrança apontam para o app (`/consumo?tab=gd`), nunca direto para o Stripe, porque a sessão de Checkout expira.
- **Inversores:** `src/backend/generation/repositories/inverter-api.factory.ts` escolhe a integração pelo `provider` do inversor.
- **IA:** `src/backend/economia/analyzer` (Claude, Gemini ou OpenAI, escolhido por `BILL_ANALYZER_PROVIDER`).

## Deploy

Produção roda em Docker (`docker-compose.prod.yml`) com `scripts/deploy-prod.sh`. O container aplica `prisma migrate deploy` e o seed ao subir (`scripts/docker-entrypoint-prod.sh`).

## Testes

```bash
npm test            # vitest
npm run typecheck   # tsc --noEmit
```
