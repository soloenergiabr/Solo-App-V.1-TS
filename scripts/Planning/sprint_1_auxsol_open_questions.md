# Sprint 1 — AUXSOL (Epic 1) open questions & deviations

Status after first pass: `auxsol.inverter-api.repository.ts` implemented and
wired into `InverterApiFactory`. Type-check passes. Remaining items below block
production rollout and need Mateus' sign-off before we close the epic.

## 1. Base URL ~~(BLOCKER)~~ ✅ RESOLVED

**Confirmed production URL:** `https://eu.auxsolcloud.com/auxsol-api` (EU
region).

- `DEFAULT_AUXSOL_URL` updated in `auxsol.inverter-api.repository.ts`.
- `AUXSOL_BASE_URL` added to `.env` and `env.example`.
- Still overridable via `Inverter.providerUrl` (per-inverter) or
  `process.env.AUXSOL_BASE_URL`.

## 2. Credential scoping (App ID 20879 + secret)

Spec §1.2 flagged this: is `App ID 20879` the master account for ALL Solo client
plants, or does each client get their own AUXSOL creds?

Current implementation:

- Reads `providerApiKey` (app_id) and `providerApiSecret` (app_secret) from the
  `Inverter` row, falling back to `AUXSOL_APP_ID` / `AUXSOL_APP_SECRET` env
  vars.
- Token cache is keyed by `app_id`, so one master account → one cached token
  shared across all Solo inverters. Per-client creds would each get their own
  cache entry automatically.

**Action:** confirm scoping model. If master-only, we can persist the creds once
(as a seed inverter or on a tenant record) and reuse.

## 3. Token cache backing store

Spec §2.2 recommended either Redis (if wired) or a new `ProviderTokenCache`
Postgres table. Findings:

- Redis container exists in `docker-compose.yml` but no Redis client is wired
  into the app code (grep found only a README mention). Adding one would pull in
  `ioredis` as a new runtime dep.
- No `ProviderTokenCache` table exists in `prisma/schema.prisma`.

**Chosen for now:** in-process `Map` with TTL, matching the existing
`HoymilesInverterApiRepository` pattern. This works in a single long-running
Docker container but will NOT share tokens across:

- Multiple Next.js server instances (if we ever scale horizontally).
- Serverless / Vercel Edge deployments.
- Separate cron worker processes.

**Action (follow-up, not this PR):** if horizontal scaling is on the roadmap,
add the Postgres `ProviderTokenCache` model. Shape proposed by the spec:

```prisma
model ProviderTokenCache {
  id            String   @id @default(cuid())
  provider      String
  credentialKey String
  accessToken   String
  expiresAt     DateTime
  createdAt     DateTime @default(now())
  @@unique([provider, credentialKey])
}
```

## 4. Rate limiter (10 req / 5s per IP) — deferred

Spec §1.3 required a token-bucket limiter. Not implemented in this first pass —
the repository only does exponential-backoff retry (3 attempts, 500ms base, 5s
cap) on 5xx and network errors, with no retry on 4xx.

**Why deferred:** existing Solis/Hoymiles repos also have no limiter, so
matching the in-repo pattern is cheaper than inventing one. For initial sync
loads (one plant, a handful of inverters) we stay well under 10 req/5s.

**Action:** revisit once we have >2 inverters under the master account, or
sooner if AUXSOL returns `429` / rate-limit errors in testing.

## 5. `InverterApiRepository` interface shape mismatch

Spec §0/§1 assumed the interface exposes `authenticate`, `getPlantById`,
`getInverterRealtime(sn)`, `getInverterHistory(granularity, date)`. Actual
interface (`src/backend/generation/repositories/inverter-api.repository.ts`):

```ts
abstract getRealTimeGeneration(): Promise<{ power: number, energy: number }>
abstract getGenerationByDay(): Promise<number>
abstract getGenerationByMonth(): Promise<number>
abstract getGenerationByYear(): Promise<number>
abstract getGenerationByInterval(): Promise<number>
abstract listPlants(): Promise<ProviderPlant[]>
```

AUXSOL-specific endpoints that don't map to the existing interface (alarm list,
inverter history curves, plant detail) are **not** exposed as public methods on
the repo this sprint. Per the spec, we don't mutate the interface.

**Action:** if Gemini wants alarms or curves surfaced, that's a separate sprint
that extends `InverterApiRepository` for every provider.

## 6. Prisma `InverterProvider` enum (spec §1.1) — skipped

Spec §1.1 asked for enum values `AUXSOL` / `SOLARMAN`. The actual schema uses a
free `String` for `Inverter.provider` (Solis/Deye/Hoymiles all already live
there as lowercase strings). Adding `'auxsol'` as a string keeps the existing
pattern; no schema migration was needed. If the team does want a real enum
later, it's a global refactor across all providers.

## 7. Timezone handling — not yet exercised

Spec §2.4 required storing UTC in DB and using plant-local timezone for "day"
granularity bucket keys. The current `getGenerationByDay/Month/Year` methods
read scalar kWh values from `/findInverterRealTimeInfoBySn` and don't emit dated
`GenerationUnit` rows directly — the existing
`sync-inverter-generation-data.use-case.ts` stamps `now()`. So timezone
correctness is a concern of the orchestrator, not the repo, for now.

**Action:** if we start calling AUXSOL curve endpoints (history per day), we
will need to propagate plant `timeZone` through the repo. Out of scope this
pass.

## 8. ~~No integration test run yet~~ ✅ DONE (2026-04-23)

Integration test ran successfully via `npx tsx scripts/test-auxsol.ts`.

**Results:**

- Auth: ✅ token obtained (App ID 20879)
- `listPlants()`: ✅ returned 3 plants:
  1. **Cleber** (id 52546) — 4 kWp, 1246.79 kWh total, ACTIVE, Fortaleza
  2. **Clairton** (id 50758) — 3 kWp, 672.65 kWh total, INACTIVE, Fortaleza
  3. **solar lismar** (id 11707) — 7 kWp, 9635.35 kWh total, ACTIVE, Fortaleza

**Next step:** to test per-inverter real-time data (`getRealTimeGeneration`),
seed an `Inverter` row with `provider='auxsol'` and `providerId=<inverter SN>`
from one of the plants above, then run the sync use case.
