# PM Sprint Handoff

---

## Sprint 5 — "Analisador": AI Bill Analyzer merge

- **Status:** ✅ **DONE — merged to `main` and pushed to origin.**
- **Date:** 2026-06-25
- **Branch merged:** `sprint5/wave-a` → `main` (fast-forward, 20 commits)
- **`main` now at:** `f70574e` · pushed `1c52f84..f70574e` to `origin/main` (`github.com/soloenergiabr/Solo-App-V.1-TS`)
- **Plan of record:** `scripts/Planning/sprint_5_ai-analyzer_v1.md` (Vision + Waves A–C + Phases E/F/G + DoD)
- **Deploy:** ⏳ **NOT yet deployed to the VPS** — see §Deploy below (one required env var).

### TL;DR
Replaced the weak single-provider Gemini bill analyzer with the standalone **"Analisador de Contas"** logic, re-platformed onto Next.js + Prisma + `EnergyBill` with **zero schema migrations**. A client uploads a bill and now gets a rich, provider-agnostic analysis (clarifier dashboard + raw technical breakdown + streaming chat), all inside the existing economia bill screen.

### What shipped

| Area | Deliverable |
| --- | --- |
| **Engine (A1)** | Provider-agnostic `getBillAnalyzer()` factory — **Claude (default)** / Gemini / OpenAI, switched by `BILL_ANALYZER_PROVIDER`; `@anthropic-ai/sdk` added; PDF/vision + streaming. |
| **Extraction (A2/A3)** | Rich extraction prompt + `mapRawToBillJson` (line-by-line table, SCEE summary, services/installments → existing JSON columns); `computeClarifier()` pure math (single source of truth). |
| **Backend routes (B1/B2)** | Upload route runs `extract → analyze → persist`; streaming `POST /economia/bills/[billId]/chat` with payer/titular **scope enforcement** (foreign bills → 401). |
| **Frontend (C1/C2/F1/F2/C3)** | Bill detail extended (22 fields); **clarifier dashboard** (score, cost pie, cost composition, solar flow, system status, action card) consolidated into the **canonical** `bill-analysis-screen.tsx` (reachable from the bill list); **raw technical-data viewer** (SCEE + line-by-line + taxes + glossary); **streaming chat drawer**. |
| **Lead-magnet stripped** | No CRM / lead-capture / freemium / proposal. Expansion CTA = **"Falar com a Solo" → `/support`** (internal). |

### Verification (independently run by PM, not self-reported)
- `npx tsc --noEmit` → **0 errors in all Sprint-5 files** (10 pre-existing non-Sprint-5 errors remain — see todo).
- `npx vitest run` → **56 files / 384 tests, 0 failures.**
- **Zero schema migrations** (uses existing `EnergyBill` columns).
- No `as any` / `!` band-aids left in Sprint-5 code (Phase-G polish, commit `f70574e`).

### Review story (why it took E/F/G)
The junior swarm's self-reported "done" was **overstated three times**; the PM review caught each by verifying against the code rather than the summary:
1. **Phase F (9 findings, R1–R9):** the rich dashboard shipped as an **unreachable orphan route**, ignored `computeClarifier()` (inline, divergent math + a kWh-as-R$ unit bug), left the sales CTA un-stripped, and **never built the technical-data viewer (DoD-4)**. All fixed.
2. **Phase G (3 type errors):** "0 TS errors" was false — `tsc --noEmit` found 3 Sprint-5 errors masked by `ignoreBuildErrors: true` + vitest not type-checking. Fixed; `tsc --noEmit` made a permanent pre-handoff gate.
3. **Phase G polish:** removed 2 `as` band-aids the fixes had introduced.

> **Lesson recorded for the team:** "tests pass" ≠ "done". Definition-of-done = type-clean **and** tested **and** reachable **and** spec-faithful — proven with command output in the handoff, not asserted.

### Deploy (REQUIRED — run on the VPS; no in-repo automation exists)
Pushing to GitHub does **not** auto-deploy (no CI/Vercel/Actions in the repo). Zero migrations, so this is a plain code deploy. **One required config change:** the default analyzer provider is now **Claude**.

```bash
# on the VPS, in the app dir:
git pull origin main
npm ci
npx prisma generate          # no migrate deploy needed — zero migrations this sprint
npm run build
# restart the app (pm2/systemd/whatever runs it), e.g.:
pm2 restart solo-app
```

**Env vars to set in production before/with deploy:**
- `ANTHROPIC_API_KEY=...` ← **required** for the default Claude provider, OR
- `BILL_ANALYZER_PROVIDER=gemini` (falls back to the existing `GEMINI_API_KEY` path) if you don't want to enable Claude yet.
- Optional: `BILL_ANALYZER_CLAUDE_MODEL` (default `claude-sonnet-4-6`).

⚠️ If neither `ANTHROPIC_API_KEY` is set nor the provider switched to `gemini`, **bill upload + chat will fail in production.** Verify on a real bill after deploy.

### Follow-ups
Logged in `scripts/Planning/todo.md` under "Sprint 5 — Carry-over & Follow-ups" (repo-wide type cleanup + flip `ignoreBuildErrors`, finish the OpenAI provider, post-deploy real-bill validation, Sprint 6 scope).

### Billing
Sprint 5 total ≈ **R$ 146** (Waves A–C + Phases F/G); per-task rows in `scripts/Planning/billing.md`.

---
