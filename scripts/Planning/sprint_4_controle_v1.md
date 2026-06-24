# Sprint 4 — Controle v1: Manual Onboarding & Cockpit

> **PM owner:** Claude (Opus) — author of this plan; light-touch merger as tasks land + runner of the single end-of-sprint review (Phase E). No per-task/per-wave approval stops.
> **Source vision:** `scripts/Planning/pré_sprint_4_controle_v1.md` (Brainstorm Sessions 1 & 2).
> **Workflow:** `scripts/Planning/agent_workflow.md` (multi-agent swarm). Branch isolation, file ownership, tier routing, and the structured HANDOFF block all apply.
> **Engineers:** junior model (**deepseek-flash**). It is weak at front-end — every FE task brief is therefore prescriptive (exact files, exact components to compose, exact field list, exact Portuguese copy, exact states). Engineers must NOT invent new components, tokens, or layouts.
> **Out of scope** for this sprint is parked in `scripts/Planning/todo.md` — do not build anything listed there.

---

## 0. Context — Why This Sprint Exists

Solo Energia needs to **migrate real clients into the app now**, before the supplier inverter APIs (Hoymiles/AUXSOL/Deye/Solis) and the distributor (Enel) billing pulls are fully automated. The blocker: today the app assumes data arrives via inverter **sync** and bill **import/OCR**. We need a clean **manual data-entry path** so the Solo team — and clients themselves — can type in generation and billing data, populate the database, and immediately see correct numbers in the **Controle cockpit**.

The primary outcome of Sprint 4: **a real client can be fully onboarded by hand (plant → generation → consumer units → bills) and the Controle cockpit shows correct payback, monthly savings, lifetime totals, and per-account status — with zero dependency on supplier/Enel automation.**

### What already exists (do NOT rebuild)

- **Controle cockpit** (`src/app/(private)/@user/controle/page.tsx`, `src/frontend/controle/**`, `telemetry-kit`): PaybackGauge, MetricTiles, LifetimeStrip, per-account StatusRing.
- **Cockpit data API** (`src/app/api/controle/overview/route.ts`): computes the whole cockpit **from `EnergyBill` rows** (`monitoredGenerationKwh`, `estimatedSavings`, `consumptionKwh`, `paymentStatus`). It does **not** read `GenerationUnit`, and `liveGenerationKw` is hardcoded `0`.
- **Manual bill entry (admin, backend)**: `src/app/api/admin/clients/[id]/energy-bills/route.ts` already upserts a full bill from typed JSON (all fields optional except plant/UC/competence).
- **Consumption import** + **bill import** admin routes.
- **Propose → Solo validates gate** (Sprint 3.1): `Plant` and `ConsumerUnit` carry `validationStatus @default("pending_review")`; client POST routes already set it. `EnergyBill.status` supports `'draft' | 'pending_review' | 'confirmed' | 'paid' | 'rejected'`.

### The real gaps this sprint fills

1. **No manual generation entry.** `GenerationUnit` requires an `inverterId`; everything assumes inverter-API sync. There is no route/UI to type in monthly kWh.
2. **No client-facing entry forms.** Clients can create plants/UCs but cannot enter their own generation or bills.
3. **Cockpit counts un-validated bills as active.** `overview/route.ts` aggregates **all** bills regardless of `status`, so a `pending_review` bill inflates savings/generation. It also never surfaces "X items waiting for Solo validation".
4. **Manual bills can land with `estimatedSavings = 0`**, so the cockpit shows zero savings even though data was entered.
5. **No onboarding visibility** — Solo/clients can't see how complete a migration is.

### Hard environment constraint (unchanged from Sprint 3.1)

There is **no local Docker / Postgres**. Production Postgres lives on the VPS. **Never run `prisma migrate dev`** — it needs a DB and will fail. If a migration is required, hand-author the `migration.sql` (schema-to-schema `prisma migrate diff`, no DB) and let production apply it with `npx prisma migrate deploy`. **This sprint is designed to need ZERO schema migrations** (see §3) — flag the PM immediately if you believe you need one.

---

## 1. Execution Rules (same as Sprint 3 / 3.1)

1. **Read the file before editing it.** Read every file in your ownership list and its imports first.
2. **One isolated branch per task:** `junior/sprint4/<task-id>/<short-desc>` (e.g. `junior/sprint4/A1/manual-generation-backend`). Never edit `main`.
3. **Only edit the files your task owns** (ownership table per task). If another file looks wrong, **flag the PM** — do not refactor out of scope.
4. **Preserve existing behavior** unless the task explicitly changes it.
5. **TDD for all backend math / status logic / data writes**: write the failing test first, watch it fail, implement, watch it pass.
6. **Verify before handoff** (all must pass on your branch):
   ```bash
   npm.cmd run build
   npx.cmd vitest run <focused path for your task>
   npx.cmd prisma generate    # OK — no DB needed. NEVER run prisma migrate dev.
   ```
7. **Run autonomously — no per-task or per-wave approval stop.** Agents pick up their task and build it straight through. The only pre-coding flag-and-wait is for a **critical** trigger (marked 🔴 in the task table): (a) you believe a **schema migration** is unavoidable, or (b) you must change the **cockpit financial aggregation** (A2) or the **client scope/security boundary** (C1/C2) in a way the brief doesn't already specify. Everything else: just build it.
8. Post the structured **HANDOFF block** from `agent_workflow.md` §6 and add **one billing row** to `scripts/Planning/billing.md`. Handoffs are collected; the deep review happens once, at the end (Phase E) — not as a stop between waves.

---

## 2. Scope

### ✅ In scope (this sprint)

- Manual **generation** entry (admin + client) → monthly kWh per plant.
- Manual **bill** entry made client-facing + savings always computed (admin path already exists).
- **Controle cockpit correctness**: exclude un-validated bills from active aggregates; surface a pending-validation count; onboarding checklist.
- **Admin approval** action to validate client-proposed generation and bills.

### ❌ Out of scope (parked in `scripts/Planning/todo.md` — do NOT build)

Navigation rebrand to 5 sections (Controle/Energia/Consumo/Clube/Suporte); Carteira-de-Energia portfolio redesign; economy timeline; activity feed; "Modo Apresentação" / share screen; gamification (Solo Coins tiers, achievements, weekly recap); admin "Operations Center" redesign; distributor (Enel/Cemig/…) API integration; rateio automation bot; PWA/offline/service-worker; feature-flag system; real-time live-generation websocket.

---

## 3. Architecture & Data-Model Decisions (locked — read before coding)

### 3.1 Manual generation → reuse `GenerationUnit` (ZERO migration)

`GenerationUnitType` already has a `month` value and `GenerationUnit` already has a nullable `source` field. Manual monthly generation is stored as:

```ts
// One row per plant per competence month
{
  inverterId,                              // a per-plant placeholder inverter (see 3.2)
  energy: <kWh entered>,                   // Float — the monthly generation
  power: 0,                                // Float — N/A for a monthly manual total
  generationUnitType: 'month',             // existing enum value — cockpit/dashboard already aggregate 'month'
  source: 'manual' | 'manual_pending',     // 'manual' = active; 'manual_pending' = client proposal awaiting Solo validation
  providerRecordId: `manual-${year}-${String(month).padStart(2,'0')}`, // e.g. 'manual-2026-05'
  timestamp: new Date(Date.UTC(year, month - 1, 1)), // first day of the competence month
}
```

- The unique constraint is `@@unique([inverterId, generationUnitType, providerRecordId])`. `providerRecordId = manual-YYYY-MM` makes one manual row per inverter per month → use **upsert** so re-entering a month overwrites.
- **Gate semantics without a migration:** admin entries write `source: 'manual'` (active immediately). Client proposals write `source: 'manual_pending'`. Aggregations that should reflect "active" data must **exclude `source: 'manual_pending'`**. Admin approval flips `manual_pending → manual`.

### 3.2 Placeholder inverter per plant (ZERO migration)

`Inverter` requires only `provider` (String), `providerId` (String), `clientId`. Create/reuse one placeholder per plant:

```ts
// find-or-create
const PROVIDER = 'manual';
let inverter = await prisma.inverter.findFirst({
  where: { plantId, provider: PROVIDER, deletedAt: null },
});
if (!inverter) {
  inverter = await prisma.inverter.create({
    data: {
      provider: PROVIDER,
      providerId: `manual-${plantId}`,
      name: 'Entrada Manual',
      clientId,
      plantId,
      syncEnabled: false,            // never auto-synced
      providerStatus: 'manual',
    },
  });
}
```

This placeholder must be **excluded from sync** (`syncEnabled: false`) and should be **filtered out of inverter-status UI** wherever inverters are listed for the client (flag any place that would show it as a real device — task A1 documents the filter helper, FE tasks reuse it).

### 3.3 Cockpit drives off bills — fix the `status` filter

`overview/route.ts` already computes savings/generation/lifetime from `EnergyBill`. Two corrections (task A2):
- **Active aggregates exclude un-validated bills.** A bill counts as active when `status ∈ {confirmed, paid}` **or** `status` is `null` (legacy rows have no status — keep them counted so existing data isn't hidden). Exclude `status ∈ {pending_review, draft, rejected}`.
- **Add `pendingValidationCount`** (bills with `status = 'pending_review'` + generation rows with `source = 'manual_pending'`) to the `ControleOverview` payload so the cockpit can show "Aguardando validação da Solo".

### 3.4 Manual bills must carry savings (task A3)

When a bill is entered manually and `estimatedSavings` is absent, compute a deterministic fallback so the cockpit isn't zero:
```
estimatedSavings = wouldPayWithoutSolar - actuallyPaid
                 = (consumptionKwh * tariffPerKwh) - totalBillValue
```
Only when both `consumptionKwh` and `tariffPerKwh` are present and `estimatedSavings` was not explicitly provided; clamp to `>= 0`. Do **not** call the AI analyzer here (cost + latency) — this is a deterministic helper. Full AI analysis stays on the existing economia path.

---

## 4. Task Table

| ID  | Tier | Critical? | Title | Wave |
| --- | ---- | --------- | ----- | ---- |
| A1  | M    | —        | Manual-generation backend: placeholder-inverter helper + admin generation route | A |
| A2  | M    | 🔴 financial-truth | Cockpit correctness: status filter + `pendingValidationCount` | A |
| A3  | M    | —        | Deterministic savings fallback for manually-entered bills | A |
| B1  | L    | —        | Admin manual-generation form (client detail tab) | B |
| B2  | L    | —        | Admin manual-bill entry form (client detail tab) | B |
| C1  | L    | 🔴 scope boundary | Client self-service bill entry (gated `pending_review`) | C |
| C2  | L    | 🔴 scope boundary | Client self-service generation entry (gated `manual_pending`) | C |
| D1  | M    | —        | Admin approval action (validate generation + bills) | D |
| D2  | L    | —        | Cockpit onboarding checklist + pending-validation banner | D |

> **Cost rule:** all tasks route to the junior model and run **autonomously** — no approval stop between tasks or waves.
> **🔴 Critical** marks the three places where a mistake is expensive: A2 changes the numbers clients trust, and C1/C2 are the client→server boundary that must enforce `clientId` scope. Those are guarded by the **required tests in their briefs** (not by a manual pre-approval) and by the end-of-sprint Phase E review. Everything else is build-straight-through.

---

## 5. Wave Map

```
Wave A  (backend, parallel — disjoint files)      A1 · A2 · A3
   │
Wave B  (admin FE — needs A1, A3)                 B1 · B2
   │
Wave C  (client FE — needs A1, A2, A3)            C1 · C2
   │
Wave D  (approval + cockpit polish — needs A,B,C) D1 · D2
   │
Phase E (end-of-sprint, frontier model)           E1 backend review · E2 frontend refinement
```

Waves are **execution order only**, not approval stops — a wave opens as soon as its dependencies are merged; agents run straight through. File ownership is **disjoint within every wave** (no two tasks in a wave touch the same file), so a wave's tasks run in parallel. The single deep quality pass is **Phase E**, after all feature work lands.

---

## 6. Task Briefs

### A1 — Manual-generation backend · Tier M · no approval

**Goal:** a backend route the Solo team (and later the client form) can call to record monthly generation by hand, stored per §3.1/§3.2.

**Owns (create unless noted):**
- `src/backend/generation/manual-generation.service.ts` (new) — the find-or-create placeholder-inverter helper + upsert of the monthly `GenerationUnit`, plus an exported `MANUAL_INVERTER_PROVIDER = 'manual'` constant and an `isManualInverter(inverter)` guard.
- `src/app/api/admin/clients/[id]/generation/route.ts` (new) — `GET` (list manual generation rows for the client, newest month first) + `POST` (create/overwrite one month). Admin-auth via `AuthMiddleware`.
- `src/backend/generation/__tests__/manual-generation.service.test.ts` (new).

**POST body (zod):**
```ts
const manualGenerationSchema = z.object({
  plantId: z.string().min(1),
  referenceMonth: z.coerce.number().int().min(1).max(12),
  referenceYear: z.coerce.number().int().min(2000).max(2100),
  energyKwh: z.coerce.number().min(0),
  source: z.enum(['manual', 'manual_pending']).default('manual'), // admin route forces 'manual'
});
```

**Logic (steps):**
- [ ] Write failing test: calling the service twice for the same `(plantId, 2026, 5)` creates exactly **one** placeholder inverter and **one** `GenerationUnit` (upsert overwrites `energy`), with `generationUnitType='month'`, `source='manual'`, `providerRecordId='manual-2026-05'`, `timestamp = 2026-05-01T00:00:00Z`.
- [ ] Run it → fails (service not implemented).
- [ ] Implement the find-or-create helper (§3.2) + upsert (§3.1) in the service.
- [ ] Add a second test: `source='manual_pending'` is persisted as given (used by the client form in C2).
- [ ] Run tests → pass.
- [ ] Wire the admin route to the service (route forces `source='manual'`, ignores any client-supplied source). Validate `plant` belongs to `clientId` (mirror `assertBillRelations` in the energy-bills route).
- [ ] `npm.cmd run build` clean. Commit.

**Done when:** service + admin route exist; idempotent upsert proven by test; placeholder inverter is `syncEnabled:false`; build clean. **No schema migration.**

---

### A2 — Cockpit correctness: status filter + pending count · Tier M · no approval

**Goal:** the cockpit reflects only validated data and reports how much is awaiting validation (§3.3).

**Owns:**
- `src/app/api/controle/overview/route.ts` (modify).
- `src/shared/controle/types.ts` (modify — extend `ControleOverview`).
- `src/app/api/controle/__tests__/overview-status-filter.test.ts` (new).

**Interfaces produced (D2 consumes these):**
```ts
// added to ControleOverview
pendingValidationCount: number   // bills status='pending_review' + generation source='manual_pending'
```

**Logic (steps):**
- [ ] Write failing test: given 3 bills for the current month — one `confirmed`, one `pending_review`, one `status=null` — `month.moneySaved` and `month.energyGeneratedKwh` include the `confirmed` and `null` bills but **exclude** the `pending_review` one; and `pendingValidationCount` is `1`.
- [ ] Run it → fails.
- [ ] In `overview/route.ts`, define `const isActiveBill = (b) => b.status == null || b.status === 'confirmed' || b.status === 'paid'`. Apply it everywhere `allBills` is reduced for **active** aggregates (month, lifetime, returned-from-bills, per-account status). Keep the raw `allBills` fetch as-is.
- [ ] Compute `pendingValidationCount`: count `allBills` with `status==='pending_review'`, plus a `prisma.generationUnit.count` where the inverter belongs to the client and `source==='manual_pending'`. Add it to the `data` payload.
- [ ] Add the field to `ControleOverview` in `src/shared/controle/types.ts`.
- [ ] Run tests → pass. `npm.cmd run build` clean. Commit.

**Done when:** un-validated bills no longer inflate the cockpit; `pendingValidationCount` exposed; tests pass; build clean.

---

### A3 — Deterministic savings fallback for manual bills · Tier M · no approval

**Goal:** a manually-entered bill never lands with `estimatedSavings = 0` when the inputs to compute it are present (§3.4).

**Owns:**
- `src/backend/economia/manual-bill-savings.ts` (new) — pure function `computeFallbackSavings(input): number`.
- `src/app/api/admin/clients/[id]/energy-bills/route.ts` (modify — call the helper in `createEnergyBill` only when `estimatedSavings` is null/undefined).
- `src/backend/economia/__tests__/manual-bill-savings.test.ts` (new).

**Function signature (produced; B1/B2/C1 rely on the server applying it — they do NOT call it directly):**
```ts
export function computeFallbackSavings(input: {
  estimatedSavings?: number | null;
  consumptionKwh?: number | null;
  tariffPerKwh?: number | null;
  totalBillValue?: number | null;
}): number | null;
// returns input.estimatedSavings when provided;
// else if consumptionKwh & tariffPerKwh present: max(0, consumptionKwh*tariffPerKwh - (totalBillValue ?? 0));
// else null (leave unset).
```

**Logic (steps):**
- [ ] Write failing tests: (a) explicit `estimatedSavings` passed through unchanged; (b) `consumptionKwh=500, tariffPerKwh=0.9, totalBillValue=180` → `270`; (c) negative result clamps to `0`; (d) missing tariff → `null`.
- [ ] Run → fail. Implement the pure function. Run → pass.
- [ ] In `createEnergyBill`, before the upsert, set `data.estimatedSavings = computeFallbackSavings(data)`.
- [ ] Run the existing energy-bills route tests + new tests. Build clean. Commit.

**Done when:** manual bills get non-zero savings when computable; explicit values respected; tests pass; build clean.

---

### FE GUARDRAILS (apply to B1, B2, C1, C2, D2 — read before any FE task)

deepseek-flash is weak at front-end. Every FE task MUST:
1. **Compose existing primitives only** — from `src/components/ui/*` (`Dialog`, `Sheet`, `Input`, `Label`, `Button`, `Select`, `Card`, `Alert`, `Badge`, `Skeleton`) and `src/frontend/telemetry-kit`. **Do NOT create new UI components, CSS, design tokens, or colors.** Reuse `formatBRL`/`formatKwh`/`formatKw` from telemetry-kit for any number display.
2. **Follow an existing pattern file** named in the brief (e.g. `add-consumption-dialog.tsx`, `register-inverter-dialog.tsx`, the plant wizard). Read it first; mirror its structure, hook usage, and toast/error handling.
3. **Implement all four states**: loading (`Skeleton`), empty, error (`Alert variant="destructive"` with the server message), success (toast via `sonner`).
4. **Use the exact Portuguese copy** given in the brief — labels, placeholders, button text, toasts. Accents included.
5. **Mutations:** use the project's existing data hook/query-client pattern (look at `src/frontend/admin/hooks/use-admin-energy-management.ts`); on success invalidate the relevant query and show the success toast. No raw inline `fetch` without error handling.
6. **No business math in the component** — the server computes savings (A3) and validation state. The form only collects and POSTs fields.
7. **No approval stop — build it straight through.** When you hand off, include one screenshot in the HANDOFF block so Phase E (frontend refinement) has a visual starting point. The frontier-model refinement pass at the end is where polish happens — your job is correct structure, correct fields, correct copy, and all four states.

---

### B1 — Admin manual-generation form · Tier L · autonomous

**Goal:** Solo team types a month's generation for a plant from the client detail screen; calls A1's route.

**Owns (create):** `src/frontend/admin/components/add-generation-dialog.tsx`; **(modify)** `src/frontend/admin/components/client-details.tsx` to mount a "Geração (manual)" tab/section with an "Adicionar geração" button and a table of existing manual rows.

**Pattern to mirror:** `src/frontend/admin/components/add-consumption-dialog.tsx` (same shape: a `Dialog` form that POSTs and refreshes a list).

**Fields (all required unless noted):** Usina (`Select` of the client's plants), Mês de referência (`Select` 1–12, pt-BR month names), Ano (`Input` number, default current year), Geração (kWh) (`Input` number, min 0). POST to `POST /api/admin/clients/[id]/generation` (A1).

**Copy:** dialog title `Adicionar geração manual`; button `Adicionar geração`; success toast `Geração registrada com sucesso`; the list column headers `Mês`, `Ano`, `Geração (kWh)`. Empty state: `Nenhuma geração manual registrada para este cliente.`

**Done when:** admin can add/overwrite a month and see it in the list; states handled; build clean (polish deferred to Phase E).

---

### B2 — Admin manual-bill entry form · Tier L · autonomous

**Goal:** Solo team types a full bill for a UC from the client detail screen; calls the existing `POST /api/admin/clients/[id]/energy-bills` (which now applies A3's savings fallback).

**Owns (create):** `src/frontend/admin/components/add-bill-dialog.tsx`; **(modify)** `src/frontend/admin/components/client-details.tsx` to add an "Adicionar fatura" button near the bills/consumption area. *(Coordinate file ownership of `client-details.tsx` with B1: B1 and B2 both touch it → run them sequentially within Wave B, B1 first, or split the mount points into two sibling components each task owns. PM assigns.)*

**Pattern to mirror:** `src/frontend/admin/components/add-consumption-dialog.tsx` + the field set in `energy-bills/route.ts`.

**Fields — keep the form to the cockpit-critical subset** (the route accepts many optional fields; only collect these, leave the rest unset): Usina (`Select`), Unidade consumidora (`Select`, filtered to the chosen plant), Mês (`Select` 1–12), Ano (`Input`), Geração monitorada (kWh) → `monitoredGenerationKwh`, Consumo da rede (kWh) → `consumptionKwh`, Tarifa (R$/kWh) → `tariffPerKwh`, Valor total da fatura (R$) → `totalBillValue`, Economia estimada (R$) *(optional — if blank the server computes it via A3)* → `estimatedSavings`, Status de pagamento (`Select`: `a_pagar`/`paga`/`vencida`) → `paymentStatus`. Send `competenceDate = new Date(Date.UTC(year, month-1, 1))`.

**Copy:** title `Adicionar fatura manual`; button `Adicionar fatura`; success toast `Fatura salva com sucesso`; helper under the savings field `Deixe em branco para calcular automaticamente.`

**Done when:** admin can enter a full bill and it appears in the client's bills list and immediately in the cockpit; states handled; build clean (polish deferred to Phase E).

---

### C1 — Client self-service bill entry · Tier L · 🔴 scope boundary (tests guard it)

**Goal:** the client enters their own bill; it lands `pending_review` and stays out of cockpit active aggregates (A2) until Solo approves (D1).

**Owns (create):**
- `src/app/api/client/energy-bills/route.ts` (new `POST`) — mirrors `client/plants/route.ts`: derives `clientId` from `userContext`, validates the plant/UC belong to the client, forces `status: 'pending_review'`, applies A3's savings fallback, upserts the bill.
- `src/frontend/economia/components/add-bill-form.tsx` (new) — the client-facing form.
- mount it on an existing client surface — add an "Adicionar fatura" entry point on the Economia screen (`src/app/(private)/@user/economia/page.tsx`); confirm the exact file in your plan.
- `src/app/api/client/__tests__/client-bill-create.test.ts` (new).

**Pattern to mirror:** `src/app/api/client/plants/route.ts` (server, the `validationStatus: 'pending_review'` shape) + the plant wizard form for the client-facing form feel (`src/frontend/plants/wizard/plant-wizard-screen.tsx`).

**Fields:** same cockpit-critical subset as B2, minus `status` (forced `pending_review` server-side) and minus admin-only ids. The UC `Select` lists only the client's own UCs.

**Copy:** form title `Enviar fatura`; intro line `Informe os dados da sua conta de luz. A equipe Solo valida antes de entrar no seu Controle.`; submit `Enviar para validação`; success toast `Fatura enviada! A Solo vai validar em breve.`; a `Badge` `Aguardando validação` on freshly submitted items.

**Tests:** client POST → bill persisted with `status='pending_review'`; a UC from another client is rejected (scope enforced); savings fallback applied.

**Done when:** client can submit a bill; it is `pending_review`; excluded from cockpit active numbers; counted in `pendingValidationCount`; tests pass; build clean (polish deferred to Phase E).

---

### C2 — Client self-service generation entry · Tier L · 🔴 scope boundary (tests guard it) · (deferrable to 4.1)

**Goal:** the client enters their own monthly generation; it lands `source='manual_pending'` and is excluded from active aggregates until Solo approves (D1).

**Owns (create):**
- `src/app/api/client/generation/route.ts` (new `POST`) — derives `clientId` from `userContext`, validates the plant belongs to the client, calls A1's `manual-generation.service` with `source='manual_pending'`.
- `src/frontend/generation/components/add-generation-form.tsx` (new) — client-facing form, mounted on the client generation/Energia surface (confirm file in plan).
- `src/app/api/client/__tests__/client-generation-create.test.ts` (new).

**Pattern to mirror:** C1's client route + B1's dialog field set.

**Fields:** Usina (`Select`, own plants only), Mês, Ano, Geração (kWh).

**Copy:** title `Informar geração`; intro `Informe a energia gerada no mês. A Solo valida antes de contar no seu histórico.`; submit `Enviar para validação`; success toast `Geração enviada para validação.`

**Tests:** client POST → `GenerationUnit` with `source='manual_pending'`; foreign plant rejected.

**Done when:** client can submit generation as `manual_pending`; excluded from active generation aggregates; counted in `pendingValidationCount`; tests pass; build clean. **C2 is the lowest-priority feature task — if it isn't done by the time Phase E starts, defer it to a Sprint 4.1 follow-up; it must not block A/B/C1/D or Phase E.**

---

### D1 — Admin approval action · Tier M · no approval

**Goal:** Solo validates client proposals: bills `pending_review → confirmed`, generation `manual_pending → manual`.

**Owns:**
- `src/app/api/admin/energy-bills/pending-review/[billId]/route.ts` (modify if a confirm/reject action isn't already complete — read it first; it exists from Sprint 3.1) **and/or** `src/app/api/admin/clients/[id]/generation/[unitId]/route.ts` (new `PATCH` to flip `source`).
- `src/frontend/admin/components/bill-validation-queue.tsx` (modify — extend the existing queue to also list pending manual generation, or add a sibling list; PM decides in your plan).
- relevant test file(s).

**Logic (steps):**
- [ ] Read the existing `pending-review` route + `bill-validation-queue.tsx` — reuse whatever already approves bills; only add what's missing.
- [ ] Add generation approval: `PATCH` sets `source` from `manual_pending` to `manual` (validate admin + ownership).
- [ ] Test: approve generation → `source='manual'` and it now appears in active aggregates / `pendingValidationCount` drops.
- [ ] Build clean. Commit.

**Done when:** admin can approve both proposal types; approved items enter active aggregates; `pendingValidationCount` decreases; tests pass; build clean.

---

### D2 — Cockpit onboarding checklist + pending banner · Tier L · autonomous

**Goal:** the cockpit shows migration completeness and a "waiting for Solo validation" banner.

**Owns (create):** `src/frontend/controle/components/onboarding-checklist.tsx`; **(modify)** `src/app/(private)/@user/controle/page.tsx` to render the banner + checklist above the existing cockpit content.

**Data:** reuse `useControleOverview()` and the new `pendingValidationCount` (A2). For the checklist completeness, reuse the plant `_count` already returned by `GET /api/client/plants` (inverters / consumerUnits / energyBills counts) — read `src/app/api/client/plants/route.ts`; do NOT add a new endpoint unless the data isn't reachable (flag PM if so).

**UI (compose existing primitives only):**
- A `pendingValidationCount > 0` banner: `Alert` (not destructive) — `{n} item(ns) aguardando validação da Solo`.
- Checklist `Card` titled `Configuração da sua conta` with four rows, each a label + a `Badge` (`Concluído` green / `Pendente` muted): `Usina cadastrada`, `Geração informada`, `Unidade consumidora`, `Primeira fatura`.

**Copy:** exactly as above. No new colors — use the existing `Badge` variants.

**Done when:** banner appears only when something is pending; checklist reflects real counts; cockpit still renders all prior content unchanged; build clean (polish deferred to Phase E).

---

## 6.5 Phase E — End-of-Sprint Review & Refinement (frontier model)

After A–D are merged, **one** review pass runs on a frontier model (Opus / equivalent) over the whole sprint diff (`git diff main...<sprint-4 integration branch>`). This replaces the per-task gates. Two tasks, run by the frontier model, not the juniors:

### E1 — Backend review · frontier model

Review the **correctness and safety** of the backend that juniors shipped. Checklist:
- [ ] **Financial truth (A2/A3):** re-derive the cockpit aggregation by hand on a sample dataset and confirm the numbers match — `isActiveBill` filter correct, `pendingValidationCount` correct, savings fallback formula correct and clamped.
- [ ] **Scope/security (C1/C2):** every client route derives `clientId` from `userContext` (never trusts a body/param `clientId`); a client cannot write a bill/generation/plant for a UC or plant they don't own. Confirm the negative tests actually exercise a foreign-client id.
- [ ] **Gate integrity (D1):** approval only flips `pending_review→confirmed` / `manual_pending→manual`; rejected/foreign items can't be promoted.
- [ ] **Data model:** no schema migration slipped in unflagged; placeholder inverter stays `syncEnabled:false` and is excluded from sync + client inverter lists.
- [ ] **Idempotency:** re-submitting the same month upserts (no duplicate rows); unique constraints hold.
- [ ] Use `superpowers:requesting-code-review` / the `/code-review` flow. File findings as fix-tasks (tier S/M) for a junior, or fix inline if trivial.

### E2 — Frontend refinement · frontier model

Take the structurally-correct forms/cockpit the juniors built (correct fields, copy, states) and **raise them to the brand bar** — this is where the Tesla/McLaren polish the juniors can't do happens. Within the existing design system only (no scope creep into the deferred redesign in `todo.md`):
- [ ] Visual consistency: spacing, typography hierarchy, `font-mono` for kWh/R$ values, alignment, responsive/mobile-first behavior across B1/B2/C1/C2/D2.
- [ ] Interaction polish: loading/disabled/error states feel intentional; toasts and the `Aguardando validação` badges are consistent; focus/keyboard order on the forms.
- [ ] Copy + accents audited (pt-BR) across every new surface.
- [ ] The cockpit onboarding checklist + pending banner sit cleanly above the existing cockpit without layout shift.
- [ ] Confirm against each FE task's screenshot from its HANDOFF block; capture an after screenshot.

**Phase E output:** a short review note appended to this file (findings + what was fixed) and any follow-up fix-tasks. Sprint 4 is **done** when E1 and E2 are complete and the DoD below is fully ticked.

---

## 7. Definition of Done — Sprint 4 (the contract)

- [ ] **DoD-1 — Manual generation:** Solo (A1/B1) and clients (C2) can record monthly generation per plant with no inverter API; stored per §3.1 on a `syncEnabled:false` placeholder inverter; idempotent per month.
- [ ] **DoD-2 — Manual billing:** Solo (B2) and clients (C1) can enter a full bill by hand; `estimatedSavings` is non-zero when computable (A3).
- [ ] **DoD-3 — Cockpit truth:** the Controle cockpit shows correct payback / monthly savings / lifetime / per-account status from manually-entered data, and **excludes** un-validated proposals (A2).
- [ ] **DoD-4 — Propose → validate:** client-entered bills are `pending_review` and generation is `manual_pending`; Solo approval (D1) promotes them into active aggregates.
- [ ] **DoD-5 — Onboarding visibility:** the cockpit shows a pending-validation banner and a completeness checklist (D2).
- [ ] **DoD-6 — Quality gates:** `npm run build` clean; each task's focused vitest suite green; **zero schema migrations** added (or, if one was truly unavoidable, it was PM-approved and hand-authored per §0, not applied locally).
- [ ] **DoD-7 — Ledger:** one billing row per task in `scripts/Planning/billing.md`; every task handed off with the structured HANDOFF block.
- [ ] **DoD-8 — Phase E:** frontier-model backend review (E1) passed with findings fixed; frontier-model frontend refinement (E2) applied; review note appended to this file.

**Merge gate (lightweight, no stop):** the PM merges a finished task's branch once it builds, its focused tests pass, and the touched files match the ownership table — branches merge as they land so the next wave opens. The **only** deep review is **Phase E**, run once by a frontier model after all feature work is merged.

---

## 8. Ledger Hooks

Each engineer, on their branch:
- Tick their task checkbox(es) in §6 to `[x]`.
- Add one row to `scripts/Planning/billing.md`: `date · Sprint 4 · <task-id> · <agent/model> · <tier>`.
- Post the HANDOFF block (`agent_workflow.md` §6).

---

_PM authored this plan from the brainstorm in `pré_sprint_4_controle_v1.md`. Deferred vision items live in `scripts/Planning/todo.md`. Engineers: acknowledge these rules, read your task + the files it owns, confirm your tier, then wait for the PM to open your wave._
