# 🧭 Roadmap Solo App v1 — Visão Consolidada do PM

> **Autor:** Claude (Project/Product Manager)
> **Versão:** 1.1 — 2026-07-04 (incorpora ajustes do PO Mateus de 2026-07-04)
> **Insumos:** Visão original do Mateus + análise do engenheiro AGY (ambas preservadas no [Apêndice](#apêndice--visões-originais)) + ajustes do PO
> **Status da base:** verificado no código em `main` antes de escrever este documento.

---

## 1. A Tese Central

**O Solo App v1 não é um projeto de construção. É um projeto de lançamento.**

O que já existe e funciona em `main` (verificado no código):

- ✅ Pipeline completo de análise de fatura: upload → OCR (Gemini/Claude/OpenAI via factory) → extração → flags determinísticas → event bus
- ✅ Drivers de inversores: Hoymiles, Solis, Deye (`inverter-api.factory.ts`) + rotas admin/client de inversores e usinas
- ✅ Admin com validação de faturas, gestão de clientes, rateio (CreditAllocation + APIs)
- ✅ Solo Club inteiro (ofertas, resgates, coins, vouchers, indicações)
- ✅ Bot-Enel como serviço real (`../Bot-Enel`): servidor porta 3006, filas Redis/BullMQ (`extraction-queue`, `webhook-queue`), captcha server, Docker
- ✅ Analisador de Contas (`solar-bill-clarity`): o motor de análise já foi portado para `src/backend/economia/analyzer`

O que está **quebrado ou faltando** (verificado, não especulado):

- 🐛 **Input de PDF não funciona** — object storage retorna `NoSuchBucket` 404; bloqueia o fluxo central do produto
- 🐛 **Buraco negro de aprovação de usinas** — `POST /api/client/plants` cria com `validationStatus: 'pending_review'`, mas **nenhuma tela do admin lista pendências**; o cliente espera uma aprovação que o admin nunca vê (causa confirmada no código)
- ❌ Onboarding de inversores é técnico demais — falta o Hub de Integrações (modelo instalador vs. usuário final)
- ❌ Sem tickets de suporte (manutenção/problema) — e este app É o backend de suporte da Solo Energia
- ❌ Sem model `Notification`, sem cofre de credenciais Enel, sem integração Bot-Enel ↔ app
- ❌ Sem importador de planilha para a migração final da base de clientes

---

## 2. A Métrica Única do V1

> **Quantos clientes têm o "loop fechado" este mês?**
> Loop fechado = fatura entrou (auto ou manual) → analisada pela IA → cliente viu a explicação de por que pagou aquele valor → cruzada com a geração real do inversor.

**Meta v1: 100% dos clientes da Solo Energia com loop fechado, sendo ≥70% sem toque humano.**

O ajuste do PO sobre acesso *end-user* de inversores adiciona um vetor de escala: clientes que a Solo **não instalou** também podem entrar no loop. Isso não muda a métrica — amplia quem pode entrar nela.

---

## 3. Ajustes do PO Incorporados (2026-07-04)

| # | Ajuste | Implicação no roadmap |
|---|---|---|
| A1 | **Onboarding de inversores em dois modos**: credencial de *instalador* (Solo vê todas as usinas instaladas e "libera" usinas/inversores para clientes) e credencial de *usuário final* (cliente ou admin conecta uma conta específica — inclusive de usinas que a Solo não instalou) | Vira o workstream principal do Sprint 8 — Hub de Integrações (estilo GDASH, com logos dos providers já suportados + "solicitar integração") |
| A2 | **Bot-Enel + auto-pull é escopo do dev externo**, mas está atrasado — o PO quer WBS completo e, se necessário, nós executamos | §6 define o WBS em work packages com dono; lado-app pode ser absorvido por nós imediatamente |
| A3 | **Garantir a integração do Analisador de Contas** (`solar-bill-clarity`) no app | Motor já portado; falta auditoria de gap das *views* + o bug do PDF (WP-8/9/10) |
| A4 | **Bug: input de PDF não funciona** | Sprint 7, item 1 — bloqueador |
| A5 | **Bug: "Minhas Usinas" espera aprovação que não aparece para o admin** | Sprint 7, item 2 — fila de aprovações no admin (causa já identificada) |
| A6 | **Tickets de suporte** (manutenção/problemas) — o app é o backend de suporte da Solo Energia | Entra no v1 em versão mínima (Sprint 9). Revisa o "não fazer O&M tickets" da visão original: *pipeline O&M completo* continua fora; *ticket simples* entra |
| A7 | **Migração total da base de clientes via planilha** ao final — PO preenche sheet, sistema ingere e organiza tudo | Sprint 10 — importador com validação e dry-run; substitui o "popular na semana 1" por: piloto pequeno agora, migração total no final |

---

## 4. O Caminho — Duas Trilhas em Paralelo

### Trilha A — App (nós: PO + agentes)

```
Sprint 7            Sprint 8              Sprint 9               Sprint 10
"Destravar"    ─►   "Hub de         ─►    "Suporte &       ─►    "Migração &
PDF fix +           Integrações"          Notificações"          Go-Live Total"
fila aprovação +    onboarding 2 modos    tickets + e-mail       importador sheet +
deploy + piloto     instalador/end-user   4 eventos              base completa
```

### Trilha B — Integração Bot-Enel (dev externo, governada pelo WBS do §6)

```
WP-1/2 (lado app: cofre + API ingestão)  ─►  WP-3/4 (bot: captura + webhook)  ─►  WP-6/7 (rateio automático)
         ↑ podemos absorver JÁ                    ↑ dev externo                        ↑ dev externo
```

**Regra de governança da Trilha B:** o lado-app (WP-1, WP-2, WP-5, WP-6) fazemos nós nos Sprints 8–9 — isso remove qualquer desculpa de bloqueio do dev. O dev externo entrega só o lado-bot (WP-3, WP-4, WP-7). **Se em 2 sprints o dev não entregar WP-3/4, nós absorvemos** — o Bot-Enel já tem filas, captcha e extração prontos; o trabalho restante é plugável.

---

## 5. As Fases em Detalhe

### Sprint 7 — "Destravar" (~1 semana) → arquivo `sprint_7_destravar_v1.md`

*Consertar o que impede o produto de ser usado hoje e colocar no ar.*

| # | Entrega | Critério de aceite |
|---|---|---|
| 7.1 | **Fix do input de PDF** (bucket/objeto storage + fluxo e2e de upload→análise) | Fatura real em PDF sobe, é analisada e aparece na Economia sem erro |
| 7.2 | **Fila de aprovações no admin** — tela global de pendências (usinas + UCs `pending_review`) com aprovar/rejeitar; badge de contagem no menu | Cliente cria usina no wizard → item aparece no admin → aprovado → cliente vê ativo |
| 7.3 | **Cron de telemetria em background na VPS** (rota de sync já existe; falta o agendamento) | Dados de geração atualizam sem ninguém abrir o dashboard |
| 7.4 | **Deploy de produção/homolog + auditoria de envs e secrets** | App no ar, migrations via `migrate deploy` |
| 7.5 | **Piloto: 3–5 clientes reais** (manual, sem esperar o importador) | Piloto com loop fechado assistido: fatura carregada + geração visível |

**Gate:** pipeline de fatura validado com PDFs reais; nenhuma solicitação de cliente cai em buraco negro.

---

### Sprint 8 — "Hub de Integrações" (~1–1,5 semana)

*O onboarding de inversores limpo, nos dois modos de acesso (A1).*

**Modelo de dados:** `ProviderCredential { provider, scope: INSTALLER | END_USER, clientId? (null = credencial da Solo), payload criptografado, status }`. Usinas puxadas por credencial de instalador ganham vínculo de "liberação" para um cliente.

| # | Entrega | Detalhe |
|---|---|---|
| 8.1 | **Página de Integrações (admin)** estilo GDASH: grid de providers com logos — Hoymiles, Solis, Deye ativos; demais do benchmarking como "em breve" | Referência: `benchmarking_1_gdash.md` |
| 8.2 | **Fluxo instalador (admin):** cadastrar credencial Solo → listar todas as usinas instaladas do provider → **liberar** usina/inversor para um cliente específico | Reusa `inverter-api.factory` e rotas admin existentes |
| 8.3 | **Fluxo end-user (admin):** cadastrar credencial do cliente em nome dele → conecta aquela usina específica | Para contas que a Solo não instalou — vetor de escala |
| 8.4 | **Fluxo end-user (cliente):** mesma grid no app do cliente → conectar com credencial própria OU ver usinas já liberadas pelo admin | Substitui/refina o wizard atual |
| 8.5 | **"Solicitar nova integração"** — cliente pede provider não suportado; vira registro visível no admin | Alimenta o roadmap de providers por demanda real |
| 8.6 | **[Trilha B — WP-1] Cofre de credenciais Enel** — mesma infra de criptografia do item 8.2/8.3, estendida para credenciais de distribuidora | Uma infra de cofre só para os dois casos |

**Gate:** novo cliente conecta inversor (por credencial própria ou liberação) em < 5 min; admin vê tudo num hub só.

---

### Sprint 9 — "Suporte & Notificações" (~1 semana)

*O app vira de fato o backend de suporte da Solo Energia (A6) e começa a falar com o cliente.*

| # | Entrega | Detalhe |
|---|---|---|
| 9.1 | **Tickets mínimos:** model `Ticket` (categoria: manutenção/problema/dúvida; status: aberto/em andamento/resolvido; thread de mensagens) | Cliente abre na página de Suporte existente; admin tem fila com filtros |
| 9.2 | **Cockpit de operações no admin:** pendências (aprovações, tickets, faturas em revisão, falhas de sync) em uma tela | O "Admin 360°" por evidência — só o que a operação já demandou |
| 9.3 | **Notificações mínimas:** model `Notification` + central no app + e-mail; 4 eventos: fatura analisada, vencimento próximo, problema de geração, anomalia na fatura | Pluga no event bus existente; WhatsApp fica fora do v1 |
| 9.4 | **[Trilha B — WP-2/5] API de ingestão de faturas + painel de status de captura** | Destrava o dev externo por completo |

**Gate:** ticket aberto pelo cliente aparece no admin em tempo real; cliente recebe e-mail "sua fatura foi analisada — você pagou R$ X, veja por quê".

---

### Sprint 10 — "Migração & Go-Live Total" (~1 semana)

*A base inteira entra no sistema (A7) e a operação real começa.*

| # | Entrega | Detalhe |
|---|---|---|
| 10.1 | **Template de planilha** com dicionário de colunas: clientes, usuários, UCs, usinas, inversores, rateios, investimentos | Definido junto com o PO antes de codar |
| 10.2 | **Importador com dry-run:** valida a planilha, gera relatório de erros/avisos SEM gravar; PO corrige e roda de novo | Ingestão só acontece com dry-run limpo |
| 10.3 | **Ingestão + reconciliação:** cria/atualiza entidades, vincula tudo, relatório final do que foi criado | Idempotente — rodar 2x não duplica |
| 10.4 | **Onboarding em massa validado:** todos os clientes logam e veem seus dados | Início da operação real |

**Gate:** 100% da base da Solo Energia dentro do sistema, loop fechado assistido para todos.

---

### Contínuo / Fase 4 — Polimento e Crescimento (Sprints 11+)

UX/UI → PWA → Solo Club ofertas reais (trabalho *comercial* do PO, em paralelo, sem consumir dev) → Landing Pages → SEO → Docs. Nada disso bloqueia o loop; nada disso entra antes.

---

## 6. WBS — Integração Bot-Enel + Analisador de Contas (A2/A3)

> **Repos:** app = este repo · bot = `C:\Users\mateus\Documents\MSM\Solo-App-v1.1\Bot-Enel` (`temp_bot_enel`, Express :3006, BullMQ/Redis, captcha server) · analisador = `C:\Users\mateus\Documents\MSM\Solo Energia - Analisador de Contas (APP)\solar-bill-clarity`

### Frente 1 — Auto-pull de faturas (o núcleo do escopo do dev)

| WP | Nome | Lado | Dono | Entregável / Aceite |
|---|---|---|---|---|
| **WP-1** | **Cofre de credenciais Enel** | App | **Nós (Sprint 8)** | Model `DistributorCredential` criptografado + consentimento registrado + forms admin/cliente + endpoint interno `GET` autenticado por service-token para o bot ler credenciais de forma efêmera |
| **WP-2** | **API de ingestão de faturas** | App | **Nós (Sprint 9)** | `POST /api/integrations/enel/bills` (service-token): recebe PDF + metadados (UC, mês ref.), **idempotente por UC+mês**, executa o MESMO pipeline do upload manual, responde com status da análise |
| **WP-3** | **Agendador de captura** | Bot | **Dev externo** | Cron mensal por UC: lê credenciais (WP-1), faz login/captcha (já existe no bot), baixa o PDF da fatura, enfileira na `extraction-queue` |
| **WP-4** | **Entrega via webhook** | Bot | **Dev externo** | `webhook-queue` → `POST` no WP-2 com retry/backoff; em falha definitiva, reporta erro estruturado |
| **WP-5** | **Observabilidade + fallback** | App | **Nós (Sprint 9)** | Painel admin: status por UC (última captura, sucesso/falha, motivo); falha marca a UC como "upload manual necessário" — o manual é rede de segurança permanente |

**Aceite da Frente 1:** no mês seguinte à entrega, ≥70% das faturas entram sem toque humano e 100% das falhas ficam visíveis no admin.

### Frente 2 — Rateio automático

| WP | Nome | Lado | Dono | Entregável / Aceite |
|---|---|---|---|---|
| **WP-6** | **Endpoint de ordens de rateio** | App | **Nós (Sprint 10+)** | `GET` service-token expondo `CreditAllocation` pendentes (percentuais, vigência, UC) em JSON estruturado |
| **WP-7** | **Execução no portal + callback** | Bot | **Dev externo** | Bot lê ordens, submete no portal Enel, faz callback de resultado; app marca `applied` — transparência pending vs applied preservada |

### Frente 3 — Paridade com o Analisador de Contas (nosso, não do dev)

| WP | Nome | Lado | Dono | Entregável / Aceite |
|---|---|---|---|---|
| **WP-8** | **Auditoria de gap** | App | **Nós (Sprint 7, timebox 1 dia)** | Lista objetiva: quais views/insights do `solar-bill-clarity` (visão mensal por conta, saldo de créditos mês a mês, "por que paguei isso") faltam nas telas Economia/Consumo |
| **WP-9** | **Fix do input de PDF** | App | **Nós (Sprint 7.1)** | Já no Sprint 7 — é o mesmo bug |
| **WP-10** | **Port das views faltantes** | App | **Nós (Sprint 9/10, conforme WP-8)** | As telas do app entregam a mesma clareza do analisador standalone |

### Regra de escalonamento (A2)

O dev externo recebe **apenas WP-3, WP-4 e WP-7**, com os contratos (WP-1/2/6) prontos e documentados por nós. Checkpoint a cada sprint: **se WP-3/4 não estiverem entregues até o fim do Sprint 9, nós absorvemos no Sprint 10** — o bot já tem 80% da infraestrutura (captcha, filas, extração); o restante é integração.

---

## 7. Mapa de Dependências (revisado)

```
S7: PDF fix ─► pipeline validado ─► piloto 3–5 clientes
     └─► fila de aprovações ─► onboarding sem buraco negro
S8: Hub Integrações (instalador + end-user) ─► cofre de credenciais (WP-1)
S9: Tickets + cockpit admin + notificações ─► API ingestão (WP-2) + status captura (WP-5)
                                                    │
Trilha B (dev): WP-3/4 captura+webhook ◄────────────┘  ─► auto-pull ≥70%
S10: Importador planilha ─► migração total ─► operação real ─► WP-6/7 rateio automático
```

**Mudança estrutural vs. versão anterior:** o Hub de Integrações subiu para o Sprint 8 (era parte difusa da "Fase 0/1") e as notificações continuam cedo (Sprint 9). A migração total via planilha ancorou o fim do v1 (Sprint 10), com piloto pequeno já no Sprint 7.

---

## 8. O Que NÃO Fazer no V1

Mantém a lista original (CRM, multi-tenant completo, dashboard customizável, mobile nativo, mapa de usinas) **com duas revisões**:

| Item | Status | Motivo |
|---|---|---|
| ~~O&M Tickets~~ → **Ticket simples entra (Sprint 9)** | ⚠️ Revisado | O app é o backend de suporte da Solo Energia (A6). O que continua fora: SLA, roteamento de equipe, agenda de manutenção preventiva |
| Pagamento de fatura in-app | ❌ Fora | Escopo financeiro/regulatório de v2 |
| Correlação clima × geração; previsão por telemetria | ❌ Fora | Produto v1.5+; o v1 responde "por que paguei isso?" |
| API de troca de titularidade | ❌ Fora | Frequência baixa; manual resolve |
| WhatsApp como canal | ❌ Fora | E-mail primeiro; WhatsApp se engajamento baixo |
| Novos providers além de Hoymiles/Solis/Deye | ⏸️ Por demanda | O botão "solicitar integração" (8.5) gera a fila real de demanda |

---

## 9. Riscos

| Risco | Prob. | Impacto | Mitigação |
|---|---|---|---|
| **Dev externo atrasa WP-3/4** | **Alta (já está atrasado)** | Alto | Contratos prontos por nós (WP-1/2/6); checkpoint por sprint; absorção no Sprint 10 se necessário |
| Scraping Enel quebra (captcha/layout) | Alta | Alto | Manual como fallback permanente (WP-5); InfoSimples como plano B pago |
| IA erra extração em layouts não vistos | Média | Alto | Piloto do Sprint 7 valida com PDFs reais ANTES do auto-pull |
| Credenciais (Enel + inversores end-user) = passivo LGPD | Média | Alto | Um cofre único criptografado, consentimento registrado, acesso efêmero, log de uso |
| Migração via planilha com dados sujos | Média | Médio | Dry-run obrigatório com relatório de erros antes de gravar (10.2) |
| Scope creep no Hub de Integrações | Média | Médio | Sprint 8 fecha com 3 providers ativos; resto é logo "em breve" |

---

## 10. Resumo Executivo (uma tela)

1. **Sprint 7 — Destravar:** PDF fix, fila de aprovações (bug confirmado no código), cron de telemetria, deploy, piloto com 3–5 clientes reais. *O produto funciona de verdade, no ar.*
2. **Sprint 8 — Hub de Integrações:** onboarding de inversores nos dois modos (instalador libera / end-user conecta), grid estilo GDASH, cofre de credenciais. *Onboarding limpo + vetor de escala.*
3. **Sprint 9 — Suporte & Notificações:** tickets, cockpit admin, e-mail com 4 eventos, API de ingestão pronta para o bot. *O app vira o backend de suporte da Solo e fala com o cliente.*
4. **Sprint 10 — Migração & Go-Live:** importador de planilha com dry-run, base 100% dentro, rateio automático na sequência. *Operação real.*
5. **Trilha B em paralelo:** dev externo entrega só WP-3/4/7 com contratos prontos; se não entregar até o fim do Sprint 9, absorvemos.

Métrica que governa tudo: **clientes com loop fechado / mês, ≥70% sem toque humano.**

---
---

# 📎 Apêndice — Visões Originais

> Conteúdo original deste documento, preservado na íntegra para referência:
> a visão do PM Mateus e a análise do engenheiro AGY.

---

View of the Project Manager: Mateus

---

## 🗺️ Roadmap Estratégico — Solo App v1

> **Propósito:** Este documento define a visão estratégica, sequenciamento e
> lógica de negócio para o lançamento do Solo App v1 em produção.
>
> **Data:** 2026-07-02
> **Visão:** Solo Ventures — plataforma de software para energia solar
> **Produto:** Solo App — app do cliente final + admin da operadora

---

### Sumário Estratégico

1. [Princípios Estratégicos](#princípios-estratégicos)
2. [Os 13 Pontos do V1](#os-13-pontos-do-v1)
3. [Mapa de Dependências](#mapa-de-dependências)
4. [Sequenciamento Estratégico — Sprint Series](#sequenciamento-estratégico)
5. [O Que NÃO Fazer no V1](#o-que-não-fazer-no-v1)

---

### Princípios Estratégicos

**O Core Loop do Valor:**

```
Dados entram sozinhos  →  IA processa e explica  →  Admin opera sem dor  →  Cliente ama e fica  →  Escala acontece
       (A)                      (B)                       (C)                     (D)                  (E)
```

Cada bloco depende do anterior. Pular etapas gera dívida técnica de produto.

**Regras de Decisão:**

1. **Cliente propõe, Solo valida, automação executa** — core contract do v1
2. **IA explica, não decide** — IA dá clareza, humano decide
3. **Transparência radical** — status real sempre visível (pending vs applied)
4. **Mobile first, web melhor** — toda feature funciona em mobile
5. **Dado que não entra = não existe** — automatizar ingestão é prioridade máxima
6. **Valor real > funcionalidade nova** — cada sprint deve entregar algo que o cliente sente

---

### Os 13 Pontos do V1

For have the Solo App v1 in production we need to build and deliver these points:

**1. Consumo:** Integrate the automatic bill pull of the Enel inside the workflow of the system with an Onboarding Page to have the credentials of the clients to can made the pull, also the microservice of the enel whel integrated.

**2. Consumo:** Integrate the analizador project inside the workflow of the app trough the complete frontend to input manually or autopull and generate total descriptive in multistep analyzes of the billing, made the ocr of the billing and have all the data stored, run the analyzes, extract the credits that is flag in the billing, analyze if the rateios is running correctly, made the report, trigger some notification or flag if something is out of the desired and have the posibility to client talk with your own account.

- Example of error in AI analyze: Erro na análise Object storage upload failed: 404 <?xml version="1.0" encoding="UTF-8"?> <Error><Code>NoSuchBucket</Code><Message>The specified bucket does not exist</Message>...

- In the visualization for the per account we can have something more aproximade of the analizador project with the reference month: "C:\Users\mateus\OneDrive\Desktop\MSM\Solo Energia - Painel de Cliente (APP)"

- We want something like: Day x, pull account, register in the right place / monthly / client, run analyzes, take all the data and organize correctly: Generation, Consuption, Injected, Credits, Compare with the Rateios, see if the Solar generate the proposed and also if supplier all the energy necessary, understand the values that was paid, like the telemetry of the account but also comparede with all the other thing: generation telemetry, rateios, potency of the system, prevision of generation based in the telemetry but also the correlation between potency and real wether data, the idea is put the client in the real control of the energy, to this we need to thin back to the begin to understand what generate value for the client and how to build this information, put them in the right place and utilize ai to empower.

- storage credits balance, monthly and month to month to client can see this variation.

- an clear information: why the client paid this value this month? with all the data and information organized in the right place.

- About the table of historic, to have the real consumo of the enel, instant consumo, injected and generated to have this balance we also need have the correlation with the data of the track period of the Enel like medição days, with it we will fetch this days like an filter of our database points of monitoring.

- Rateio: We need to develop the api for do the Rateio automatically.
- Also develop the api for the owner change automatically.

https://infosimples.com/consultas/contas-enel-ce-download/
https://github.com/mpfarias/tarifas-energia-api

- Pay billing inside the app, send the payment to the responsible for that account.

**3. Energia:** We need to have an onboarding process to conect the inverter.

Has the providers integrations api and will scaling with more inverters and after have an easy way of the client conect your inverter in platform and also the admin.

- Have an full vision picture for all the Usinas (Plants) of the client with the real time data and all the inverters, and so can filter by plant, inverter, data, etc.

- Have an specific view for each plant, inverter to can analyze the data trough the time.

- bring more telemetry data if possible of the apis

- have the roadmap of the suppliers to integrate, read here: C:\Users\mateus\Documents\MSM\Solo-App-v1.1\Solo-App-V.1-TS\scripts\Planning\benchmarking_1_gdash.md

to know how to work better in this integrations session.

- Improve the view of the data and also have the inverter section to see if the % of the potency in the moment, some notification of problem, internet connection and so on.

- Have the filter for specific days like: day 3 to 7 etc.

**4. Notifications:** Have an workflow for notifications:

- New billing
- Billing with issues
- Vencimento day of the billing
- Payment done
- report of the month
- generation issues

**5. Solo Club:**

- Imporve the Solo Club logic
- Input real offers

**6. Improve the Admin page** to have full suport control, 360 system view, granular client control and permissioning, onboarding (have to function like the backend support system of Solo Energia)

**7. Populate the System** with the real clients data.

**8. Create the permissioning logic** with the evolving subscription: like plan free - Generation only, plan pro: full system use.

**9. refining the ux / ui** with the design of the pages, improve the light / dark mode, refining the desigh of the charts and visual hierarchy.

**10. adapt to mobile,** responsiveness, pwa and possbilite of native app.

**11. SEO, tracking and growth.**

**12. Full docs.**

**13. Landing Pages.**

---

### Mapa de Dependências

```
Auto Pull Enel (1) ──► Analyzer Completo (2) ──► Notificações (4)
       │                                              │
       │                                              ▼
       └──────────────────────┐              Admin 360° (6)
                              │                  │
Inversor Onboarding (3) ──────┼──────────────────┤
                              │                  │
                              ▼                  ▼
                     Permissionamento (8) ◄── Planos (8)
                              │
                              ▼
                     Solo Club (5) ──► UX/UI (9) ──► Mobile (10)
                                                          │
                                                          ▼
                                                  SEO (11) + Docs (12) + LPs (13)
```

**Dependências críticas:**

- **Item 1 (auto pull)** bloqueia **item 2 (analyzer)** em escala — sem fatura automática, analyzer depende de upload manual
- **Item 3 (inversor onboarding)** é independente de 1/2 — pode rodar em paralelo
- **Item 8 (permissionamento)** é pré-requisito para produção real com múltiplos planos
- **Item 6 (admin 360°)** depende de 1, 2, 3 estarem funcionando — sem dados, admin não tem o que mostrar
- **Itens 11-13 (growth)** só fazem sentido depois que o produto está rodando e retendo

---

### Sequenciamento Estratégico

#### Sprint Series A — "Auto-pilot" (Data In)

**Objetivo:** Dados entram sozinhos. Fim da dependência de processos manuais.

| Item | Descrição | Justificativa |
|---|---|---|
| **1** | Auto pull Enel + onboarding credenciais | Sem isso, toda análise de consumo depende de upload manual |
| **3** | Onboarding inversor + providers API scaling | Sem isso, novos clientes não entram no fluxo de geração |

**Por que primeiro:** Itens 1 e 3 são os **gargalos de toda a cadeia de valor**. Tudo que vem depois depende deles. Rodam em paralelo por serem independentes.

**Critério de sucesso:** Novo cliente conecta seu inversor e tem faturas puxadas automaticamente em < 5 minutos de onboarding.

---

#### Sprint Series B — "AI Engine" (Core Processing)

**Objetivo:** Transformar dados brutos em informação de valor com IA explicativa.

| Item | Descrição | Justificativa |
|---|---|---|
| **2** | Analyzer completo (OCR + extração + análise + reports + notificações) | Diferencial competitivo mais forte do Solo App |
| **7** | Povoar com dados reais de clientes | Validação real do analyzer em produção |

**Por que segundo:** O analyzer é o coração do produto — entrega o valor que o cliente sente. Mas ele só funciona se os dados estiverem entrando (Series A).

**Critério de sucesso:** Cliente recebe fatura, sistema puxa automaticamente, analisa com IA e gera report completo em < 60 segundos.

---

#### Sprint Series C — "Ops Hub" (Operations)

**Objetivo:** A Solo Energia opera dezenas de clientes sem trabalho manual.

| Item | Descrição | Justificativa |
|---|---|---|
| **6** | Admin 360° — visão completa + controle granular | Hub de operações para equipe Solo |
| **4** | Notificações — billing, vencimento, issues, reports | Redução de chamados de suporte |
| **8** | Permissionamento por plano (Free vs Pro) | Modelo de negócio + gating de features |

**Por que terceiro:** Admin precisa de dados (A) e análises (B) para agir. Notificações só fazem sentido quando há eventos para notificar.

**Critério de sucesso:** Admin vê status de todos os clientes em uma tela, recebe alertas proativos, gerencia onboarding sem sair do sistema.

---

#### Sprint Series D — "Client Delight" (Retenção)

**Objetivo:** Transformar cliente satisfeito em cliente fiel e promotor.

| Item | Descrição | Justificativa |
|---|---|---|
| **5** | Solo Club com ofertas reais | Ecossistema de incentivos (ninguém no mercado tem) |
| **9** | UX/UI refinement + empty states + micro-animações | Percepção de qualidade premium |
| **10** | Mobile / PWA / push / biometria | Mercado mobile-first brasileiro |

**Por que quarto:** Clube e UX são diferenciais de **retenção**, não de aquisição. Primeiro o produto precisa funcionar (A+B+C).

**Critério de sucesso:** Cliente abre o app todo dia (engajamento mensal > 80%), indica amigos espontaneamente (NPS > 70).

---

#### Sprint Series E — "Growth" (Escala)

**Objetivo:** Escalar aquisição e preparar o terreno para multi-tenant.

| Item | Descrição | Justificativa |
|---|---|---|
| **11** | SEO + analytics + tracking | Aquisição orgânica |
| **12** | Documentação completa | Pré-requisito para terceiros usarem a plataforma |
| **13** | Landing Pages | Aquisição paga/orgânica |
| — | Preparação multi-tenant (schema TenantConfig) | "Prepare the soil, plant later" |

**Por que quinto:** SEO e LPs trazem tráfego, mas se o produto não retém, o tráfego é desperdiçado.

**Multi-tenant:** Não implementar agora. Apenas preparar schema (campo `tenantId` opcional, `TenantConfig` model). O gatilho para implementar de verdade é quando um segundo integrador quiser usar a plataforma.

**Critério de sucesso:** Tráfego orgânico crescente, clientes se autodocumentam, primeiro integrador avalia a plataforma.

---

### O Que NÃO Fazer no V1

| Item | Motivo | Quando Fazer |
|---|---|---|
| **CRM de Vendas** (pipeline, leads, kanban) | Solo Energia não é integradora que vende para terceiros | Pós-v1 se entrar em mercado de integradores |
| **O&M Tickets** (chamados de manutenção) | Solo opera usinas próprias — ticket é complexidade desnecessária | Pós-v1 se multi-tenant com integradores |
| **Multi-tenant completo** | Solo Energia é único cliente hoje. Refatorar agora = risco sem retorno | Gatilho: segundo cliente integrador |
| **Dashboard customizável** (drag-and-drop) | Legal mas valor marginal vs esforço para v1 | Pós-v1 |
| **Mobile nativo (React Native/Expo)** | PWA resolve para v1 | Pós-v1 validado |
| **Mapa de usinas (Google Maps)** | Visualmente legal, não crítico para o core loop | Pós-v1 |
| **Relatórios automáticos p/ cliente** | Killer feature, mas depende de A+B+C sólidos | Sprint Series C/D |

---

### Apêndice: Referências

- [Benchmarking GDASH → Solo App](./benchmarking_1_gdash.md) — Análise competitiva completa
- Commits base: Sprint 5 (Economia), Sprint 6 (Consumo), Sprint 6.1 (Controle fixes)
- Arquitetura: Next.js 15 + DDD + Prisma + PostgreSQL + Gemini AI

---

### 🛡️ Flag: AGY — Análise Estratégica, Priorização e Caminho Crítico (Integração Bot-Enel)

Após analisar o status atual da base de código do **Solo App v1** e a existência do projeto autônomo de automação **`Bot-Enel`** (localizado em `../Bot-Enel`), apresento uma revisão estratégica focada em **otimização de esforço, caminho crítico e sequenciamento de entrega**. 

Não estamos construindo robôs de captura e automação do zero. O trabalho do desenvolvedor disponível é de **integração**, o que reduz drasticamente os prazos e redefine o que é gargalo.

---

#### 1. 🗺️ O Caminho Crítico para Produção (Critical Path)

O objetivo principal é colocar o aplicativo no ar com o menor atrito técnico possível, validando o valor no mundo real.

```
[Lançamento Base: Dia 1]              [Lançamento Auto: Semana 2]            [Lançamento Ops: Semana 4]
   Manual Upload & IA      ────────►    Integração Bot-Enel      ────────►    Automação de Rateio (Enel)
   (Já está pronto!)                    (Captura Automática)                  (Envio Automático via Bot)
```

1.  **Fase 0 (Pronta no Main): Upload Manual + IA + Inversores (Dia 1)**
    *   *Por que:* A infraestrutura de upload de faturas, OCR com Gemini/Claude, e onboarding básico de inversores já está integrada e testada localmente. O aplicativo pode ir para produção imediatamente neste modelo semi-assistido.
2.  **Fase 1: Integração de Ingestão de Dados (Bot-Enel Auto-Pull) (Semana 2)**
    *   *Por que:* Conectar o projeto `Bot-Enel` existente para buscar as faturas. O cliente digita as credenciais Enel, o app as armazena de forma criptografada, o bot busca a fatura em background e envia para a API do Solo App via webhook.
3.  **Fase 2: Integração de Operações (Automação de Rateio) (Semana 4)**
    *   *Por que:* O cliente ajusta os percentuais no Solo App, e o desenvolvedor integra a API de regras do Solo App com a rotina de envio de rateio do `Bot-Enel`, que entra no site da distribuidora e executa a operação.

---

#### 2. 🔗 Correlações e Dependências de Integração

A integração do `Bot-Enel` conecta três módulos do Solo App:

*   **Criptografia de Credenciais ↔ Bot-Enel:** Para que o `Bot-Enel` busque faturas em background, o Solo App precisa criptografar de forma segura as credenciais de acesso da distribuidora do cliente no banco. O bot deve decodificar isso de forma efêmera e segura na execução.
*   **Webhook de Entrada ↔ Pipeline de IA:** O `Bot-Enel` funciona como um "cliente automático". Ao puxar o PDF da fatura, o bot deve disparar um POST para o endpoint `/api/client/energy-bills/upload`. Esse endpoint executará o *mesmo* pipeline de IA que processa uploads manuais, garantindo reaproveitamento de 100% do motor de IA.
*   **Tabela `credit_allocation` ↔ Script de Rateio:** As regras configuradas na tabela `credit_allocation` (percentuais, datas de vigência) devem ser expostas em um endpoint estruturado JSON para que o desenvolvedor do `Bot-Enel` consiga ler as ordens de rateio pendentes e submetê-las ao portal da Enel.

---

#### 3. 🎯 Matriz de Priorização para Go-Live

Esta matriz divide o backlog entre o que é **essencial para o lançamento imediato** e o que pode ser construído **em paralelo ou postergado** para otimizar o tempo do desenvolvedor.

| Item / Funcionalidade | Prioridade | Esforço (com Bot-Enel) | Justificativa Estratégica |
|---|---|---|---|
| **1. Upload Manual + IA** | ⭐ **Crítica (Dia 1)** | Praticamente Zero | Já está integrado no `main`. Serve como o fallback imediato caso a automação do portal caia. |
| **2. Conexão do Inversor** | ⭐ **Crítica (Dia 1)** | Baixo (Já mapeado) | Essencial para cruzar geração real com dados de consumo. Os drivers (Solis, Deye, Hoymiles) já existem. |
| **3. Cofre de Credenciais (Enel)** | 🟢 **Alta (Fase 1)** | Baixo | Tela simples de formulário coletando login/senha da Enel e criptografando no BD. |
| **4. Webhook Bot-Enel (Pull)** | 🟢 **Alta (Fase 1)** | Médio (Integração) | Conexão do script existente de download de faturas com o pipeline de IA da aplicação. |
| **5. Automação de Rateio** | 🟡 **Média (Fase 2)** | Médio (Integração) | Pode rodar depois do lançamento. No início, o time da Solo pode fazer o rateio manualmente ou via console usando o script isolado. |
| **6. Notificações Básicas** | 🟡 **Média (Fase 2)** | Baixo | Notificações de "Fatura Disponível" ou "Problema na Geração" via webhook simples de e-mail/WhatsApp. |
| **7. Solo Club & Vouchers** | 🔴 **Baixa (Post-v1)** | Alto | Recursos de engajamento do clube. O core do negócio é eficiência energética e controle operacional, não marketplace. |
| **8. Mobile Nativo / PWA** | 🔴 **Baixa (Post-v1)** | Alto | A aplicação web responsiva já cobre as necessidades de v1. Converter em app nativo agora gera custo desnecessário. |
| **9. Multi-Tenant Completo** | 🔴 **Baixa (Post-v1)** | Alto | O único cliente no v1 é a Solo Energia. Deixar o schema preparado com `clientId` é suficiente. |

#### 4. 🚀 Próximos Passos Recomendados para o Desenvolvedor

1.  **Realizar o deploy imediato** da branch atual em um ambiente de homologação e validar o fluxo de **Upload Manual + AI Analyzer** com faturas reais dos clientes (Validando o pipeline Gemini/Claude).
2.  **Desenhar a API de integração para o Bot-Enel:** Criar o endpoint seguro que receberá o PDF baixado pelo bot e a rota de consulta de credenciais encriptadas.
3.  **Habilitar o cron de sincronização de telemetria dos inversores** em segundo plano, garantindo que o banco de dados seja alimentado independentemente das requisições do frontend.
