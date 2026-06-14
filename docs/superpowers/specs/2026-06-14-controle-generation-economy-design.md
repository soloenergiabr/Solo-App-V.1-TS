# Sprint 2 — "Controle": Generation + Economy Redesign

**Date:** 2026-06-14
**Status:** Design approved, pending spec review
**Scope:** Epic 1 (Geração) + Epic 2 (Consumo & Economia). Epic 3 (Clube Solo) is out of scope for this sprint.

---

## 1. North Star

Make Solo Energia's brand promise — **"Você no controle da sua energia"** — literal in the app. The client is treated as a high-performance asset investor in real control of their energy: F1-telemetry feel, Tesla engineering, Toyota discipline, Red Bull energy. The signature is the strong brand orange `#FF481E`.

The experience answers, in order:
1. **Is my investment paid off?** (payback / ROI — the emotional core, not "money saved")
2. **This month** across three lenses: **money**, **energy**, **return vs. investment**
3. **Lifetime / total-time** cumulative generation and return
4. **Status of each billing/account** in the network

**Design principle:** design the ideal product vision, not what the current backend allows. The backend will be built to match this spec afterward.

---

## 2. Audiences & Scope (3 access scopes)

| Scope | Who | Sees | Edits |
|---|---|---|---|
| **Titular** | client owner (e.g. the mother) | full network: all accounts, full Controle / Geração / Economia | nothing structural |
| **Payer** | scoped login (e.g. the brother who pays his own UC) | slimmed Controle + own AccountCard(s) + own PIX; Economia limited to own UC(s) | mark own bills, copy own PIX |
| **Admin** | Solo team (`@master`) | everything inside a client cockpit | CRUD accounts, assign payers, set rateio %, set Investment, upload bills/PIX, mark paid |

Scope is enforced **server-side** in the data layer, not merely hidden in the UI.

---

## 3. Information Architecture

**Client (`@user`):**
```
Controle   ← NEW landing: merged asset control center
  ├─ Geração     ← generation detail (redesigned dashboard)
  └─ Economia    ← accounts, bills, rateio, costs, PIX
Clube Solo / Solo Coins / Perfil   ← untouched this sprint
```

**Payer (`@user`, scoped):** same shell, data filtered to the account(s) the user is responsible for. Slimmed Controle (own account status + bill + PIX), Economia limited to own UC(s). No network rateio editing, no sibling accounts.

**Admin (`@master`):**
```
Clients → [select client] → Client Cockpit
   ├─ Controle  (read KPIs)
   ├─ Geração   (manage plants/inverters)
   └─ Economia  (manage accounts, payers, rateio %, investment, bills, payments)
```

The Controle overview is **one reusable composition** fed by a role + scope aware data layer; client, payer, and admin render the same building blocks with different data scope and edit permissions.

---

## 4. Design System Foundation

Ported from `Mockup_Examples/solopro_desigh_system.txt` (the saved "Portal do Cliente Solo Energia" reference), into the app's Tailwind/shadcn token layer in `globals.css`.

**Theme = dark-first, brand orange.** (Light theme out of scope this sprint; reference is dark-only.)

| Token | Value |
|---|---|
| `--background` | `0 0% 8%` (near-black) |
| `--card` / `--popover` | `0 0% 11%` |
| `--foreground` | `48 9% 88%` (warm white) |
| `--primary` / `--accent` / `--ring` | `11 100% 56%` (= brand orange `#FF481E`) |
| `--border` | `0 0% 16%` |
| `--input` | `0 0% 20%` |
| `--radius` | `1rem` |
| `--brand-gradient` | `linear-gradient(135deg, #FF481E 0%, #F5A623 100%)` |
| charts 1–5 | orange `11 100% 56%`, amber `38 100% 54%`, teal `180 100% 40%`, purple `280 100% 60%`, pink `340 100% 60%` |

> Note: the reference file used hue 14 for primary; this spec uses the true brand orange `#FF481E` = `11 100% 56%`.

**Fonts** via `next/font`: **DM Sans** (body), **Outfit** (display/headlines — free substitute for the reference's Neue Montreal).

**Motion** (framer-motion, already installed): gauge fill on load, KPI count-up, status-ring draw, subtle glow pulse on live data. All animation respects `prefers-reduced-motion`.

### Reusable "telemetry kit" components
Shared across Controle / Geração / Economia and the admin cockpit:

- **`PaybackGauge`** — "Investimento X% pago" hero gauge (F1 instrument feel)
- **`MetricTile`** — month KPI in 3 lenses (R$ / kWh / retorno), count-up animation
- **`StatusRing`** — health indicator (verde / amarelo / vermelho) for accounts and inverters
- **`GlowChart`** — recharts wrapper with orange "golden-hour" glow + gradient fills
- **`AccountCard`** — one UC: bill, payment status, titular vs. payer, PIX, PDF, AI analysis
- **`CopyPixButton`** — one-click copy with native-feeling confirmation feedback
- **`LiveBadge`** — real-time "ao vivo" pulse

---

## 5. Screen: Controle (overview)

Landing page. Default period **este mês**, with a **Vida toda** toggle.

```
Olá, {nome}                              ⚡ ao vivo    [ Mês ▼ ]
você no controle da sua energia

        PaybackGauge: Investimento 62% pago
        R$ 31.000 / R$ 50.000 · quitação prevista mar/2027

DINHEIRO            ENERGIA               RETORNO (vs invest.)
R$ 643 economia mês 980 kWh ger/1.100 con + R$ 643 · +1,3% no mês

VIDA TODA  ▸ 18.420 kWh gerados · R$ 31.000 retorno
           ▸ 14 meses ativo · 8,2 t CO₂ evitado

SUAS CONTAS (rede)                              ver todas ▸
●Casa  ●Mãe  ●Irmão  ○Loja  ●Sítio   (StatusRing por conta → toca p/ detalhe)

GERAÇÃO agora  3,4 kW  ▁▂▅▇▆▃            ver telemetria ▸
```

**Reading order:** payback gauge → month (money/energy/return) → lifetime → per-account status rings → live generation peek. Account rings and the generation peek are tap-throughs to the detail pages.

**Scope-aware:** payer sees this page scoped to their own account(s); admin sees it read-only inside a client cockpit.

CO₂/lifestyle line is included (kept as a soft engagement element; can be dropped if it dilutes the investor framing).

---

## 6. Screen: Geração (Telemetria)

Premium redesign of today's generation dashboard (`@user/dashboard`), same data hooks (`useGenerationDashboard`), new telemetry skin. Implements Epic 1's "Golden Hour" visualization and status rings.

```
Geração              ⚡ ao vivo   [Dia·Mês·Ano]  ◂ hoje ▸

PRODUÇÃO AGORA      ENERGIA (período)     EFICIÊNCIA
 3,4 kW (LiveBadge)  980 kWh (count-up)   94% (gauge)

GlowChart — "golden hour" área com brilho laranja (gradient #FF481E→#F5A623)
   eixo: 06h … 18h

SEUS INVERSORES (StatusRing por equipamento)
●Hoymiles 2,1kW  ●Deye 1,3kW  ⚠Auxsol limpeza  ○Canadian
verde ok · amarelo atenção/limpeza · vermelho falha

Comparação entre inversores (GlowChart multi-série)
Tabela detalhada (expansível)
```

**Upgrades vs. today:** aggregate live kW hero with pulse; `GlowChart` replacing flat recharts; per-inverter `StatusRing` row surfacing "needs cleaning / fault" at a glance (JTBD: don't lose money on hidden downtime); telemetry-styled period nav. Existing comparison chart, inverter table, and `InverterMultiSelect` filter preserved/reskinned.

---

## 7. Screen: Economia (Contas & Rateio)

Largest functional surface. `Consolidado ⇄ Por conta` toggle (instant client-side switch, no scroll reset).

```
Economia                         [ Mês ▼ ]   [Consolidado | Por conta]

CONTAS A PAGAR
● Casa   R$ 187  vence 12/04   [ Copiar PIX ]   a pagar
● Mãe    R$ 142  vence 12/04   [ Copiar PIX ]   a pagar
✓ Irmão  R$ 96   pago 03/04                      paga
⚠ Loja   R$ 210  venceu 28/03  [ Copiar PIX ]   vencida

CONSOLIDADO (rede toda)
Você pagaria R$ 1.890 → Você paga R$ 643 · Economia R$ 1.247 (66%) · Créditos +120 kWh

RATEIO (distribuição de créditos)
Usina ▸ Casa 40% · Mãe 25% · Irmão 20% · Sítio 15%   [barra visual]

CONTAS (Por conta) — AccountCard por UC:
  Casa · Enel · UC 123456                       ●ok / a pagar
  Titular: Gabriel   Paga: Mateus
  Fatura mar: R$ 187   vence 12/04
  Economia R$ 410   custo real ▸
  [ Copiar PIX ]  [ PDF ]  [ Análise IA ]

ANÁLISE DE CUSTO (conta selecionada)
Energia · TUSD/TE · ICMS · ilum. pública · bandeira
IA: "bandeira vermelha elevou R$ 38 este mês"
```

**Highlights:**
- **Contas a pagar** quick-pay strip at the top: opens Economia with "what do I owe and how do I pay it." Each bill has a payment status: **a pagar** (shows Copy PIX) → **paga** (✓ + paid date) → **vencida** (red, overdue, still payable). Same status badge appears on each AccountCard.
- **Consolidado ⇄ Por conta** toggle (Epic 2 core).
- **Rateio** visualized from existing `CreditAllocation` (read for client/payer, editable for admin).
- **AccountCard** per UC shows **titular vs. payer** (mother/brother case), bill, savings, due date, payment status, and one-click **Copy PIX** + PDF + AI cost analysis.
- **Cost analysis** breaks down the real bill (existing ~30 `EnergyBill` financial fields + `aiAnalysis`).
- **Payer scope:** payer sees only their own AccountCard(s); no network rateio editing.

---

## 8. New Data Concepts (backend built after design)

Most of the model already exists (`ConsumerUnit`, `CreditAllocation`, `EnergyBill` with rich financial fields, `Plant`, `Inverter`, `GenerationUnit`). New concepts this design introduces:

| Concept | Why | Conceptual shape |
|---|---|---|
| **Investment** | drives PaybackGauge | system cost (R$), start date → computes % paid, retorno acumulado, quitação prevista |
| **Bill payment** | Contas a pagar | on `EnergyBill`: `paymentStatus` (a_pagar \| paga \| vencida), `paidAt`, `dueDate`, `pixCode`, `barcode` |
| **Payer link** | scoped login | `User ↔ ConsumerUnit` relation (payer user → the UC(s) they pay) + `payerName` / `payerEmail` / `payerPhone` on `ConsumerUnit` |
| *(reuse)* Rateio | distribution view | existing `CreditAllocation` (from → to, `allocationPercentage`, active periods) |

> These are conceptual. Exact Prisma modeling is decided during implementation, but the frontend is designed to these shapes.

---

## 9. Admin Cockpit

Mirrors the same telemetry kit in management mode: client list → client → Controle (read KPIs) · Geração (manage plants/inverters) · Economia (CRUD accounts, payers, rateio %, investment, bills, payments — including upload PIX and mark paid). Reuses the API surface already present under `app/api/admin/clients/[id]/*`.

---

## 10. Quality & States

- **Loading:** skeletons (existing pattern).
- **Empty:** explicit empty states ("nenhuma conta ainda", "sem faturas no período").
- **Error:** alert pattern already in use.
- **Accessibility/motion:** all animation gated by `prefers-reduced-motion`.
- **Testing:**
  - Vitest unit tests for pure calculations: money/energy/payback math and the `consolidado ⇄ por-conta` aggregation.
  - Component tests for `CopyPixButton` (copy + confirmation), `PaybackGauge` (% rendering), `StatusRing` (state→color mapping).

---

## 11. Out of Scope (this sprint)

- Epic 3 (Clube Solo / Solo Coins / referrals).
- Light theme.
- Notification delivery (WhatsApp/email cadence) — payer login + in-app status only; delivery is a later sprint.
- Neue Montreal licensing (using Outfit).

---

## 12. Implementation Sequencing (suggested)

1. **Foundation** — theme tokens, fonts, telemetry-kit components (PaybackGauge, MetricTile, StatusRing, GlowChart, AccountCard, CopyPixButton, LiveBadge).
2. **Geração** redesign (lowest data risk — hooks exist).
3. **Controle** overview (composes kit + needs Investment concept).
4. **Economia** (accounts, rateio, Contas a pagar, PIX, cost analysis).
5. **Access control** (payer scope + scoped data layer).
6. **Admin cockpit** management surfaces.

Detailed plan to be produced by the writing-plans skill.
