# Sprint 2 "Controle" — Unified Implementation Plan (All Waves)

> **For agentic workers:** REQUIRED SUB-SKILL: Use
> superpowers:subagent-driven-development (recommended) or
> superpowers:executing-plans to implement this plan wave-by-wave, task-by-task.
> Steps use checkbox (`- [ ]`) syntax for tracking. Each wave is independently
> shippable and must end green (its tests pass + build compiles) before the next
> begins.

**Goal:** Deliver the entire Sprint 2 "Controle" experience end-to-end — brand
identity, branded auth + shell, the data concepts that payback/PIX/payer need,
and the three redesigned screens (Geração, Controle, Economia) plus payer access
scope and admin parity — so the app makes Solo's promise _"Você no controle da
sua energia"_ literal.

**Architecture:** Built in 6 dependency-ordered waves on top of the
already-shipped Plan 1 foundation (dark brand-orange tokens in `globals.css`,
`DM Sans + Outfit` fonts, and the tested `src/frontend/telemetry-kit/` of
`PaybackGauge`, `MetricTile`, `StatusRing`, `GlowChart`, `CopyPixButton`,
`LiveBadge`, `calcPaybackPercent`, `calcSavings`, formatters). Each screen
composes the telemetry kit. New data (Investment, bill payment/PIX, payer↔UC) is
added to Prisma and surfaced through hooks; the frontend is built to the spec's
ideal shapes (spec §8) with the backend extended to match.

**Tech Stack:** Next.js 15 (App Router) + React 19, Tailwind v4 (CSS-variable
tokens), shadcn/ui (new-york), Prisma + PostgreSQL, framer-motion, recharts,
Vitest 3 + jsdom + Testing Library.

**Specs:** design spec
`docs/superpowers/specs/2026-06-14-controle-generation-economy-design.md`
(§§1–12); sprint brief `scripts/Planning/sprint_2_frontend_v1.md`; Plan 1
`docs/superpowers/plans/2026-06-14-controle-foundation.md`; brand/auth/shell
detail `docs/superpowers/plans/2026-06-14-solo-brand-auth-shell.md`.

**Existing code this plan builds on (verified):**

- Prisma models: `User`, `Client`, `Plant`, `Inverter`, `ConsumerUnit`,
  `CreditAllocation`, `GenerationUnit`, `Consumption`, `EnergyBill` (already has
  ~30 financial fields + `aiAnalysis`/`aiExplanations`/`alerts` + `status`).
- APIs: `app/api/consumption/dashboard`,
  `app/api/admin/clients/[id]/{energy-bills,credit-allocations,consumer-units,plants}`.
- Frontend: `useGenerationDashboard` (`src/frontend/generation/...`),
  `useConsumptionDashboard` +
  `ConsumptionDashboard`/`SavingsCard`/`ConsumptionChart`
  (`src/frontend/consumption/...`), admin `client-details` +
  `use-admin-energy-management`.
- The user dashboard (`@user/dashboard`) already has an ad-hoc telemetry-kit
  integration (committed `f7f5b8a`).

---

## Wave Overview

| Wave  | Title                      | Ships                                                                                                                                                     | Depends on |
| ----- | -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| **1** | Brand, Auth & Shell        | Brand assets, Neue Montreal, glow tokens, `BrandMark`/`BrandLogo`, 4 rebuilt auth pages, branded shell, all-pages token pass                              | Plan 1     |
| **2** | Data Foundation            | Prisma: `Investment`, bill `paymentStatus`/`pixCode`/`barcode`/`dueDate`/`paidAt`, payer↔UC link; migration; shared TS types; economy/controle data hooks | Wave 1     |
| **3** | Geração (Telemetria)       | Redesigned generation screen: live kW hero, efficiency gauge, GlowChart, per-inverter StatusRing row, reskinned comparison + table                        | Wave 1     |
| **4** | Controle (Overview)        | New landing: PaybackGauge hero, 3-lens MetricTiles, Vida-toda toggle, per-account StatusRing strip, live generation peek; new route + nav                 | Waves 2, 3 |
| **5** | Economia (Contas & Rateio) | Contas a pagar strip, Consolidado⇄Por conta, AccountCard per UC, Copy PIX, rateio viz, cost analysis                                                      | Waves 2    |
| **6** | Access Scope & Admin       | Payer scope (server-enforced) + admin cockpit parity (manage investment, payments, rateio, payers)                                                        | Waves 4, 5 |

> **Sequencing note:** Waves 3 and 5 can run in parallel after Wave 2. Wave 4
> (Controle) needs the Investment hook (Wave 2) and the Geração peek (Wave 3).
> Wave 6 is last.

---

## Cross-Cutting Conventions

- Interactive components start with `"use client"`; import `cn` from
  `@/lib/utils`; root element gets `data-slot="<name>"`.
- Component test files start with `// @vitest-environment jsdom`. Pure helpers
  are unit-tested (node env). Charts get an empty-state test + manual visual
  check.
- Money/energy/percent rendering ALWAYS goes through `telemetry-kit` formatters
  (`formatBRL`, `formatKwh`, `formatKw`, `formatPercent`). Never re-implement
  number formatting.
- Brand image components render a plain `<img>` (jsdom-testable) with
  `{/* eslint-disable-next-line @next/next/no-img-element */}`.
- Prisma `Decimal` columns arrive as strings/Decimal at the API boundary —
  coerce with `Number(...)` in the mapping layer of each hook, never deep in
  components.
- All animation respects `prefers-reduced-motion` (kit already does; new motion
  uses `motion-reduce:` utilities).
- Commit after every green step. Branch per wave: `wave-1-brand`, `wave-2-data`,
  etc.

---

# WAVE 1 — Brand, Auth & Shell

**This wave is already fully specified in
`docs/superpowers/plans/2026-06-14-solo-brand-auth-shell.md`.** Execute that
plan verbatim (13 tasks). Summary checklist for tracking:

- [ ] **1.1** Import brand assets (marks, wordmark, Neue Montreal `.otf`,
      favicon) → `public/brand/`, `src/app/fonts/`, `src/app/icon.png`.
- [ ] **1.2** Self-host Neue Montreal as `--font-display`
      (`src/app/layout.tsx`).
- [ ] **1.3** Extend tokens: `--energy` (#4ade80), `--card-border`, `--glow-*`,
      `--brand-gradient-90` + glow utilities (`src/app/globals.css`).
- [ ] **1.4** `BrandMark` component (+ test) —
      `src/frontend/brand/brand-mark.tsx`.
- [ ] **1.5** `BrandLogo` component (+ test) + barrel — `src/frontend/brand/`.
- [ ] **1.6** Branded `(auth)/layout.tsx` split-screen shell.
- [ ] **1.7–1.10** Rebuild Login / Forgot / Reset / Register on tokens.
- [ ] **1.11** Shell polish: sidebar wordmark + display-font headings.
- [ ] **1.12** Brand pass over remaining `@user`/`@master` pages (tokenize
      colors).
- [ ] **1.13** App metadata + full verification
      (`vitest run telemetry-kit brand`, `next build`).

**Wave 1 exit criteria:**
`npx.cmd vitest run src/frontend/telemetry-kit src/frontend/brand` PASS;
`npx.cmd next build --no-lint` compiles; auth + shell visually branded.

---

# WAVE 2 — Data Foundation (payback, payment/PIX, payer)

**Goal:** Add the spec §8 concepts to Prisma and expose them through typed
hooks, so Waves 4–5 build against real shapes. Frontend defaults gracefully when
fields are null (design-first principle).

**Files:**

- Modify: `prisma/schema.prisma`
- Create: migration via `prisma migrate`
- Create: `src/shared/controle/types.ts` — shared TS types used by all later
  waves.
- Create: `src/frontend/controle/hooks/use-controle-overview.ts` (+ API route) —
  payback + month + lifetime + account-status feed.

## Task 2.1: Add payment + PIX fields to `EnergyBill`

- [ ] **Step 1: Add the payment enum and fields**

In `prisma/schema.prisma`, add this enum near the other enums (after
`enum RedemptionStatus { … }`):

```prisma
enum BillPaymentStatus {
  a_pagar
  paga
  vencida
}
```

Then inside `model EnergyBill { … }`, just after the `status String?` line
(before `createdAt`), add:

```prisma
// Payment / Contas a pagar
paymentStatus BillPaymentStatus @default(a_pagar)
dueDate       DateTime?         @db.Date
paidAt        DateTime?
amountDue     Decimal?          @db.Decimal(14, 2)
pixCode       String?
barcode       String?
```

- [ ] **Step 2: Add an index for the payment query**

Inside the same model's index block, add:

```prisma
@@index([clientId, paymentStatus])
```

- [ ] **Step 3: Create the migration**

Run: `npx.cmd prisma migrate dev --name add_bill_payment_fields` Expected:
migration created + applied; `prisma generate` runs. If no shadow DB, use
`npx.cmd prisma migrate dev --create-only --name add_bill_payment_fields` then
apply per project convention.

- [ ] **Step 4: Commit**

```bash
git add prisma/schema.prisma prisma/migrations
git commit -m "feat(data): add EnergyBill payment + PIX fields"
```

## Task 2.2: Add payer link to `ConsumerUnit` + `User`

- [ ] **Step 1: Add payer fields + relation**

In `model ConsumerUnit { … }`, after the `status String?` line, add:

```prisma
// Payer (scoped login who pays this UC)
payerName  String?
payerEmail String?
payerPhone String?
payerUser   User?   @relation("PayerUnits", fields: [payerUserId], references: [id])
payerUserId String?
```

And add the index:

```prisma
@@index([payerUserId])
```

In `model User { … }`, after the `client Client? @relation(...)` line, add:

```prisma
payerUnits ConsumerUnit[] @relation("PayerUnits")
```

- [ ] **Step 2: Migrate + commit**

```bash
npx.cmd prisma migrate dev --name add_payer_link
git add prisma/schema.prisma prisma/migrations
git commit -m "feat(data): add payer link between User and ConsumerUnit"
```

## Task 2.3: Add `Investment` model (drives PaybackGauge)

- [ ] **Step 1: Add the model + relation**

Add to `prisma/schema.prisma`:

```prisma
model Investment {
  id String @id @default(dbgenerated("(concat('investment_', gen_random_uuid()))::TEXT"))

  client   Client @relation(fields: [clientId], references: [id], onDelete: Cascade)
  clientId String

  totalInvested   Decimal   @db.Decimal(14, 2)
  startDate       DateTime  @db.Date
  expectedPayoff  DateTime? @db.Date
  monthlyReturn   Decimal?  @db.Decimal(14, 2) // optional override; else derived from bills savings

  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  deletedAt DateTime?

  @@index([clientId])
  @@map("investment")
}
```

In `model Client { … }`, add to the relations block:

```prisma
investments Investment[]
```

- [ ] **Step 2: Migrate + commit**

```bash
npx.cmd prisma migrate dev --name add_investment
git add prisma/schema.prisma prisma/migrations
git commit -m "feat(data): add Investment model"
```

## Task 2.4: Shared TS types

- [ ] **Step 1: Create the shared types**

Create `src/shared/controle/types.ts`:

```ts
export type BillPaymentStatus = "a_pagar" | "paga" | "vencida";

export interface AccountBill {
    id: string;
    consumerUnitId: string;
    consumerUnitName: string;
    distributor: string | null;
    accountNumber: string | null;
    referenceMonth: number;
    referenceYear: number;
    amountDue: number;
    dueDate: string | null;
    paidAt: string | null;
    paymentStatus: BillPaymentStatus;
    pixCode: string | null;
    barcode: string | null;
    billFileUrl: string | null;
    estimatedSavings: number;
    titularName: string | null;
    payerName: string | null;
    aiAnalysis: string | null;
}

export interface RateioSlice {
    toUnitId: string;
    toUnitName: string;
    percentage: number;
}

export interface InvestmentSummary {
    totalInvested: number;
    returned: number;
    expectedPayoffLabel: string | null;
    monthsActive: number;
}

export interface EconomyConsolidated {
    wouldPay: number;
    actuallyPay: number;
    savedAmount: number;
    savedPercent: number;
    creditsKwh: number;
}

export interface ControleOverview {
    clientName: string;
    investment: InvestmentSummary;
    month: {
        moneySaved: number;
        energyGeneratedKwh: number;
        energyConsumedKwh: number;
        returnVsInvestment: number;
        monthChangePercent: number;
    };
    lifetime: {
        totalGeneratedKwh: number;
        totalReturn: number;
        monthsActive: number;
        co2AvoidedTons: number;
    };
    accounts: Array<
        {
            id: string;
            name: string;
            status: "ok" | "warning" | "critical" | "unknown";
        }
    >;
    liveGenerationKw: number;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/shared/controle/types.ts
git commit -m "feat(data): add shared Controle TS types"
```

## Task 2.5: Bill-status pure helpers (TDD)

**Files:** `src/frontend/economia/lib/bill-status.ts` (+ test)

- [ ] **Step 1: Write the failing test**

Create `src/frontend/economia/lib/bill-status.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { resolveBillStatus, statusToBadge } from "./bill-status";

describe("resolveBillStatus", () => {
    const ref = new Date("2026-04-15T00:00:00Z");
    it("returns paga when paidAt is set", () => {
        expect(
            resolveBillStatus({
                paymentStatus: "a_pagar",
                paidAt: "2026-04-03",
                dueDate: "2026-04-12",
            }, ref),
        ).toBe("paga");
    });
    it("returns vencida when unpaid and past due", () => {
        expect(
            resolveBillStatus({
                paymentStatus: "a_pagar",
                paidAt: null,
                dueDate: "2026-03-28",
            }, ref),
        ).toBe("vencida");
    });
    it("returns a_pagar when unpaid and not yet due", () => {
        expect(
            resolveBillStatus({
                paymentStatus: "a_pagar",
                paidAt: null,
                dueDate: "2026-04-20",
            }, ref),
        ).toBe("a_pagar");
    });
    it("returns a_pagar when no due date and unpaid", () => {
        expect(
            resolveBillStatus({
                paymentStatus: "a_pagar",
                paidAt: null,
                dueDate: null,
            }, ref),
        ).toBe("a_pagar");
    });
});

describe("statusToBadge", () => {
    it("maps each status to a label + tone", () => {
        expect(statusToBadge("paga")).toEqual({
            label: "paga",
            tone: "success",
        });
        expect(statusToBadge("a_pagar")).toEqual({
            label: "a pagar",
            tone: "warning",
        });
        expect(statusToBadge("vencida")).toEqual({
            label: "vencida",
            tone: "destructive",
        });
    });
});
```

- [ ] **Step 2: Run to verify it fails** —
      `npx.cmd vitest run src/frontend/economia/lib/bill-status.test.ts` → FAIL
      (unresolved import).

- [ ] **Step 3: Implement**

Create `src/frontend/economia/lib/bill-status.ts`:

```ts
import type { BillPaymentStatus } from "@/shared/controle/types";

export function resolveBillStatus(
    bill: {
        paymentStatus: BillPaymentStatus;
        paidAt: string | null;
        dueDate: string | null;
    },
    now: Date = new Date(),
): BillPaymentStatus {
    if (bill.paidAt || bill.paymentStatus === "paga") return "paga";
    if (bill.dueDate && new Date(bill.dueDate) < now) return "vencida";
    return "a_pagar";
}

export function statusToBadge(
    status: BillPaymentStatus,
): { label: string; tone: "success" | "warning" | "destructive" } {
    switch (status) {
        case "paga":
            return { label: "paga", tone: "success" };
        case "vencida":
            return { label: "vencida", tone: "destructive" };
        default:
            return { label: "a pagar", tone: "warning" };
    }
}
```

- [ ] **Step 4: Run to verify it passes** — PASS.
- [ ] **Step 5: Commit** — `feat(economia): add bill-status helpers`.

## Task 2.6: Consolidado aggregation helper (TDD)

**Files:** `src/frontend/economia/lib/aggregate.ts` (+ test)

- [ ] **Step 1: Write the failing test**

Create `src/frontend/economia/lib/aggregate.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { aggregateEconomy } from "./aggregate";
import type { AccountBill } from "@/shared/controle/types";

const bill = (over: Partial<AccountBill>): AccountBill => ({
    id: "b",
    consumerUnitId: "u",
    consumerUnitName: "UC",
    distributor: "Enel",
    accountNumber: null,
    referenceMonth: 3,
    referenceYear: 2026,
    amountDue: 0,
    dueDate: null,
    paidAt: null,
    paymentStatus: "a_pagar",
    pixCode: null,
    barcode: null,
    billFileUrl: null,
    estimatedSavings: 0,
    titularName: null,
    payerName: null,
    aiAnalysis: null,
    ...over,
});

describe("aggregateEconomy", () => {
    it("sums actually-paid and savings into would-pay + percent", () => {
        const result = aggregateEconomy([
            bill({ amountDue: 187, estimatedSavings: 410 }),
            bill({ amountDue: 142, estimatedSavings: 300 }),
        ]);
        expect(result.actuallyPay).toBe(329);
        expect(result.savedAmount).toBe(710);
        expect(result.wouldPay).toBe(1039);
        expect(result.savedPercent).toBe(68);
    });
    it("returns zeros for no bills", () => {
        expect(aggregateEconomy([])).toEqual({
            wouldPay: 0,
            actuallyPay: 0,
            savedAmount: 0,
            savedPercent: 0,
            creditsKwh: 0,
        });
    });
});
```

- [ ] **Step 2: Run to verify it fails.**

- [ ] **Step 3: Implement**

Create `src/frontend/economia/lib/aggregate.ts`:

```ts
import type { AccountBill, EconomyConsolidated } from "@/shared/controle/types";

export function aggregateEconomy(
    bills: AccountBill[],
    creditsKwh = 0,
): EconomyConsolidated {
    const actuallyPay = bills.reduce((s, b) => s + b.amountDue, 0);
    const savedAmount = bills.reduce((s, b) => s + b.estimatedSavings, 0);
    const wouldPay = actuallyPay + savedAmount;
    const savedPercent = wouldPay > 0
        ? Math.round((savedAmount / wouldPay) * 100)
        : 0;
    return { wouldPay, actuallyPay, savedAmount, savedPercent, creditsKwh };
}
```

- [ ] **Step 4: Run to verify it passes.**
- [ ] **Step 5: Commit** — `feat(economia): add consolidado aggregation helper`.

## Task 2.7: Economy bills API + hook

**Files:** Create `src/app/api/economia/bills/route.ts`; Create
`src/frontend/economia/hooks/use-economia.ts`.

- [ ] **Step 1: API route returning the caller's account bills**

Create `src/app/api/economia/bills/route.ts` — GET the authenticated user's
client bills for a period, scoped to payer units when the user is a payer.
Follow the auth pattern in `app/api/consumption/dashboard/route.ts` (same
session/clientId resolution). Map each `EnergyBill` (+ its `ConsumerUnit`) into
the `AccountBill` shape from `@/shared/controle/types`, coercing Decimals with
`Number()`. Filter: if the user has `payerUnits`, restrict
`consumerUnitId in payerUnitIds`; otherwise return all client UCs.

```ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/backend/shared/prisma"; // use the project's prisma singleton import path
import { getSessionUser } from "@/backend/auth/session"; // use the project's existing session helper
import type { AccountBill } from "@/shared/controle/types";

export async function GET(req: NextRequest) {
    const user = await getSessionUser(req);
    if (!user?.clientId) {
        return NextResponse.json({ success: false, message: "unauthorized" }, {
            status: 401,
        });
    }

    const { searchParams } = new URL(req.url);
    const year = Number(searchParams.get("year")) || new Date().getFullYear();
    const month = searchParams.get("month")
        ? Number(searchParams.get("month"))
        : undefined;

    const payerUnits = await prisma.consumerUnit.findMany({
        where: { payerUserId: user.id },
        select: { id: true },
    });
    const payerUnitIds = payerUnits.map((u) => u.id);

    const bills = await prisma.energyBill.findMany({
        where: {
            clientId: user.clientId,
            referenceYear: year,
            ...(month ? { referenceMonth: month } : {}),
            ...(payerUnitIds.length
                ? { consumerUnitId: { in: payerUnitIds } }
                : {}),
        },
        include: { consumerUnit: true },
        orderBy: [{ referenceYear: "desc" }, { referenceMonth: "desc" }],
    });

    const data: AccountBill[] = bills.map((b) => ({
        id: b.id,
        consumerUnitId: b.consumerUnitId,
        consumerUnitName: b.consumerUnit?.name ??
            b.consumerUnit?.clientNumber ?? "Conta",
        distributor: b.consumerUnit?.distributor ?? b.distributor ?? null,
        accountNumber: b.consumerUnit?.accountNumber ?? b.accountNumber ?? null,
        referenceMonth: b.referenceMonth,
        referenceYear: b.referenceYear,
        amountDue: Number(b.amountDue ?? b.totalBillValue ?? 0),
        dueDate: b.dueDate ? b.dueDate.toISOString() : null,
        paidAt: b.paidAt ? b.paidAt.toISOString() : null,
        paymentStatus: b.paymentStatus,
        pixCode: b.pixCode ?? null,
        barcode: b.barcode ?? null,
        billFileUrl: b.billFileUrl ?? null,
        estimatedSavings: Number(b.estimatedSavings ?? 0),
        titularName: b.consumerUnit?.accountHolder ?? b.accountHolder ?? null,
        payerName: b.consumerUnit?.payerName ?? null,
        aiAnalysis: b.aiAnalysis ?? null,
    }));

    return NextResponse.json({ success: true, data });
}
```

> Worker note: replace `@/backend/shared/prisma` and `@/backend/auth/session`
> with the project's actual prisma singleton + session helper (grep `prisma`
> usage in an existing route under `app/api/consumption/dashboard/route.ts` to
> copy the exact imports).

- [ ] **Step 2: Frontend hook**

Create `src/frontend/economia/hooks/use-economia.ts`:

```ts
import { useEffect, useState } from "react";
import { useAuthenticatedApi } from "@/frontend/auth/hooks/useAuthenticatedApi";
import type { AccountBill } from "@/shared/controle/types";

export function useEconomia(params: { year?: number; month?: number }) {
    const api = useAuthenticatedApi();
    const [bills, setBills] = useState<AccountBill[] | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!api.isAuthenticated) return;
        const qs = new URLSearchParams();
        qs.append("year", String(params.year ?? new Date().getFullYear()));
        if (params.month) qs.append("month", String(params.month));
        setIsLoading(true);
        api.get(`/economia/bills?${qs.toString()}`)
            .then((res) => {
                if (res.data.success) setBills(res.data.data);
                else setError(res.data.message || "Falha ao carregar contas");
            })
            .catch((e) =>
                setError(
                    e?.response?.data?.message || "Erro ao carregar contas",
                )
            )
            .finally(() => setIsLoading(false));
    }, [api.isAuthenticated, params.year, params.month]);

    return { bills, isLoading, error };
}
```

- [ ] **Step 3: Verify** —
      `npx.cmd tsc --noEmit 2>&1 | grep -E "economia|economia/bills"` (expect
      none beyond pre-existing).
- [ ] **Step 4: Commit** — `feat(economia): add bills API + hook`.

**Wave 2 exit criteria:** migrations applied;
`npx.cmd vitest run src/frontend/economia/lib` PASS; types compile.

---

# WAVE 3 — Geração (Telemetria)

**Goal:** Finish the spec §6 generation redesign on `@user/dashboard`, extending
the committed ad-hoc integration (`f7f5b8a`): aggregate live-kW hero, efficiency
gauge, GlowChart, per-inverter StatusRing row, reskinned comparison chart +
table. Same `useGenerationDashboard` data.

**Files:**

- Create: `src/frontend/generation/components/dashboard/efficiency-gauge.tsx` (+
  test)
- Modify: `src/app/(private)/@user/dashboard/page.tsx`
- Modify:
  `src/frontend/generation/components/dashboard/inverters-comparison-chart.tsx`
  (reskin)
- Modify: `src/frontend/generation/components/dashboard/inverters-table.tsx`
  (reskin)

## Task 3.1: EfficiencyGauge component (TDD)

- [ ] **Step 1: Write the failing test**

Create `src/frontend/generation/components/dashboard/efficiency-gauge.test.tsx`:

```tsx
// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { EfficiencyGauge } from "./efficiency-gauge";

describe("EfficiencyGauge", () => {
    it("renders the percent and label", () => {
        render(<EfficiencyGauge percent={94} />);
        expect(screen.getByText("94%")).toBeInTheDocument();
        expect(screen.getByText(/eficiência/i)).toBeInTheDocument();
    });
    it("clamps out-of-range values", () => {
        render(<EfficiencyGauge percent={140} />);
        expect(screen.getByText("100%")).toBeInTheDocument();
    });
});
```

- [ ] **Step 2: Run to verify it fails.**

- [ ] **Step 3: Implement**

Create `src/frontend/generation/components/dashboard/efficiency-gauge.tsx`:

```tsx
import { cn } from "@/lib/utils";
import { formatPercent } from "@/frontend/telemetry-kit";

export function EfficiencyGauge(
    { percent, className }: { percent: number; className?: string },
) {
    const value = Math.max(0, Math.min(100, Math.round(percent)));
    return (
        <div
            data-slot="efficiency-gauge"
            className={cn(
                "flex flex-col gap-1 rounded-2xl border bg-card p-4",
                className,
            )}
        >
            <span className="text-xs font-medium tracking-wide text-muted-foreground">
                EFICIÊNCIA
            </span>
            <span className="font-display text-2xl font-semibold text-foreground">
                {formatPercent(value)}
            </span>
            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                    className="h-full rounded-full bg-brand-gradient-90"
                    style={{ width: `${value}%` }}
                />
            </div>
        </div>
    );
}
```

- [ ] **Step 4: Run to verify it passes.**
- [ ] **Step 5: Commit** — `feat(geracao): add EfficiencyGauge`.

## Task 3.2: Compose the redesigned Geração screen

- [ ] **Step 1: Add the efficiency tile + live hero to the metric row**

In `src/app/(private)/@user/dashboard/page.tsx`, import `EfficiencyGauge` and
(already imported) the kit. In the real-time metric block, render
`EfficiencyGauge` using `overview.generationEfficiency` when present, else
derived from `peakPower`/`averagePower`:

```tsx
import { EfficiencyGauge } from "@/frontend/generation/components/dashboard/efficiency-gauge";
// …compute once near chartData:
const efficiencyPct = analytics
    ? Math.min(
        100,
        Math.round(
            (analytics.overview.averagePower /
                Math.max(1, analytics.overview.peakPower)) * 100,
        ),
    )
    : 0;
```

Add `<EfficiencyGauge percent={efficiencyPct} />` as a fourth tile in the
real-time grid (replace the "INVERSORES ATIVOS" tile or extend the grid to 5
columns on `lg`). Keep the existing `LiveBadge`, `MetricTile`s, `StatusRing`
strip, and `GlowChart` from commit `f7f5b8a`.

- [ ] **Step 2: Verify** — `npx.cmd tsc --noEmit 2>&1 | grep "dashboard/page"`
      (expect none). Manual: real-time view shows live kW + efficiency + glow
      chart + status rings.
- [ ] **Step 3: Commit** —
      `feat(geracao): add efficiency to telemetry dashboard`.

## Task 3.3: Reskin comparison chart + inverter table

- [ ] **Step 1: Tokenize the comparison chart** — In
      `inverters-comparison-chart.tsx`, replace hardcoded recharts colors with
      `var(--chart-1)`…`var(--chart-5)` and wrap in a
      `rounded-2xl border bg-card` container with a `font-display` title. Keep
      data logic.
- [ ] **Step 2: Tokenize the table** — In `inverters-table.tsx`, replace any
      hardcoded grey/white classes with tokens (`bg-card`,
      `text-muted-foreground`, `border-border`); add `StatusRing`-style status
      dot per row using `statusToColor`. Keep columns/data.
- [ ] **Step 3: Verify + commit** — tsc grep clean;
      `feat(geracao): reskin comparison chart and inverter table`.

**Wave 3 exit criteria:** `npx.cmd vitest run src/frontend/generation` PASS;
dashboard visually matches spec §6.

---

# WAVE 4 — Controle (Overview landing)

**Goal:** Build the spec §5 landing that composes the kit. New route
`@user/controle`, set as the post-login landing, added to nav.

**Files:**

- Create: `src/app/api/controle/overview/route.ts`
- Create: `src/frontend/controle/hooks/use-controle-overview.ts`
- Create: `src/frontend/controle/components/lifetime-strip.tsx` (+ test)
- Create: `src/app/(private)/@user/controle/page.tsx`
- Modify: `src/frontend/app-sidebar.tsx` (add Controle nav, make it first),
  `src/frontend/auth/pages/login.page.tsx` (redirect to `/controle`)

## Task 4.1: Controle overview API + hook

- [ ] **Step 1: API route** — Create `src/app/api/controle/overview/route.ts`
      returning `ControleOverview` (from `@/shared/controle/types`). Compose
      from existing data:
  - `investment`: latest `Investment` for the client → `totalInvested`,
    `returned` = sum of `EnergyBill.estimatedSavings` since `startDate` (or
    `monthlyReturn * monthsActive`), `monthsActive` from `startDate`,
    `expectedPayoffLabel` from `expectedPayoff`.
  - `month`: current-month savings (reuse consumption logic) + generation kWh
    (reuse generation aggregate).
  - `lifetime`: cumulative generation + return;
    `co2AvoidedTons = totalGeneratedKwh * 0.0817 / 1000` (Brazil grid factor
    approx — document the constant).
  - `accounts`: each `ConsumerUnit` → `{ id, name, status }` (status from latest
    bill `paymentStatus`/data freshness via `resolveBillStatus`-equivalent
    server-side; default `unknown`).
  - `liveGenerationKw`: latest real-time generation power (reuse generation
    service). Follow the auth/scoping pattern from Wave 2 Task 2.7.

- [ ] **Step 2: Hook** — Create
      `src/frontend/controle/hooks/use-controle-overview.ts` mirroring
      `use-economia.ts` (fetch `/controle/overview`, return
      `{ overview, isLoading, error }` typed as `ControleOverview`).

- [ ] **Step 3: Verify + commit** — tsc clean;
      `feat(controle): add overview API + hook`.

## Task 4.2: LifetimeStrip component (TDD)

- [ ] **Step 1: Write the failing test**

Create `src/frontend/controle/components/lifetime-strip.test.tsx`:

```tsx
// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { LifetimeStrip } from "./lifetime-strip";

describe("LifetimeStrip", () => {
    it("renders lifetime generation, return and months", () => {
        render(
            <LifetimeStrip
                totalGeneratedKwh={18420}
                totalReturn={31000}
                monthsActive={14}
                co2AvoidedTons={8.2}
            />,
        );
        expect(screen.getByText(/18\.420 kWh/)).toBeInTheDocument();
        expect(screen.getByText(/R\$ 31\.000/)).toBeInTheDocument();
        expect(screen.getByText(/14 meses/)).toBeInTheDocument();
    });
});
```

- [ ] **Step 2: Run to verify it fails.**

- [ ] **Step 3: Implement**

Create `src/frontend/controle/components/lifetime-strip.tsx`:

```tsx
import { cn } from "@/lib/utils";
import { formatBRL, formatKwh } from "@/frontend/telemetry-kit";

export function LifetimeStrip({
    totalGeneratedKwh,
    totalReturn,
    monthsActive,
    co2AvoidedTons,
    className,
}: {
    totalGeneratedKwh: number;
    totalReturn: number;
    monthsActive: number;
    co2AvoidedTons: number;
    className?: string;
}) {
    return (
        <div
            data-slot="lifetime-strip"
            className={cn("rounded-2xl border bg-card p-4", className)}
        >
            <span className="text-xs font-medium tracking-wide text-muted-foreground">
                VIDA TODA
            </span>
            <div className="mt-2 grid grid-cols-2 gap-3 text-sm">
                <div>
                    ▸{" "}
                    <span className="font-medium text-foreground">
                        {formatKwh(totalGeneratedKwh)}
                    </span>{" "}
                    gerados
                </div>
                <div>
                    ▸{" "}
                    <span className="font-medium text-foreground">
                        {formatBRL(totalReturn)}
                    </span>{" "}
                    retorno
                </div>
                <div>
                    ▸{" "}
                    <span className="font-medium text-foreground">
                        {monthsActive} meses
                    </span>{" "}
                    ativo
                </div>
                <div>
                    ▸{" "}
                    <span className="font-medium text-foreground">
                        {co2AvoidedTons.toLocaleString("pt-BR", {
                            maximumFractionDigits: 1,
                        })} t
                    </span>{" "}
                    CO₂ evitado
                </div>
            </div>
        </div>
    );
}
```

- [ ] **Step 4: Run to verify it passes.**
- [ ] **Step 5: Commit** — `feat(controle): add LifetimeStrip`.

## Task 4.3: Assemble the Controle page

- [ ] **Step 1: Build the page** — Create
      `src/app/(private)/@user/controle/page.tsx` composing, in spec §5 reading
      order: `LiveBadge` + period toggle (header); `PaybackGauge` hero
      (`totalInvested`, `returned`, `payoffLabel` from `investment`); a 3-tile
      `MetricTile` row (DINHEIRO `formatBRL(month.moneSaved)`, ENERGIA
      `formatKwh(month.energyGeneratedKwh)`, RETORNO
      `formatBRL(month.returnVsInvestment)` with `+{month.monthChangePercent}%`
      sublabel); `LifetimeStrip`; a per-account `StatusRing` strip (tap →
      `/economia`); a live generation peek card (`liveGenerationKw` + mini
      sparkline via `GlowChart` height 80, link → `/dashboard`). Wrap in
      `PageLayout`/`PageHeader title="Controle"`. Use `withAuth`. Handle loading
      (skeletons) + error (Alert) like the dashboard.

- [ ] **Step 2: Make Controle the landing + nav** — In `app-sidebar.tsx`
      `vendedorSections`, add as the FIRST item:
      `{ label: 'Controle', mobileLabel: 'Controle', href: '/controle', icon: <Gauge className="w-5 h-5" /> }`
      (import `Gauge` from lucide). In `login.page.tsx` change
      `router.push('/dashboard')` → `router.push('/controle')`.

- [ ] **Step 3: Verify + commit** — tsc grep clean; manual: `/controle` shows
      gauge → KPIs → lifetime → rings → live peek. Commit
      `feat(controle): assemble overview landing + nav`.

**Wave 4 exit criteria:** `npx.cmd vitest run src/frontend/controle` PASS;
`/controle` renders and is the landing.

---

# WAVE 5 — Economia (Contas & Rateio)

**Goal:** Build spec §7 — the billing surface: Contas a pagar strip,
Consolidado⇄Por conta toggle, AccountCard per UC, Copy PIX, rateio viz, cost
analysis. Replaces `@user/economy-dashboard` content.

**Files:**

- Create: `src/frontend/economia/components/contas-a-pagar.tsx` (+ test)
- Create: `src/frontend/economia/components/account-card.tsx` (+ test)
- Create: `src/frontend/economia/components/rateio-bar.tsx` (+ test)
- Create: `src/frontend/economia/components/cost-breakdown.tsx`
- Create: `src/frontend/economia/components/consolidado-summary.tsx`
- Create: `src/frontend/economia/economia-screen.tsx`
- Modify: `src/app/(private)/@user/economy-dashboard/page.tsx` (render the new
  screen) and add `/economia` route alias.

## Task 5.1: ContasAPagar strip (TDD)

- [ ] **Step 1: Write the failing test**

Create `src/frontend/economia/components/contas-a-pagar.test.tsx`:

```tsx
// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ContasAPagar } from "./contas-a-pagar";
import type { AccountBill } from "@/shared/controle/types";

const bill = (over: Partial<AccountBill>): AccountBill => ({
    id: "b1",
    consumerUnitId: "u1",
    consumerUnitName: "Casa",
    distributor: "Enel",
    accountNumber: "123",
    referenceMonth: 4,
    referenceYear: 2026,
    amountDue: 187,
    dueDate: "2026-04-12",
    paidAt: null,
    paymentStatus: "a_pagar",
    pixCode: "PIX-CASA",
    barcode: null,
    billFileUrl: null,
    estimatedSavings: 410,
    titularName: "Gabriel",
    payerName: "Mateus",
    aiAnalysis: null,
    ...over,
});

describe("ContasAPagar", () => {
    beforeEach(() =>
        Object.assign(navigator, {
            clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
        })
    );
    it("lists each bill with amount and a copy-pix button when payable", () => {
        render(<ContasAPagar bills={[bill({})]} />);
        expect(screen.getByText("Casa")).toBeInTheDocument();
        expect(screen.getByText("R$ 187")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /copiar pix/i }))
            .toBeInTheDocument();
    });
    it("shows paid bills without a copy button", () => {
        render(
            <ContasAPagar
                bills={[bill({ paymentStatus: "paga", paidAt: "2026-04-03" })]}
            />,
        );
        expect(screen.queryByRole("button", { name: /copiar pix/i }))
            .toBeNull();
        expect(screen.getByText(/paga/i)).toBeInTheDocument();
    });
});
```

- [ ] **Step 2: Run to verify it fails.**

- [ ] **Step 3: Implement**

Create `src/frontend/economia/components/contas-a-pagar.tsx`:

```tsx
"use client";

import { cn } from "@/lib/utils";
import { CopyPixButton, formatBRL } from "@/frontend/telemetry-kit";
import type { AccountBill } from "@/shared/controle/types";
import { resolveBillStatus, statusToBadge } from "../lib/bill-status";

const TONE: Record<"success" | "warning" | "destructive", string> = {
    success: "text-success",
    warning: "text-warning",
    destructive: "text-destructive",
};

export function ContasAPagar(
    { bills, className }: { bills: AccountBill[]; className?: string },
) {
    if (bills.length === 0) {
        return (
            <div
                className={cn(
                    "rounded-2xl border bg-card p-4 text-sm text-muted-foreground",
                    className,
                )}
            >
                Sem faturas no período
            </div>
        );
    }
    return (
        <div data-slot="contas-a-pagar" className={cn("space-y-2", className)}>
            {bills.map((b) => {
                const status = resolveBillStatus(b);
                const badge = statusToBadge(status);
                return (
                    <div
                        key={b.id}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-card p-4"
                    >
                        <div className="min-w-0">
                            <div className="font-medium text-foreground">
                                {b.consumerUnitName}
                            </div>
                            <div className="text-xs text-muted-foreground">
                                {formatBRL(b.amountDue)} · {b.dueDate
                                    ? `vence ${
                                        new Date(b.dueDate).toLocaleDateString(
                                            "pt-BR",
                                        )
                                    }`
                                    : "sem vencimento"}
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span
                                className={cn(
                                    "text-xs font-medium",
                                    TONE[badge.tone],
                                )}
                            >
                                {badge.label}
                            </span>
                            {status !== "paga" && b.pixCode
                                ? <CopyPixButton code={b.pixCode} />
                                : null}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
```

- [ ] **Step 4: Run to verify it passes.**
- [ ] **Step 5: Commit** — `feat(economia): add Contas a pagar strip`.

## Task 5.2: AccountCard (TDD)

- [ ] **Step 1: Write the failing test**

Create `src/frontend/economia/components/account-card.test.tsx`:

```tsx
// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { AccountCard } from "./account-card";
import type { AccountBill } from "@/shared/controle/types";

const bill: AccountBill = {
    id: "b1",
    consumerUnitId: "u1",
    consumerUnitName: "Casa",
    distributor: "Enel",
    accountNumber: "UC 123456",
    referenceMonth: 3,
    referenceYear: 2026,
    amountDue: 187,
    dueDate: "2026-04-12",
    paidAt: null,
    paymentStatus: "a_pagar",
    pixCode: "PIX-CASA",
    barcode: null,
    billFileUrl: "http://x/bill.pdf",
    estimatedSavings: 410,
    titularName: "Gabriel",
    payerName: "Mateus",
    aiAnalysis: "bandeira vermelha elevou R$ 38",
};

describe("AccountCard", () => {
    beforeEach(() =>
        Object.assign(navigator, {
            clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
        })
    );
    it("shows UC, titular vs payer, amount, savings and copy pix", () => {
        render(<AccountCard bill={bill} />);
        expect(screen.getByText("Casa")).toBeInTheDocument();
        expect(screen.getByText(/Gabriel/)).toBeInTheDocument();
        expect(screen.getByText(/Mateus/)).toBeInTheDocument();
        expect(screen.getByText("R$ 187")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /copiar pix/i }))
            .toBeInTheDocument();
    });
});
```

- [ ] **Step 2: Run to verify it fails.**

- [ ] **Step 3: Implement**

Create `src/frontend/economia/components/account-card.tsx`:

```tsx
"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { CopyPixButton, formatBRL } from "@/frontend/telemetry-kit";
import type { AccountBill } from "@/shared/controle/types";
import { resolveBillStatus, statusToBadge } from "../lib/bill-status";

const TONE = {
    success: "text-success",
    warning: "text-warning",
    destructive: "text-destructive",
} as const;

export function AccountCard(
    { bill, className }: { bill: AccountBill; className?: string },
) {
    const status = resolveBillStatus(bill);
    const badge = statusToBadge(status);
    return (
        <div
            data-slot="account-card"
            className={cn(
                "space-y-3 rounded-2xl border bg-card p-4",
                className,
            )}
        >
            <div className="flex items-start justify-between gap-2">
                <div>
                    <div className="font-display font-semibold text-foreground">
                        {bill.consumerUnitName}
                    </div>
                    <div className="text-xs text-muted-foreground">
                        {bill.distributor ?? "—"} · {bill.accountNumber ?? "—"}
                    </div>
                </div>
                <span className={cn("text-xs font-medium", TONE[badge.tone])}>
                    {badge.label}
                </span>
            </div>

            <div className="text-xs text-muted-foreground">
                Titular:{" "}
                <span className="text-foreground">
                    {bill.titularName ?? "—"}
                </span>
                {bill.payerName
                    ? (
                        <>
                            · Paga:{" "}
                            <span className="text-foreground">
                                {bill.payerName}
                            </span>
                        </>
                    )
                    : null}
            </div>

            <div className="flex items-baseline justify-between">
                <span className="font-display text-2xl font-semibold text-foreground">
                    {formatBRL(bill.amountDue)}
                </span>
                <span className="text-xs text-success">
                    economia {formatBRL(bill.estimatedSavings)}
                </span>
            </div>

            {bill.aiAnalysis
                ? (
                    <p className="rounded-lg bg-muted/50 p-2 text-xs text-muted-foreground">
                        IA: {bill.aiAnalysis}
                    </p>
                )
                : null}

            <div className="flex flex-wrap gap-2">
                {status !== "paga" && bill.pixCode
                    ? <CopyPixButton code={bill.pixCode} />
                    : null}
                {bill.billFileUrl
                    ? (
                        <Button asChild variant="secondary" size="sm">
                            <a
                                href={bill.billFileUrl}
                                target="_blank"
                                rel="noreferrer"
                            >
                                <FileText className="size-4" /> PDF
                            </a>
                        </Button>
                    )
                    : null}
            </div>
        </div>
    );
}
```

- [ ] **Step 4: Run to verify it passes.**
- [ ] **Step 5: Commit** — `feat(economia): add AccountCard`.

## Task 5.3: RateioBar (TDD)

- [ ] **Step 1: Write the failing test**

Create `src/frontend/economia/components/rateio-bar.test.tsx`:

```tsx
// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { RateioBar } from "./rateio-bar";

describe("RateioBar", () => {
    it("renders each slice label with its percentage", () => {
        render(
            <RateioBar
                slices={[
                    { toUnitId: "a", toUnitName: "Casa", percentage: 40 },
                    { toUnitId: "b", toUnitName: "Mãe", percentage: 25 },
                ]}
            />,
        );
        expect(screen.getByText(/Casa/)).toBeInTheDocument();
        expect(screen.getByText("40%")).toBeInTheDocument();
        expect(screen.getByText("25%")).toBeInTheDocument();
    });
});
```

- [ ] **Step 2: Run to verify it fails.**

- [ ] **Step 3: Implement**

Create `src/frontend/economia/components/rateio-bar.tsx`:

```tsx
import { cn } from "@/lib/utils";
import { formatPercent } from "@/frontend/telemetry-kit";
import type { RateioSlice } from "@/shared/controle/types";

const SWATCH = [
    "bg-chart-1",
    "bg-chart-2",
    "bg-chart-3",
    "bg-chart-4",
    "bg-chart-5",
];

export function RateioBar(
    { slices, className }: { slices: RateioSlice[]; className?: string },
) {
    return (
        <div
            data-slot="rateio-bar"
            className={cn(
                "space-y-2 rounded-2xl border bg-card p-4",
                className,
            )}
        >
            <span className="text-xs font-medium tracking-wide text-muted-foreground">
                RATEIO (distribuição de créditos)
            </span>
            <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted">
                {slices.map((s, i) => (
                    <div
                        key={s.toUnitId}
                        className={cn("h-full", SWATCH[i % SWATCH.length])}
                        style={{ width: `${s.percentage}%` }}
                    />
                ))}
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
                {slices.map((s, i) => (
                    <span
                        key={s.toUnitId}
                        className="flex items-center gap-1 text-muted-foreground"
                    >
                        <span
                            className={cn(
                                "size-2 rounded-full",
                                SWATCH[i % SWATCH.length],
                            )}
                        />
                        {s.toUnitName}{" "}
                        <span className="font-medium text-foreground">
                            {formatPercent(s.percentage)}
                        </span>
                    </span>
                ))}
            </div>
        </div>
    );
}
```

> Add `--color-chart-*` swatch utilities: these map to the chart tokens already
> in `@theme inline`. If `bg-chart-1` doesn't resolve, add
> `--color-chart-1: var(--chart-1)` mappings (already present in Plan 1
> globals).

- [ ] **Step 4: Run to verify it passes.**
- [ ] **Step 5: Commit** — `feat(economia): add RateioBar`.

## Task 5.4: ConsolidadoSummary + CostBreakdown

- [ ] **Step 1: ConsolidadoSummary** — Create
      `src/frontend/economia/components/consolidado-summary.tsx`: given an
      `EconomyConsolidated`, render "Você pagaria {formatBRL(wouldPay)} → Você
      paga {formatBRL(actuallyPay)} · Economia {formatBRL(savedAmount)}
      ({formatPercent(savedPercent)}) · Créditos +{formatKwh(creditsKwh)}" in a
      `rounded-2xl border bg-card p-4` card with `font-display` emphasis on the
      paid value. (No new test; covered by `aggregate` unit test + manual.)

- [ ] **Step 2: CostBreakdown** — Create
      `src/frontend/economia/components/cost-breakdown.tsx`: given a selected
      `AccountBill` plus its raw cost fields (extend `AccountBill` mapping to
      include `energyCost`, `tariffTusdValue`, `tariffTeValue`, `icmsCost`,
      `publicLightingCost`, `tariffFlag`, `tariffFlagCost` — add these optional
      fields to the type + API map in Wave 2 Task 2.7 if not already), render a
      labeled list (Energia · TUSD/TE · ICMS · Ilum. pública · Bandeira) using
      `formatBRL`, plus the `aiAnalysis` line. Empty-safe (skip null fields).

- [ ] **Step 3: Commit** —
      `feat(economia): add consolidado summary + cost breakdown`.

## Task 5.5: Assemble the Economia screen

- [ ] **Step 1: Build the screen** — Create
      `src/frontend/economia/economia-screen.tsx`: uses
      `useEconomia({ year, month })`. Header: title "Economia" + period
      selector + a `Consolidado | Por conta` toggle (local `useState`, no scroll
      reset). Body:
  - **Contas a pagar** (`ContasAPagar bills={bills}`) at top.
  - **Consolidado** mode: `ConsolidadoSummary` (from
    `aggregateEconomy(bills)`) + `RateioBar` (slices from a rateio fetch or
    passed in).
  - **Por conta** mode: grid of `AccountCard` per bill; selecting one shows
    `CostBreakdown` below. Loading skeletons + `PageEmpty` ("nenhuma conta
    ainda") + error Alert.

- [ ] **Step 2: Wire the route** — In
      `src/app/(private)/@user/economy-dashboard/page.tsx`, replace the
      `ConsumptionDashboard` render with `<EconomiaScreen />` (keep the
      `clientId` guard). Optionally add a `@user/economia/page.tsx` that renders
      the same screen and update the sidebar `Economia` href to `/economia`
      (keep `/economy-dashboard` working or redirect).

- [ ] **Step 3: Verify + commit** — `npx.cmd vitest run src/frontend/economia`
      PASS; tsc clean; manual: toggle + copy PIX + cards. Commit
      `feat(economia): assemble Economia screen`.

**Wave 5 exit criteria:** `npx.cmd vitest run src/frontend/economia` PASS;
Economia screen matches spec §7.

---

# WAVE 6 — Access Scope & Admin Cockpit

**Goal:** Enforce payer scope server-side (spec §2) and give admin parity to
manage the new concepts (spec §9).

**Files:**

- Modify: economy/controle API routes (Wave 2/4) — already filter by
  `payerUnits`; harden + test.
- Modify: `src/frontend/admin/components/client-details.tsx` +
  `use-admin-energy-management.ts`
- Create: admin API extensions under
  `app/api/admin/clients/[id]/{investment,bill-payments,payers}/route.ts`

## Task 6.1: Server-enforced payer scope (TDD where possible)

- [x] **Step 1: Centralize scope resolution** — Created
      `src/backend/controle/scope.ts` exporting `resolveAccessibleUnitIds(userId)`
      + pure `computeAccessibleUnitIds(payerUnitIds)` (unit-tested in
      `scope.test.ts`) — returns `'all'` for titular/admin, or the payer's
      `consumerUnit.id[]`.
- [x] **Step 2: Apply it** in the economia + controle routes (replaced the inline
      `payerUnits` query). Payers are filtered to their own UCs; the controle
      route also derives `clientId` from the payer's units.
- [x] **Step 3: Commit** — `feat(scope): server-enforced payer access`.

## Task 6.2: Admin management of investment / payments / payers / rateio

- [x] **Step 1: Investment CRUD** —
      `app/api/admin/clients/[id]/investment/route.ts` (GET/PUT, upserts the
      client `Investment`). Added `useAdminInvestment` hook + an
      `InvestmentSection` form in `client-details.tsx` (Resumo tab: valor
      investido + data de início + payback esperado + retorno mensal).
- [x] **Step 2: Bill payment management** — extended
      `app/api/admin/clients/[id]/energy-bills/[billId]/route.ts` PUT schema with
      `paymentStatus`, `paidAt`, `dueDate`, `amountDue`, `pixCode`, `barcode`.
      Added a `Pagamento` badge column + `BillPaymentDialog` ("Marcar como paga"
      + PIX/barcode/status editor) to the Faturas tab.
- [x] **Step 3: Payer assignment** —
      `app/api/admin/clients/[id]/payers/route.ts` (PUT) sets
      `ConsumerUnit.payerUserId`/`payerName/Email/Phone`. Added a `Pagador`
      column + `PayerDialog` (assign/remove) in `PlantUnitsSection`.
- [x] **Step 4: Rateio editing** — the `credit-allocations` API already exists;
      added inline `AllocationPercentCell` editing of `allocationPercentage` in
      the admin rateio table. The client/payer view is read-only (`RateioBar`,
      Wave 5).
- [x] **Step 5: Verify + commit** — tsc clean on all touched files; committed per
      task (`feat(admin): manage client investment`, `… bill payments`,
      `… assign payer …`, `… inline edit of rateio …`).

**Wave 6 exit criteria:** payer login sees only its UC(s); admin can set
investment, mark bills paid, upload PIX, assign payers, edit rateio.

---

## Final Verification (after all waves)

- [ ] `npx.cmd vitest run src/frontend/telemetry-kit src/frontend/brand src/frontend/economia src/frontend/controle src/frontend/generation`
      → PASS.
- [ ] `npx.cmd next build --no-lint` → compiles (pre-existing unrelated type
      errors documented in Plan 1 remain out of scope: admin Prisma JSON typing,
      inverter fixtures, object-storage body typing, the JWT-expiry test).
- [ ] Manual walkthrough: login (branded) → `/controle` (gauge/KPIs/rings/peek)
      → `/dashboard` (telemetry) → `/economia` (contas a pagar, toggle, copy
      PIX, cards, rateio, cost) → payer login scoped → admin cockpit manage.

---

## Self-Review (completed during planning)

**Spec coverage:** §4 design system → Plan 1 + Wave 1; §5 Controle → Wave 4; §6
Geração → Wave 3; §7 Economia → Wave 5; §8 data concepts (Investment, bill
payment/PIX, payer link) → Wave 2; §2 scopes / §9 admin → Wave 6; §10
states/testing → enforced per task (skeletons/empty/error + Vitest).
Brand/logo/auth (user request) → Wave 1.

**Reuse:** every screen composes the already-tested telemetry-kit
(`PaybackGauge`, `MetricTile`, `StatusRing`, `GlowChart`, `CopyPixButton`,
`LiveBadge`, `calcPaybackPercent`, `calcSavings`, formatters) and existing data
(`useGenerationDashboard`, consumption API, `energy-bills`/`credit-allocations`
admin APIs) — new code is the data deltas (Wave 2) + presentational
compositions + the economy/controle read APIs.

**Type consistency:** all shapes flow from `src/shared/controle/types.ts` (Wave
2): `AccountBill` is produced by the bills API (2.7), consumed by
`ContasAPagar`/`AccountCard`/`aggregateEconomy`; `BillPaymentStatus` defined
once and used by `bill-status.ts` + components; `ControleOverview` produced by
the overview API (4.1) and consumed by the Controle page (4.3); `RateioSlice`
shared by `RateioBar` + admin. `resolveBillStatus`/`statusToBadge` signatures
(2.5) are used unchanged in 5.1/5.2.

**Placeholder scan:** pure helpers and presentational components have full
code + tests. Backend read routes (2.7, 4.1) and admin/scope tasks (6.x) give
complete representative handlers with an explicit worker note to copy the
project's exact prisma/session import paths from an existing route — this is an
integration instruction, not a TODO. No "fill in later" steps remain.

---

## Execution Handoff

**Plan complete and saved to
`docs/superpowers/plans/2026-06-14-controle-sprint2-unified.md`. Two execution
options:**

**1. Subagent-Driven (recommended)** — fresh subagent per task, review between
tasks, fast iteration. Best for a plan this large; run wave-by-wave.

**2. Inline Execution** — execute in this session via executing-plans, batching
by wave with a checkpoint at each wave boundary.

**Which approach — and do you want to start at Wave 1, or has Wave 1
(brand/auth/shell) already begun separately?**
