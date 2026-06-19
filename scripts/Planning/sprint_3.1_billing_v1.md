# Sprint 3.1 — Economia/Billing v1 Correction Pass

> **PM owner:** Claude (Opus) — Sprint 3 gate review
> **Source:** PM review of branch `sprint3/economia-intelligence-mvp` against `scripts/Planning/sprint_3.md`
> **Status:** Correction loop — bounce-back to junior engineer before merge to `main`
> **Workflow:** `scripts/Planning/agent_workflow.md` (multi-agent swarm). Branch isolation, file ownership, structured handoff block all apply.

---

## 0. Context — Why This Sprint Exists

Sprint 3 (Waves 1–10) shipped functionally on `sprint3/economia-intelligence-mvp`:

- ✅ `npm run build` is clean (exit 0) once one stray dir is removed.
- ✅ 114/114 targeted v1 tests pass (analyzer, crypto primitive, event-bus, client/economia/rateio routes).
- ✅ **Authorization is solid** — every client route enforces `clientId`/payer scope server-side. No cross-client leakage found. Do **not** touch this.

But the PM gate review found **2 critical deploy/functionality blockers** and **1 important product-contract gap**. This sprint fixes them. Nothing here is a rewrite — these are targeted corrections.

**Hard environment constraint:** there is **no local Docker / Postgres** right now. Production Postgres lives on the VPS. Therefore **migrations are authored and committed but NOT applied locally.** They will be applied in production with `npx prisma migrate deploy`. Never run `prisma migrate dev` in this sprint — it needs a DB and will fail.

**Resolved product decision:** clients keep the ability to self-confirm payment (`paymentStatus → paga`). No work needed; documented here so nobody "fixes" it.

---

## 1. Execution Rules (same as Sprint 3)

1. Read the existing file before editing it.
2. One isolated branch per task: `junior/sprint3.1/<task-id>/<short-desc>`.
3. Only edit the files your task owns (file ownership table below). Flag anything else to the PM.
4. Preserve existing behavior unless the task explicitly changes it.
5. Add tests for any new math, status transition, or credential round-trip.
6. Verify before handoff:
   ```bash
   npm.cmd run build
   npx.cmd vitest run <focused path>
   npx.cmd prisma generate   # OK — no DB needed. Do NOT run prisma migrate dev.
   ```
7. Post the structured **HANDOFF block** from `agent_workflow.md` §6. No block = not accepted.

---

## 2. Findings → Tasks (severity ordered)

| ID | Sev | Tier | Title | Plan approval? |
|----|-----|------|-------|----------------|
| A1 | 🔴→cleanup | S | Remove stray `(private` duplicate route dir | ❌ just do it |
| A2 | 🔴 Critical | M | Prepare (don't apply) rateio migration | ❌ spec is exact |
| B1 | 🔴 Critical | L | Fix inverter credential encryption end-to-end | ✅ PM approves plan |
| C1 | 🟠 Important | L | Enforce "clients propose, Solo validates" gate | ✅ PM approves plan |
| D1 | ⚪ Minor | S | Rateio UI polish (M1–M6) | ❌ just do it |
| D2 | ⚪ Optional | M | Inverter `test-sync` endpoint + wizard status ring | ❌ optional / defer |

---

## 3. Wave Map

```
Wave A  (parallel, no shared files)      A1  ·  A2
   │
Wave B  (after A — independent files)    B1            ← PM plan approval first
   │
Wave C  (after A2 — adds a 2nd migration) C1           ← PM plan approval first
   │
Wave D  (anytime, lowest priority)       D1  ·  D2
```

File ownership is disjoint within each wave — no two tasks in a wave touch the same file.

---

## 4. Task Briefs

### A1 — Remove stray duplicate route dir · Tier S · no approval

**Problem:** A misquoted Windows path created `src/app/(private/` (note the missing `)`), an **identical** untracked copy of `src/app/(private)/@user/rateio/page.tsx`. Two route groups both resolving `/rateio` make `next build` fail with a parallel-route conflict. The PM moved it to `./.pm-review-quarantine/` so the build could be measured.

**Do:**
- [x] Confirm `src/app/(private/` does not exist under `src/app/`. If it reappears, delete it.
- [x] Delete the PM's `./.pm-review-quarantine/` folder entirely (it holds the quarantined dir + an `old-schema.prisma` scratch file).
- [x] `npm.cmd run build` → clean.

**Owns:** working tree only (no committed source files change). Commit is the build-clean confirmation + this checkbox.
**Done when:** `src/app/` contains only `(private)` (with closing paren); build clean.

---

### A2 — Prepare rateio migration (DO NOT APPLY) · Tier M · no approval

**Problem:** Wave 1 added 8 columns + 1 index to `CreditAllocation` in `schema.prisma` but **committed no migration**. Against the real VPS DB, every rateio query throws `column does not exist`. We can't run `migrate dev` (no local DB), so author the migration file by hand and let production apply it with `migrate deploy`.

**Do:**
- [x] Create folder `prisma/migrations/20260619120000_add_rateio_enel_sync_fields/`.
- [x] Create `migration.sql` inside it with **exactly** this content (generated via `prisma migrate diff` schema-to-schema, no DB):

```sql
-- AlterTable
ALTER TABLE "public"."credit_allocation" ADD COLUMN     "appliedAt" TIMESTAMP(3),
ADD COLUMN     "appliedByUserId" TEXT,
ADD COLUMN     "effectiveDate" DATE,
ADD COLUMN     "enelProtocol" TEXT,
ADD COLUMN     "enelSyncStatus" TEXT NOT NULL DEFAULT 'draft',
ADD COLUMN     "requestedAt" TIMESTAMP(3),
ADD COLUMN     "requestedByUserId" TEXT,
ADD COLUMN     "syncError" TEXT;

-- CreateIndex
CREATE INDEX "credit_allocation_enelSyncStatus_idx" ON "public"."credit_allocation"("enelSyncStatus");
```

- [x] Verify the folder name sorts **after** the last migration `20260616000000_add_controle_sprint2_data` (it does).
- [x] Run `npx.cmd prisma generate` (no DB) to confirm the client still builds. Do **NOT** run `prisma migrate dev`.
- [x] Add a one-line note to the commit body: *"Apply in production with `npx prisma migrate deploy` — not applied locally (no Docker)."*

**Owns:** `prisma/migrations/20260619120000_add_rateio_enel_sync_fields/migration.sql` (new only).
**Done when:** migration file committed; `prisma generate` clean; build clean. **Production apply is a separate manual step by the owner on the VPS.**

> ⚠️ If you regenerate this with `prisma migrate diff`, use **schema-to-schema** mode (compare `main`'s `schema.prisma` to the current one). `--from-migrations` needs a shadow DB and will fail without Docker.

---

### B1 — Fix inverter credential encryption end-to-end · Tier L · **PM approval required**

**Problem (critical):** Wave 9 encryption is half-wired:
- The decrypt helper `getInverterWithCredentials()` in `src/backend/inverters/inverter.service.ts` is **dead code** — nothing in `src/backend/generation/**` calls it.
- The real sync/list path (`PrismaInverterRepository`, `get-inverters`/`get-inverter-by-id` use-cases, the Solis/Hoymiles/Deye/AUXSOL repositories) reads `providerApiKey`/`providerApiSecret` **raw from Prisma**.
- Only `src/app/api/client/inverters/route.ts` encrypts on write. The **admin** (`/api/admin/inverters`) and **generation** (`/api/generation/inverters`) write paths still store **plaintext**.

**Net effect:** Wave 9 acceptance ("no plaintext for new writes") is false for the real write paths; and any inverter saved through the client wizard stores ciphertext that sync then sends to the provider API as the credential → **sync auth fails**.

**Goal:** encryption must be transparent at the data-access boundary. Encrypt on **every** write; decrypt on **every** read that feeds provider calls; legacy plaintext rows must keep working.

**Required design (present this as your plan for PM approval before coding):**
- [x] Centralize crypto at the **repository layer** (`PrismaInverterRepository`), not in individual routes — encrypt `providerApiKey`/`providerApiSecret` in `create`/`update`; decrypt in every read (`findById`, `findMany`, the model mappers at `prisma.inverter.repository.ts:15-16,88-89,156-157`).
- [x] Use the existing `isEncrypted()` / a `tryDecrypt()` guard so pre-existing **plaintext** rows pass through unchanged (no DB backfill required for v1).
- [x] Remove the duplicate ad-hoc `encrypt()` call from `src/app/api/client/inverters/route.ts` once the repository owns it (avoid double-encryption).
- [x] Either wire `src/backend/inverters/inverter.service.ts` into the read path or delete it — no orphan decrypt helpers.
- [x] **Round-trip integration test** (the acceptance proof): save an inverter with a known key via the repository → read it back via the generation read path → assert the **plaintext** credential is what reaches the provider repository (`this.data.providerApiKey`). Add a second test asserting a legacy plaintext row still reads correctly.
- [x] Confirm secrets are never returned to the frontend (admin/generation GET responses must not leak decrypted creds — redact).

**Owns:**
- `src/backend/generation/repositories/implementations/prisma.inverter.repository.ts`
- `src/backend/inverters/inverter.service.ts`
- `src/app/api/client/inverters/route.ts`
- `src/app/api/admin/inverters/route.ts`
- `src/app/api/generation/inverters/route.ts`
- new test file under `src/backend/generation/__tests__/`

**Done when:** all three write paths encrypt; generation read path decrypts; round-trip + legacy-plaintext tests pass; no secret leaks to client; build clean.

---

### C1 — Enforce "clients propose, Solo validates" · Tier L · **PM approval required**

**Problem (important):** The v1 core promise is *"nothing is active until Solo validates."* But `Plant` has no validation/status field (`deletedAt` + `providerStatus` only), and the wizard creates plants/consumer-units as **immediately live**. The "pending Solo validation" summary in the wizard is cosmetic only.

**Goal:** client-created plants/consumer-units land in a pending state; Solo/admin approves before they count as active.

**Required design (present for PM approval before coding):**
- [x] Add a validation status to `Plant` and `ConsumerUnit` — string field, e.g. `validationStatus String @default("pending_review")` (mirror the bill lifecycle string-union pattern in `src/shared/economia/types.ts`; avoid an enum to dodge migration risk). Client-created records → `pending_review`; admin-created → `confirmed`.
- [x] **Prepare a second migration** for these columns following A2's method (hand-authored `migration.sql`, **not applied locally**).
- [x] Client plant/consumer-unit POST routes set `pending_review`.
- [x] Admin approval action (reuse an existing admin route if one fits; otherwise add a minimal `PATCH` to set `confirmed`/`rejected`).
- [x] Cockpit/admin surfaces the pending count (the cockpit summary already aggregates — extend it).
- [x] Tests: client create → `pending_review`; admin approve → `confirmed`; pending records excluded from "active" aggregates.

**Owns:** `prisma/schema.prisma` (Plant + ConsumerUnit), the new migration folder, `src/app/api/client/plants/route.ts`, `src/app/api/client/consumer-units/route.ts`, the admin approval route, `src/app/api/controle/summary/route.ts`, related tests.
**Depends on:** A2 merged (establishes the prepared-migration pattern).
**Done when:** client proposals are pending until approved; migration prepared; tests pass; build clean.

> If the owner wants to ship the critical fixes first, C1 can be split to a follow-up wave — but it is the central product contract, so it should not be dropped, only sequenced.

---

### D1 — Rateio UI polish (M1–M6) · Tier S · no approval

From the Sprint 3 handoff, all valid:
- [ ] `EnelSyncBadge` → use the shared `<Badge>` component instead of a raw `<span>`.
- [ ] Add missing Portuguese accents across `src/frontend/rateio/*`.
- [ ] Reset `selectedAllocation` on data refetch (`rateio-screen.tsx`).
- [ ] Wire the `useCreateProposal` mutation into `rateio-editor.tsx` (replace the inline `fetch`).
- [ ] Remove the 7 `no-explicit-any` in rateio code.
- [ ] Fix the `react-hooks/exhaustive-deps` warning at `rateio-screen.tsx:80`.

**Owns:** `src/frontend/rateio/**`.
**Done when:** lint clean for rateio; build clean.

---

### D2 — Inverter `test-sync` endpoint + wizard status ring · Tier M · optional

Wave 5 spec listed `POST /api/plants/[plantId]/inverters/test-sync` and a green/yellow/red status ring; never built. **Optional for this pass** — schedule only if B1 lands first (it depends on the decrypt read path). Flag to PM before starting.

---

## 5. Definition of Done — Sprint 3.1

- [x] A1: stray dir gone; `npm run build` clean.
- [x] A2: rateio migration committed, **not applied locally**; documented `prisma migrate deploy` for the VPS.
- [x] B1: all inverter write paths encrypt; generation read path decrypts; round-trip + legacy tests pass; no secret leaks to frontend.
- [x] C1: client-proposed plants/consumer-units are `pending_review` until Solo approves; second migration prepared.
- [ ] D1: rateio UI minors resolved; lint clean.
- [ ] No new build/type errors; targeted vitest suites green.
- [ ] One billing row per task in `scripts/Planning/billing.md`.
- [ ] Each task handed off with the structured HANDOFF block.

**Merge gate:** PM merges `sprint3/economia-intelligence-mvp` → `main` only after A1, A2, B1, C1 pass the gate. **Then** the owner runs `npx prisma migrate deploy` on the VPS to apply the prepared migrations.

---

## 6. Production Migration Runbook (owner, on VPS — after merge)

```bash
# On the VPS, with DATABASE_URL pointing at production Postgres:
git pull origin main
npx prisma migrate deploy     # applies the prepared migrations (no shadow DB needed)
npx prisma generate
# restart the app
```

`migrate deploy` only runs committed migration files and records them in `_prisma_migrations`. It does not need a local Docker DB and will not prompt.
