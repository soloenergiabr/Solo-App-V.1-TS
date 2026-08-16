# Sprint — Inverter Integrations v1

> **Document contract.** Part 1 is the PM brief from Gemini, preserved verbatim.
> Part 2 is the engineering spec written by the Product Engineer for consumption
> by Antigravity / Claude Code. Part 2 is the source of truth for
> implementation; if it contradicts Part 1, Part 2 wins and the discrepancy is
> raised back to Gemini.

---

# PART 1 — PM Brief (Gemini, preserved)

### 🌟 North Star

Centralizar a telemetria e o monitoramento das usinas no banco de dados do Solo
App. O objetivo deste sprint é conectar as plantas da AUXSOL (via API oficial) e
da Solarman (via API cloud não-oficial), eliminando o trabalho manual de
migração de usinas e permitindo que a equipe de suporte visualize todos os dados
de geração num painel único (`@master`).

---

### 🦸‍♂️ My Hero Sections

**Input:** "Preciso integrar os inversores da Auxsol / Nansen usando a
documentação oficial e as chaves de API que o suporte acabou de me enviar. Além
disso, tenho várias plantas presas no monitoramento da Solarman que não consigo
migrar para a Deye Cloud no momento. Em vez de perder tempo fazendo essa
migração manualmente, quero integrar a Solarman agora mesmo usando uma rota
não-oficial (open-source), assim como fizemos com a Hoymiles."

**The View (Architectural Organization):**

- **AUXSOL / Nansen (Official Route):** Integração limpa via REST API. O sistema
  usará o ID e Secret fornecidos para gerar um _Access Token_ com a AiSWEICloud.
  Esse token será guardado em cache temporal para alimentar a rotina de
  sincronização (Cron Job) de forma estável e segura, sem risco de bloqueios.
- **Solarman (Shadow Route):** Integração orientada a eficiência de código. Como
  a Deye Cloud é um "clone" (white-label) da Solarman e a integração da Deye já
  está pronta no nosso código, vamos aproveitar essa arquitetura. Criaremos um
  clone do repositório da Deye apontando para as URLs base da Solarman
  (`api.solarmanpv.com`), autenticando com o e-mail/senha master da equipe e
  mapeando os JSONs que possuem o mesmo formato.

---

### 🏗️ Epics Breakdown (Specs to the Engineer)

_Nota para a Engenharia: Ambas as integrações devem respeitar a interface
`InverterApiRepository` já estabelecida no projeto._

#### Epic 1: Integração Oficial AUXSOL / Nansen

**Objetivo:** Criar o módulo de comunicação oficial lendo a documentação PDF da
AUXSOL.

- **Task 1.1: Setup do Repositório e Autenticação**
  - Criar o arquivo
    `src/backend/generation/repositories/implementations/auxsol.inverter-api.repository.ts`.
  - Implementar o método de login recebendo o `providerApiKey` (App ID: 20879) e
    o `providerApiSecret` do banco de dados.
  - O endpoint de autenticação retornará um _Access Token_ (Bearer).
- **Task 1.2: Estratégia de Cache do Token**
  - O Access Token tem validade temporária. Implementar uma camada simples de
    cache (em memória ou no Redis configurado no `docker-compose`) para guardar
    esse token. O sistema só deve chamar a rota de login da AUXSOL novamente
    quando o token expirar, otimizando o fluxo do nosso Cron Job.
- **Task 1.3: Fetch e Mapeamento de Dados**
  - Criar os métodos para buscar a lista de plantas (Plant List) e os dados do
    inversor (Device Data).
  - Mapear os parâmetros técnicos retornados no JSON da AUXSOL (ex: `pac` para
    potência atual, `etd` para energia do dia) para os modelos padronizados do
    nosso Prisma (`ProviderPlant` e `GenerationUnit`).

#### Epic 2: Integração Não-Oficial Solarman

**Objetivo:** Plugar as usinas legadas simulando requisições Cloud,
reaproveitando a integração Deye existente.

- **Task 2.1: Clonagem Estrutural**
  - Duplicar o arquivo existente `deye.inverter-api.repository.ts`.
  - Renomear a nova classe e o arquivo para
    `solarman.inverter-api.repository.ts`.
- **Task 2.2: Roteamento e Payload**
  - Alterar a `BASE_URL` para apontar para o servidor principal da Solarman (ex:
    `https://api.solarmanpv.com`). _(Ref. open-source: repositório GitHub
    `hareeshmu/solarman`)_.
  - Ajustar a rota de autenticação. Em vez de usar chaves de API, o payload de
    login deverá receber o **E-mail** (`providerApiKey`) e a **Senha com hash
    SHA-256** (`providerApiSecret`) do usuário administrador Master da Solo
    Energia.
- **Task 2.3: Ajuste de Interfaces de Retorno**
  - Rodar o script de teste de sincronização
    (`sync-inverter-generation-data.use-case.ts`) apontando para um inversor
    Solarman.
  - Validar se as chaves do JSON de retorno da Solarman são 100% idênticas às da
    Deye. Caso haja alguma pequena variação no nome dos parâmetros (ex:
    `dailyEnergy` vs `eToday`), criar o tratador de dados específico na classe
    para salvar corretamente na tabela `GenerationUnit`.

---

# PART 2 — Engineering Spec (Product Engineer, for Antigravity & Claude Code)

> **How to read this.** Section 0 sets preconditions. Section 1 defines
> contracts shared by both epics. Sections 2 and 3 are the implementation specs
> for Epic 1 (AUXSOL) and Epic 2 (Solarman) with explicit endpoints, field
> mappings, and Definition of Done per task. Section 4 covers integration
> testing. Section 5 lists open questions that must be resolved with Mateus
> before merge.

---

## 0. Preconditions — read before writing any code

Before starting Task 1.1 or 2.1, the agent must:

1. **Read the existing Generation module.** Specifically:
   - `src/backend/generation/repositories/interfaces/inverter-api.repository.ts`
     (or equivalent) — the `InverterApiRepository` contract.
   - `src/backend/generation/repositories/implementations/solis.inverter-api.repository.ts`
     — reference implementation of the official-API pattern.
   - `src/backend/generation/repositories/implementations/deye.inverter-api.repository.ts`
     — reference implementation that Epic 2 clones.
   - `src/backend/generation/repositories/implementations/hoymiles.inverter-api.repository.ts`
     — the other unofficial/shadow integration; Solarman must mirror this
     pattern, not invent a new one.
   - `src/backend/generation/use-cases/sync-inverter-generation-data.use-case.ts`
     — the orchestrator that calls every repository.
   - `prisma/schema.prisma` — the `Inverter`, `ProviderPlant`, `GenerationUnit`
     models and the `InverterProvider` enum.

2. **Confirm the exact `InverterApiRepository` shape.** Both new classes must
   implement the same methods (typically `authenticate`, `listPlants`,
   `getPlantById`, `listInverters`, `getInverterRealtime`,
   `getInverterHistory(granularity, date)`). Do not invent new methods — if
   AUXSOL or Solarman exposes data that does not fit the existing contract, open
   a question in Section 5 rather than mutating the interface in this sprint.

3. **Do not modify the `sync-inverter-generation-data.use-case.ts` orchestrator
   logic.** The two new repositories plug into it via the existing
   provider-dispatch switch.

If any of the files above do not exist or have drifted from the assumed names,
stop and report — do not guess.

---

## 1. Shared Contracts

### 1.1 Prisma schema additions

Add two values to the `InverterProvider` enum:

```prisma
enum InverterProvider {
  SOLIS
  SOLPLANET_LEGACY
  SOLPLANET_PRO
  DEYE
  HOYMILES
  AUXSOL       // new
  SOLARMAN     // new
}
```

Create a migration. No other schema changes are required for this sprint —
`Inverter.providerApiKey`, `Inverter.providerApiSecret`, `ProviderPlant`, and
`GenerationUnit` already cover what is needed.

**Verify before writing the migration:** confirm the enum name and the current
set of values by reading `prisma/schema.prisma` first.

### 1.2 Credential storage — no env vars for per-client secrets

Provider credentials live in the database, per `Inverter` record, following the
existing Solis/Solplanet pattern:

- `Inverter.providerApiKey` → AUXSOL `app_id` **or** Solarman account email
- `Inverter.providerApiSecret` → AUXSOL `app_secret` **or** Solarman password
  (plaintext at rest; hashing happens at request time — see §3.3)

The AUXSOL credentials Mateus received from support (`App ID 20879` + secret)
correspond to **one master AUXSOL account** that owns multiple Solo client
plants. Store them once on the parent `Client` record (or on a single seed
`Inverter` representing the master account, depending on how Solis was modeled).
**Open question in §5** — confirm with Mateus whether the project models "one
credential per client plant" or "one shared credential per provider".

Secrets must never be:

- Logged (redact from request/response logs)
- Returned by any API route, even to `master` role
- Committed to the repo as fixtures

### 1.3 HTTP client baseline

Both new repositories use the same HTTP client pattern already established in
the Solis/Deye implementations. In addition, both must:

1. **Respect rate limits.**
   - AUXSOL: 10 requests per 5 seconds per IP
     ([PDF §4.6](./API_-_AUXSOL_1__1__1_.pdf)). Implement a simple in-process
     token bucket or sleep-based limiter keyed per `providerApiKey`. For a
     single master account this is global, not per-inverter.
   - Solarman: no published limit; implement a conservative 5 req/s ceiling and
     bail out on `429`.

2. **Retry with exponential backoff** on 5xx and network errors. 3 attempts,
   base delay 500ms, cap 5s. Do NOT retry on 4xx (those indicate a payload/auth
   bug, not a transient failure).

3. **Return a typed error envelope**, not raw `Error`:
   ```typescript
   type InverterApiError =
       | { kind: "AUTH_FAILED"; message: string }
       | { kind: "RATE_LIMITED"; retryAfterMs: number }
       | { kind: "UPSTREAM_ERROR"; status: number; body: unknown }
       | { kind: "MAPPING_ERROR"; field: string; raw: unknown }
       | { kind: "NETWORK_ERROR"; cause: Error };
   ```
   This should match the pattern Solis already uses. If Solis returns raw
   `Error`, do not "fix" it in this sprint — open a question.

4. **Never leak secrets in error messages or logs.** When logging a failed
   request, redact `app_secret`, `password`, and `Authorization` headers.

### 1.4 Sync-use-case integration

The existing `sync-inverter-generation-data.use-case.ts` dispatches by
`Inverter.provider`. Add two cases for `AUXSOL` and `SOLARMAN` that instantiate
the new repositories. The orchestrator must not change shape.

If the dispatch is currently done via a factory or DI container, register the
new repositories there. Read first, pattern-match second.

---

## 2. Epic 1 — AUXSOL / Nansen (Official)

**File to create:**
`src/backend/generation/repositories/implementations/auxsol.inverter-api.repository.ts`

**Reference pattern:** mirror `solis.inverter-api.repository.ts` at the
class/method level. Do not invent a new structure.

### 2.1 Endpoint reference (from the official AUXSOL PDF)

| Purpose                        | Method | Path                                                         | Notes                                                                                                                        |
| ------------------------------ | ------ | ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| Auth                           | POST   | `/auth/token`                                                | Body: `{ app_id, app_secret, lang: "en-US" }`. Returns `{ access_token, expires_in }` in seconds (observed: 43200 = 12h).    |
| List plants                    | GET    | `/archive/plant/list`                                        | Query: `pageSize`, `pageNum`, optional `status`, `plantName`, etc.                                                           |
| Plant detail                   | GET    | `/archive/plant/findPlantDetail/{plantId}`                   | —                                                                                                                            |
| Inverters of a plant           | GET    | `/archive/inverter/getInverterByPlant/{plantId}`             | Returns `ArchiveInverter[]` with `sn`, `model`, `status`, `ratePower`, `currentPower`, `dayEnergy`, `totalEnergy`, `lastDt`. |
| All inverters                  | GET    | `/archive/inverter/list`                                     | Paginated, across all plants under the account.                                                                              |
| Plant realtime                 | GET    | `/analysis/plantReport/queryPlantCurrentData/{plantId}`      | Returns `PlantCurrentData` with `p` (current kW), `y` (day kWh), `yM`, `yY`, `yT`.                                           |
| Plant curve/history            | GET    | `/analysis/plantReport/queryPlantReportByPlantId`            | Query: `reportType` (0=day, 1=month, 2=year, 3=total), `dataTime`, `plantId`, `dataItems` (bitmask).                         |
| Inverter realtime              | GET    | `/analysis/inverterReport/findInverterRealTimeInfoBySn/{sn}` | Returns `InverterCurrentData` with nested `energyData`, `gridData`, `loadData`, `alarmCurrent`.                              |
| Inverter curve (intraday)      | GET    | `/analysis/inverterReport/queryInverterCurveBySn`            | `reportType=01`, `dataTime=yyyy-MM-dd`, `sn`, `dataItemList`.                                                                |
| Inverter day/month/year energy | GET    | `/analysis/inverterReport/queryInverterCurveBySn`            | `reportType=02/03/04`, `dataTime` format varies per type.                                                                    |
| Alarms                         | GET    | `/analysis/alarm/list`                                       | By plant, inverter, or org.                                                                                                  |

**Base URL.** Not specified in the PDF — request the production base URL from
Mateus (support contact). Pending that, use env var `AUXSOL_BASE_URL`. Default
to staging if Solo has one; otherwise fail loud.

**Auth header on every non-auth request:**
`Authorization: Bearer <access_token>` and
`Content-Type: application/json; charset=UTF-8`.

**Success envelope.** Every response is
`{ code: string, msg: string|null, data: T }`. Success is `code === "AWX-0000"`.
Any other code is an error — map to `AUTH_FAILED` for auth-related codes
(AWX-2000, AWX-2001) and `UPSTREAM_ERROR` otherwise. Full error code table is at
the end of the PDF.

### 2.2 Token cache — deterministic choice

Gemini wrote "in-memory or Redis". For a Next.js App Router deployment,
in-memory is **not** reliable (serverless cold starts wipe memory; multiple
lambda instances each cache their own token and race on refresh). Decide
deterministically:

- **If Redis is already wired** into the app (check `docker-compose.yml` and the
  backend for an existing Redis client) → use it. Key: `auxsol:token:${appId}`.
  TTL: `expires_in - 60` seconds (60s safety buffer).
- **If Redis is NOT wired** → use a `ProviderTokenCache` table in Postgres:
  ```prisma
  model ProviderTokenCache {
    id            String   @id @default(cuid())
    provider      InverterProvider
    credentialKey String   // e.g. the appId or email, to disambiguate multi-account
    accessToken   String
    expiresAt     DateTime
    createdAt     DateTime @default(now())
    @@unique([provider, credentialKey])
  }
  ```
  Read-through cache: on every authenticated call, check the table; if
  `expiresAt` is in the future minus 60s, reuse the token; else call
  `/auth/token` and upsert.

Do **not** introduce Redis to the stack solely for this sprint. Prefer the
Postgres table unless Redis is already there. Confirm with Mateus before
picking.

### 2.3 Field mapping — AUXSOL → Solo domain

The repository's job is to return data in the Solo domain shape
(`ProviderPlant`, `GenerationUnit`, or whatever the existing interface
specifies). The mapping is:

**Plant (AUXSOL `PlantVo` → Solo `ProviderPlant`)**

| Solo field          | AUXSOL source    | Notes                                                                 |
| ------------------- | ---------------- | --------------------------------------------------------------------- |
| `externalId`        | `plantId` (Long) | Cast to string.                                                       |
| `name`              | `plantName`      | —                                                                     |
| `address`           | `address`        | —                                                                     |
| `capacityKwp`       | `capacity`       | BigDecimal → number. Unit: kWp (assumed; confirm on first live call). |
| `status`            | `status`         | `"01"`→`ONLINE`, `"02"`→`OFFLINE`, `"03"`→`ALARM`.                    |
| `createdAtExternal` | `createTime`     | ISO timestamp with `+08:00`; convert to UTC on store (see §2.5).      |

**Inverter realtime (AUXSOL `InverterCurrentData.energyData` → Solo
`GenerationUnit` for `granularity=real_time`)**

| Solo field         | AUXSOL source           | Unit                      |
| ------------------ | ----------------------- | ------------------------- |
| `currentPowerKw`   | `energyData.power`      | kW                        |
| `dailyEnergyKwh`   | `energyData.y`          | kWh                       |
| `monthlyEnergyKwh` | `energyData.ym`         | kWh                       |
| `yearlyEnergyKwh`  | `energyData.yy`         | kWh                       |
| `totalEnergyKwh`   | `energyData.yt`         | kWh                       |
| `co2SavedKg`       | `energyData.co2`        | kg                        |
| `treesEquivalent`  | `energyData.treePlants` | —                         |
| `timestamp`        | `dt`                    | See §2.5 for TZ handling. |

**Inverter history (AUXSOL curve/report endpoints → Solo `GenerationUnit` for
`granularity=day/month/year`)**

For day granularity, call `queryInverterCurveBySn` with `reportType=02`. The
response is an array of `{ dt, value }` pairs where `dt` is the day-of-month
integer as a string and `value` is kWh. Emit one `GenerationUnit` per non-null
pair.

For month granularity, `reportType=03`, `dt` is month-of-year (1–12). For year,
`reportType=04`, `dt` is a year string.

Emit zero-value rows only when upstream returns `0`, not when it returns `null`
— `null` means "no data at that timestamp" and must be skipped, not stored as
zero.

### 2.4 Timezone handling

AUXSOL returns timestamps with a `+08:00` (Beijing) offset in `lastCommTime`,
`createTime`, etc. Solo is in Brazil (`-03:00`). Two rules:

1. **Store UTC in the DB.** Parse the AUXSOL timestamp as UTC-aware and write
   `Date` objects; Prisma will persist UTC.
2. **For "day" granularity, the date key (`dt` in Solo's `GenerationUnit`) is
   the local date at the plant.** If the plant's timezone is stored (AUXSOL
   `plantBasicFormItems.timeZone`), use it. Otherwise default to the Solo
   operational timezone (`America/Fortaleza`, UTC-3) and open a question in §5
   for multi-region clients.

### 2.5 Task 1.1 — DoD (Definition of Done)

- [ ] `auxsol.inverter-api.repository.ts` exists and implements every method of
      `InverterApiRepository`.
- [ ] `authenticate()` calls `POST /auth/token`, maps the response, and caches
      the token via the chosen strategy (§2.2).
- [ ] Wrong credentials → throws/returns `AUTH_FAILED` with the AUXSOL error
      code in the message.
- [ ] Unit test: mocked HTTP stub, verifies one token call per N data calls (no
      re-auth per request).
- [ ] No secret appears in any log statement.

### 2.6 Task 1.2 — DoD

- [ ] Token cache layer exists (Postgres table migration applied, or Redis key
      pattern documented).
- [ ] Integration test: two consecutive `listPlants()` calls produce exactly one
      `/auth/token` HTTP call.
- [ ] Expired-token simulation (advance cached `expiresAt` into the past): next
      call triggers re-auth, not a 401.
- [ ] `.env.example` updated with `AUXSOL_BASE_URL`.

### 2.7 Task 1.3 — DoD

- [ ] `listPlants()`, `getInverterRealtime(sn)`,
      `getInverterHistory(sn, 'day'|'month'|'year', date)` all return
      Solo-domain objects matching the §2.3 mapping table.
- [ ] Smoke test: running the `sync-inverter-generation-data.use-case.ts`
      against the Solo master AUXSOL account populates `ProviderPlant` and
      `GenerationUnit` rows for at least one real plant. Screenshot attached to
      the PR.
- [ ] Null-handling: an upstream `null` for `power` or `y` does NOT create a
      `GenerationUnit` row with `0`; it is skipped.
- [ ] Rate-limit proof: running `listPlants()` 20 times in a loop does not
      trigger an AUXSOL rate-limit error.

---

## 3. Epic 2 — Solarman (Shadow Route)

**File to create:**
`src/backend/generation/repositories/implementations/solarman.inverter-api.repository.ts`

**Reference pattern:** mirror `hoymiles.inverter-api.repository.ts` (the
existing shadow integration), NOT blindly `deye.inverter-api.repository.ts`.
Read the Hoymiles file first to understand how unofficial integrations are
structured in this codebase.

### 3.1 Reality check on "clone Deye"

Gemini's framing (Deye is a Solarman white-label, so clone the Deye class and
swap URLs) is directionally correct but oversimplified. Actual situation:

- Deye Cloud and Solarman PV share backend infrastructure, but they expose
  different **public** API surfaces. If the Deye repository in Solo App talks to
  `developer.deyecloud.com` (the official Deye developer API), that is NOT the
  same protocol as the Solarman shadow endpoint.
- The reference Gemini pointed at (`hareeshmu/solarman`) uses the **unofficial**
  Solarman business API with token-based auth, not the Deye developer API. So:
  - If `deye.inverter-api.repository.ts` uses the official Deye API → the
    "clone" shortcut does not work; Solarman needs to be built closer to
    Hoymiles' pattern (raw HTTP, SHA-256 password, no API key).
  - If `deye.inverter-api.repository.ts` already uses the
    Solarman/hareeshmu-style protocol → the clone shortcut works, just swap base
    URL and re-test.

**First action in this epic:** read `deye.inverter-api.repository.ts` and
determine which case applies. Report back before writing Solarman code. Do not
assume.

### 3.2 Solarman endpoint reference (unofficial / hareeshmu pattern)

| Purpose          | Method | Path                                            | Notes                                                                                                         |
| ---------------- | ------ | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Base URL         | —      | `https://api.solarmanpv.com`                    | (EU region: `https://globalapi.solarmanpv.com`. Confirm with Mateus which region Solo's master account uses.) |
| Auth             | POST   | `/account/v1.0/token?appId={appId}&language=en` | Body: `{ email, password: <SHA-256 hex>, appSecret }`. Returns `{ access_token, expires_in }`.                |
| Station list     | POST   | `/station/v1.0/list`                            | Paginated.                                                                                                    |
| Station realtime | POST   | `/station/v1.0/realTime?language=en`            | Body: `{ stationId }`.                                                                                        |
| Station history  | POST   | `/station/v1.0/history`                         | Body: `{ stationId, startTime, endTime, timeType }`.                                                          |
| Device list      | POST   | `/station/v1.0/device`                          | —                                                                                                             |
| Device realtime  | POST   | `/device/v1.0/currentData`                      | Body: `{ deviceSn }`.                                                                                         |
| Device history   | POST   | `/device/v1.0/historical`                       | Body: `{ deviceSn, startTime, endTime, timeType }`.                                                           |

Endpoints above are the ones documented in `hareeshmu/solarman` and in the
official Solarman Business API docs. **Verify against a live call before
hardcoding** — the unofficial community repos drift.

### 3.3 Solarman auth — SHA-256 specifics

The password in the auth request is SHA-256 of the plaintext password,
**hex-encoded lowercase**. In Node.js:

```typescript
import { createHash } from "node:crypto";
const passwordHash = createHash("sha256").update(plaintext, "utf8").digest(
    "hex",
);
```

Two Solarman particularities that the engineer must not miss:

1. **`appId` and `appSecret` are BOTH required** (not just email + password).
   The Solo master account in Solarman needs a Business API app registered in
   the Solarman developer portal to obtain these. If Solo does not yet have
   them, that's a blocker before Task 2.2 — raise in §5.
2. **`email` is sent as `email`, not `username`** in the JSON body. The
   hareeshmu repo occasionally shows `username` in older commits; the current
   Solarman business API uses `email`.

### 3.4 Field mapping — Solarman → Solo domain

Solarman station/device responses use different field names than AUXSOL. The
mapping that matters:

| Solo field         | Solarman source                                              | Notes                                                      |
| ------------------ | ------------------------------------------------------------ | ---------------------------------------------------------- |
| `currentPowerKw`   | `generationPower` (W)                                        | **Divide by 1000.** Solarman reports W, Solo stores kW.    |
| `dailyEnergyKwh`   | `generationValue` (station realtime) **or** `daily` (device) | Unit is kWh, but verify on live data.                      |
| `monthlyEnergyKwh` | derived by summing daily history (month window)              | Solarman does not always expose a dedicated monthly field. |
| `yearlyEnergyKwh`  | derived from yearly history aggregate                        | Same.                                                      |
| `totalEnergyKwh`   | `lastUpdateTime`-accompanying `totalGeneration`              | —                                                          |
| `timestamp`        | `lastUpdateTime` (epoch seconds)                             | Multiply by 1000 for `Date`.                               |

Do **not** assume field names match Deye exactly. Even if the integrations talk
to the same backend, the DTO shapes Deye Cloud returns are reshaped/renamed vs.
Solarman. Expect a small adapter class inside the repository.

### 3.5 Task 2.1 — DoD

- [ ] `solarman.inverter-api.repository.ts` exists and implements every method
      of `InverterApiRepository`.
- [ ] Class structure mirrors Hoymiles (shadow-integration pattern), not Deye,
      UNLESS the Deye repo is confirmed to already use the Solarman business API
      pattern (see §3.1).

### 3.6 Task 2.2 — DoD

- [ ] Auth flow: `email + SHA-256(password) + appId + appSecret` → access token
      cached per §2.2 strategy (reuse the same `ProviderTokenCache` table,
      different `provider` enum value).
- [ ] `.env.example` updated with `SOLARMAN_BASE_URL`, `SOLARMAN_APP_ID`,
      `SOLARMAN_APP_SECRET` (the app-level credentials; account-level
      email/password stay in the DB).
- [ ] Unit test: given a known plaintext password, the outgoing request body
      contains the exact expected SHA-256 hex string.

### 3.7 Task 2.3 — DoD

- [ ] At least one real Solarman plant syncs end-to-end: `listPlants()` →
      `getInverterRealtime(sn)` → `GenerationUnit` rows persisted. Screenshot
      attached to the PR.
- [ ] Power values are stored in kW (not W) — a test asserts
      `currentPowerKw < 1000` for a residential-scale plant.
- [ ] Where Solarman does not expose a direct monthly/yearly field, the
      repository derives it from daily history and the derivation logic has a
      unit test.

---

## 4. Integration Test Plan

One smoke plant per provider, wired into a dev-only route:

- `POST /api/generation/sync?provider=AUXSOL&plantId=<id>` — runs the full sync
  against the AUXSOL master account for one plant.
- `POST /api/generation/sync?provider=SOLARMAN&plantId=<id>` — same for
  Solarman.

Both routes are `master`-role only and must be disabled (or gated by
`NODE_ENV !== 'production'`) before merge if they're truly dev-only. If the
existing `/api/generation/sync` endpoint already handles per-provider dispatch,
extend it rather than adding new routes.

**Idempotency test.** Run the sync twice in a row for the same plant/day.
Assert: `GenerationUnit` row count does not double. If it does, the upsert logic
is wrong — the unique constraint should be
`(inverterId, granularity, timestamp)` (or whatever the existing schema uses;
read first).

**Failure-mode tests.**

- Wrong `app_secret` → `AUTH_FAILED`, not a 500.
- Upstream 500 → retried 3x, then `UPSTREAM_ERROR`.
- Rate-limit breach (simulated) → `RATE_LIMITED` with `retryAfterMs`.

---

## 5. Open Questions (block merge until resolved)

1. **Credential scoping.** Is the AUXSOL App ID `20879` the master account that
   owns ALL Solo client plants, or does each client get their own AUXSOL
   credential? This determines whether credentials sit on `Client` or
   `Inverter`. (Default assumption in this spec: one master credential stored
   once, associated with Solo's tenant.)
2. **Redis availability.** Is Redis actually wired into the Next.js app, or only
   present in `docker-compose.yml` for future use? Drives §2.2 choice.
3. **Solarman Business API app credentials.** Does Solo have an `appId` +
   `appSecret` registered in the Solarman developer portal? If not, §3.3 is
   blocked.
4. **Solarman region.** `api.solarmanpv.com` (CN) vs `globalapi.solarmanpv.com`
   (EU/global). Which region hosts Solo's master account?
5. **AUXSOL base URL.** Not in the PDF — requires confirmation from AUXSOL
   support.
6. **`InverterApiRepository` shape drift.** If the existing interface doesn't
   include a `getAlarms()` method, the AUXSOL alarm endpoint (§2.1) is out of
   scope for this sprint — confirm Gemini is OK deferring alarms.
7. **Deye repository protocol.** Official Deye developer API or Solarman-style
   unofficial? Drives §3.1 decision.
8. **Plant registration UX.** How does a support agent register a new AUXSOL or
   Solarman plant against a Solo client — is the existing
   `/api/admin/clients/[id]/inverters` endpoint extended with the new enum
   values, or does this sprint ship without a UI path (sync-only)?

---

## 6. Out of Scope (explicitly)

- Automated cron scheduling. This sprint makes the sync possible on-demand; the
  cron/scheduler is a separate sprint.
- The `@master` monitoring panel UI. Data lands in the DB this sprint;
  visualization is a follow-up.
- Alarm ingestion and notifications.
- Migration of existing legacy Solarman plants from the old monitoring system
  into Solo's DB.
- Push notifications on inverter failure.

---

**End of spec.** If anything here contradicts the PM brief in Part 1, flag it to
Mateus — don't silently reconcile.
