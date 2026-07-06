# Sprint 7 — "Destravar" Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to
> implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> **Source of truth estratégico:** `scripts/Planning/ROADMAP.md` §5 (Sprint 7).

## Original Reported Issues (source of truth)

1. O **input de PDF não funciona** — análise de fatura falha com
   `Object storage upload failed: 404 NoSuchBucket`.
2. Em **Minhas Usinas**, o cliente cria uma usina e fica "aguardando aprovação",
   mas **a solicitação não aparece em lugar nenhum do admin**.
3. A telemetria dos inversores só atualiza quando alguém abre o dashboard —
   falta o **cron de sync em background** rodando na VPS.
4. O app precisa ir para **produção/homologação** com envs e secrets auditados.

## Clarified Scope (confirmado com o PO 2026-07-04)

- **Issue 1:** Diagnóstico primeiro (systematic-debugging). Causa provável: bucket
  inexistente/nome errado no ambiente — mas verificar TODO o caminho
  upload → storage → análise → persistência → tela Economia, com PDF real.
- **Issue 2:** Causa **já confirmada no código**: `POST /api/client/plants` grava
  `validationStatus: 'pending_review'` (`src/app/api/client/plants/route.ts:52`) e o
  mesmo padrão existe para consumer units, mas nenhuma tela admin lista pendências —
  só existe PATCH por cliente (`src/app/api/admin/clients/[id]/plants/[plantId]/route.ts`).
  Construir a **fila global de aprovações** no admin.
- **Issue 3 (revisado 2026-07-04 após pull de `1cb683c`/`e756450`):** A rota de sync
  existe (`src/app/api/generation/sync/route.ts`) mas está **SEM autenticação** —
  `AuthMiddleware` é importado e nunca chamado; qualquer pessoa na internet pode
  disparar um sync completo contra as APIs dos providers (risco de estouro de rate
  limit/ban no Hoymiles). O dev NÃO adicionou agendamento: os commits novos tagueiam
  `source: 'api_sync'`, corrigem o filtro Prisma de `manual_pending` (NULL) e melhoram
  os charts — o gap do cron continua. Decisão de implementação: **scheduler
  in-process via `src/instrumentation.ts`** (hook de boot que já existe e chama
  `initListeners()`), intervalo por env (`GENERATION_SYNC_INTERVAL_MINUTES`, default 15,
  respeitando o throttle de 15 min do Hoymiles), ativado somente com a env presente
  (produção). Fica versionado no repo e sobrevive a redeploys — sem crontab manual na
  VPS. A proteção da rota por service-token continua necessária independentemente.
- **Issue 4:** Deploy + checklist de envs. Migrations **sempre** via `migrate deploy`
  na VPS (não há Docker DB local).
- **Extra (timebox 1 dia):** WP-8 do ROADMAP — auditoria de gap entre o Analisador de
  Contas standalone (`C:\Users\mateus\Documents\MSM\Solo Energia - Analisador de Contas (APP)\solar-bill-clarity`)
  e as telas Economia/Consumo do app. Entregável: lista objetiva em
  `scripts/Planning/wp8_gap_analisador.md`. **Sem código nesta sprint.**

---

**Goal:** Ao fim da sprint: fatura em PDF real sobe e é analisada sem erro; nenhuma
solicitação de cliente cai em buraco negro; telemetria atualiza sozinha; app no ar
com 3–5 clientes piloto reais.

**Architecture:** Next.js 15 App Router + React 19, TanStack Query no client, backend
`use-case/service/repository`, Prisma 6, object storage S3-compatível
(`src/lib/object-storage.ts`), design system shadcn/Tailwind com tokens CSS em
`src/app/globals.css`.

## Global Constraints

- Test runner: `npm test -- <path>` (vitest). Type check: `npm run typecheck`.
- Copy do usuário em **português brasileiro**, tom existente.
- Tokens de design como `var(--token)` — nunca `hsl(var(--token))`.
- Não introduzir dependências novas sem aprovação do PO.
- TDD: teste falhando primeiro → implementação mínima → verde → commit.
- Commits frequentes, um por task: `fix(economia)`, `feat(admin)`, `chore(infra)`.
- Migrations: preparar localmente (`prisma migrate dev --create-only` se schema mudar),
  aplicar na VPS com `prisma migrate deploy`.

---

## Task 7.1 — Fix do input de PDF (bloqueador)

**Skill:** superpowers:systematic-debugging — diagnosticar ANTES de corrigir.

- [x] Reproduzir o erro com um PDF real de fatura Enel (fluxo cliente: Economia →
      enviar fatura) e capturar o erro exato de storage
      **Diagnóstico:** Causa raiz confirmada — bucket `uploads` nunca é provisionado.
      `object-storage.ts` faz PUT direto (SigV4) sem verificar existência.
      Não há init container nem script de boot que crie o bucket.
- [x] Auditar `src/lib/object-storage.ts` + envs (`.env` local vs VPS): nome do bucket,
      endpoint, região, credenciais; confirmar se o bucket existe no provedor
      **Achado:** `.env` local tem `MINIO_BUCKET_NAME=uploads`, `MINIO_ENDPOINT=localhost`.
      Bucket `uploads` não existe no MinIO. Dois storages paralelos:
      `src/lib/object-storage.ts` (raw SigV4, usado) e `src/backend/storage/s3-client.ts` (AWS SDK, não usado).
- [x] Corrigir a causa raiz (provisionar bucket e/ou corrigir config; se fizer sentido,
      criar bucket automaticamente no boot OU falhar com mensagem acionável)
      **Correção:** `ensureBucketExists()` + `bucketExists()` + `createBucket()` em
      `src/lib/object-storage.ts`; chamado no boot via `src/backend/init-listeners.ts`.
      Erro `NoSuchBucket` em `uploadObject` convertido para mensagem pt-BR clara.
- [x] Adicionar teste de contrato para o caminho de upload (mock do storage, erro
      NoSuchBucket → mensagem clara em pt-BR para o usuário, não XML cru)
- [ ] Validar e2e: PDF real → upload → análise IA → fatura aparece na Economia com
      explicação; conferir também o fluxo admin (`admin/clients/[id]/energy-bills/import`)
- [ ] **Aceite:** 3 PDFs reais de layouts diferentes analisados com sucesso

## Task 7.2 — Fila de aprovações no admin

- [x] API: `GET src/app/api/admin/approvals/route.ts` — lista `Plant` e `ConsumerUnit`
      com `validationStatus: 'pending_review'` (join com cliente; ordenar por criação)
- [x] Teste da rota (admin-only; user comum recebe 403)
- [x] UI: página `src/app/(private)/@master/admin/approvals/page.tsx` — tabela de
      pendências com ações **Aprovar / Rejeitar** (com motivo opcional), reusando os
      PATCH existentes (`admin/clients/[id]/plants/[plantId]`, `.../consumer-units/[unitId]`)
- [x] Badge de contagem de pendências no menu/admin dashboard (TanStack Query,
      refetch on focus)
- [x] Lado do cliente: em Minhas Usinas, estado "aguardando aprovação" mostra data do
      pedido; após rejeição, mostrar motivo
- [ ] **Aceite:** cliente cria usina no wizard → item aparece na fila do admin →
      aprovar → cliente vê a usina ativa sem precisar de suporte

## Task 7.3 — Sync de telemetria em background + proteger a rota

**Contexto pós-pull:** rota global de sync está aberta ao público (bug de segurança);
nenhum agendamento existe. O sync client-scoped disparado pelo dashboard (Sprint 6.1)
continua como está.

- [x] **Proteger `POST /api/generation/sync`**: exigir service-token via header
      (`x-sync-token`, secret `GENERATION_SYNC_TOKEN` em env) OU sessão admin; token
      inválido/ausente → 401. Teste primeiro (TDD): rota sem token → 401
- [x] Scheduler in-process em `src/instrumentation.ts`: se
      `GENERATION_SYNC_INTERVAL_MINUTES` estiver definida, agendar
      `syncAllInvertersData()` no intervalo (default 15 min); guard para rodar só no
      runtime Node.js (`process.env.NEXT_RUNTIME === 'nodejs'`) e nunca em build/test
- [x] Log estruturado por ciclo: quantos inversores sincronizados, falhas por provider
      (alimenta o painel de status do Sprint 9 / WP-5)
- [x] Teste unitário do scheduler (fake timers: dispara no intervalo, não agenda sem env)
- [x] Adicionar `GENERATION_SYNC_INTERVAL_MINUTES` e `GENERATION_SYNC_TOKEN` ao
      `docker-compose.prod.yml` (o dev acabou de adicionar as envs de
      Hoymiles/AUXSOL lá — commit `e756450` — seguir o mesmo padrão)
- [ ] **Aceite:** com nenhum dashboard aberto por 1h, os dados de geração no banco
      avançam; chamada anônima à rota de sync retorna 401

## Task 7.4 — Deploy + auditoria de envs

- [ ] Checklist de envs de produção: DB, JWT/auth secrets, chaves IA (Gemini/Claude/OpenAI),
      credenciais de providers de inversores, object storage, service-tokens novos
- [ ] `npm run typecheck` + suíte completa verde no commit de deploy
- [ ] Deploy na VPS + `prisma migrate deploy` (se houver migration nova do 7.2/7.3)
- [ ] Smoke test em produção: login cliente, login admin, upload de PDF (Task 7.1),
      dashboard de geração, fila de aprovações (Task 7.2)
- [ ] **Aceite:** smoke test 100% verde em produção

## Task 7.5 — Piloto com clientes reais (PO + agente)

- [ ] PO seleciona 3–5 clientes reais (mix: com inversor conectável + com fatura em mãos)
- [ ] Cadastrar via admin: cliente, usina, UC, inversor, rateio (sem esperar o
      importador de planilha — ele é o Sprint 10)
- [ ] Carregar a fatura do mês de cada um e validar a análise na fila de revisão
- [ ] Registrar problemas encontrados em `scripts/Planning/sprint_7_piloto_notas.md`
      (alimenta o cockpit do Sprint 9 e o WP-8)
- [ ] **Aceite:** cada piloto loga e vê geração + fatura analisada ("por que paguei isso")

## Task 7.6 — WP-8: Auditoria de gap do Analisador (timebox 1 dia)

- [x] Comparar telas/insights do `solar-bill-clarity` com Economia/Consumo do app:
      visão mensal por conta, saldo de créditos mês a mês, comparativo com rateio,
      "por que paguei este valor"
- [x] Entregar `scripts/Planning/wp8_gap_analisador.md` com: já coberto / falta /
      prioridade sugerida (para Sprint 9/10)
- [ ] **Aceite:** PO revisa a lista e marca o que entra no v1

---

## Fora de escopo desta sprint (não deixar entrar)

- Hub de Integrações e cofre de credenciais → Sprint 8
- Tickets, cockpit admin, notificações → Sprint 9
- Importador de planilha / migração total → Sprint 10
- Qualquer WP do Bot-Enel além de documentação → Trilha B (dev externo)
