# 💰 Project Billing & Spending Tracker

Tracks the cost of AI agents across sprints. **No token math, no dashboards** —
every task is a flat tier, the tier sets the price.

## 📋 How to log (Engineers)

When you finish a task, add **one row** to the ledger below with your task's
tier letter. The R$ comes from the table — you don't calculate anything.

## 🎚️ Tier Price Table

| Tier   | Typical work                                                 | Est. R$ |
| :----- | :----------------------------------------------------------- | :------ |
| **S**  | Copy edits, column deletes, mask audits, merges, doc updates | R$ 5    |
| **M**  | One hook, one focused component change                       | R$ 12   |
| **L**  | Hook + integration across several files                      | R$ 20   |
| **XL** | Cross-cutting / architecture / atomic transactions           | R$ 28   |

_Calibrated from real Sprint 4 / 5.5 history. Recalibrate the four numbers
anytime — nothing else changes. (Flat tiers slightly overstate cost when a cheap
model does an S task; that's intentional and conservative.)_

## 💸 Cost Ledger

| Date | Sprint | Task | Agent / Model | Tier | Est. R$ |
| :--- | :----- | :--- | :------------ | :--- | :------ |
| 2026-06-18 | Sprint 3 | Wave 1 - Data Contracts | claude (haiku) | M | R$ 12 |
| 2026-06-18 | Sprint 3 | Wave 2 - Bill Analyzer | claude (sonnet) | L | R$ 20 |
| 2026-06-19 | Sprint 3 | Wave 3 - Analise da Conta | claude (sonnet) | L | R$ 20 |
| 2026-06-19 | Sprint 3 | Wave 4 - Upload & Validation | claude (sonnet) | L | R$ 20 |
| 2026-06-19 | Sprint 3.1 | A1 - Remove stray dir | claude (haiku) | S | R$ 5 |
| 2026-06-19 | Sprint 3.1 | A2 - Rateio migration | claude (sonnet) | M | R$ 12 |
| 2026-06-19 | Sprint 3.1 | B1 - Inverter encryption fix | claude (sonnet) | L | R$ 20 |
| 2026-06-19 | Sprint 3.1 | C1 - Validation status | claude (sonnet) | L | R$ 20 |
| 2026-06-19 | Sprint 3.1 | D1 - Rateio UI polish | claude (haiku) | S | R$ 5 |
| 2026-06-23 | Sprint 4 | A1 - Manual-generation backend | claude (sonnet) | M | R$ 12 |
| 2026-06-23 | Sprint 4 | A2 - Cockpit correctness | claude (sonnet) | M | R$ 12 |
| 2026-06-23 | Sprint 4 | A3 - Savings fallback | claude (sonnet) | M | R$ 12 |
| 2026-06-23 | Sprint 4 | B1 - Admin generation form | claude (sonnet) | L | R$ 20 |
| 2026-06-23 | Sprint 4 | B2 - Admin bill form | claude (sonnet) | L | R$ 20 |
| 2026-06-23 | Sprint 4 | C1 - Client bill entry | claude (sonnet) | L | R$ 20 |
| 2026-06-23 | Sprint 4 | C2 - Client generation form | claude (sonnet) | L | R$ 20 |
| 2026-06-23 | Sprint 4 | D1 - Admin approval action | claude (sonnet) | M | R$ 12 |
| 2026-06-23 | Sprint 4 | D2 - Onboarding checklist | claude (sonnet) | L | R$ 20 |
| 2026-06-24 | Sprint 5 | A1 - Provider abstraction | claude (opus) | L | R$ 20 |
| 2026-06-24 | Sprint 5 | A2 - Rich prompts + mapping | claude (sonnet) | M | R$ 12 |
| 2026-06-24 | Sprint 5 | A3 - computeClarifier | claude (sonnet) | M | R$ 12 |
| 2026-06-24 | Sprint 5 | C1 - Extend bill-detail API + BillDetail type | deepseek-flash | S | R$ 5 |
| 2026-06-24 | Sprint 5 | B1 - Rewire upload route | deepseek-flash | M | R$ 12 |
| 2026-06-24 | Sprint 5 | B2 - Bill chat API route | deepseek-flash | M | R$ 12 |
| 2026-06-24 | Sprint 5 | C2 - BillAnalyze clarifier dashboard | deepseek-flash | L | R$ 20 |
| 2026-06-24 | Sprint 5 | C3 - Bill chat dialog integration | deepseek-flash | M | R$ 12 |
| 2026-06-25 | Sprint 5 | F1 - Consolidate dashboard + source math from computeClarifier | deepseek-flash | L | R$ 20 |
| 2026-06-25 | Sprint 5 | F2 - Raw technical data viewer | deepseek-flash | M | R$ 12 |
| 2026-06-25 | Sprint 5 | F3 - ActionCard CTA to /support | deepseek-flash | S | R$ 5 |
| 2026-06-25 | Sprint 5 | F4 - UI/UX polish pass | deepseek-flash | M | R$ 12 |
| 2026-06-25 | Sprint 5 | F5 - Backend hardening | deepseek-flash | S | R$ 5 |
| 2026-06-25 | Sprint 5 | F6 - Render/integration test (reachability guard) | deepseek-flash | S | R$ 5 |
| 2026-06-25 | Sprint 5 | G1 - Fix invented variant + sibling audit | deepseek-flash | S | R$ 5 |
| 2026-06-25 | Sprint 5 | G2 - Fix screen type errors (null-narrowing + payment enum) | deepseek-flash | S | R$ 5 |
| 2026-06-25 | Sprint 5 | G3 - Add typecheck gate | deepseek-flash | S | R$ 5 |
| 2026-06-25 | Sprint 5 | I1 - Fix upload URL + sibling audit | codex (gpt-5) | S | R$ 5 |
| 2026-06-25 | Sprint 5 | I2 - Add upload URL/FormData assertion | codex (gpt-5) | S | R$ 5 |
| 2026-06-25 | Sprint 5.1 | A0 - Commit Phase H/I upload dialog + URL fix | claude (opus) | S | R$ 5 |
| 2026-06-25 | Sprint 5.1 | A1 - Economia entry-point regression test | claude (sonnet) | S | R$ 5 |
| 2026-06-25 | Sprint 5.1 | A2 - Phase I contract audit verification | claude (opus) | S | R$ 5 |
| 2026-06-25 | Sprint 5.1 | A3 - Type-safety evidence (filtered) | claude (opus) | S | R$ 5 |
| 2026-06-26 | Sprint 5.1 | B1 - Navigation IA decision record | claude (opus) | S | R$ 5 |
| 2026-06-26 | Sprint 5.1 | B2 - Consolidate sidebar to 4 sections + mobile hubs | claude (sonnet) | M | R$ 12 |
| 2026-06-26 | Sprint 5.1 | B3a - /energia section hub | claude (sonnet) | M | R$ 12 |
| 2026-06-26 | Sprint 5.1 | B3b+C1+C2 - /consumo hub + analyzer entry + empty state | claude (sonnet) | L | R$ 20 |
| 2026-06-26 | Sprint 5.1 | B5 - Sidebar 4-section regression test | claude (sonnet) | S | R$ 5 |
| 2026-06-26 | Sprint 5.1 | C3 - Consumo hub analyzer reachability test | claude (sonnet) | M | R$ 12 |
| 2026-06-27 | Sprint 6 | A1 - embedded prop for EconomiaScreen | claude (sonnet) | M | R$ 12 |
| 2026-06-27 | Sprint 6 | A2 - embedded prop for RateioScreen | claude (haiku) | M | R$ 12 |
| 2026-06-27 | Sprint 6 | A3 - embedded prop for ConsumptionDashboard | claude (haiku) | M | R$ 12 |
| 2026-06-27 | Sprint 6 | A4 - Unified /consumo tabbed shell | claude (sonnet) | L | R$ 20 |
| 2026-06-27 | Sprint 6 | A5 - Redirect old routes + repoint sidebar to tabs | claude (sonnet) | S | R$ 5 |
| 2026-06-27 | Sprint 6 | A6 - Finalize Consumo test suite (orphan remove + tabbed hrefs + real dialog) | claude (sonnet) | S | R$ 5 |