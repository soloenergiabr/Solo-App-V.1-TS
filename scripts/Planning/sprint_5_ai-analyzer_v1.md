# Sprint 5 — Analisador: Merge the AI Bill Analyzer

> **PM owner:** Claude (Opus) — author of this plan; light-touch merger as tasks land + runner of the single end-of-sprint review (Phase E). No per-task/per-wave approval stops, except the one 🔴 architecture gate (A1).
> **Source app being merged:** the standalone **"Solo Energia — Analisador de Contas"** Lovable app at `C:\Users\mateus\OneDrive\Desktop\MSM\Solo Energia - Analisador de Contas (APP)\solar-bill-clarity` (Vite + React + Supabase). We **port the logic, not the platform** (see §3).
> **Workflow:** `scripts/Planning/agent_workflow.md` (multi-agent swarm). Branch isolation, file ownership, tier routing, and the structured HANDOFF block all apply.
> **Engineers:** junior model (**deepseek-flash**) for S/M/L FE + glue; the **A1 architecture task is tier L and PM-approved** (it can run on a stronger model). Every FE brief is prescriptive (exact files, exact components, exact props, exact Portuguese copy, exact states). Engineers must NOT invent new UI components, tokens, or layouts.
> **This is sprint 1 of 2.** Sprint 5 = merge the analyzer (engine + rich results dashboard + chat + raw-data viewer) into the **existing** economia screen. Sprint 6 (next) = the "Consumo" navigation consolidation (consumption + rateio + economia → one section) + multi-bill history/compare + contextual FAQ/educational. **Do not build Sprint 6 scope here.**

---

## 0. Context — Why This Sprint Exists

Solo already has a **weak** bill analyzer in the main app: `src/backend/economia/analyzer/gemini-bill-analyzer.ts` (single-provider Gemini 2.5 Flash, a thin extraction prompt) wired into the client upload route. It extracts flat fields but **never runs the AI analysis step** (the upload route only calls `extract()`, never `analyze()`), so client-uploaded bills land with `aiAnalysis = null`, no line-by-line breakdown, no "minimum-obligatory vs. what you paid" clarity, and no chat.

The standalone **"Analisador de Contas"** does this *far* better:
- **Dual-provider OCR** (Gemini 3 Flash primary + GPT-4o fallback) with a rich ~1,500-line extraction prompt — line-by-line billing table, SCEE solar-credit summary, all taxes, services/installments.
- A **"clarifier" results dashboard**: bill-score gauge, cost-composition pie + detail, solar-energy flow card, system-status (is your array big enough?), action/expansion card, alerts, and an expandable **raw technical-data viewer** with a glossary.
- A **bill chat** ("ask anything about this bill") that streams answers grounded in the extracted data.

**Primary outcome of Sprint 5:** a client uploads a bill in the existing **economia** screen and immediately gets the **full rich analysis + chat**, powered by a **provider-agnostic** analyzer the owner can switch (Claude / Gemini / OpenAI) with one env var — **with zero schema migrations**.

### What already exists in the main app (do NOT rebuild)

- **EnergyBill model** (`prisma/schema.prisma`) — already carries every field the rich extraction needs, including JSON columns `billingItems`, `creditSummary`, `extraCharges`, `alerts`, `aiExplanations`, `aiRecommendations`, plus `billScore`, `aiAnalysis`, and all cost/tax/tariff/SCEE-ish numeric fields. **No new columns are needed.**
- **Client upload route** `src/app/api/client/energy-bills/upload/route.ts` — uploads the PDF to object storage, runs the analyzer, upserts the `EnergyBill`. We rewire it (B1), we do not rebuild it.
- **Analyzer module** `src/backend/economia/analyzer/**` — `types.ts`, `gemini-bill-analyzer.ts`, `deterministic-flags.ts`, `parsers.ts`, `index.ts`. We refactor it into a provider abstraction (A1) and upgrade the prompt (A2).
- **Bill detail screen** `src/frontend/economia/analysis/bill-analysis-screen.tsx` (mounted at `(private)/@user/economia/[billId]/page.tsx`, fed by `GET /api/economia/bills/[billId]`) — already shows a score ring, AI summary, explanations, alerts, recommendations. We **compose the new clarifier cards into this screen** (C2), we do not replace it.
- **Design system**: `src/components/ui/*`, `src/frontend/telemetry-kit` (`formatBRL`, `formatKwh`, `formatKw`, `CopyPixButton`), `recharts@2.15.4` (already installed). Reuse these only.

### Hard environment constraint (unchanged)

There is **no local Docker / Postgres**. Production Postgres lives on the VPS. **Never run `prisma migrate dev`.** **This sprint is designed to need ZERO schema migrations** (§3). If you believe you need one, **STOP and flag the PM** — you are almost certainly wrong (use the existing JSON columns).

---

## 1. Execution Rules (same as Sprint 4)

1. **Read the file before editing it.** Read every file in your ownership list and its imports first. For tasks that port a standalone component, **read the standalone source file first** (path given in the brief).
2. **One isolated branch per task:** `<agent>/sprint5/<task-id>/<short-desc>` (e.g. `junior/sprint5/A1/provider-abstraction`). Never edit `main`.
3. **Only edit the files your task owns** (ownership table per task). If another file looks wrong, **flag the PM** — do not refactor out of scope.
4. **Preserve existing behavior** unless the task explicitly changes it. The existing Gemini path must keep working after A1.
5. **TDD for all backend math / parsing / provider routing**: write the failing test first, watch it fail, implement, watch it pass.
6. **Verify before handoff** (all must pass on your branch):
   ```bash
   npm.cmd run build
   npx.cmd vitest run <focused path for your task>
   npx.cmd prisma generate    # OK — no DB needed. NEVER run prisma migrate dev.
   ```
7. **Run autonomously — no per-task or per-wave approval stop**, EXCEPT the single 🔴 architecture gate **A1**: post a 5-line plan (files + the `BillAnalyzerProvider` interface signature + the factory env switch) and get PM approval **before coding**. Everything else: build it straight through.
8. **When the task touches Claude / the Anthropic SDK (A1 Claude provider, B2 chat), invoke the `claude-api` skill first** to get current model IDs, the vision/PDF document-block shape, and the streaming API right. Do not code Anthropic calls from memory.
9. Post the structured **HANDOFF block** (`agent_workflow.md` §6) and add **one billing row** to `scripts/Planning/billing.md`. The deep review happens once, at the end (Phase E).

---

## 2. Scope

### ✅ In scope (this sprint)

- **Provider-agnostic analyzer**: a `BillAnalyzerProvider` interface + a factory selected by `BILL_ANALYZER_PROVIDER` env var. Implementations: **Claude** (new, default), **Gemini** (refactor existing), **OpenAI** (optional/best-effort).
- **Rich extraction + analysis**: port the standalone's extraction schema/prompt and the analysis prompt; run **both** `extract()` and `analyze()` on upload; persist the line-by-line table, SCEE summary, and extra charges into existing JSON columns.
- **Clarifier results dashboard**: port the clarifier cards (cost pie, cost composition, solar-energy flow, system status, action/expansion, alerts) into the existing bill-analysis screen, plus the expandable **raw technical-data viewer**.
- **Bill chat**: a streaming, scope-enforced chat API route + a chat drawer UI on the bill-analysis screen, provider-agnostic.

### ❌ Out of scope (do NOT build — Sprint 6 or parked in `todo.md`)

- The **lead magnet**: lead-capture form, freemium banner, CRM trigger (`trigger-crm`), proposal generator, public no-login funnel, the `wa.me` "sell expansion" sales link. **Strip all of it.** The expansion *insight* stays (C2) but its CTA routes to **Suporte** internally.
- The **"Consumo" navigation consolidation** (merging consumption + rateio + economia), **multi-bill history/compare**, and **contextual FAQ/educational** surfaces — all Sprint 6.
- Multi-property model, Supabase auth/storage, the standalone's own `bill_analyses`/`bill_raw_data` tables (we use `EnergyBill`).
- Any schema migration.

---

## 3. Architecture & Data-Model Decisions (locked — read before coding)

### 3.1 Port the logic, not the platform

The standalone is Supabase (edge functions + `bill_analyses`/`bill_raw_data` tables + Supabase storage + Supabase auth). **None of that moves.** Mapping:

| Standalone (Supabase) | Main app (this sprint) |
| --- | --- |
| edge fn `analyze-bill` | logic inside the analyzer providers (A1/A2) + the upload route (B1) |
| edge fn `bill-chat` | `POST /api/economia/bills/[billId]/chat` (B2) |
| tables `bill_analyses` + `bill_raw_data` | the existing **`EnergyBill`** row (+ its JSON columns) |
| Supabase storage signed URLs | existing `uploadObject` / `object-storage` (already used by the upload route) |
| Lovable AI gateway (Gemini 3) / OpenAI | the **provider abstraction** (A1), default **Claude** |
| client-side `pdfToImages` | not needed — providers accept the PDF buffer directly (Claude PDF doc block, Gemini `inlineData`). OpenAI image fallback is best-effort/deferred. |

### 3.2 Provider-agnostic analyzer (ZERO migration)

A single interface, three implementations, one factory switched by env. Put the interface + `ChatMessage` type in `analyzer/types.ts`:

```ts
export interface ChatMessage { role: 'user' | 'assistant'; content: string }

export interface BillAnalyzerProvider {
  readonly name: 'claude' | 'gemini' | 'openai'
  extract(input: { buffer: Buffer; mimeType: string }): Promise<RawBillData>
  analyze(input: { raw: RawBillData; flags: DeterministicBillFlags }): Promise<SpecialistAnalysis>
  // Streaming chat: returns a web ReadableStream of UTF-8 text chunks (plain text deltas).
  chat(input: { system: string; messages: ChatMessage[] }): Promise<ReadableStream<Uint8Array>>
}
```

Factory (`analyzer/factory.ts`):

```ts
export function getBillAnalyzer(): BillAnalyzerProvider {
  const provider = (process.env.BILL_ANALYZER_PROVIDER ?? 'claude').toLowerCase()
  switch (provider) {
    case 'gemini': return createGeminiBillAnalyzer()
    case 'openai': return createOpenAIBillAnalyzer()
    case 'claude':
    default:       return createClaudeBillAnalyzer()
  }
}
```

- **Default = `claude`**, model from `BILL_ANALYZER_CLAUDE_MODEL` (default **`claude-sonnet-4-6`** — vision-capable, good cost/latency for OCR; the owner can switch to Opus/Haiku via env).
- Existing `createGeminiBillAnalyzer()` is **refactored to satisfy the interface** (add `name` + `chat()`), not deleted — `BILL_ANALYZER_PROVIDER=gemini` must keep the current behavior working.
- `index.ts` re-exports `getBillAnalyzer`, the interface types, and keeps `computeDeterministicFlags`.

### 3.3 Rich extraction → existing JSON columns (ZERO migration)

Extend the existing `RawBillData` and `EXTRACTION_PROMPT` to capture the standalone's richer shape (read `solar-bill-clarity/supabase/functions/analyze-bill/index.ts` lines 23–160 for the full field list). The three nested structures map into existing `EnergyBill` JSON columns — **no new columns**:

| Rich extraction structure | EnergyBill column |
| --- | --- |
| line-by-line `billing_table_items[]` (description, quantity_kwh, unit_price, total_value, icms_*, is_credit) | `billingItems` (Json) |
| SCEE `{ injected_kwh, used_kwh, balance_kwh, expiring_kwh }` | `creditSummary` (Json) |
| `service_items[]` + `installment_items[]` merged to `[{description, value, type, remaining_installments?}]` | `extraCharges` (Json) |
| `aiAnalysis`, `aiExplanations`, `aiRecommendations`, `alerts`, `billScore` (from `analyze()`) | same-named columns |

> If — and only if — chat quality demands the *entire* raw JSON, an **optional** `rawExtraction Json?` column would help. **Default: do NOT add it.** Chat (B2) builds context from the columns above, which is enough. Adding it requires a hand-authored migration and PM sign-off — flag first.

### 3.4 Clarifier math = one pure tested function (no AI)

The standalone computes its dashboard numbers **client-side, deterministically** (`AnalysisResult.tsx` → `calculateClarifierResult`). Port that to a pure shared function `computeClarifier(input)` (A3) with unit tests, so the dashboard (C2) is dumb/presentational:

- `minimumPossible = availabilityCost + publicLightingCost + extraChargesTotal`
- `uncompensatedCost = max(0, totalPaid − minimumPossible)`
- `geracaoNecessaria = max(0, billedConsumption − compensated)`; `systemStatus = adequate | slightly_below | below_needed` (≥, ≥80%, else)
- `extraGenerationNeeded`, `expansionKwp = needed/150`, `expansionModules = ceil(kwp/0.4)`
  (mirror the exact constants in the source).

### 3.5 Strip the lead magnet, keep the insight

No CRM trigger, no lead form, no freemium banner, no `wa.me` sales link. The **ActionCard** (expansion recommendation) is kept as client guidance, but its CTA is **"Falar com a Solo"** routing to the in-app **/support** screen — not an external WhatsApp sales funnel.

---

## 4. Task Table

| ID  | Tier | Critical? | Title | Wave |
| --- | ---- | --------- | ----- | ---- |
| A1  | L    | 🔴 architecture | Provider-agnostic analyzer: interface + factory + Claude provider + Gemini refactor (+ OpenAI stub) | A |
| A2  | M    | —        | Rich extraction & analysis prompts + `RawBillData` extension + JSON mapping helper | A |
| A3  | M    | —        | `computeClarifier()` pure function + tests | A |
| B1  | M    | —        | Rewire client upload route: factory + extract→analyze→persist (incl. JSON columns) | B |
| B2  | M    | 🔴 scope boundary | Bill chat API route (streaming, provider-agnostic, scope-enforced) | B |
| C1  | S    | —        | Extend bill-detail API + `BillDetail` type with clarifier fields | C |
| C2  | L    | —        | Clarifier dashboard cards composed into `bill-analysis-screen` | C |
| C3  | M    | —        | Raw technical-data viewer (SCEE + line-by-line table + taxes, with glossary) | C |
| C4  | L    | —        | Bill chat drawer UI (FAB + drawer + streaming render) | C |

> **Cost rule:** A1 may run on a stronger model (architecture, PM-approved). Everything else routes to the junior and runs autonomously.
> **🔴 A1** is the one pre-coding approval gate. **🔴 B2** is the client→server boundary (chat must enforce that the caller owns the bill) — guarded by its required negative test, not a manual stop.

---

## 5. Wave Map

```
Wave A  (backend foundation, parallel — disjoint files)   A1 · A2 · A3
   │
Wave B  (backend routes — needs A1, A2; B2 needs A1)      B1 · B2
   │
Wave C  (frontend — C1 first, then the rest)              C1 → (C2 · C3 · C4)
   │
Phase E (end-of-sprint, frontier model)                   E1 backend review · E2 frontend refinement
```

- **Wave A** is parallel. To keep file ownership disjoint, **A1 owns all of `types.ts`** (provider interface + the `RawBillData` extension A2 needs). If A2's `RawBillData` additions are small, fold them into A1's brief; otherwise **PM runs A1 → A2 sequentially** (A1 first). A3 owns only `src/shared/economia/*` and never touches `types.ts`.
- **Wave B**: B1 and B2 own different routes (no shared file). Both need A1's factory + A2's prompts.
- **Wave C**: **C1 runs first** (widens the API payload the cards consume). Then C2/C3/C4. **C2 owns `bill-analysis-screen.tsx`** and the `clarifier/` folder and leaves two commented mount slots; **C3** and **C4** each deliver a self-contained component and add only their single mount line into C2's slots. **PM merges C2 before C3/C4** to avoid the shared-file conflict.

---

## 6. Task Briefs

### A1 — Provider-agnostic analyzer · Tier L · 🔴 PM-approved before coding — ✅ DONE & reviewed (see §9)

**Goal:** one `BillAnalyzerProvider` interface, a factory switched by `BILL_ANALYZER_PROVIDER`, a new **Claude** provider (default), the existing **Gemini** provider refactored to fit, and an **OpenAI** stub. Existing Gemini behavior must keep working.

**Pre-code gate (🔴):** post a 5-line plan — the interface signature (§3.2), the factory switch, the file list, the Claude model/env-var choice, and how you keep the Gemini path green — and get PM approval.

**Owns:**
- `src/backend/economia/analyzer/types.ts` (modify — add `ChatMessage` + `BillAnalyzerProvider` per §3.2, and the `RawBillData` rich fields from A2 if folded in).
- `src/backend/economia/analyzer/claude-bill-analyzer.ts` (new) — `createClaudeBillAnalyzer(): BillAnalyzerProvider` using `@anthropic-ai/sdk`. PDF via a document content block (or image block), JSON-only responses parsed with `cleanJsonText`. `chat()` returns a `ReadableStream` of text deltas from `anthropic.messages.stream`.
- `src/backend/economia/analyzer/gemini-bill-analyzer.ts` (modify — add `name: 'gemini'` and a `chat()` impl via the Gemini SDK streaming; keep `extract`/`analyze` behavior).
- `src/backend/economia/analyzer/openai-bill-analyzer.ts` (new — `createOpenAIBillAnalyzer()`; `extract`/`analyze` may throw `AnalyzerError('OpenAI provider not yet supported for PDF')` for now, but `chat()` should work via the installed `openai` SDK. Best-effort; not on the critical path).
- `src/backend/economia/analyzer/factory.ts` (new — `getBillAnalyzer()` per §3.2).
- `src/backend/economia/analyzer/index.ts` (modify — export `getBillAnalyzer`, the new types; keep `computeDeterministicFlags`, `createGeminiBillAnalyzer`).
- `src/backend/economia/analyzer/__tests__/factory.test.ts` (new).
- `package.json` (modify — add `@anthropic-ai/sdk`).

**Steps (TDD):**
- [ ] **Invoke the `claude-api` skill** to confirm the model id (`claude-sonnet-4-6`), the messages vision/PDF document-block shape, and the streaming API.
- [ ] Write failing tests: `getBillAnalyzer()` returns the Claude provider by default; `BILL_ANALYZER_PROVIDER=gemini` returns the Gemini provider; `=openai` returns the OpenAI provider; each provider exposes `name`, `extract`, `analyze`, `chat`. Mock the SDKs.
- [ ] Run → fail. Implement interface + factory + providers. Run → pass.
- [ ] Add `@anthropic-ai/sdk`; document `ANTHROPIC_API_KEY` + `BILL_ANALYZER_PROVIDER` + `BILL_ANALYZER_CLAUDE_MODEL` in `.env.example` (append, don't reorder).
- [ ] `npm.cmd run build` clean. Commit.

**Done when:** factory switches providers by env; Claude is the default and really calls Anthropic; Gemini path unchanged when selected; build + focused tests pass. **No schema migration.**

---

### A2 — Rich extraction & analysis prompts + mapping · Tier M — ✅ DONE & reviewed (see §9)

**Goal:** upgrade extraction to the standalone's rich schema and make `analyze()` produce the executive summary / explanations / recommendations / alerts; provide a mapping helper that fills `billingItems` / `creditSummary` / `extraCharges`.

**Read first:** `solar-bill-clarity/supabase/functions/analyze-bill/index.ts` (the `RawBillData` interface lines 23–160 and the prompt body) and `solar-bill-clarity/supabase/functions/bill-chat/index.ts` (for the analysis tone/glossary).

**Owns:**
- `src/backend/economia/analyzer/prompts.ts` (new) — export `EXTRACTION_PROMPT` (rich, JSON-only, pt-BR) and `buildAnalysisPrompt(raw, flags)`. Move the prompt strings here out of `gemini-bill-analyzer.ts` (coordinate with A1: providers import from `prompts.ts`).
- `src/backend/economia/analyzer/types.ts` → the **`RawBillData` interface only**: add the nested fields (`billingItems` typed line-items, `creditSummary` SCEE shape, `extraCharges` typed). *(Ownership: A1 owns the provider-interface additions in this file. If two tasks editing one file is unacceptable, the PM folds these `RawBillData` additions into A1 and A2 imports them.)*
- `src/backend/economia/analyzer/mapping.ts` (new) — `mapRawToBillJson(raw)` returning `{ billingItems, creditSummary, extraCharges }` ready for Prisma `Json` (use `Prisma.JsonNull` when empty), merging `service_items` + `installment_items` into `extraCharges` with a `type` tag.
- `src/backend/economia/analyzer/__tests__/mapping.test.ts` (new).

**Steps (TDD):**
- [ ] Failing test: given a raw object with two `billing_table_items`, an SCEE summary, one service + one installment item → `mapRawToBillJson` returns the three JSON blobs with correct shapes and `extraCharges` length 2 (tagged `service`/`installment`).
- [ ] Run → fail. Implement prompts + mapping. Run → pass.
- [ ] `npm.cmd run build` clean. Commit.

**Done when:** rich prompt in place; `analyze()` prompt yields summary/explanations/recommendations/alerts; mapping fills the three JSON columns; tests pass.

---

### A3 — `computeClarifier()` pure function · Tier M — ✅ DONE & reviewed (see §9)

**Goal:** the deterministic dashboard math as one pure, tested function (§3.4).

**Read first:** `solar-bill-clarity/src/pages/AnalysisResult.tsx` → `calculateClarifierResult` (lines ~194–245) and its `ClarifierResult` interface (lines ~115–132).

**Owns:**
- `src/shared/economia/clarifier.ts` (new) — `export interface ClarifierResult {…}` and `export function computeClarifier(input): ClarifierResult`. Pure, no AI, no Prisma; input is a plain object of the numeric fields (totalPaid, availabilityCost, publicLightingCost, extraCharges[], monitoredGenerationKwh, injectedEnergyKwh, compensatedEnergyKwh, currentCreditsKwh, billedConsumptionKwh, expectedGenerationKwh, connectionType, otherCharges).
- `src/shared/economia/__tests__/clarifier.test.ts` (new).

**Steps (TDD):**
- [ ] Failing tests mirroring the source math: (a) totalPaid 200, availability 50, CIP 20, no extras → minimumPossible 70, uncompensated 130; (b) generated ≥ needed → `adequate`; (c) generated between 80–100% of needed → `slightly_below`; (d) below 80% → `below_needed` with `extraGenerationNeeded`/`expansionKwp`/`expansionModules` computed; (e) extraCharges itemized sum used over `otherCharges` fallback.
- [ ] Run → fail. Implement. Run → pass. Build clean. Commit.

**Done when:** function matches the source math exactly; tests pass; reused by C2 (no math in the component).

---

### B1 — Rewire client upload route · Tier M

**Goal:** the upload route uses the factory, runs **extract → flags → analyze → map**, and persists the full analysis incl. JSON columns. (Admin manual entry is untouched.)

**Owns:** `src/app/api/client/energy-bills/upload/route.ts` (modify) + `src/app/api/client/__tests__/bill-upload-analysis.test.ts` (new).

**Steps:**
- [ ] Read the current route. Replace `createGeminiBillAnalyzer()` with `getBillAnalyzer()` (A1).
- [ ] After `extract()` + `computeDeterministicFlags()`, call `analyzer.analyze({ raw, flags })` and merge its `aiAnalysis/aiExplanations/aiRecommendations/alerts/billScore/estimatedSavings` into `billData` (analyze wins over the extraction placeholders).
- [ ] Use `mapRawToBillJson(raw)` (A2) for `billingItems`/`creditSummary`/`extraCharges`.
- [ ] Keep status `'draft'`, keep the existing upsert key, keep the `BILL_UPLOADED` event.
- [ ] Test (mock the analyzer factory): upload persists a bill with non-null `aiAnalysis`, populated `billingItems`, and `estimatedSavings` set. Build clean. Commit.

**Done when:** a client upload yields a fully analyzed bill (summary + line items + savings), provider-agnostic; tests pass.

---

### B2 — Bill chat API route · Tier M · 🔴 scope boundary (test guards it)

**Goal:** `POST /api/economia/bills/[billId]/chat` streams a grounded answer; only the bill's owner can call it.

**Read first:** `solar-bill-clarity/supabase/functions/bill-chat/index.ts` (the system-prompt builder + glossary) and `src/app/api/economia/bills/[billId]/route.ts` (copy its **exact scope-enforcement** via `resolveAccessibleUnitIds`).

**Owns:**
- `src/app/api/economia/bills/[billId]/chat/route.ts` (new `POST`) — `AuthMiddleware.requireAuth`; load the bill; **enforce the same payer/titular scope as the detail route** (reject foreign bills 401); build the pt-BR system prompt from the bill's columns (port the standalone's prompt + concept glossary); call `getBillAnalyzer().chat({ system, messages })`; return the `ReadableStream` as the response body (`Content-Type: text/plain; charset=utf-8`).
- `src/backend/economia/analyzer/chat-prompt.ts` (new) — `buildChatSystemPrompt(bill)` pure builder + its test.
- `src/app/api/economia/bills/[billId]/__tests__/chat-route.test.ts` (new).

**Steps:**
- [ ] Failing tests: (a) owner POST → 200 and `getBillAnalyzer().chat` called with a system prompt containing the bill's distributor + total; (b) **foreign-bill POST → 401** and `chat` NOT called; (c) `buildChatSystemPrompt` includes minimum-possible and solar figures.
- [ ] Run → fail. Implement. Run → pass. Build clean. Commit.

**Done when:** owner can chat (streamed) about their bill; foreign access is rejected; provider-agnostic; tests pass.

---

### FE GUARDRAILS (apply to C2, C3, C4 — read before any FE task)

deepseek-flash is weak at front-end. Every FE task MUST:
1. **Compose existing primitives only** — `src/components/ui/*` (`Card`, `Alert`, `Badge`, `Button`, `Collapsible`, `Skeleton`, `Sheet`/`Drawer`, `Input`) + `src/frontend/telemetry-kit` (`formatBRL`, `formatKwh`, `formatKw`). For the pie chart, use **`recharts`** (already installed; mirror `consumption-chart.tsx`'s import style). **Do NOT copy the standalone's Tailwind/tokens/`framer-motion` verbatim** — the standalone has its own design system. **Port the layout intent + the data, re-rendered with our primitives.**
2. **Read the standalone source named in the brief first** (for logic/props/labels), then re-implement in our system.
3. **Implement all four states**: loading (`Skeleton`), empty, error (`Alert variant="destructive"`), success.
4. **Use the exact Portuguese copy** in the brief (accents included).
5. **No business math in components** — consume `computeClarifier()` (A3) and the API payload (C1).
6. **No new colors/tokens.** Use existing `Badge`/`Alert` variants and `text-success`/`text-destructive`/`text-muted-foreground`.
7. **No approval stop** — build straight through; include one screenshot in the HANDOFF block for Phase E.

---

### C1 — Extend bill-detail API + `BillDetail` type · Tier S

**Goal:** the detail payload carries the fields the clarifier dashboard + raw viewer need.

**Owns:** `src/app/api/economia/bills/[billId]/route.ts` (modify the `data` object) + `src/frontend/economia/analysis/types.ts` (modify `BillDetail`).

**Add to both** (numbers via `Number(... ?? 0)`, nullable strings as-is): `totalAmount`, `availabilityCost`, `publicLightingCost`, `monitoredGenerationKwh`, `injectedEnergyKwh`, `compensatedEnergyKwh`, `currentCreditsKwh`, `previousCreditsKwh`, `billedConsumptionKwh`, `expectedGenerationKwh`, `generationEfficiency`, `icmsCost`, `pisCofinsCost`, `tariffFlag`, `fineAmount`, `otherCharges`, `connectionType`, `consumerClass`, `tariffPeriod`, `readingPeriodFrom`, `readingPeriodTo`, `extraCharges` (Json). Keep the already-present `billingItems`/`creditSummary`/`billScore`. Keep scope enforcement unchanged.

**Done when:** the detail endpoint returns every field C2/C3 read; type compiles; existing behavior intact; build clean.

---

### C2 — Clarifier dashboard cards · Tier L

**Goal:** compose the rich results dashboard into the existing `bill-analysis-screen.tsx`, fed by `computeClarifier()` + the C1 payload.

**Read first:** `solar-bill-clarity/src/pages/AnalysisResult.tsx` (composition order, lines ~480–668) and `solar-bill-clarity/src/components/clarifier/*` (`CostPieChart`, `CostCompositionCard`, `SolarEnergyCard`, `SystemStatusCard`, `ActionCard`, `BillScoreGauge`). **Re-implement with our primitives.**

**Owns (create):** `src/frontend/economia/analysis/clarifier/cost-pie-chart.tsx`, `cost-composition-card.tsx`, `solar-energy-card.tsx`, `system-status-card.tsx`, `action-card.tsx`; **(modify)** `src/frontend/economia/analysis/bill-analysis-screen.tsx` to call `computeClarifier(bill)` and render: hero (reuse existing `BillScoreRing` + "Você pagou" / "Mínimo obrigatório" tiles) → `CostPieChart` → `CostCompositionCard` → `SolarEnergyCard` → `SystemStatusCard` → existing AI summary/alerts/recs → `ActionCard`. Leave two clearly-commented mount slots: `{/* C3: technical data */}` and `{/* C4: chat FAB */}`.

**Copy (exact):** tiles `Você pagou` / `Mínimo obrigatório`; the solar highlight `Solar compensou tudo que podia`; `SystemStatusCard` labels `Sistema adequado` / `Ligeiramente abaixo` / `Abaixo do necessário`; `ActionCard` CTA **`Falar com a Solo`** linking to `/support` (NOT WhatsApp). Reuse `formatBRL`/`formatKwh`.

**Done when:** the bill screen shows the full clarifier dashboard from real data; math comes only from `computeClarifier`; four states handled; build clean (polish in Phase E).

---

### C3 — Raw technical-data viewer · Tier M

**Goal:** an expandable "Dados Técnicos da Fatura" section: general info, **SCEE credit summary**, **line-by-line billing table with glossary tooltips**, taxes & efficiency.

**Read first:** `solar-bill-clarity/src/pages/AnalysisResult.tsx` lines ~670–814 (the Collapsible block, the SCEE grid, the billing-table glossary map, the taxes grid).

**Owns (create):** `src/frontend/economia/analysis/technical-data-viewer.tsx` — a self-contained `<TechnicalDataViewer bill={bill} />` using `Collapsible` + `Card`. Port the glossary `Record<string,string>` and the line-item rendering (credit rows styled with `text-success`). C2 mounts it at the `{/* C3 */}` slot (C3 adds the single import+mount line into C2's file *after* C2 merges — or hands the line to the PM).

**Copy (exact):** section header `Dados Técnicos da Fatura`; subsections `Informações gerais`, `Saldo SCEE — Sistema de Compensação`, `Tabela de faturamento linha a linha`, `Tributos e eficiência`. Keep the SCEE explainer + CONFAZ/ICMS note paragraphs.

**Done when:** all extracted detail (SCEE, line items + tips, taxes) renders; collapsed by default; empty-safe (sections hide when their data is null); build clean.

---

### C4 — Bill chat drawer · Tier L

**Goal:** a floating "Perguntar sobre esta conta" entry that opens a drawer and streams answers from B2.

**Read first:** `solar-bill-clarity/src/components/chat/*` (`BillChatDrawer`, `ChatInput`, `ChatMessage`, `FAQSuggestions`). Re-implement with our `Drawer`/`Sheet` + `Input` + `Button`.

**Owns (create):** `src/frontend/economia/analysis/chat/bill-chat-drawer.tsx` (+ small `chat-message.tsx`, `chat-input.tsx` if helpful). C2 leaves the `{/* C4: chat FAB */}` slot; C4 mounts `<BillChatDrawer billId={bill.id} distributor={bill.distributor} referenceMonth={…} referenceYear={…} />` there (single line).

**Behavior:** POST `messages[]` to `/api/economia/bills/{billId}/chat`, read the response body as a stream, append assistant text incrementally. Show FAQ suggestion chips on open. Handle 401/429/500 with an `Alert`. No chat persistence (stateless per the standalone).

**Copy (exact):** trigger `Perguntar sobre esta conta`; drawer title `Assistente Solo`; intro `Pergunte qualquer coisa sobre esta conta de luz.`; input placeholder `Digite sua pergunta...`; FAQ chips e.g. `Por que pago a taxa mínima?`, `Quanto economizei com o solar?`, `O que é o saldo SCEE?`.

**Done when:** client opens the drawer and gets a streamed, bill-grounded answer; errors surfaced; build clean (polish in Phase E).

---

## 6.5 Phase E — End-of-Sprint Review & Refinement (frontier model)

After A–C merge, **one** review pass on a frontier model (Opus) over `git diff main...<sprint-5 integration branch>`.

### E1 — Backend review · frontier model
- [ ] **Provider abstraction (A1):** factory honors `BILL_ANALYZER_PROVIDER`; Claude default really calls Anthropic; Gemini path unchanged when selected; no secrets logged.
- [ ] **Extraction/analysis (A2/B1):** upload runs extract **and** analyze; JSON columns populated; `estimatedSavings`/`billScore` consistent with `computeDeterministicFlags`.
- [ ] **Clarifier math (A3):** re-derive on a sample bill; numbers match the source formulas; clamps hold.
- [ ] **Scope/security (B2):** chat enforces bill ownership (re-check the negative test exercises a foreign bill); no `clientId` trusted from the body.
- [ ] **Data model:** zero migrations; only existing JSON columns used.
- [ ] Use `superpowers:requesting-code-review` / `/code-review`. File findings as fix-tasks or fix inline.

### E2 — Frontend refinement · frontier model
- [ ] Port fidelity: clarifier cards, technical viewer, and chat drawer match the standalone's information design but in our design system (spacing, `font-mono` for kWh/R$, mobile-first).
- [ ] Interaction polish: streaming chat feels smooth; loading/empty/error states intentional; FAQ chips + alerts consistent.
- [ ] Copy + accents audited (pt-BR) across every new surface; the `ActionCard` CTA routes to `/support`, never an external sales link.
- [ ] Confirm against each FE task's screenshot; capture after-shots.

**Phase E output:** a short review note appended to this file; any follow-up fix-tasks.

---

## 7. Definition of Done — Sprint 5 (the contract)

- [ ] **DoD-1 — Provider-agnostic engine:** `getBillAnalyzer()` selects Claude (default) / Gemini / OpenAI via `BILL_ANALYZER_PROVIDER`; Claude provider added (`@anthropic-ai/sdk`); Gemini path preserved.
- [ ] **DoD-2 — Rich analysis on upload:** a client upload yields `aiAnalysis`, line-by-line `billingItems`, SCEE `creditSummary`, `extraCharges`, `billScore`, and non-zero `estimatedSavings` when computable.
- [ ] **DoD-3 — Clarifier dashboard:** the existing bill-analysis screen shows the cost pie, cost composition, solar-energy flow, system status, alerts, and the expansion/action card — math from `computeClarifier()` only.
- [ ] **DoD-4 — Raw technical viewer:** SCEE summary + line-by-line table (with glossary) + taxes render in a collapsible section, empty-safe.
- [ ] **DoD-5 — Bill chat:** owner can ask questions and get a streamed, bill-grounded answer; foreign-bill access rejected (401).
- [ ] **DoD-6 — Lead magnet stripped:** no CRM/lead-capture/freemium/proposal/external sales link; expansion CTA routes to `/support`.
- [ ] **DoD-7 — Quality gates:** `npm run build` clean; each task's focused vitest suite green; **zero schema migrations**.
- [ ] **DoD-8 — Ledger:** one billing row per task in `scripts/Planning/billing.md`; every task handed off with the structured HANDOFF block.
- [ ] **DoD-9 — Phase E:** backend review (E1) passed with findings fixed; frontend refinement (E2) applied; review note appended.

**Merge gate (lightweight, no stop):** the PM merges a finished task's branch once it builds, its focused tests pass, and the touched files match the ownership table. The only pre-coding stop is **A1's 🔴 architecture approval**. The only deep review is **Phase E**.

---

## 8. Ledger Hooks

Each engineer, on their branch:
- Tick their task checkbox(es) in §6 to `[x]`.
- Add one row to `scripts/Planning/billing.md`: `date · Sprint 5 · <task-id> · <agent/model> · <tier>`.
- Post the HANDOFF block (`agent_workflow.md` §6).

---

## 9. Wave A — Executed (reference HANDOFFs · the excellence bar)

> **Read this before you build B/C.** Wave A was executed by the PM via same-session subagent-driven development (a fresh implementer subagent per task on `claude-opus`/`claude-sonnet`, each followed by an independent task-review subagent: **spec-compliance + code-quality**, fix loop, then merge). It ran on a single integration branch `sprint5/wave-a` (BASE `1c52f84`) rather than three per-task branches because it was one continuous session — **you still use one branch per task** per §1.2. These three HANDOFFs are the standard every B/C task must meet: TDD with RED→GREEN evidence, only-owned-files diffs, a passing focused suite with **pristine output**, and a clean build. "It works" is not a handoff. This is.

```
HANDOFF: A2 · Rich extraction & analysis prompts + RawBillData extension + JSON mapping
Branch:  sprint5/wave-a
Commit:  0515b1b feat(economia): A2 — rich extraction prompt + RawBillData extension + JSON mapping
         aedb2dc fix(economia): A2 — remove analysis-output fields from EXTRACTION_PROMPT
Files:   src/backend/economia/analyzer/prompts.ts (created — EXTRACTION_PROMPT + buildAnalysisPrompt)
         src/backend/economia/analyzer/mapping.ts (created — mapRawToBillJson, pure)
         src/backend/economia/analyzer/__tests__/mapping.test.ts (created — 12 TDD tests)
         src/backend/economia/analyzer/types.ts (RawBillData: typed RawBillLineItem/RawCreditSummary/RawExtraCharge)
Tests:   npx vitest run src/backend/economia/analyzer → 46 passed, 0 failed (12 new, RED→GREEN)
Review:  Approved — 1 Important finding (AI-output fields leaked into EXTRACTION_PROMPT) fixed in aedb2dc
Ledger:  [x] A2 · billing row added
```

```
HANDOFF: A1 · Provider-agnostic analyzer — interface + factory + Claude/Gemini/OpenAI
Branch:  sprint5/wave-a
Commit:  a44ecc8 feat(analyzer): provider-agnostic bill analyzer (Claude/Gemini/OpenAI)
Files:   src/backend/economia/analyzer/types.ts (BillAnalyzerProvider + ChatMessage)
         src/backend/economia/analyzer/claude-bill-analyzer.ts (created — default; PDF/image vision; messages.stream → ReadableStream)
         src/backend/economia/analyzer/gemini-bill-analyzer.ts (refactored to the interface; prompts now from prompts.ts; behavior preserved)
         src/backend/economia/analyzer/openai-bill-analyzer.ts (created — chat works; extract/analyze stubbed)
         src/backend/economia/analyzer/factory.ts (created — getBillAnalyzer())
         src/backend/economia/analyzer/index.ts (re-exports getBillAnalyzer + new types)
         src/backend/economia/analyzer/__tests__/factory.test.ts (created — 9 tests, SDKs mocked, no live key)
         package.json + package-lock.json (@anthropic-ai/sdk), env.example (ANTHROPIC_API_KEY, BILL_ANALYZER_PROVIDER, BILL_ANALYZER_CLAUDE_MODEL)
Tests:   npx vitest run src/backend/economia/analyzer → 55 passed, 0 failed (9 new factory; Gemini suite preserved)
Review:  Approved (Opus) — streaming adapter + lazy construction + Gemini-behavior-preserved all verified; only Minor findings (OpenAI stub typing) deferred to Phase E
Notes:   🔴 architecture gate honored — claude-api skill consulted for model id + PDF block shape + streaming before coding. env file is `env.example` (no dot) per project convention.
Ledger:  [x] A1 · billing row added
```

```
HANDOFF: A3 · computeClarifier() pure function
Branch:  sprint5/wave-a
Commit:  b1de6da feat(shared): add computeClarifier pure function (Sprint 5 A3)
Files:   src/shared/economia/clarifier.ts (created — ClarifierResult + computeClarifier, pure)
         src/shared/economia/__tests__/clarifier.test.ts (created — 7 TDD tests)
Tests:   npx vitest run src/shared/economia/__tests__/clarifier.test.ts → 7 passed, 0 failed (RED→GREEN; case (d) asserts exact expansionKwp/expansionModules)
Review:  Approved — line-by-line math fidelity to the standalone source confirmed; only Minor (source-inherited) findings
Ledger:  [x] A3 · billing row added
```

**Wave A verification (integrated branch `1c52f84..b1de6da`):** `npx vitest run src/backend/economia/analyzer src/shared/economia` → **62 passed, 0 failed**. Zero schema migrations. Minor findings from A1/A3 are logged in `.superpowers/sdd/progress.md` for the Phase E whole-branch review. **Wave B opens** (B1 rewires the upload route onto `getBillAnalyzer()` + `mapRawToBillJson`; B2 builds the chat route on `getBillAnalyzer().chat`).

---

## 10. Phase F — Rework & Excellence Pass (🔴 REQUIRED before merge to `main`)

> **Why this exists.** Waves A–C were built and the suite is green (**55 files / 374 tests**), but the PM end-of-sprint review found the **backend (A1/A2/B1/B2) and the pure math (A3) meet the bar**, while the **frontend (C2/C3) does not**: the rich dashboard was built as an **orphan, unreachable route**, it **ignores the validated `computeClarifier()`** and re-derives numbers inline (with bugs), the lead-magnet CTA was **not stripped**, and the **raw technical-data viewer (DoD-4) was never built**. A passing test suite hid all of it because the tests render components in isolation and never assert reachability, math source, or correctness. **Sprint 5 is NOT done until Phase F closes every item below and a frontier-model review signs off.**
>
> Do NOT merge A/B in isolation either — Phase F changes the same FE surface; ship Sprint 5 as one reviewed unit.

### 10.1 PM Review Findings (the contract Phase F must satisfy)

| # | Severity | Finding | Evidence |
|---|----------|---------|----------|
| R1 | 🔴 Critical | **Rich dashboard is unreachable.** Nothing links to `/economia/[billId]/analyze`; the bill list links only to `/economia/[billId]` (the old screen). Headline feature invisible. | `account-card.tsx:66`; no `/analyze` href anywhere |
| R2 | 🔴 Critical | **`computeClarifier()` (A3) is dead code** — never imported. C2 re-implements the math inline and differently. Violates DoD-3 + FE-guardrail "no business math in components". | `grep computeClarifier` → only its own file/test |
| R3 | 🔴 Critical | **Unit bug: kWh rendered as R$.** `CostCompositionCard.uncompensatedCost` (money) is fed `billedConsumptionKwh − compensatedEnergyKwh` (kWh). | `[billId]/analyze/page.tsx:200` |
| R4 | 🔴 Critical | **DoD-4 not delivered.** No raw technical-data viewer; `billingItems`/`creditSummary` (SCEE + line-by-line table) are extracted and stored but **never displayed**. | no `technical-data-viewer.tsx`; grep shows render nowhere |
| R5 | 🟠 Important | **DoD-6 violated.** Expansion CTA uses sales copy ("Quero avaliar expansão" / "Solicite um orçamento sem compromisso") and `onExpansionClick` is never wired — must be **"Falar com a Solo" → `/support`**. | `action-card.tsx:82–90`; `analyze/page.tsx:229–233` |
| R6 | 🟠 Important | **Expansion insight never shows** — `expansionModules` hardcoded `undefined`, so `ActionCard` always renders the "tudo certo" branch. | `analyze/page.tsx:231–232` |
| R7 | 🟠 Important | **Inline math diverges from spec** — `minimumPossible` omits `extraChargesTotal`; `systemStatus` uses a 0.7/0.9 expected-ratio instead of generated-vs-needed ≥/80%; `uncompensatedCost` computed two ways in one file. | `analyze/page.tsx:134,140–144,191,200` |
| R8 | 🟡 Minor | Duplicate components (`bill-score-gauge.tsx`, `bill-summary-card.tsx`) instead of reusing existing `BillScoreRing`. | new clarifier files |
| R9 | 🟡 Minor | Backend nits: chat route `buildChatSystemPrompt(bill as any)`; chat `messages` not shape-validated; OpenAI stub typing; `BILL_ANALYZER_OPENAI_MODEL` undocumented. | `chat/route.ts:58,48–55`; `openai-bill-analyzer.ts` |

### 10.2 Locked decision — ONE bill experience, not two

The rework **consolidates the rich dashboard INTO the canonical `bill-analysis-screen.tsx`** (the screen the bill list already reaches at `/economia/[billId]`) and **deletes the orphan `/economia/[billId]/analyze/page.tsx`**. Rationale: the plan's original C2 intent was to enhance the existing screen; two parallel bill views is the fragmentation we are removing, and the existing screen already owns payment / PDF / confirm / alerts / recommendations that must NOT be lost. The clarifier **card components are kept and reused** — only their data source (now `computeClarifier`) and their host change.

### 10.3 Phase F Task Table

| ID  | Tier | Title | Owns |
| --- | ---- | ----- | ---- |
| F1 | L | Consolidate clarifier dashboard into the canonical screen, source ALL math from `computeClarifier`, delete the orphan route (fixes R1,R2,R3,R7,R8) | `src/frontend/economia/analysis/bill-analysis-screen.tsx` (modify), the 5 kept clarifier cards (modify props), delete `[billId]/analyze/page.tsx`, delete `bill-score-gauge.tsx`/`bill-summary-card.tsx` (or refit one — see brief), `src/frontend/economia/analysis/clarifier/__tests__/*` (update) |
| F2 | M | Build the missing **raw technical-data viewer** (R4 / DoD-4) | `src/frontend/economia/analysis/technical-data-viewer.tsx` (new) + mount in `bill-analysis-screen.tsx` + its test |
| F3 | S | ActionCard → `/support` CTA + real expansion numbers (R5,R6) | `src/frontend/economia/analysis/clarifier/action-card.tsx` (modify) |
| F4 | M | **UI/UX excellence pass** across the unified screen + chat (the brand bar) | the unified screen + clarifier cards + `chat/*` (style only) |
| F5 | S | Backend hardening (R9) | `chat/route.ts`, `chat-prompt.ts`, `openai-bill-analyzer.ts`, `env.example` |
| F6 | S | Close the test gap that hid these defects | `bill-analysis-screen` render/integration test (new) |

**Wave order:** F1 → (F2 · F3 · F5 in parallel) → F4 (polish, last) → F6 (guard). F4 touches files F1/F2/F3 own, so it runs **after** they merge.

### 10.4 Task Briefs

#### F1 — Consolidate + source math from `computeClarifier` · Tier L
**Goal:** one reachable bill screen that renders the full clarifier dashboard with **all numbers from `computeClarifier(bill)`**.
- Read `src/shared/economia/clarifier.ts` (the `ClarifierResult` + `computeClarifier` you must use) and the current `bill-analysis-screen.tsx`.
- In `bill-analysis-screen.tsx`, after the existing payment/score block, compose: `BillSummaryCard` (Você pagou / Mínimo obrigatório tiles) → `CostPieChart` → `CostCompositionCard` → `SolarEnergyCard` → `SystemStatusCard` → existing AI summary/alerts/recommendations → `ActionCard` (F3) → `TechnicalDataViewer` (F2 slot) → mount `BillChatDrawer`.
- **Every derived number** (minimumPossible, uncompensatedCost, extraChargesTotal, systemStatus, expectedGeneration, extraGenerationNeeded, expansionKwp, expansionModules) comes from `computeClarifier(bill)`. **Delete all inline math.** Pass `clarifier.uncompensatedCost` (money) to `CostCompositionCard` — never a kWh value (fixes R3).
- **Reuse the existing `BillScoreRing`** for the score; delete `bill-score-gauge.tsx`. Keep `BillSummaryCard` only if it adds the two cost tiles fed by `computeClarifier`; otherwise inline the tiles. Justify the choice in your handoff.
- **Delete** `src/app/(private)/@user/economia/[billId]/analyze/page.tsx` (its content moves here).
- Verify: the bill list → `/economia/[billId]` now shows the dashboard (reachable). Build clean; update the clarifier component tests so they still pass.

#### F2 — Raw technical-data viewer · Tier M (this is DoD-4, was never built)
**Goal:** the expandable "Dados Técnicos da Fatura" the plan's original C3 specified.
- Read the standalone source: `...solar-bill-clarity\src\pages\AnalysisResult.tsx` lines ~670–814 (the Collapsible block, the SCEE grid, the line-by-line billing-table glossary map, the taxes grid).
- Create `technical-data-viewer.tsx` (`<TechnicalDataViewer bill={bill} />`) using `Collapsible` + `Card`. Render: `Informações gerais`, `Saldo SCEE — Sistema de Compensação` (from `bill.creditSummary`), `Tabela de faturamento linha a linha` (from `bill.billingItems`, with the glossary tooltips + credit rows in `text-success`), `Tributos e eficiência`. Collapsed by default; each subsection hides when its data is null (empty-safe).
- Mount it at the slot F1 leaves in `bill-analysis-screen.tsx`. Build clean; add a render test for a bill with `billingItems`/`creditSummary`.
- **Note:** `C1` already exposes the needed fields in `BillDetail`/the detail route — confirm `billingItems` + `creditSummary` are present in the payload; if not, that's a C1 follow-up (flag PM).

#### F3 — ActionCard CTA → /support · Tier S
- In `action-card.tsx`: the primary CTA becomes **`Falar com a Solo`** wrapped in `<Link href="/support">` (no `onExpansionClick` sales handler, no "orçamento sem compromisso" copy). Keep the "Falta gerar X kWh / +Y kWp / Z módulos" insight rows.
- F1 feeds it `extraGenerationNeeded`, `expansionKwp`, `expansionModules` from `computeClarifier` so the expansion branch actually renders (fixes R6).

#### F4 — UI/UX excellence pass · Tier M (the brand bar)
Within the existing design system only (no new tokens/colors; no Sprint-6 scope). Make the unified bill screen feel like a Tesla/McLaren product, not a form dump:
- **Number typography:** every R$ and kWh value uses `font-mono`/`tabular-nums`; consistent decimal precision (R$ 2dp, kWh 0–1dp); `formatBRL`/`formatKwh` everywhere (no inline `Intl`).
- **Layout & rhythm:** consistent card radii, borders, padding, and vertical spacing; mobile-first (cards stack to one column < md; the 2-up grids collapse cleanly); no layout shift between loading and loaded.
- **Loading:** skeletons mirror the final dashboard shape (not generic boxes).
- **Graceful partial data:** each clarifier card renders an intentional state when its inputs are null/0 (e.g. "Dados de geração insuficientes") — the dashboard must look deliberate with a sparse bill, never broken or showing `R$ 0,00` noise.
- **Interaction:** chat streaming renders incrementally and auto-scrolls; input disabled while streaming; FAQ chips + `Aguardando` states consistent; focus/keyboard order correct; errors via `Alert`/`sonner`.
- **Motion:** standardize `framer-motion` use (or remove it) so it matches the rest of the app — no one-off animations.
- **A11y + copy:** aria-label the score gauge and pie chart; color is never the only signal; pt-BR copy + accents audited on every new surface.

#### F5 — Backend hardening · Tier S
- `chat-prompt.ts`/`chat/route.ts`: replace `buildChatSystemPrompt(bill as any)` with a typed input (a narrow `ChatBillContext` type or the Prisma `EnergyBill` type); validate the request `messages` are `{role:'user'|'assistant', content:string}[]` and return 400 on malformed input.
- `openai-bill-analyzer.ts`: type the `messages.map` to the SDK's param type; append `BILL_ANALYZER_OPENAI_MODEL=gpt-4o` to `env.example`.
- No behavior change to the claude/gemini paths.

#### F6 — Close the test gap · Tier S
- Add a render/integration test on `bill-analysis-screen.tsx` proving: (a) given a bill with clarifier data, the dashboard (pie/solar/system cards + technical viewer) renders — the **reachability/regression guard** that R1/R4 lacked; (b) a `computeClarifier`-derived value appears (e.g. the "Mínimo obrigatório" tile equals `availability + publicLighting + extraChargesTotal`), guarding R2/R3/R7.

### 10.5 Phase F — Definition of Done (additive to §7)

- [ ] **DoD-F1 — Reachable & unified:** the bill list → `/economia/[billId]` renders the full clarifier dashboard + chat; the orphan `/analyze` route is deleted (R1).
- [ ] **DoD-F2 — Single source of truth:** all dashboard math comes from `computeClarifier()`; zero inline business math in components; no unit bugs (R2,R3,R7).
- [ ] **DoD-F3 — Technical viewer (DoD-4 closed):** SCEE summary + line-by-line table (with glossary) + taxes render, collapsed, empty-safe (R4).
- [ ] **DoD-F4 — Lead-magnet truly stripped:** expansion CTA is "Falar com a Solo" → `/support`; expansion numbers render when applicable (R5,R6).
- [ ] **DoD-F5 — Brand bar:** the unified screen passes the F4 checklist (mono numbers, mobile-first, graceful partial-data, polished chat) on a frontier-model FE review.
- [ ] **DoD-F6 — Backend hardened + duplicates removed:** R8/R9 closed.
- [ ] **DoD-F7 — Test gap closed:** the screen-level render/integration test from F6 is green; full suite green; `npm run build` clean; **zero schema migrations**.
- [ ] **DoD-F8 — Frontier review:** a whole-branch frontier-model review (backend correctness + UI/UX) signs off; findings fixed; note appended here. Only then merge to `main`.

### 10.6 Phase F Ledger
Each engineer ticks their F-task `[x]` and adds a `Sprint 5 · F<n>` row to `billing.md`, with the structured HANDOFF block — held to the §9 excellence bar (TDD/RED→GREEN where logic changes, only-owned-files diffs, pristine output, reachability proven, screenshots for FE).

---

## 11. Phase G — Type-Safety Hardening & Final Approval (🔴 REQUIRED before merge to `main`)

> **Why this exists.** Phase F correctly fixed all 9 functional findings (R1–R9 verified). But the PM's final review found the completion claim "0 TypeScript errors / ready to merge" is **false**: `npx tsc --noEmit` reports **3 type errors in Sprint-5 files**. They were masked because (a) `next.config.ts` sets `typescript.ignoreBuildErrors: true`, so `next build` never fails on type errors, and (b) **vitest strips types and does not type-check**, so "384/384 green" can coexist with broken types. **A green test run is not a type-safe codebase.** Sprint 5 is **NOT approved** until every Sprint-5 file is type-clean under `tsc --noEmit` and the gate below is part of the handoff.

### 11.1 The defects (each with the exact fix)

| # | Sev | File:line | Error | Exact fix |
|---|-----|-----------|-------|-----------|
| G-a | 🔴 | `src/frontend/economia/analysis/chat/bill-chat-drawer.tsx:118` | `variant="gradient"` — `gradient` is **not** in our Button variant union (`default \| destructive \| outline \| secondary \| ghost \| link`). This is an **invented variant copied from the standalone** — a FE-guardrail violation; the FAB currently renders with no variant styling. | Change to `variant="default"` (the primary CTA). Keep the `rounded-full` pill + `shadow-lg` classes so it still reads as a floating action button. |
| G-b | 🔴 | `src/frontend/economia/analysis/bill-analysis-screen.tsx:152` | `'bill' is possibly 'null'` — `buildClarifier(bill)`/clarifier usage runs where TS cannot prove `bill` is non-null. | Compute the clarifier **after** the `if (!bill) return …` early-return so TS narrows the type — e.g. `const clarifier = buildClarifier(bill)` placed below the empty/not-found guard, and pass `clarifier` down. Do not use `!` / `as` to silence it. |
| G-c | 🟠 | `src/frontend/economia/analysis/bill-analysis-screen.tsx:169` | `string` not assignable to `BillPaymentStatus` — `effectivePaymentStatus` is widened to `string`. | Annotate it with the Prisma enum: `const effectivePaymentStatus: BillPaymentStatus = confirmedPaidAt ? 'paga' : bill.paymentStatus` (import `BillPaymentStatus` from `@/app/generated/prisma`). |

### 11.2 Task Table

| ID | Tier | Title | Owns |
| -- | ---- | ----- | ---- |
| G1 | S | Fix the invented Button variant + audit for siblings | `chat/bill-chat-drawer.tsx` (+ grep-audit of `chat/*` & `clarifier/*`) |
| G2 | S | Fix the two `bill-analysis-screen.tsx` type errors (null-narrowing + payment-status enum) | `bill-analysis-screen.tsx` |
| G3 | S | Make `tsc --noEmit` a real gate (process + DoD) | `package.json` (add `typecheck` script), this file (DoD), `agent_workflow` handoff note |

**Order:** G1 · G2 in parallel (different files) → G3 (verification) last.

### 11.3 Briefs

#### G1 — Invented variant + sibling audit · Tier S
- Apply fix **G-a** above.
- **Root-cause audit (this is why it's not a one-liner):** the `gradient` variant was copied verbatim from the standalone. Grep the entire new FE surface for other props/variants that don't exist in our primitives:
  ```bash
  grep -rnE "variant=\"gradient\"|gradient-bg|className=\"gradient" src/frontend/economia/analysis
  ```
  Replace any hit with a real design-system variant/class. Report what you found (even if zero).
- Verify the FAB still looks like an intentional primary floating button (screenshot in handoff).

#### G2 — Screen type errors · Tier S
- Apply fixes **G-b** and **G-c** above. No behavior change — the payment box, confirm-payment flow, badge, and clarifier dashboard must render exactly as before.
- Re-run the F6 render test (`bill-analysis-screen.test.tsx`) → still green.

#### G3 — Type-check gate · Tier S
- Add an npm script: `"typecheck": "tsc --noEmit"`.
- Run `npx.cmd tsc --noEmit` and confirm **zero errors in every Sprint-5-owned file** (the analyzer module, the economia routes/screens, the clarifier + chat components, the shared clarifier). Paste the filtered result in your handoff.
- Pre-existing errors in **non-Sprint-5** files (`src/frontend/admin/components/client-details.tsx`, `src/frontend/rateio/rateio-screen.tsx`, `src/lib/object-storage.ts`, the `PendingBill.type` access) are **out of scope** for Sprint 5 — list them in your handoff as a flagged follow-up for a future cleanup sprint (and note that `ignoreBuildErrors: true` should eventually be flipped to `false` once they're cleared). Do **not** fix them here; do not let them block Sprint-5 approval.

### 11.4 New permanent verification gate (amends §1.6)

From now on, **every** task's pre-handoff verification adds a type-check — a green vitest run is not sufficient proof on its own:
```bash
npm.cmd run build
npx.cmd vitest run <focused path>
npx.cmd tsc --noEmit        # ← NEW: must introduce zero new type errors in your owned files
```

### 11.5 Phase G — Definition of Done (the final approval contract)

- [ ] **DoD-G1** — G-a/G-b/G-c fixed; no `!`/`as any` band-aids; the sibling audit (G1) is reported.
- [ ] **DoD-G2** — `npx tsc --noEmit` shows **0 errors in all Sprint-5 files**; the only remaining errors are the documented pre-existing non-Sprint-5 ones.
- [ ] **DoD-G3** — `typecheck` script added; the new `tsc --noEmit` gate is in §1.6 and honored.
- [ ] **DoD-G4** — full suite still green (`vitest run`) and `npm run build` clean; zero schema migrations.
- [ ] **DoD-G5** — all prior contracts still hold: §7 (DoD-1…8), §10.5 (DoD-F1…F8), R1–R9 still fixed (no regression).
- [ ] **DoD-G6 — FINAL SIGN-OFF** — a frontier-model whole-branch review (backend correctness + UI/UX + type-safety) returns clean; the review note is appended here. **Only when DoD-G1…G6 are all ✅ is Sprint 5 APPROVED and `sprint5/wave-a` may merge to `main`.**

### 11.6 Phase G Ledger
Each engineer ticks their G-task `[x]`, adds a `Sprint 5 · G<n>` row to `billing.md`, and posts the §9-grade HANDOFF block — now including the `tsc --noEmit` result, not just the vitest result.

> **Lesson for the team (write it on the wall):** "tests pass" ≠ "done". With `ignoreBuildErrors: true`, the compiler is the only thing checking types, and nothing was running it. Definition-of-done means: type-clean **and** tested **and** reachable **and** spec-faithful — proven with command output in the handoff, not asserted.

---

_PM authored this plan from the Sprint 5 brainstorm (replace the weak analyzer with the standalone "Analisador de Contas", provider-agnostic, lead-magnet stripped, dropped into the existing economia screen). The "Consumo" navigation consolidation + history/compare + FAQ are **Sprint 6**. Engineers: acknowledge these rules, read your task + the files it owns (and the standalone source named in your brief), confirm your tier, then wait for the PM to open your wave._
