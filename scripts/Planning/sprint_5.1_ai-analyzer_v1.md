# Sprint 5.1 — Analyzer Closure + Navigation Consolidation (Controle · Energia · Consumo · Solo Club)

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Same workflow rules as Sprint 5 (`scripts/Planning/agent_workflow.md`): one isolated branch per task, file ownership, TDD for logic, the `npm.cmd run build` + focused `vitest` + `tsc --noEmit` gate before every handoff, one `billing.md` row per task, structured HANDOFF block.

**Goal:** finish the user-facing path Sprint 5 promised **and** ship the navigation the product needs to make it discoverable. Two things ship together:

1. **Close the AI analyzer** so a real client can, in production, upload a bill (PDF/photo), get the rich clarifier dashboard + technical-data viewer + chat, end-to-end — the manual-input path, proven on the VPS.
2. **Consolidate the client sidebar** from 9 flat items into **4 sections — Controle · Energia · Consumo · Solo Club** (Suporte stays in the footer) — and surface the analyzer where it belongs, inside **Consumo**.

**Locked product decisions (from the Sprint 5.1 brainstorm, 2026-06-25):**

- **Input model = manual now, auto-pull later.** The client uploads the bill themselves (the path already built in Phase H/I). **Automatic distributor bill-pull is explicitly NOT in this sprint** — Brazilian distributors have no public bill API, so it needs RPA/scraping or a paid 3rd-party fetch service plus per-client portal credentials and legal review. That is scoped as a **Sprint 7 research spike** (§7). The reference app (`solar-bill-clarity`) is itself manual-upload only — manual is the proven path.
- **Navigation = 4 grouped sections**, not 4 tabbed mega-routes. Desktop shows the 4 titled groups with their sub-items; mobile shows 4 hub entries. This folds in what Sprint 5 had parked as "Sprint 6 — Consumo consolidation."
- **This file is now a full sprint, phased A → B → C**, not a thin closure checklist. Phase A is the original closure work (still open); B and C are new.

**Tech Stack:** Next.js 15 (App Router, `(private)/@user` parallel route), React, Prisma, Vitest, TypeScript, `useAuthenticatedApi`/Axios with `baseURL: '/api'`, Claude/Gemini bill-analyzer providers, VPS + PM2 deployment. **No local Docker/Postgres; never run `prisma migrate dev`; this sprint needs ZERO schema migrations.**

---

## Source Audit

Read before executing:

- `scripts/Planning/sprint_5_ai-analyzer_v1.md` (the full A→I history; §10–§13 are the Phase F/G/H/I contracts)
- `scripts/Planning/PM_SPRINT-HANDOFF.md`
- `scripts/Planning/todo.md`
- `src/frontend/app-sidebar.tsx` (the 9-item flat client nav — the thing being consolidated)
- `src/components/ui/sidebar.tsx` (renders `sections` on desktop, flattens `items ?? sections` on mobile footer)
- `src/frontend/economia/economia-screen.tsx` + `src/frontend/economia/components/analyze-bill-dialog.tsx` (+ its test)
- `src/app/api/client/energy-bills/upload/route.ts`
- `src/app/api/economia/bills/[billId]/chat/route.ts`
- `src/frontend/economia/analysis/bill-analysis-screen.tsx` (the unified dashboard, F1/F2)
- Reference (read-only, do NOT port the platform): `C:\Users\mateus\OneDrive\Desktop\MSM\Solo Energia - Analisador de Contas (APP)\solar-bill-clarity\src\pages\Dashboard.tsx` and `Index.tsx` (their bill-list / property home — for Consumo information design only).

## Current State — Verified 2026-06-25

**Analyzer (code) is done and green.** `npx.cmd vitest run src/frontend/economia src/backend/economia/analyzer src/shared/economia` → **110 passed / 0 failed**. Confirmed present and correct: provider abstraction + factory, `computeClarifier`, the unified `bill-analysis-screen.tsx` (sources all math from `computeClarifier`, mounts `TechnicalDataViewer` + `BillChatDrawer`), the orphan `/[billId]/analyze` route is deleted, ActionCard CTA is `Falar com a Solo` → `/support`, no invented `variant="gradient"`, the upload dialog POSTs to `/client/energy-bills/upload` (no double `/api`), `"typecheck"` script exists.

**Two real gaps remain:**

1. **The analyzer is not proven in production** — DoD-H6 / DoD-I4 (deploy + real-bill E2E) were never closed. This is the whole point of Phase A.
2. **The Phase H/I working tree is uncommitted.** `git status` shows `analyze-bill-dialog.tsx` + its test as untracked (`??`) and `economia-screen.tsx` / `plant-wizard-screen.tsx` as modified (`M`) on `sprint5/wave-a`. The finished code is not in a commit yet. **A0 lands it.**

## Current Client Sidebar (the thing Phase B replaces)

`src/frontend/app-sidebar.tsx` → `vendedorSections`, one flat "Principal" group, 9 items + Investor Demo:

`Controle (/controle)` · `Geração (/dashboard)` · `Minhas Usinas (/plants/wizard)` · `Economia (/economia)` · `Rateio (/rateio)` · `Clube Solo (/club)` · `Meus Vouchers (/vouchers)` · `Solo Coins (/solo-coins)` · `Suporte (/support)` · `Investor Demo (/investor-demo)`.

Existing `@user` route segments: `club`, `controle`, `dashboard`, `economia`, `economy-dashboard`, `plants`, `profile`, `rateio`, `solo-coins`, `support`, `vouchers`. **No `consumo` or `energia` segment exists yet** — Phase B creates the two hubs.

## Target Information Architecture (Phase B)

| Section (desktop group title) | Mobile hub entry → route | Sub-items (desktop) | Maps from |
| --- | --- | --- | --- |
| **Controle** | `/controle` | Controle (cockpit) | `/controle` (unchanged) |
| **Energia** | `/energia` (new hub) | Geração · Minhas Usinas | `/dashboard` + `/plants/wizard` |
| **Consumo** | `/consumo` (new hub) | Economia (analisador IA) · Rateio · Consumo | `/economia` + `/rateio` + consumption screen |
| **Solo Club** | `/club` | Clube Solo · Meus Vouchers · Solo Coins | `/club` + `/vouchers` + `/solo-coins` |
| _(footer / utility)_ | `/support` | Suporte | `/support` (stays separate, not a hub) |

> **Desktop vs mobile, no component change needed.** `Sidebar` renders `sections` on desktop (grouped, with sub-items) and uses `items ?? sections.flatMap(...)` on the mobile footer. So `AppSidebar` passes **both**: `sections` = the 4 grouped sections (desktop) **and** `items` = the 4 hub entries + Suporte (mobile footer, max 5 — no longer 9-cramped). The hubs are real landing pages so mobile has one destination per section. `Investor Demo` is removed from the client nav (it is a demo affordance, not client IA — keep it reachable by direct URL only, or behind the master role).

---

## Phase A — Analyzer Closure (finish the manual-input path to production)

> This is the original Sprint 5.1 closure work, still open. It must pass before B/C ship, because B/C make the analyzer **more** discoverable — shipping discoverability on top of an unproven engine would surface bugs to every client at once.

### A0 — Commit the Phase H/I working tree · Tier S

**Why:** the finished upload dialog + URL fix exist only in the working tree.

- [ ] Confirm the diff is exactly the Phase H/I surface: `analyze-bill-dialog.tsx` (+ test), `economia-screen.tsx` (mounts the dialog, adds the helper line), `plant-wizard-screen.tsx` (the sibling `/api` double-prefix fix from Phase I).
- [ ] `npx.cmd vitest run src/frontend/economia` → green; `npx.cmd tsc --noEmit` introduces **zero** new errors in these files.
- [ ] Commit on `sprint5/wave-a` (or a fresh `sprint5.1/A0` branch per §workflow): `fix(economia): land Phase H/I upload dialog + URL fix`. Do **not** sweep unrelated modified files (`.gitignore`, planning docs) into this commit.

**Done when:** the upload front door is committed; `git status` no longer shows the dialog as untracked.

### A1 — Economia entry-point regression test · Tier S  *(was Task 1 / S5.1-3)*

**Why:** Phase H3 required a screen-level test proving `/economia` renders **both** entry points (manual `Adicionar fatura` + AI `Analisar conta (PDF)`). It was never written — `src/frontend/economia/economia-screen.test.tsx` does not exist.

**Owns (create):** `src/frontend/economia/economia-screen.test.tsx`.

- [ ] Mock the smallest data-hook surface needed for `EconomiaScreen` to render (mirror the mocks already used in `account-card.test.tsx` / `contas-a-pagar.test.tsx`).
- [ ] Assert all three:
  ```tsx
  expect(await screen.findByText('Adicionar fatura')).toBeInTheDocument()
  expect(screen.getByText('Analisar conta (PDF)')).toBeInTheDocument()
  expect(
    screen.getByText(/Tem o PDF da conta\? Use .*Analisar conta.* para a IA preencher tudo\./),
  ).toBeInTheDocument()
  ```
- [ ] Prove it guards: temporarily removing `<AnalyzeBillDialog />` makes the test fail (do **not** commit the removal). Then `npx.cmd vitest run src/frontend/economia` → all green.

**Done when:** the screen-level entry-point test passes and fails if the AI entry is removed.

### A2 — Re-run the Phase I contract audit · Tier S  *(was Task 2)*

- [ ] Double-prefix audit returns **no output**:
  ```powershell
  rg -n "axiosInstance\.(post|get|put|patch|delete)\(['""]/api/|api\.(post|get|put|patch|delete)\(['""]/api/" src/frontend
  ```
- [ ] `npx.cmd vitest run src/frontend/economia/components/analyze-bill-dialog.test.tsx` → green, and the evidence includes the contract assertion:
  ```tsx
  expect(mockAxiosPost).toHaveBeenCalledWith('/client/energy-bills/upload', expect.any(FormData))
  ```
- [ ] `npm.cmd run build` exits `0` (record Prisma `P1001` as environment noise only if the process still exits `0`).

### A3 — Type-safety evidence (no repo-wide cleanup) · Tier S  *(was Task 3 / S5.1-4)*

- [ ] `npx.cmd tsc --noEmit` — it may still fail on **non-Sprint-5** files parked in `todo.md`. Do not fix those here.
- [ ] Record the filtered evidence block in the handoff (the table from the prior 5.1 draft). **Zero** errors are permitted in these owned surfaces:
  ```text
  src/backend/economia/analyzer/**
  src/shared/economia/**
  src/app/api/client/energy-bills/upload/**
  src/app/api/economia/bills/**
  src/frontend/economia/**
  src/frontend/plants/wizard/plant-wizard-screen.tsx
  ```
- [ ] DoD wording if global typecheck is still blocked only by non-sprint files:
  > Typecheck: global `npx.cmd tsc --noEmit` still fails on pre-existing non-Sprint-5 files already parked in `todo.md`; zero errors were introduced in Sprint-5/5.1 files.

### A4 — Deploy to the VPS · Tier S  *(was Task 4 / S5.1-1)*

- [ ] Confirm provider env on the VPS — **one** of:
  ```bash
  ANTHROPIC_API_KEY=...           # default provider = claude
  # or
  BILL_ANALYZER_PROVIDER=gemini   # uses the existing Gemini key
  ```
  Optional: `BILL_ANALYZER_CLAUDE_MODEL=claude-sonnet-4-6`. If neither is set, **do not smoke-test** — upload + chat will fail.
- [ ] Deploy from the VPS app dir (no migration commands — zero schema changes):
  ```bash
  git pull origin main
  npm ci
  npx prisma generate
  npm run build
  pm2 restart solo-app
  ```
- [ ] Confirm the deployed tree includes Phase I: the upload path is `/client/energy-bills/upload` and **not** `api/client/...` inside the dialog.

### A5 — Real-bill end-to-end smoke · Tier M  *(was Task 5 / S5.1-2 — the actual finish line)*

- [ ] Log in as a client with ≥1 consumer unit; `/economia` (or `/consumo` after Phase B) shows both `Adicionar fatura` and `Analisar conta (PDF)`.
- [ ] Upload a real bill → network is `POST /api/client/energy-bills/upload` → **200**, no `/api/api/...`; processing state shows; success redirects to `/economia/[billId]`.
- [ ] Dashboard renders: bill score/summary, clarifier dashboard, technical-data viewer (billing items / SCEE / taxes when present); expansion CTA (when applicable) says `Falar com a Solo` → `/support`; **no** CRM/lead-capture/freemium/proposal/WhatsApp lead-magnet anywhere.
- [ ] Chat: ask `Por que minha conta ainda teve valor a pagar?` → streamed, grounded answer; no foreign-bill data.
- [ ] Record evidence:
  ```text
  Real-bill smoke (YYYY-MM-DD): Provider: Claude/Gemini · Upload: POST /api/client/energy-bills/upload -> 200 ·
  Redirect: /economia/<billId> · Dashboard: AI analysis + clarifier + technical viewer · Chat: streamed grounded · Result: PASS/FAIL
  ```

### Phase A — Definition of Done

- [x] **DoD-A1** — Phase H/I work committed (no untracked dialog). _(commit 5f6b6e4)_
- [x] **DoD-A2** — `/economia` entry-point screen test green and guards both starts. _(commit 0f5bc2e; RED/GREEN proven)_
- [x] **DoD-A3** — double-prefix audit clean; dialog contract test asserts URL + `FormData`; build `0`. _(audit 0 matches; build exit 0)_
- [x] **DoD-A4** — filtered typecheck shows zero Sprint-5/5.1 errors; repo-wide errors stay parked in `todo.md`. _(8 non-sprint files remain, listed)_
- [ ] **DoD-A5** — deployed with a working provider env; **real bill** uploads → 200 → dashboard + chat work in production. Closes Sprint 5 DoD-H6 / DoD-I4. **← HUMAN-ONLY (VPS); see §A4/A5 checklist.**

---

## Phase B — Navigation Consolidation (Controle · Energia · Consumo · Solo Club)

> Folds in the work Sprint 5 parked as "Sprint 6 — Consumo consolidation." **No new business logic** — this is information architecture: group the nav, build two hub landing pages, redirect old routes, keep every existing screen reachable. **Preserve all current screens and their data**; hubs compose/link them, they do not rewrite them.

**Wave order:** B1 → B2 → (B3a · B3b in parallel) → B4 → B5.

### B1 — IA decision record + route map · Tier S

**Owns (create):** a short `## Navigation IA` section appended to `scripts/Planning/PM_SPRINT-HANDOFF.md` (or a `docs/` note) capturing the table in §"Target Information Architecture", the desktop-`sections`/mobile-`items` split, and the redirect list (B4). No code. This is the contract B2–B5 implement against.

- [ ] Confirm icon choices (reuse `lucide-react` already imported): Controle `Gauge`, Energia `Zap`, Consumo `DollarSign`, Solo Club `Gift`, Suporte `HelpCircleIcon`.
- [ ] Confirm `Investor Demo` is removed from client nav (reachable by direct URL / master role only).

### B2 — Refactor `app-sidebar.tsx` to 4 sections + mobile hubs · Tier M

**Owns (modify):** `src/frontend/app-sidebar.tsx` only.

- [ ] Replace the single flat `vendedorSections` with **4 titled sections**: `Controle`, `Energia` (Geração → `/energia`/Geração tab, Minhas Usinas → `/plants/wizard`), `Consumo` (Economia → `/consumo`, Rateio → `/rateio`, Consumo → `/consumo` consumption tab), `Solo Club` (Clube → `/club`, Vouchers → `/vouchers`, Solo Coins → `/solo-coins`).
- [ ] Pass an additional `vendedorMobileItems` (the 4 hubs + Suporte) and wire the component so the mobile footer receives `items={vendedorMobileItems}` while desktop receives `sections={vendedorSections}`. (The `Sidebar` already prefers `items` for the footer and `sections` for desktop — provide both; no change to `sidebar.tsx`.)
- [ ] `mobileLabel` kept short: `Controle`, `Energia`, `Consumo`, `Club`, `Suporte`.
- [ ] Admin (`master`) sidebar is untouched.

**Done when:** desktop shows 4 grouped sections; mobile footer shows ≤5 hub icons (not 9); active-state highlighting still works (`pathname.startsWith(href + '/')`).

### B3a — `/energia` hub page · Tier M

**Owns (create):** `src/app/(private)/@user/energia/page.tsx` + a thin `src/frontend/energia/energia-hub.tsx`.

- [ ] A hub landing that presents two clearly-labelled cards/tabs: **Geração** (links to / embeds the existing generation dashboard at `/dashboard` or `economy-dashboard`) and **Minhas Usinas** (`/plants/wizard`). Reuse existing primitives (`Card`, `Tabs` if present, `Button`). No new business logic — compose/link existing screens.
- [ ] Mobile: this is the destination for the Energia footer entry.

**Done when:** `/energia` renders, both sub-areas reachable, build clean.

### B3b — `/consumo` hub page · Tier M

**Owns (create):** `src/app/(private)/@user/consumo/page.tsx` + `src/frontend/consumo/consumo-hub.tsx`.

- [ ] A hub landing with three sub-areas: **Economia** (the bill-analyzer home — render/host the existing `EconomiaScreen` so the bill list + both upload entries live here), **Rateio** (`/rateio`), **Consumo** (the consumption screen under `src/frontend/consumption`). Tabs or cards, mobile-first, existing primitives only.
- [ ] **This is the home of the AI analyzer going forward** — Phase C builds on it.

**Done when:** `/consumo` renders all three sub-areas; the analyzer bill list + `Analisar conta (PDF)` entry are reachable from here; build clean.

### B4 — Redirects + reachability guards · Tier S

**Owns (create/modify):** `next.config.ts` redirects (or per-route `redirect()` in old `page.tsx` shells) + nav tests.

- [ ] Old direct routes keep working: `/economia` still resolves (it is hosted inside Consumo; keep the standalone route too so existing links/bookmarks and the H1 redirect `router.push('/economia/'+id)` are unaffected). Add redirects only where a route is being *retired*, not for `/economia`, `/rateio`, `/plants/wizard`, `/dashboard`, `/club`, `/vouchers`, `/solo-coins` (all stay valid).
- [ ] Decide and document: does the analyzer redirect target stay `/economia/[billId]` (recommended — unchanged, lowest risk) or move under `/consumo`? **Recommended: keep `/economia/[billId]`** as the canonical bill-analysis URL; Consumo links to it. (Revisit only in Sprint 6+.)

### B5 — Sidebar regression test · Tier S

**Owns (create):** `src/frontend/app-sidebar.test.tsx`.

- [ ] Render `AppSidebar` for a `vendedor` user and assert the 4 section titles render (`Controle`, `Energia`, `Consumo`, `Solo Club`) and each expected sub-item label is present.
- [ ] Assert the mobile footer item set (mock `useIsMobile` → true) shows the 4 hubs + Suporte and **not** the old 9-item flat list.

**Done when:** the nav structure is locked by a test; removing a section fails it.

### Phase B — Definition of Done

- [x] **DoD-B1** — desktop client sidebar shows exactly 4 groups: Controle · Energia · Consumo · Solo Club; Suporte in the footer/utility area; Investor Demo gone from client nav. _(commit 8990383)_
- [x] **DoD-B2** — mobile footer shows the 4 hubs (+Suporte), not 9 cramped items. _(5 hub items via dual sections+items wiring; guarded by B5 test)_
- [x] **DoD-B3** — `/energia` and `/consumo` hubs exist and reach every sub-screen; all pre-existing screens still load and keep their data. _(commits c0792b9, ec60757; build manifest confirms routes)_
- [x] **DoD-B4** — no dead links; `/economia/[billId]` remains the canonical analysis URL; redirects documented. _(no routes retired; IA record §navigation_IA.md)_
- [x] **DoD-B5** — `app-sidebar.test.tsx` green; full economia suite still green; `tsc --noEmit` clean on owned files; `npm.cmd run build` clean. _(commit c09db73; 116 tests green; build exit 0)_

---

## Phase C — Analyzer fully integrated into Consumo

> Make the AI analyzer feel native to the **Consumo** section, not a bolt-on. Same engine (Phase A), now with a deliberate home, empty/onboarding states, and a clear "upload your bill" call from the Consumo hub.

**Wave order:** after B3b merges. C1 → C2 → C3.

### C1 — Analyzer entry inside the Consumo hub · Tier S

**Owns (modify):** `src/frontend/consumo/consumo-hub.tsx` (+ the Economia sub-area it hosts).

- [ ] The Consumo **Economia** sub-area is the analyzer home: bill list + both entries (`Adicionar fatura` manual, `Analisar conta (PDF)` AI) visible without extra clicks. The helper line `Tem o PDF da conta? Use "Analisar conta" para a IA preencher tudo.` shows here.
- [ ] After a successful upload, the existing redirect to `/economia/[billId]` stands; returning to Consumo refetches the bill list so the new bill appears.

### C2 — First-run / empty state for Consumo · Tier S

**Owns (modify):** `consumo-hub.tsx` Economia sub-area empty branch.

- [ ] When the client has **no bills yet**, show an intentional empty state (existing `Card` + copy) that points straight at `Analisar conta (PDF)`: e.g. `Ainda não analisamos nenhuma conta sua. Envie o PDF da sua conta de luz e a IA cuida do resto.` — never a blank panel or `R$ 0,00` noise.
- [ ] When bills exist, list them with the score/summary already used in `account-card.tsx`; each row links to `/economia/[billId]`.

### C3 — Integration test for the Consumo analyzer path · Tier M

**Owns (create):** `src/frontend/consumo/consumo-hub.test.tsx`.

- [ ] Renders the Consumo hub, mocks the bills hook: (a) with bills → list renders + `Analisar conta (PDF)` present; (b) empty → the empty-state copy + AI entry present.
- [ ] Guards that the analyzer is reachable from Consumo (the reachability lesson from Sprint 5 R1 — assert the path from the section, not just the leaf screen).

### Phase C — Definition of Done

- [x] **DoD-C1** — from `/consumo` a client reaches the bill list + both upload entries without leaving the section. _(AnalyzeBillDialog mounted on the hub; Economia card → /economia; commit ec60757)_
- [x] **DoD-C2** — a client with zero bills sees a deliberate empty state that drives them to AI upload. _(exact empty-state copy; no loading flash — bills null-init)_
- [x] **DoD-C3** — `consumo-hub.test.tsx` proves both states and the reachability of the analyzer from Consumo; suite + build + filtered typecheck clean. _(commit 1d3a765; 2/2 green)_

---

## 7. Out of Scope — parked, with the auto-pull decision recorded

Do **not** build these in Sprint 5.1 unless the PM re-scopes:

- **Automatic distributor bill-pull** (the "we pull the bill and analyze it for the client automatically" idea). **Decision: deferred to a Sprint 7 research spike.** Why it is not a build task now: Brazilian distributors (CEMIG, Enel, Neoenergia, etc.) expose no public bill API; fetching a client's bill requires either (a) RPA/headless-browser scraping of each distributor portal with the client's stored login (CAPTCHA, MFA, per-distributor brittleness, ToS/legal exposure) or (b) a paid third-party bill-aggregation vendor. Both need credentials storage, a scheduled fetch job, robust error handling, and a legal review. **Sprint 7 spike output:** a feasibility note — vendor shortlist vs. RPA, per-distributor coverage for Solo's actual client base, security/legal constraints, and a build/no-build recommendation. Until then, manual upload (Phase A/C) is the path.
- **Finish the OpenAI analyzer `extract()`/`analyze()`** — optional/best-effort in Sprint 5, parked in `todo.md`. Claude/Gemini are the completion path.
- **Optional `rawExtraction Json?` migration** — only if real-bill validation proves chat quality is blocked by missing raw JSON.
- **Async queue/BullMQ for large PDFs** — only if real bills time out on the synchronous two-call upload.
- **Repo-wide TypeScript cleanup** in non-Sprint-5 files and flipping `next.config.ts` `ignoreBuildErrors` to `false` — stays in `todo.md`.
- **Sprint 6 content** beyond the nav consolidation done here: multi-bill history/compare and contextual FAQ/education.

---

## 8. Final Documentation & Handoff (closes the sprint)

**Owns (modify):** `scripts/Planning/PM_SPRINT-HANDOFF.md`, `scripts/Planning/sprint_5_ai-analyzer_v1.md`, this file, and `scripts/Planning/billing.md` (rows only if missing).

- [ ] Tick Sprint 5 DoD-H6 / DoD-I4 only after A5 passes in production.
- [ ] Append a dated PM addendum:
  ```markdown
  ### Sprint 5.1 Addendum — Analyzer closure + nav consolidation
  - Phase A (closure): deployed yes/no · provider Claude/Gemini · real-bill smoke PASS/FAIL · POST-URL guarded by analyze-bill-dialog.test.tsx
  - Phase B (nav): client sidebar = Controle · Energia · Consumo · Solo Club (4 sections); /energia + /consumo hubs live; app-sidebar.test.tsx green
  - Phase C (integration): analyzer reachable from /consumo with empty-state onboarding
  - Typecheck: repo-wide cleanup parked in todo.md; Sprint-5/5.1 files clean
  - Auto-pull: deferred to Sprint 7 research spike
  - Final status: APPROVED / NOT APPROVED
  ```
- [ ] One `billing.md` row per executed task (`date · Sprint 5.1 · <task-id> · <agent/model> · <tier>`).

---

## Sprint 5.1 — Definition of Done (the contract)

**Phase A (analyzer closure):**
- [x] Phase H/I work committed; `/economia` has both entry points proven by `economia-screen.test.tsx`.
- [x] Dialog contract test proves `/client/energy-bills/upload` + `FormData`; prefix audit clean; economia suite + build pass.
- [x] Filtered typecheck: zero Sprint-5/5.1 errors; repo-wide errors parked in `todo.md`.
- [ ] VPS has `ANTHROPIC_API_KEY` or `BILL_ANALYZER_PROVIDER=gemini`; **real bill** → 200 → `/economia/[billId]` → dashboard + technical viewer + chat all work. **← HUMAN-ONLY deploy (A4/A5).**

**Phase B (navigation):**
- [x] Client sidebar consolidated to 4 sections (Controle · Energia · Consumo · Solo Club); Suporte in footer; mobile footer ≤5 hubs.
- [x] `/energia` + `/consumo` hubs reach every existing sub-screen with no data loss; no dead links; `app-sidebar.test.tsx` green.

**Phase C (integration):**
- [x] Analyzer is reachable and native inside `/consumo`, with a deliberate empty/onboarding state; `consumo-hub.test.tsx` green.

**Cross-cutting:**
- [x] Zero schema migrations. `npm.cmd run build` clean. Focused `vitest` suites green (18 files / 116 tests). `tsc --noEmit` clean on all owned files.
- [x] Whole-branch frontier-model review (opus) returned READY TO MERGE; minors fixed in commit 7aa5f42.
- [ ] PM handoff has the Sprint 5.1 addendum with deploy + smoke + nav evidence. **← completed by the human after A4/A5.**

**STATUS (2026-06-26):** All codeable work is complete, reviewed, and green on branch `sprint5.1/integration` (10 commits, 0f5eea4..7aa5f42). The navigation vision (Controle · Energia · Consumo · Solo Club) is **shipped in code**. The ONLY remaining gate is the human-only **A4 deploy + A5 real-bill smoke** on the VPS — after which Sprint 5 is "finished in production." Auto-pull remains a Sprint 7 research spike.

---

## A4/A5 — Human deploy + smoke checklist (the only steps Claude cannot run)

```bash
# 1. Ensure ONE provider env is set on the VPS:
#    ANTHROPIC_API_KEY=...   (default: claude)   OR   BILL_ANALYZER_PROVIDER=gemini
# 2. Deploy (no migrations — zero schema changes this sprint):
git checkout main && git merge --no-ff sprint5.1/integration   # or merge via PR
git pull origin main && npm ci && npx prisma generate && npm run build && pm2 restart solo-app
# 3. Smoke as a client with ≥1 consumer unit:
#    /consumo (or /economia) -> "Analisar conta (PDF)" -> pick a real bill PDF
#    EXPECT: POST /api/client/energy-bills/upload -> 200 (no /api/api/...) -> redirect /economia/<id>
#            dashboard + technical viewer render; chat answers "Por que minha conta ainda teve valor a pagar?"
# 4. Tick DoD-A5 + Sprint 5 DoD-H6/DoD-I4, and append the PM addendum.
```
