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
| 2026-06-24 | Sprint 5 | B2 - Bill chat API route | deepseek-flash | M | R$ 12 |
