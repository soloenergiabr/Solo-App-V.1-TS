# Sprint 7.1 — Geração Distribuída (rateio de custo + responsável por UC)

## Job to be done (original)

> Afonso tem um prédio onde aluga imóveis para inquilinos, ele instalou o
> sistema solar nesse prédio que agora gera o suficiente para suprir a demanda de
> todos os inquilinos, todas as contas estão em sua titularidade, ele quer poder
> receber todas as contas, ratear a energia gerada entre as contas, e também
> poder fazer a gestão de pagamentos colocando o responsável por pagar essa conta,
> ele pode enviar somente a conta para pagamento do inquilino ou então definir o
> valor a ser pago baseado na quantidade de energia que está fornecendo para essa
> conta.

Objetivo: habilitar geração distribuída para clientes micro e médios — vale
para o prédio do Afonso e para a família com uma usina e 5 casas.

---

## Análise: o que já existia vs. o gap real

Verificado no código antes de escrever qualquer linha.

| Necessidade do Afonso | Situação encontrada |
|---|---|
| Várias UCs sob um titular | ✅ `ConsumerUnit` (n por `Plant`/`Client`), flags `isGenerator`/`isConsumer` |
| Ratear a energia gerada | ✅ `CreditAllocation` + tela `/rateio` (proposta, timeline, auditoria, guarda de soma ≤100%) |
| Receber todas as contas | ✅ `EnergyBill` por UC + análise IA + `/economia` |
| Definir o responsável | ⚠️ Metade — campos `payerName/Email/Phone/payerUserId` e `resolveAccessibleUnitIds` existiam, mas **não havia como criar o login do pagador**: `/api/auth/register` sempre cria um `Client` novo |
| Cobrar o inquilino | ❌ Nada. `EnergyBill.amountDue` é o que a Enel cobra do titular, não o que o inquilino deve ao Afonso |
| Enviar a conta ao inquilino | ❌ Nada (model `Notification` é Sprint 9; `lib/mail.ts` já existia) |

**Os 4 gaps fechados nesta sprint:** entidade de cobrança, base em kWh por UC,
provisionamento do login do pagador, e envio por e-mail.

---

## Decisões do PO (2026-08-14)

| # | Decisão | Efeito |
|---|---|---|
| D1 | Regra de cobrança com **três modos** (`pass_through`, `per_kwh`, `fixed`), escolhidos por UC | Cobre os dois casos do JTBD sem bifurcar o produto |
| D2 | Inquilino tem **login próprio** (completa o `payerUserId` que era letra morta) | Puxa o fluxo de convite + endurecimento de escopo |
| D3 | **Titular self-serve + espelho no admin** | Uma API só; `?clientId=` liberado para role `master` |
| D4 | Executar direto, sem plano de implementação | Esta sprint |

**Restrição estratégica respeitada:** ROADMAP §8 mantém "pagamento de fatura
in-app" fora do v1. O app **calcula, envia e registra a baixa**; o dinheiro
troca de mãos fora do app. Sem gateway, sem emissão de boleto.

---

## O que foi implementado

### Modelo de dados (`prisma/migrations/20260814000000_add_distributed_generation`)

- **`ChargeRule`** — uma por UC (`consumerUnitId` unique): `mode`, `pricePerKwh`,
  `fixedAmount`, `dueDayOfMonth`, `isActive`.
- **`Charge`** — uma por UC/competência (unique `consumerUnitId+ano+mês`):
  snapshot de `mode`, `basisKwh`, `pricePerKwh`, `amount`, `dueDate`, `status`
  (`draft|sent|paid|overdue|canceled`) e do responsável.
- **`PayerInvite`** — convite por token: guarda **apenas o hash** (SHA-256);
  o token cru só existe no link do e-mail. TTL 7 dias.

### Núcleo de cálculo (`src/backend/gd/charge-calculator.ts`) — puro, 26 testes

- `per_kwh` = `compensatedEnergyKwh` **real da fatura** × preço do titular
- `pass_through` = `amountDue` (fallback `totalBillValue`)
- `fixed` = valor fixo, **não depende de fatura** (cobra antes de a conta chegar)
- Vencimento: `dueDayOfMonth` vale para o **mês seguinte** à competência
  (a fatura de julho chega em agosto), com encaixe no último dia de meses curtos;
  sem dia na regra, herda o vencimento da fatura
- `overdue` é **derivado na leitura** — não precisa de job de vencimento

### Correções de segurança (o login de pagador abriria estes buracos)

| Achado | Correção |
|---|---|
| `computeAccessibleUnitIds([])` devolvia `'all'` — desatribuir a última UC de um pagador o promovia a titular e expunha a conta inteira | Pagador passa a ser marcado por **role**, não por "tem UCs" |
| `/api/rateio`, `/api/client/plants`, `/api/client/consumer-units` eram escopados só por `clientId` — um pagador veria a usina e o rateio do prédio inteiro | `assertNotPayer` nas rotas de titular |
| `PUT /api/admin/clients/[id]/payers` chamava `extractUserContext` sem checar role e confiava no `[id]` da URL — **qualquer usuário autenticado reatribuía o responsável de qualquer cliente** | Passa a exigir role `master` |

### API (`/api/gd/*`) — `?clientId=` só para `master` (espelho do admin)

`GET|POST /charge-rules` · `GET /charges` · `POST /charges/generate` ·
`POST /charges/[id]/send` · `POST /charges/[id]/confirm-payment` ·
`DELETE /charges/[id]` · `GET|POST /invites` · `DELETE /invites/[id]` ·
`GET|POST /invites/accept` (público)

`generate` é **idempotente** e nunca reescreve cobrança já enviada ou paga — o
valor que o inquilino recebeu por e-mail não muda pelas costas dele. Erro por UC
não derruba o lote: volta na lista de `errors` com o motivo em pt-BR.

### Telas

- **Titular** — aba "Geração Distribuída" em `/consumo`: resumo do mês
  (cobrado / recebido / em aberto / vencido), tabela de cobranças com Enviar e
  Recebi, e tabela de unidades com regra de cobrança e convite.
- **Pagador** — aba "Minha conta": só a UC dele, valor, como foi calculado,
  vencimento e "Já paguei". Abas Rateio e consumo do cliente ficam ocultas.
- **Admin** — aba "Geração Distribuída" em `admin/clients/[id]`, mesma tela.
- **Público** — `/convite/[token]`: cria a senha e o acesso.

---

## Gate de verificação (2026-08-14)

| Comando | Resultado |
|---|---|
| `npx vitest run` | ✅ **568 testes, 89 arquivos, 0 falhas** (44 novos em `backend/gd` + 7 de escopo em `api/gd`) |
| `npm run typecheck` | ✅ limpo |
| `npm run build` | ✅ exit 0; rotas `/api/gd/*` e `/convite/[token]` no manifesto |

Commits: `a936467` (feature) + `daaad18` (envs) via PR #1, mergeado em `main`
como `d52eaf3` em 2026-08-15; `de850e0` (correção do link do convite) em 2026-08-18.

> Os erros `PrismaClientInitializationError` no build são **pré-existentes** —
> prerender sem banco local (ver `sprint_7_destravar_v1.md`: não há Docker DB local).

---

## Ambiente de produção — o que o env do Dokploy revelou (2026-08-18)

Conferido contra o env real exportado do Dokploy. Três conclusões:

**1. Dokploy NÃO usa o `docker-compose.prod.yml`.** O env define
`DATABASE_URL=...@localhost:6001` e `DATABASE_HOST=localhost`, enquanto o compose
fixa `postgres:5432`. Os dois não podem ser verdade — logo o Dokploy builda o
**Dockerfile direto e injeta as envs ele mesmo**. Consequências:

- Editar o compose é documentação; **variável de produção se altera na UI do Dokploy**.
- Resolve a dúvida Docker vs PM2: é **Docker**, então o `ENTRYPOINT` roda e
  `npx prisma migrate deploy` **executa no boot** (`docker-entrypoint-prod.sh`).

**2. A variável do link não era a que eu usei.** Produção não tem
`NEXT_PUBLIC_APP_URL`; tem `NEXT_PUBLIC_BASE_URL="https://soloapp.com.br"`, já
lida por `src/config.ts` como `config.base_url` — a mesma fonte que o
`forgot-password.use-case.ts:31` usa no link de reset de senha. Corrigido em
`de850e0`, com teste de regressão. **Nada a adicionar no Dokploy.**

**3. SMTP já está completo.** `SMTP_HOST/PORT/USER/PASS/FROM` presentes
(Gmail, porta 587). `SMTP_SECURE` está ausente e **deve continuar assim**: 587 é
STARTTLS e exige `secure: false`, que é o default de `lib/mail.ts`.

> `Planning/assets/env_dokploy.md` tem segredos de produção e está no
> `.gitignore`. Nunca versionar.

---

## ⚠️ Risco de deploy: drift de migrations pode derrubar o app

Ao aplicar as migrations num Postgres real pela primeira vez (2026-08-18, banco
de dev local), **4 migrations falharam** com `already exists`:

```
20251231010042_                       → relation "consumption" already exists
20260616000000_add_controle_sprint2   → type "BillPaymentStatus" already exists
20260619120000_add_rateio_enel_sync   → (mesma classe)
20260619130000_add_validation_status  → (mesma classe)
```

Causa: `prisma db push` em algum momento criou os objetos sem registrar em
`_prisma_migrations`. O `20260623` já tinha sido escrito à mão com `IF NOT EXISTS`
por causa desse mesmo problema — ou seja, é recorrente no projeto.

**Por que é perigoso em produção:** `docker-entrypoint-prod.sh` tem `set -e` e roda
`migrate deploy` sem `|| true`. Migration que falha → entrypoint sai != 0 →
com `restart: always` o container entra em **crash loop**. O deploy derruba o app,
não apenas deixa a feature de fora.

**Runbook — rodar ANTES de redeployar**, no terminal do Dokploy:

```bash
cd /app && npx prisma migrate status   # o shell do Dokploy abre em /, não em /app
```

- Só `20260814000000_add_distributed_generation` pendente → deploy limpo.
- Migrations antigas pendentes → produção tem o mesmo drift. Para **cada** uma,
  confirmar no banco que os objetos já existem e só então:
  `npx prisma migrate resolve --applied <nome>`. Nunca marcar como aplicada sem
  conferir — se a migration criava algo que falta, o schema fica inconsistente.

A migration da GD em si foi validada de ponta a ponta contra um Postgres real:
3 enums, todas as colunas, as 2 unique constraints e as 9 FKs. As invariantes
foram testadas funcionalmente (transação com rollback): duas regras na mesma UC →
bloqueado; cobrança duplicada na mesma competência → bloqueado (é a guarda de
idempotência do `generateCharges`); `mode` inválido → rejeitado pelo enum.

---

## Pendências antes de usar com cliente real

- [x] `docker-compose.prod.yml` e `env.example` alinhados a `NEXT_PUBLIC_BASE_URL`
- [x] Link do convite usando `config.base_url` (`de850e0`)
- [x] SMTP conferido no env de produção — completo, nada a fazer
- [x] Migration validada contra Postgres real
- [ ] **Rodar o `migrate status` do runbook acima na produção** — único gate
      técnico restante antes do deploy
- [ ] Deploy pelo Dokploy (a migration entra sozinha no boot)
- [ ] Teste e2e com o caso do Afonso: 1 usina, 3 UCs, 3 modos diferentes
- [ ] **PO decide o sequenciamento** — esta sprint foi executada fora da ordem
      do ROADMAP (S8 Hub de Integrações, S9 Suporte/Notificações, S10 Migração).
      Dois pontos de contato a resolver:
      - **Sprint 9:** os e-mails de convite e cobrança hoje usam `lib/mail.ts`
        direto. Quando o model `Notification` existir, devem migrar para ele.
      - **Sprint 10:** o template da planilha (10.1) precisa ganhar colunas de
        `ChargeRule` e responsável, senão a base entra sem as regras de cobrança
        e vai exigir uma segunda migração.

## Fora de escopo (deliberado)

- Gateway de pagamento, split, emissão de boleto/PIX do titular → v2 (ROADMAP §8)
- Contrato de locação, reajuste, multa e juros sobre a cobrança
- Rateio automático no portal da Enel → WP-6/7, Trilha B
