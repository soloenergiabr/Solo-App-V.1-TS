# Sprint 6 — Consumo: Unified Experience, Multi-Bill History & Contextual Education

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax. Same workflow as Sprint 5/5.1 (`scripts/Planning/agent_workflow.md`): one isolated branch per task (or one same-session integration branch via SDD), file ownership, TDD for logic, the `npm.cmd run build` + focused `vitest` + `npx.cmd tsc --noEmit` gate before every handoff, one `billing.md` row per task, structured HANDOFF block.

**Goal:** turn the four-section navigation Sprint 5.1 shipped into a finished **Consumo** product — one unified, tabbed Consumo screen (Economia + Rateio + Histórico de consumo in a single surface, not three card links), **multi-bill history with month/bill compare**, and **contextual FAQ/educational** surfaces that teach the client to read their own energy — plus a small symmetric **Solo Club** hub.

**Context:** Sprint 5/5.1 shipped the AI bill analyzer (manual upload → clarifier dashboard + technical viewer + chat) and consolidated the client sidebar into **Controle · Energia · Consumo · Solo Club**. Sprint 5.1 built `/consumo` as a *light card-hub* that links out to the still-separate `/economia`, `/rateio`, `/consumo/historico` screens. **This was deliberately deferred depth** (`sprint_5_ai-analyzer_v1.md` §2 "out of scope → Sprint 6"; `todo.md` "Navigation depth"). Sprint 6 finishes it.

**Locked product decisions (Sprint 6 scope, 2026-06-27):**
- **Consumo = one tabbed screen**, not three routes. The sidebar's Consumo sub-items deep-link to tabs; the old standalone routes redirect into the tabs. `/economia/[billId]` stays the canonical bill-detail URL (unchanged).
- **Manual input only** — auto-pull stays a **Sprint 7 research spike** (no change here).
- **Reuse, don't rebuild.** FAQ has a working backend (`/api/support/faqs`, `src/backend/support/*`); the bill chat already has `faq-suggestions.tsx`. Compose existing primitives (`Tabs`, `Collapsible`, `Card`, `Table`, telemetry-kit formatters, `recharts`). **Zero schema migrations** — the `EnergyBill` JSON columns + existing FAQ model carry everything.

**Tech Stack:** Next.js 15 (App Router, `(private)/@user`), React, Prisma, Vitest, TypeScript, `useAuthenticatedApi`/Axios (`baseURL:'/api'`), `@radix-ui/react-tabs` (`src/components/ui/tabs.tsx`), `recharts@2.15.4`.

---

## 1. Source Audit (read before executing)

- `scripts/Planning/sprint_5.1_ai-analyzer_v1.md` + `scripts/Planning/PM_Sprint_Handoff.md` + `scripts/Planning/navigation_IA.md` (what 5.1 shipped).
- `scripts/Planning/todo.md` → "Navigation depth" + "Deferred out of Sprint 5.1".
- `src/frontend/consumo/consumo-hub.tsx` + `consumo-hub.test.tsx` (the card-hub being replaced).
- `src/frontend/economia/economia-screen.tsx` (Consolidado/Por conta tabs, bill list, upload entries).
- `src/frontend/rateio/rateio-screen.tsx` (+ its `/rateio/page.tsx` clientId guard).
- `src/frontend/consumption/components/consumption-dashboard.tsx` (`clientId` prop, own PageLayout).
- `src/components/ui/tabs.tsx` (exports `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`), `src/components/ui/page-layout.tsx`, `src/components/ui/collapsible.tsx`, `src/components/ui/table.tsx`.
- `src/app/api/economia/bills/route.ts` (LIST: `?year=&month=`, returns `AccountBill[]`) and `src/app/api/economia/bills/[billId]/route.ts` (detail).
- `src/app/api/support/faqs/route.ts` (`GET` → active FAQs: `{ question, answer, category, isActive }`) and `src/frontend/economia/analysis/chat/faq-suggestions.tsx`.
- `src/frontend/app-sidebar.tsx` (the 4-section nav; Consumo sub-items currently `/economia`, `/rateio`, `/consumo/historico`).

## 2. Scope

### ✅ In scope
- **Consumo unified shell** — one `/consumo` screen with **Economia · Rateio · Histórico** tabs (URL-driven via `?tab=`), each rendering the existing screen body without duplicate page chrome. Sidebar sub-items → tab deep-links; old routes redirect.
- **Multi-bill history & compare** — a history view spanning months/years and a side-by-side compare of any two bills (amount, savings, consumption, credits, key taxes).
- **Contextual FAQ/educational** — a reusable educational accordion fed by `/api/support/faqs`, surfaced on the Consumo screen and the bill-analysis screen; seeds default energy FAQs if none exist.
- **Solo Club hub** — a small `/solo-club` landing symmetric with `/energia` & `/consumo`.

### ❌ Out of scope (parked — `todo.md`)
- Auto-pull / distributor integration (Sprint 7 spike). OpenAI analyzer `extract/analyze`. Async PDF queue. The Controle "Carteira de Energia" cockpit redesign (separate sprint). Repo-wide TS cleanup. Any schema migration.

## 3. Architecture Decisions (locked — read before coding)

### 3.1 The `embedded` prop pattern (no double page chrome)
Each of the three screens currently renders its own `PageLayout`/`PageHeader`. To host them in one tabbed Consumo screen **without nested headers**, give each screen an **`embedded?: boolean`** prop:
- `embedded` **false/undefined** (default) → renders exactly as today (own `PageLayout` + header) so standalone routes are byte-for-byte unchanged.
- `embedded` **true** → renders only the body (no `PageLayout`, no `PageHeader`, no page-level padding wrapper) so the Consumo shell owns the chrome.

This is the minimal, reversible refactor — no body-extraction into new files, no data-hook rewiring.

### 3.2 URL-driven tabs (deep-linkable, back-button safe)
The Consumo shell uses `?tab=economia|rateio|historico` (default `economia`) read with `useSearchParams` and written with `router.replace` on tab change. Why query param not nested route: keeps one screen, one data context, and lets the sidebar + redirects target tabs cleanly.

### 3.3 Routing & redirects (no dead links; `/economia/[billId]` stays canonical)
| Old route | Sprint 6 behavior |
| --- | --- |
| `/consumo` | the new unified tabbed shell (replaces the card-hub) |
| `/economia` (list) | `redirect('/consumo?tab=economia')` |
| `/rateio` | `redirect('/consumo?tab=rateio')` |
| `/consumo/historico` | `redirect('/consumo?tab=historico')` |
| `/economia/[billId]` | **unchanged** — canonical bill detail; upload redirect still lands here |
Sidebar Consumo sub-items become: Economia → `/consumo?tab=economia`, Rateio → `/consumo?tab=rateio`, Histórico → `/consumo?tab=historico`.

### 3.4 Multi-bill history (zero migration)
The LIST route (`/api/economia/bills`) already returns multiple months ordered desc and filters by `?year=`. Extend it to accept **`?year=all`** (omit the year filter) for the history span. Compare is **client-side** over the returned `AccountBill[]` — no new endpoint. The detail fields needed for compare already exist on `AccountBill` (`amountDue`, `estimatedSavings`, `energyCost`, `icmsCost`, …) and `BillDetail`.

### 3.5 Contextual FAQ (reuse the support FAQ backend)
Public `GET /api/support/faqs` returns active FAQs `{ question, answer, category }`. Add an optional **`?category=`** filter (server-side, backward compatible). A reusable `<EducationalFaq category="consumo" />` renders a `Collapsible` accordion. A one-time **idempotent seed** inserts a handful of default energy FAQs (category `consumo`) **only if none exist for that category** (no migration — a runtime seed helper invoked by an admin-guarded route or a script; default copy in the brief).

### 3.6 Solo Club hub (symmetry)
Mirror `energia-hub.tsx`: `/solo-club` light landing with three cards (Clube Solo → `/club`, Meus Vouchers → `/vouchers`, Solo Coins → `/solo-coins`). Sidebar mobile "Club" entry → `/solo-club`; desktop "Solo Club" section keeps its sub-items.

## 4. Task Table

| ID | Tier | Title | Wave |
| --- | --- | --- | --- |
| A1 | M | `embedded` prop for `EconomiaScreen` | A |
| A2 | M | `embedded` prop for `RateioScreen` | A |
| A3 | M | `embedded` prop for `ConsumptionDashboard` | A |
| A4 | L | Unified `/consumo` tabbed shell (URL `?tab=`) + render 3 embedded bodies | B |
| A5 | S | Redirect old routes + repoint sidebar Consumo sub-items to tabs | B |
| A6 | M | Replace `consumo-hub.test.tsx` with a `consumo-screen` tab/integration test; update sidebar test | B |
| B1 | S | LIST route: accept `?year=all` (omit year filter) + test | C |
| B2 | L | Bill **history** view (all months/years, grouped) — new `bill-history.tsx` | C |
| B3 | L | Bill **compare** (pick 2 → side-by-side metrics) — new `bill-compare.tsx` | C |
| B4 | S | History/compare tests | C |
| C1 | S | Public FAQ API `?category=` filter + test | D |
| C2 | M | `EducationalFaq` accordion (reusable) + mount on Consumo + bill-analysis screen | D |
| C3 | S | Idempotent default-FAQ seed (category `consumo`) + admin-guarded trigger + test | D |
| D1 | M | `/solo-club` hub + sidebar mobile repoint + test | E |
| E1 | — | Phase E: whole-branch frontier review + DoD | E |

> **Cost rule:** route S/M to the junior tier; L tasks (A4, B2, B3) get a stronger model + a 5-line pre-code plan to the PM.

## 5. Wave Map

```
Wave A  (embeddable bodies, parallel — disjoint files)   A1 · A2 · A3
   │
Wave B  (unify)   A4 → A5 → A6
   │
Wave C  (history/compare)   B1 → (B2 · B3) → B4
   │
Wave D  (education)   C1 → C2 · C3
   │
Wave E  (club + review)   D1 → E1
```

---

## 6. Task Briefs

### FE GUARDRAILS (apply to every FE task)
1. Compose existing primitives only (`Tabs`, `Card`, `Collapsible`, `Table`, `Alert`, `Badge`, `Button`, `Skeleton`, `Sheet`) + `src/frontend/telemetry-kit` (`formatBRL`, `formatKwh`, `formatKw`) + `recharts` (mirror `consumption-chart.tsx`). No new tokens/colors, no invented Button variants, no `framer-motion` one-offs.
2. Four states everywhere: loading (`Skeleton`), empty (intentional copy), error (`Alert variant="destructive"`), success.
3. Exact pt-BR copy with accents as given. Numbers via the telemetry-kit formatters — no inline `Intl`.
4. No business math in components — reuse `computeClarifier()` / API payloads.
5. `tsc --noEmit` clean on owned files; a green vitest run is not sufficient proof on its own.

---

### A1 — `embedded` prop for `EconomiaScreen` · Tier M
**Goal:** `<EconomiaScreen embedded />` renders only the body (bill list + Consolidado/Por conta tabs + upload entries), no `PageLayout`/`PageHeader`; default behavior unchanged.
**Owns:** `src/frontend/economia/economia-screen.tsx` (modify) + extend `src/frontend/economia/economia-screen.test.tsx`.
**Steps:**
- [ ] Add `export function EconomiaScreen({ embedded = false }: { embedded?: boolean })`. Extract the current header `actions` (the Consolidado/Por conta toggle + `AddBillForm` + `AnalyzeBillDialog` + helper line) into a local `const actions = (...)`.
- [ ] When `embedded`, return the body content directly (the `<div>`s that today are PageLayout children) preceded by a compact inline action row (render `actions` above the list, since there is no PageHeader to host them). When not embedded, return the existing `<PageLayout header={<PageHeader … actions={actions} />}>…</PageLayout>` exactly as now.
- [ ] Test: `render(<EconomiaScreen embedded />)` shows both `Adicionar Fatura` and `Analisar conta (PDF)` and the bill list, and does NOT render the page title (assert the PageHeader title `Economia` is absent in embedded mode). `render(<EconomiaScreen />)` still shows the title. Mock `useEconomia` + `useAuthenticatedApi` as in the existing economia tests.
**DoD:** embedded body renders without page chrome; standalone unchanged; both entry points present in both modes; `tsc` clean.

### A2 — `embedded` prop for `RateioScreen` · Tier M
**Goal:** `<RateioScreen embedded />` renders the rateio body only.
**Owns:** `src/frontend/rateio/rateio-screen.tsx` (modify) + a focused test (new or extend).
**Steps:**
- [ ] Add `embedded?: boolean`. Factor the body (the cards/table/editor currently inside `PageLayout`) so that, when `embedded`, it returns just that body; otherwise the existing `PageLayout`+`PageHeader` wrapper. Do NOT change the rateio data hooks or behavior.
- [ ] Test: embedded render shows a known rateio element (e.g. the proposal/editor or the allocations table header) and no `PageHeader` title `Rateio…`.
**DoD:** body-only in embedded; standalone unchanged; `tsc` clean. ⚠️ `rateio-screen.tsx` has pre-existing `tsc` errors parked in `todo.md` — do NOT fix unrelated ones; only ensure your `embedded` change introduces no NEW errors.

### A3 — `embedded` prop for `ConsumptionDashboard` · Tier M
**Goal:** `<ConsumptionDashboard clientId embedded />` renders the dashboard body only.
**Owns:** `src/frontend/consumption/components/consumption-dashboard.tsx` (modify) + test.
**Steps:**
- [ ] Add `embedded?: boolean` to the props (`{ clientId: string; embedded?: boolean }`). When `embedded`, return the body (period nav + `ConsumptionChart` + `SavingsCard`) without `PageLayout`/`PageHeader`; else unchanged.
- [ ] Test: embedded render mounts the chart/savings area and omits the page title.
**DoD:** body-only in embedded; standalone unchanged; `tsc` clean.

### A4 — Unified `/consumo` tabbed shell · Tier L 🔴 (5-line pre-code plan to PM)
**Goal:** replace the card-hub with one `PageLayout title="Consumo"` hosting `Tabs` (Economia/Rateio/Histórico) driven by `?tab=`, each tab rendering the embedded body from A1/A2/A3. Keep the `AnalyzeBillDialog` action + helper line in the page header.
**Owns:** `src/frontend/consumo/consumo-screen.tsx` (new — the shell) + `src/app/(private)/@user/consumo/page.tsx` (modify — render `<ConsumoScreen/>`, keep `useAuth` for `clientId`). **Delete** `src/frontend/consumo/consumo-hub.tsx` (A6 updates its test).
**Read first:** A1/A2/A3 (the embedded props + their exact names), `src/components/ui/tabs.tsx` (Tabs/TabsList/TabsTrigger/TabsContent), `economy-dashboard/page.tsx` (clientId guard).
**Build:**
- [ ] `ConsumoScreen` (`'use client'`): `const tab = useSearchParams().get('tab') ?? 'economia'`; `const router = useRouter()`; on tab change `router.replace('/consumo?tab='+value)`. Get `clientId` via `useAuth()` (guard with the standard loader when absent).
- [ ] `PageLayout` + `PageHeader title="Consumo" subtitle="Suas contas, rateio e consumo em um só lugar"`, `actions` = `<AnalyzeBillDialog onSuccess={…}/>` + the helper line (exact copy from `consumo-hub.tsx`).
- [ ] `Tabs value={tab} onValueChange={…}` → `TabsList` with `TabsTrigger value="economia"` **Economia**, `value="rateio"` **Rateio**, `value="historico"` **Histórico**. `TabsContent`: economia → `<EconomiaScreen embedded/>`; rateio → `<RateioScreen embedded/>`; historico → `<ConsumptionDashboard clientId={clientId} embedded/>`.
- [ ] Mobile-first: tabs scroll/wrap cleanly < sm; no layout shift between tabs.
**DoD:** `/consumo` shows three working tabs from real data, deep-linkable via `?tab=`, no duplicate headers, analyzer entry present; build clean.

### A5 — Redirects + sidebar repoint · Tier S
**Owns:** `src/app/(private)/@user/economia/page.tsx`, `src/app/(private)/@user/rateio/page.tsx`, `src/app/(private)/@user/consumo/historico/page.tsx` (each → `redirect(...)` from `next/navigation`), and `src/frontend/app-sidebar.tsx` (Consumo sub-item hrefs).
**Steps:**
- [ ] `/economia/page.tsx` → server `redirect('/consumo?tab=economia')` (keep it a tiny file; `/economia/[billId]` is a different segment and stays). `/rateio/page.tsx` → `redirect('/consumo?tab=rateio')`. `/consumo/historico/page.tsx` → `redirect('/consumo?tab=historico')`.
- [ ] In `app-sidebar.tsx`, set Consumo sub-items: Economia `/consumo?tab=economia`, Rateio `/consumo?tab=rateio`, Histórico `/consumo?tab=historico`. Mobile `Consumo` hub stays `/consumo`. Energia/Controle/Solo Club untouched.
**DoD:** old links resolve into the right tab; sidebar deep-links work; no dead links; build clean.

### A6 — Consumo screen test + sidebar test update · Tier S
**Owns:** delete `src/frontend/consumo/consumo-hub.test.tsx`; create `src/frontend/consumo/consumo-screen.test.tsx`; update `src/frontend/app-sidebar.test.tsx` for the new hrefs.
**Steps:**
- [ ] `consumo-screen.test.tsx`: mock `useSearchParams`/`useRouter` (`next/navigation`), `useAuth`, `useEconomia`, `useAuthenticatedApi`. (a) default → Economia tab content + `Analisar conta (PDF)` present; (b) `?tab=rateio` → rateio tab active; (c) the three `TabsTrigger`s render. Do NOT stub `AnalyzeBillDialog`.
- [ ] Update sidebar test: Consumo sub-items now point to `/consumo?tab=...` (assert hrefs).
**DoD:** new tests green; full economia/consumo/sidebar suites green; `tsc` clean.

---

### B1 — LIST route `?year=all` · Tier S
**Owns:** `src/app/api/economia/bills/route.ts` (modify) + `src/app/api/economia/bills/__tests__/list-all-years.test.ts` (new).
**Steps:**
- [ ] When `searchParams.get('year') === 'all'`, omit the `referenceYear` filter (keep the scope + clientId enforcement exactly). Otherwise behavior unchanged (default = current year).
- [ ] Test: `?year=all` returns bills across years; scope/clientId guard still applies; foreign units excluded.
**DoD:** multi-year fetch works; scope intact; test green.

### B2 — Bill history view · Tier L 🔴 (5-line pre-code plan)
**Goal:** a history surface listing all the client's bills across months/years, grouped by year (newest first), each row showing month, UC, amount paid, savings, payment status — clickable to `/economia/[billId]`.
**Owns:** `src/frontend/economia/history/bill-history.tsx` (new) + a small hook `use-bill-history.ts` (calls `/economia/bills?year=all`). Mounted as a panel in the **Histórico** tab (above the consumption chart) to keep three tabs — coordinate with A4.
**Build:** group `AccountBill[]` by `referenceYear`; render `Table` rows (month name pt-BR via `date-fns/locale ptBR`, `formatBRL` amounts, `Badge` for `paymentStatus`). Empty state: `Você ainda não tem contas no histórico.` Loading skeleton mirrors the table.
**DoD:** all bills across years render grouped + linked; four states; no business math; build clean.

### B3 — Bill compare · Tier L 🔴 (5-line pre-code plan)
**Goal:** select any two bills and see a side-by-side comparison of key metrics.
**Owns:** `src/frontend/economia/history/bill-compare.tsx` (new) + its test. **Mount:** inside the Histórico tab, surfaced from the B2 history panel via a `Comparar contas` toggle/affordance (so history + compare live together).
**Build:** two `Select`s (or checkboxes capped at 2) over the history list; render a two-column `Table`/`Card` comparing: `amountDue` (Você pagou), `estimatedSavings`, billed consumption / compensated (from `BillDetail` if needed — else from `AccountBill` fields present), `icmsCost`, `energyCost`, reference month/year. Show deltas (↑/↓ with `text-success`/`text-destructive`, color never the only signal — include +/− sign). Empty/instructional state when fewer than 2 selected: `Selecione duas contas para comparar.`
**Note:** if a compare metric needs fields only on `BillDetail` (not `AccountBill`), fetch each bill's detail via `/economia/bills/[billId]` on selection; otherwise compare from the list payload. State the choice in the handoff.
**DoD:** two-bill compare with signed deltas + accessible cues; four states; build clean.

### B4 — History/compare tests · Tier S
**Owns:** `bill-history.test.tsx` + `bill-compare.test.tsx`.
**Steps:** history: groups by year, links to `/economia/[billId]`, empty state. compare: with 2 bills shows both columns + a delta; with <2 shows the instructional copy. Mock the hooks/api.
**DoD:** genuine guards; green; `tsc` clean.

---

### C1 — FAQ API `?category=` filter · Tier S
**Owns:** `src/app/api/support/faqs/route.ts` (modify) + `src/backend/support/services/faq.service.ts` (add `getActiveFAQsByCategory(category)` if absent) + test.
**Steps:**
- [ ] If `?category=` present, return only active FAQs in that category; else unchanged (all active). Keep it public.
- [ ] Test: `?category=consumo` returns only that category; no param returns all.
**DoD:** filter works, backward compatible, test green.

### C2 — `EducationalFaq` accordion · Tier M
**Goal:** a reusable accordion that teaches energy basics, fed by `/api/support/faqs?category=<cat>`.
**Owns:** `src/frontend/education/educational-faq.tsx` (new) + test; mount it on the Consumo screen (below the tabs) and on the bill-analysis screen (near the technical viewer).
**Build:** `<EducationalFaq category="consumo" title="Entenda sua conta de energia" />`; fetch via `useAuthenticatedApi`. Render `Collapsible` items (question → answer). Four states; empty → hide the section entirely (empty-safe). Exact default section header: `Entenda sua conta de energia`.
**DoD:** renders FAQs for a category, collapsed by default, empty-safe; mounted in both surfaces; build clean.

### C3 — Default-FAQ idempotent seed · Tier S
**Goal:** ensure category `consumo` has a useful starter set without a migration.
**Owns:** `src/backend/support/seed-default-faqs.ts` (new — `seedConsumoFaqsIfEmpty()`: if `getActiveFAQsByCategory('consumo')` is empty, create the defaults) + an admin-guarded trigger (`POST /api/admin/faqs/seed-consumo` using the existing admin auth) + test.
**Default FAQs (exact pt-BR, category `consumo`):**
- `O que é o saldo SCEE?` → `É o Sistema de Compensação de Energia Elétrica: os créditos que sua usina injetou e que abatem seu consumo nos próximos meses.`
- `Por que ainda pago a taxa mínima?` → `Mesmo gerando energia, a distribuidora cobra um custo de disponibilidade (taxa mínima) por manter você conectado à rede.`
- `O que é a bandeira tarifária?` → `Um adicional na tarifa que varia conforme o custo de geração do país: verde (sem adicional), amarela e vermelha (adicionais crescentes).`
- `O que significa kWh?` → `Quilowatt-hora é a unidade que mede a energia consumida — é o que a distribuidora cobra na sua conta.`
**Steps:** TDD the idempotency (running twice creates the set once); guard the route with the admin middleware (reuse the `/api/admin/faqs` auth pattern).
**DoD:** seed is idempotent + admin-guarded; test proves no duplicates on re-run.

---

### D1 — `/solo-club` hub · Tier M
**Goal:** a light landing symmetric with `/energia`, grouping Clube/Vouchers/Coins.
**Owns:** `src/frontend/club/solo-club-hub.tsx` (new) + `src/app/(private)/@user/solo-club/page.tsx` (new) + `src/frontend/app-sidebar.tsx` (mobile `Club` hub href → `/solo-club`) + test.
**Build:** mirror `energia-hub.tsx`: `PageHeader title="Solo Club"` + three nav cards — Clube Solo → `/club` (`Gift`), Meus Vouchers → `/vouchers` (`Ticket`), Solo Coins → `/solo-coins` (`Coins`), each with a one-line pt-BR description. Sidebar: change only the mobile `Solo Club` item href from `/club` to `/solo-club` (desktop sub-items unchanged).
**DoD:** `/solo-club` renders + reaches all three; sidebar mobile repointed; build manifest includes the route; test green.

---

## 6.5 Phase E — Whole-Branch Review & DoD (frontier model)
- [ ] One whole-branch frontier-model review (backend correctness + UI/UX + type-safety) over `git diff main...<sprint-6 branch>`. Verify: no duplicate page chrome in any tab; deep-links + redirects resolve; `/economia/[billId]` still canonical; history scope-safe; compare deltas correct & accessible; FAQ empty-safe + seed idempotent; zero migrations; build clean; full suite green; `tsc` clean on owned files (the 8 pre-existing non-sprint errors stay parked).
- [ ] Fix Critical/Important findings; log Minors; append a review note here.

## 7. Definition of Done — Sprint 6

- [ ] **DoD-1 — Unified Consumo:** `/consumo` is ONE tabbed screen (Economia · Rateio · Histórico), URL-deep-linkable, no duplicate headers; the card-hub is gone; standalone screens still render in `embedded={false}` mode.
- [ ] **DoD-2 — No dead links:** `/economia`, `/rateio`, `/consumo/historico` redirect into the right tab; sidebar Consumo sub-items deep-link to tabs; `/economia/[billId]` unchanged and canonical.
- [ ] **DoD-3 — History & compare:** client sees all bills across months/years grouped + linked, and can compare any two with signed, accessible deltas.
- [ ] **DoD-4 — Contextual education:** `EducationalFaq` renders category FAQs (collapsed, empty-safe) on the Consumo + bill-analysis screens; the `consumo` category has an idempotent default seed.
- [ ] **DoD-5 — Solo Club hub:** `/solo-club` exists, symmetric with `/energia`/`/consumo`; mobile nav repointed.
- [ ] **DoD-6 — Quality gates:** `npm.cmd run build` clean; focused `vitest` suites green; `npx.cmd tsc --noEmit` clean on all owned files; **zero schema migrations**.
- [ ] **DoD-7 — Ledger + review:** one `billing.md` row per task; HANDOFF block per task; Phase E review note appended; `PM_Sprint_Handoff.md` updated.

## 8. Ledger Hooks
Each engineer: tick the task checkbox in §6, add `date · Sprint 6 · <task-id> · <agent/model> · <tier>` to `scripts/Planning/billing.md`, post the HANDOFF block, and record completion in `.superpowers/sdd/progress.md`.

---

_Sprint 6 finishes the Consumo experience deferred from Sprint 5/5.1. Auto-pull and the Controle "Carteira de Energia" cockpit redesign remain separate future sprints (see `todo.md`)._
