# Solo App — Backlog / Deferred Scope (parked out of Sprint 4)

> Source vision: `scripts/Planning/pré_sprint_4_controle_v1.md` (Brainstorm Sessions 1 & 2).
> Sprint 4 (`sprint_4_controle_v1.md`) deliberately ships **only** manual onboarding + cockpit correctness so Solo can migrate real clients now, without supplier/Enel automation.
> Everything below is **explicitly out of Sprint 4** — do NOT build it this sprint. Each item is a candidate for a future sprint; rough sizing and the vision section it came from are noted.

---

## 🎨 Brand / Navigation / IA

- [~] **Navigation rebrand to 5 sections** — Controle / Energia / Consumo / Solo Club / Suporte. **Sidebar grouping DONE in Sprint 5.1** (`app-sidebar.tsx` → 4 desktop sections + 5-item mobile footer; `/energia` + `/consumo` hubs; Investor Demo removed from client nav; see `PM_Sprint_Handoff.md`). **REMAINING:** the deep screen-level merges — fold `plants` + `generation` into ONE Energia screen and `consumption` + `rateio` + `economia` into ONE Consumo screen (today the hubs are light landing pages that LINK OUT to the existing standalone screens). _(L — Vision §2; the grouping is shipped, the screen merges are not)_
- [ ] **Dark "McLaren/Tesla" design-token pass** — expanded palette (`--solo-*`), JetBrains Mono for technical numbers, tighter display typography, purposeful glows. _(L — Vision §1)_
- [ ] **Animated Solo logo** that pulses when live data is flowing. _(S — Vision §4)_

## 💼 Controle → "Carteira de Energia" (cockpit redesign)

- [ ] **Energy Portfolio card** — assets/liabilities/cashflow/equity/health-score model (`EnergyPortfolio` interface in Vision Session 2 §1). _(L)_
- [ ] **Portfolio Wheel** — circular geração/consumo/excedente split viz. _(M)_
- [ ] **Interactive economy timeline** — month-by-month savings vs. "without solar", with annotation points. _(L — Vision §3.2)_
- [ ] **Activity feed** — bank-statement-style event log on the cockpit. _(M — Vision §3.4)_
- [ ] **"Modo Apresentação" / share screen** — full-screen referral card + public `solo.app/r/<slug>` page. _(L — Vision §3.3 / Session 2 §4.2)_
- [ ] **"Modo Investidor" toggle** (Simplificado ↔ Avançado) + "Terminal de Energia" per-inverter view. _(L — Session 2 §3)_

## ⚡ Generation / Energia

- [ ] **Real-time live generation** — replace the hardcoded `liveGenerationKw = 0` in the cockpit with real telemetry (WebSocket or SSE). _(L)_
- [ ] **Inverter status rings from real sync health** (green/yellow/red) + `test-sync` endpoint (Sprint 3.1 D2, deferred). _(M)_
- [ ] **Unified "virtual plant" view** — aggregate a client's multiple inverters/plants into one usina (the Airton 2-plant case). _(M)_

## 🔄 Consumo / Distribution / Rateio

- [ ] **Rateio automation bot ("Bot Enel")** — validate + submit rateio to the distributor, confirm application. _(XL — Session 2 §6.3)_
- [ ] **Distributor API integration** — Enel first, then Cemig/Light/CPFL/Neoenergia/Equatorial/Energisa/EDP: auto-pull bills, debts, credits. _(XL — Session 2 §6.2)_
- [ ] **Bill OCR / auto-analysis at scale** — processing queue (BullMQ + Redis) for incoming bills. _(L)_

## 💳 Payments

- [ ] **PIX one-click pay** from inside a bill card (copy code + confirm), incl. pay-with-Solo-Coins path. _(M — Vision Session 1 §3 / sprint 2 benchmark)_
- [ ] **Credit-card payment** via gateway partnership. _(M)_

## 🏆 Clube Solo / Gamification / Growth

- [ ] **Solo Coins value model + tiered referral** (Bronze/Prata/Ouro/Diamante). _(M — Session 2 §4.3)_
- [ ] **"Momentos" / notification engine with personality** (Bom Dia Solo, Conta Chegou, Vencimento, Conquista…). _(L — Session 2 §2)_
- [ ] **Weekly recap** ("Spotify Wrapped"-style energy summary). _(M)_
- [ ] **Goals & challenges** (economia target, 100% compensation, indique-5). _(M)_

## 🛠️ Admin "Operations Center"

- [ ] **Solo Operations Center dashboard** — alerts triage, clientes/usinas/tickets/relatórios counters, activity stream. _(L — Session 2 §5.1)_
- [ ] **"Modo Suporte"** — single-screen full client context when a ticket opens. _(M — Session 2 §5.2)_
- [ ] **Automated reports (GDASH-style)** — monthly geração/economia/saúde/indicações via email/WhatsApp/PDF. _(L — Session 2 §5.3)_

## 🧱 Platform / Infra

- [ ] **Feature-flag system** (Tesla-style: per-tenant, rollout %, beta). _(M — Vision §4)_
- [ ] **PWA + offline** — service worker, stale-while-revalidate cache, offline action queue, "dados de [data]" freshness indicator. _(L — Session 2 §8)_
- [ ] **Performance SLAs** — first load < 1s (SSR + streaming), instant nav (prefetch + cache). _(M — Vision §4)_
- [ ] **Multi-tenant / white-label** foundation for the B2C2B integrator play. _(XL — Vision §5.2, Cenário B)_

## 📦 Follow-ups from Sprint 6 (Consumo Unified — final review minors)

> Added 2026-06-28. Sprint 6 (Consumo unified tabs + history/compare + contextual FAQ + Solo Club hub) shipped; the Opus whole-branch review flagged these non-blocking minors.

- [ ] **`seed-consumo` (and `admin/faqs`) lack an explicit master-role check** — both use `AuthMiddleware.extractUserContext` (requires a valid JWT) but not `requireRole('master')`, so any authenticated user could POST the idempotent FAQ seed. Low risk (idempotent + safe default content). Add `AuthMiddleware.requireRole(request, 'master')` to close it (resolves the existing `// TODO: Explicit master role check` in `admin/faqs/route.ts` too). _(S)_
- [ ] **`/api/economia/bills` `?clientId=` fallback hardening** — `userContext.clientId ?? searchParams.get('clientId')` lets a `scope==='all'` caller without a JWT clientId scope to another client; `?year=all` widens the temporal window. Pre-existing, not a Sprint 6 regression. _(S)_
- [ ] **`referenceYear ?? year` → 0 group in `?year=all`** — a bill with null `referenceYear` lands in a "0" year group in BillHistory. Cosmetic; only on bad data. _(XS)_
- [ ] **Test infra: full parallel vitest hits collection timeouts** on the current machine (jsdom env setup 70-140s) — run suites in batches, or raise `testTimeout`/`hookTimeout` and reduce worker concurrency in `vitest.config`. Not a code defect. _(S)_

## 📦 Deferred out of Sprint 5.1 (AI Analyzer Closure + Nav Consolidation)

> Added 2026-06-26. Sprint 5.1 shipped the manual-upload analyzer + the 4-section nav (`Controle · Energia · Consumo · Solo Club`) to `main` (`369ea44`). The items below were explicitly NOT built and are parked. Plan: `sprint_5.1_ai-analyzer_v1.md`; handoff: `PM_Sprint_Handoff.md`.

### 🔌 Auto-pull (the big one — promote as **Sprint 7 research spike**)
- [ ] **Auto-pull bills + auto-analyze for the client** — instead of the client uploading the PDF, fetch their bill automatically and run the AI analysis for them. **Blocked product/tech decision:** Brazilian distributors have no public bill API → needs either per-distributor RPA/headless-browser scraping with the client's stored portal login (CAPTCHA/MFA/ToS/legal exposure) OR a paid 3rd-party bill-aggregation vendor. **Spike output:** vendor shortlist vs. RPA, per-distributor coverage for Solo's real client base, security/legal constraints, build/no-build recommendation. _(XL — supersedes/overlaps the "Distributor API integration" + "Bot Enel" + "Bill OCR at scale" items above; this is their concrete near-term framing)_

### 🤖 Analyzer hardening (post-MVP)
- [ ] **OpenAI analyzer `extract()`/`analyze()`** — currently stubbed/best-effort; Claude + Gemini are the supported providers. Finish only if a third provider is needed. _(M)_
- [ ] **Optional `rawExtraction Json?` column** — only if real-bill validation proves chat quality is blocked by missing raw JSON (hand-authored migration + PM sign-off). _(S, conditional)_
- [ ] **Async PDF queue (BullMQ + Redis)** — the upload route runs two AI calls synchronously (10–40s); fine for v1 with the processing state. Build only if real bills time out on serverless/proxy. _(L — overlaps "Bill OCR at scale" above)_

### 🧭 Navigation depth (beyond the shipped grouping)
- [ ] **Energia / Consumo screen-level merges** — see the `[~]` nav item above: today the hubs LINK OUT; the deeper UX merges plants+generation and consumption+rateio+economia into unified screens. _(L)_
- [ ] **Dedicated Solo Club hub** — Energia/Consumo got hub landing pages; Solo Club's mobile entry points straight to `/club`, relying on that screen's internal links to reach `/vouchers` + `/solo-coins`. Works today; a symmetric `/solo-club` hub would be cleaner. _(S)_
- [ ] **`ConsumptionDashboard` header copy** — its hardcoded header reads "Economia e Consumo"; the `/consumo/historico` loader title says "Histórico de consumo". Cosmetic mismatch to reconcile when that screen is next touched. _(XS)_

### 🧹 Type-safety repo-wide cleanup (parked since Phase G/I)
- [ ] **Clear the 8 pre-existing non-sprint `tsc --noEmit` errors** then flip `next.config.ts` `typescript.ignoreBuildErrors` to `false`. Files: `api/admin/clients/[id]/plants/route.ts`, `…/plants/[plantId]/route.ts`, `backend/generation/__tests__/solis.inverter-api.repository.test.ts`, `…/sync-inverter-generation-data.use-case.test.ts`, `frontend/admin/components/bill-validation-queue.tsx`, `frontend/admin/components/client-details.tsx`, `frontend/rateio/rateio-screen.tsx`, `lib/object-storage.ts`. _(M — dedicated cleanup sprint; do NOT bundle into a feature sprint)_

## ❓ Open product questions (decide before the relevant sprint)

- [ ] Pricing model — who pays (integrator SaaS? client freemium?), how much, how. _(Vision §5.4 / Session 2 §10.2)_
- [ ] First distributor to integrate (Enel assumed) + rateio-without-Enel-partnership viability. _(Session 2 §10.2)_
- [ ] Solo Coins: real R$ value vs. discount-only (accounting impact). _(Session 2 §10.2)_
- [ ] PWA vs. native for v2. _(Vision §5.4)_
- [ ] WebSocket vs. SSE for live data. _(Session 2 §10.1)_

---

_Pulled from the Sprint 4 brainstorm so nothing from the vision is lost. Promote an item into a sprint file when it's next; keep this list as the running product backlog._
