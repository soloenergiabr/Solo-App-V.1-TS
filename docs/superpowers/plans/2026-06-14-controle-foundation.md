# Controle Foundation (Design System + Telemetry Kit) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the dark-first, brand-orange design system and the reusable "telemetry kit" of components + pure helpers that every Sprint 2 screen (Controle, Geração, Economia) and the admin cockpit will compose.

**Architecture:** Replace the Tailwind v4 CSS theme tokens in `globals.css` with the Solo dark/orange system and swap the fonts in `app/layout.tsx`. Add a self-contained module at `src/frontend/telemetry-kit/` containing pure formatting/calculation helpers (`lib/`) and presentational components (`components/`), each exported from a barrel. Pure helpers are unit-tested; presentational components get component tests under jsdom; charts get a non-flaky empty-state test plus manual visual verification.

**Tech Stack:** Next.js 15 (App Router) + React 19, Tailwind CSS v4 (CSS-variable tokens, oklch/hsl/hex all valid), shadcn/ui (new-york), framer-motion, recharts, Vitest 3, jsdom, Testing Library.

**Scope note:** This is Plan 1 of the Sprint 2 series (spec: `docs/superpowers/specs/2026-06-14-controle-generation-economy-design.md`). It delivers the design system + reusable primitives only. Screen assembly (Geração, Controle, Economia), `AccountCard` (domain composition), access control, and admin are separate plans. `AccountCard` is intentionally deferred to the Economia plan because it is bound to bill/payment data shapes defined there.

**Conventions for every component file:** start interactive components with `"use client"`, import `cn` from `@/lib/utils`, add `data-slot="<name>"` on the root element (matches existing shadcn components). Every component test file starts with the docblock `// @vitest-environment jsdom` so backend node tests are unaffected.

## Execution Status (2026-06-14)

- Completed: Tasks 1-13 implementation files are present (`vitest.setup.ts`, `vitest.config.mts`, design tokens, app fonts, telemetry-kit helpers, components, tests, and barrel export).
- Completed verification: `npm.cmd run build` passes; `npx.cmd vitest run src/frontend/telemetry-kit` passes (10 files, 32 tests).
- Blocked / not completed: browser visual verification could not run because the in-app browser Node helper failed with `windows sandbox failed: spawn setup refresh`.
- Known unrelated blockers: `npx.cmd tsc --noEmit` fails outside `src/frontend/telemetry-kit/**` in existing admin Prisma JSON typing, inverter test fixtures, and object-storage body typing. The existing JWT backend test also fails because it expects expiry after 25h while the service default expiry is `30d`.
- Not done: plan-scope files have not been committed yet. Existing unrelated worktree changes were left untouched (`temp_bot_enel`, dev-server logs, untracked `scripts/...` files).

---

## File Structure

- Create: `vitest.setup.ts` — Testing Library jest-dom matchers.
- Modify: `vitest.config.mts` — register the setup file.
- Modify: `src/app/globals.css` — dark-first brand-orange tokens + success/warning + font/gradient vars.
- Modify: `src/app/layout.tsx` — DM Sans (body) + Outfit (display) fonts.
- Create: `src/frontend/telemetry-kit/lib/format.ts` — pure formatters (BRL, kWh, kW, percent).
- Create: `src/frontend/telemetry-kit/lib/format.test.ts`
- Create: `src/frontend/telemetry-kit/lib/calc.ts` — pure calculations (payback %, savings).
- Create: `src/frontend/telemetry-kit/lib/calc.test.ts`
- Create: `src/frontend/telemetry-kit/lib/status.ts` — `TelemetryStatus` type + `statusToColor`.
- Create: `src/frontend/telemetry-kit/lib/status.test.ts`
- Create: `src/frontend/telemetry-kit/components/status-ring.tsx` + `status-ring.test.tsx`
- Create: `src/frontend/telemetry-kit/components/payback-gauge.tsx` + `payback-gauge.test.tsx`
- Create: `src/frontend/telemetry-kit/components/metric-tile.tsx` + `metric-tile.test.tsx`
- Create: `src/frontend/telemetry-kit/components/copy-pix-button.tsx` + `copy-pix-button.test.tsx`
- Create: `src/frontend/telemetry-kit/components/live-badge.tsx` + `live-badge.test.tsx`
- Create: `src/frontend/telemetry-kit/components/glow-chart.tsx` + `glow-chart.test.tsx`
- Create: `src/frontend/telemetry-kit/index.ts` — barrel re-exporting lib + components.

---

## Task 1: Enable component testing (jsdom + Testing Library)

**Files:**
- Modify: `vitest.config.mts`
- Create: `vitest.setup.ts`
- Modify: `package.json` (via install command)

- [ ] **Step 1: Install Testing Library packages**

Run:
```bash
npm install -D @testing-library/react@^16 @testing-library/jest-dom@^6 @testing-library/user-event@^14
```
Expected: packages added to `devDependencies`, no error.

- [ ] **Step 2: Create the test setup file**

Create `vitest.setup.ts`:
```ts
import '@testing-library/jest-dom/vitest'
```

- [ ] **Step 3: Register the setup file in vitest config**

Replace the contents of `vitest.config.mts` with:
```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
    plugins: [tsconfigPaths(), react()],
    test: {
        setupFiles: ['./vitest.setup.ts'],
    },
})
```
Note: the global environment stays node (default). Component test files opt into jsdom with a `// @vitest-environment jsdom` docblock, so existing backend tests are untouched.

- [ ] **Step 4: Add a smoke test to prove jsdom + jest-dom work**

Create `src/frontend/telemetry-kit/components/__smoke__.test.tsx`:
```tsx
// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'

describe('jsdom smoke', () => {
    it('renders into the DOM and matchers work', () => {
        render(<div>olá</div>)
        expect(screen.getByText('olá')).toBeInTheDocument()
    })
})
```

- [ ] **Step 5: Run the smoke test**

Run: `npx vitest run src/frontend/telemetry-kit/components/__smoke__.test.tsx`
Expected: PASS (1 test).

- [ ] **Step 6: Confirm existing backend tests still pass**

Run: `npx vitest run src/backend/auth/__tests__/jwt.service.test.ts`
Expected: PASS (no environment regression).

- [ ] **Step 7: Delete the smoke test and commit**

```bash
rm src/frontend/telemetry-kit/components/__smoke__.test.tsx
git add vitest.config.mts vitest.setup.ts package.json package-lock.json
git commit -m "test: enable jsdom component testing with Testing Library"
```

---

## Task 2: Pure formatters

**Files:**
- Create: `src/frontend/telemetry-kit/lib/format.ts`
- Test: `src/frontend/telemetry-kit/lib/format.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/frontend/telemetry-kit/lib/format.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { formatBRL, formatKwh, formatKw, formatPercent } from './format'

describe('formatBRL', () => {
    it('formats whole reais with R$ and pt-BR thousands', () => {
        expect(formatBRL(1247)).toBe('R$ 1.247')
    })
    it('rounds to whole reais by default', () => {
        expect(formatBRL(642.6)).toBe('R$ 643')
    })
    it('supports cents when asked', () => {
        expect(formatBRL(187.5, { cents: true })).toBe('R$ 187,50')
    })
})

describe('formatKwh', () => {
    it('formats kWh with pt-BR thousands and unit', () => {
        expect(formatKwh(18420)).toBe('18.420 kWh')
    })
    it('keeps one decimal when fractional', () => {
        expect(formatKwh(980.4)).toBe('980,4 kWh')
    })
})

describe('formatKw', () => {
    it('formats kW with one decimal', () => {
        expect(formatKw(3.4)).toBe('3,4 kW')
    })
})

describe('formatPercent', () => {
    it('formats an integer percent', () => {
        expect(formatPercent(62)).toBe('62%')
    })
    it('supports one decimal', () => {
        expect(formatPercent(1.3, { decimals: 1 })).toBe('1,3%')
    })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/frontend/telemetry-kit/lib/format.test.ts`
Expected: FAIL with "Failed to resolve import './format'".

- [ ] **Step 3: Write minimal implementation**

Create `src/frontend/telemetry-kit/lib/format.ts`:
```ts
const BRL_WHOLE = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
})

const BRL_CENTS = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
})

// Intl currency renders "R$ 1.247" (non-breaking space). Normalize to a
// regular space so output is predictable and copy-paste friendly.
function normalize(value: string): string {
    return value.replace(/ /g, ' ')
}

export function formatBRL(value: number, opts: { cents?: boolean } = {}): string {
    const fmt = opts.cents ? BRL_CENTS : BRL_WHOLE
    return normalize(fmt.format(value))
}

function decimalFmt(maxDecimals: number): Intl.NumberFormat {
    return new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: maxDecimals,
    })
}

export function formatKwh(value: number): string {
    return `${decimalFmt(1).format(value)} kWh`
}

export function formatKw(value: number): string {
    return `${decimalFmt(1).format(value)} kW`
}

export function formatPercent(value: number, opts: { decimals?: number } = {}): string {
    return `${decimalFmt(opts.decimals ?? 0).format(value)}%`
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/frontend/telemetry-kit/lib/format.test.ts`
Expected: PASS (all cases).

- [ ] **Step 5: Commit**

```bash
git add src/frontend/telemetry-kit/lib/format.ts src/frontend/telemetry-kit/lib/format.test.ts
git commit -m "feat: add telemetry-kit pure formatters"
```

---

## Task 3: Pure calculations (payback %, savings)

**Files:**
- Create: `src/frontend/telemetry-kit/lib/calc.ts`
- Test: `src/frontend/telemetry-kit/lib/calc.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/frontend/telemetry-kit/lib/calc.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { calcPaybackPercent, calcSavings } from './calc'

describe('calcPaybackPercent', () => {
    it('returns the percent of investment returned', () => {
        expect(calcPaybackPercent({ totalInvested: 50000, returned: 31000 })).toBe(62)
    })
    it('clamps to 100 when fully returned or more', () => {
        expect(calcPaybackPercent({ totalInvested: 50000, returned: 60000 })).toBe(100)
    })
    it('returns 0 when nothing returned', () => {
        expect(calcPaybackPercent({ totalInvested: 50000, returned: 0 })).toBe(0)
    })
    it('returns 0 when investment is zero (avoid divide-by-zero)', () => {
        expect(calcPaybackPercent({ totalInvested: 0, returned: 1000 })).toBe(0)
    })
})

describe('calcSavings', () => {
    it('returns amount saved and percent', () => {
        expect(calcSavings({ wouldPay: 1890, actuallyPay: 643 })).toEqual({
            amount: 1247,
            percent: 66,
        })
    })
    it('returns zeros when there is nothing that would be paid', () => {
        expect(calcSavings({ wouldPay: 0, actuallyPay: 0 })).toEqual({
            amount: 0,
            percent: 0,
        })
    })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/frontend/telemetry-kit/lib/calc.test.ts`
Expected: FAIL with "Failed to resolve import './calc'".

- [ ] **Step 3: Write minimal implementation**

Create `src/frontend/telemetry-kit/lib/calc.ts`:
```ts
export function calcPaybackPercent(input: { totalInvested: number; returned: number }): number {
    if (input.totalInvested <= 0) return 0
    const pct = (input.returned / input.totalInvested) * 100
    return Math.max(0, Math.min(100, Math.round(pct)))
}

export function calcSavings(input: { wouldPay: number; actuallyPay: number }): {
    amount: number
    percent: number
} {
    const amount = Math.max(0, input.wouldPay - input.actuallyPay)
    const percent = input.wouldPay > 0 ? Math.round((amount / input.wouldPay) * 100) : 0
    return { amount, percent }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/frontend/telemetry-kit/lib/calc.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/frontend/telemetry-kit/lib/calc.ts src/frontend/telemetry-kit/lib/calc.test.ts
git commit -m "feat: add telemetry-kit payback and savings calculations"
```

---

## Task 4: Status type + color mapping

**Files:**
- Create: `src/frontend/telemetry-kit/lib/status.ts`
- Test: `src/frontend/telemetry-kit/lib/status.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/frontend/telemetry-kit/lib/status.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { statusToColor, type TelemetryStatus } from './status'

describe('statusToColor', () => {
    it('maps ok to the success token class', () => {
        expect(statusToColor('ok')).toBe('text-success')
    })
    it('maps warning to the warning token class', () => {
        expect(statusToColor('warning')).toBe('text-warning')
    })
    it('maps critical to the destructive token class', () => {
        expect(statusToColor('critical')).toBe('text-destructive')
    })
    it('maps unknown to the muted token class', () => {
        expect(statusToColor('unknown')).toBe('text-muted-foreground')
    })
    it('accepts every member of the TelemetryStatus union', () => {
        const all: TelemetryStatus[] = ['ok', 'warning', 'critical', 'unknown']
        for (const s of all) expect(typeof statusToColor(s)).toBe('string')
    })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/frontend/telemetry-kit/lib/status.test.ts`
Expected: FAIL with "Failed to resolve import './status'".

- [ ] **Step 3: Write minimal implementation**

Create `src/frontend/telemetry-kit/lib/status.ts`:
```ts
export type TelemetryStatus = 'ok' | 'warning' | 'critical' | 'unknown'

const COLOR: Record<TelemetryStatus, string> = {
    ok: 'text-success',
    warning: 'text-warning',
    critical: 'text-destructive',
    unknown: 'text-muted-foreground',
}

export function statusToColor(status: TelemetryStatus): string {
    return COLOR[status]
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/frontend/telemetry-kit/lib/status.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/frontend/telemetry-kit/lib/status.ts src/frontend/telemetry-kit/lib/status.test.ts
git commit -m "feat: add telemetry-kit status color mapping"
```

---

## Task 5: Design tokens (dark-first brand orange)

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Step 1: Add success/warning + display font to the `@theme inline` block**

In `src/app/globals.css`, inside the existing `@theme inline { ... }` block, add these lines just after `--color-chart-1: var(--chart-1);`:
```css
  --color-success: var(--success);
  --color-warning: var(--warning);
  --font-display: var(--font-display);
```
And change the existing `--font-sans` line to:
```css
  --font-sans: var(--font-sans);
```
(It currently reads `var(--font-geist-sans)`; the value will be provided by `--font-sans` set in layout in Task 6.)

- [ ] **Step 2: Replace the `:root` and `.dark` token blocks with the dark-first Solo system**

Replace BOTH the entire `:root { ... }` block (lines starting `:root {` through its closing `}`) AND the entire `.dark { ... }` block with this single block:
```css
:root,
.dark {
  --radius: 1rem;

  --background: hsl(0 0% 8%);
  --foreground: hsl(48 9% 88%);
  --card: hsl(0 0% 11%);
  --card-foreground: hsl(48 9% 88%);
  --popover: hsl(0 0% 11%);
  --popover-foreground: hsl(48 9% 88%);

  --primary: #ff481e;
  --primary-foreground: hsl(0 0% 100%);
  --secondary: hsl(0 0% 15%);
  --secondary-foreground: hsl(48 9% 88%);
  --muted: hsl(0 0% 16%);
  --muted-foreground: hsl(0 0% 60%);
  --accent: #ff481e;
  --accent-foreground: hsl(0 0% 100%);
  --destructive: hsl(0 84% 60%);
  --destructive-foreground: hsl(0 0% 100%);

  --border: hsl(0 0% 16%);
  --input: hsl(0 0% 20%);
  --ring: #ff481e;

  --success: hsl(142 70% 45%);
  --warning: hsl(38 100% 54%);

  --chart-1: #ff481e;
  --chart-2: hsl(38 100% 54%);
  --chart-3: hsl(180 100% 40%);
  --chart-4: hsl(280 100% 60%);
  --chart-5: hsl(340 100% 60%);

  --sidebar: hsl(0 0% 9%);
  --sidebar-foreground: hsl(48 9% 88%);
  --sidebar-primary: #ff481e;
  --sidebar-primary-foreground: hsl(0 0% 100%);
  --sidebar-accent: hsl(0 0% 15%);
  --sidebar-accent-foreground: hsl(48 9% 88%);
  --sidebar-border: hsl(0 0% 15%);
  --sidebar-ring: #ff481e;

  --brand-gradient: linear-gradient(135deg, #ff481e 0%, #f5a623 100%);
}
```

- [ ] **Step 3: Add a brand-gradient utility at the end of the file**

Append to `src/app/globals.css`:
```css
@layer utilities {
  .bg-brand-gradient {
    background-image: var(--brand-gradient);
  }
  .text-brand-gradient {
    background-image: var(--brand-gradient);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }
}
```

- [ ] **Step 4: Verify the app compiles**

Run: `npx next build --no-lint 2>&1 | tail -20`
Expected: build completes without CSS errors (a successful "Compiled successfully" or route summary). If `--no-lint` is unsupported, run `npx tsc --noEmit` instead and expect no new errors from `globals.css` (CSS is not type-checked; this just confirms nothing else broke).

- [ ] **Step 5: Commit**

```bash
git add src/app/globals.css
git commit -m "feat: apply dark-first brand-orange design tokens"
```

---

## Task 6: Brand fonts (DM Sans body, Outfit display)

**Files:**
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Swap the font imports and variables**

In `src/app/layout.tsx`, replace the font import + declarations (the `import { Geist, Geist_Mono } ...` line and the two `const geistSans`/`const geistMono` blocks) with:
```tsx
import { DM_Sans, Outfit } from "next/font/google";

const dmSans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const outfit = Outfit({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});
```

- [ ] **Step 2: Update the body className**

In the same file, change the `<body>` className from:
```tsx
className={`${geistSans.variable} ${geistMono.variable} antialiased`}
```
to:
```tsx
className={`${dmSans.variable} ${outfit.variable} font-sans antialiased`}
```

- [ ] **Step 3: Verify it compiles and fonts resolve**

Run: `npx tsc --noEmit`
Expected: no new type errors from `layout.tsx`.

- [ ] **Step 4: Manual verification (visual)**

Use the `run` skill to start the app and load any page; confirm the body text renders in DM Sans (geometric, not the old Geist) and the background is near-black with orange accents. This is a visual check; no automated assertion.

- [ ] **Step 5: Commit**

```bash
git add src/app/layout.tsx
git commit -m "feat: switch app fonts to DM Sans + Outfit"
```

---

## Task 7: StatusRing component

**Files:**
- Create: `src/frontend/telemetry-kit/components/status-ring.tsx`
- Test: `src/frontend/telemetry-kit/components/status-ring.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/frontend/telemetry-kit/components/status-ring.test.tsx`:
```tsx
// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StatusRing } from './status-ring'

describe('StatusRing', () => {
    it('renders the label', () => {
        render(<StatusRing label="Casa" status="ok" />)
        expect(screen.getByText('Casa')).toBeInTheDocument()
    })
    it('exposes the status for assistive tech and styling', () => {
        render(<StatusRing label="Loja" status="critical" />)
        const root = screen.getByTestId('status-ring')
        expect(root).toHaveAttribute('data-status', 'critical')
        expect(root).toHaveAttribute('aria-label', 'Loja: crítico')
    })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/frontend/telemetry-kit/components/status-ring.test.tsx`
Expected: FAIL with "Failed to resolve import './status-ring'".

- [ ] **Step 3: Write minimal implementation**

Create `src/frontend/telemetry-kit/components/status-ring.tsx`:
```tsx
import { cn } from "@/lib/utils"
import { statusToColor, type TelemetryStatus } from "../lib/status"

const STATUS_LABEL: Record<TelemetryStatus, string> = {
    ok: "ok",
    warning: "atenção",
    critical: "crítico",
    unknown: "sem dados",
}

const RING_BORDER: Record<TelemetryStatus, string> = {
    ok: "border-success",
    warning: "border-warning",
    critical: "border-destructive",
    unknown: "border-muted-foreground",
}

export function StatusRing({
    label,
    status,
    className,
}: {
    label: string
    status: TelemetryStatus
    className?: string
}) {
    return (
        <div
            data-slot="status-ring"
            data-testid="status-ring"
            data-status={status}
            aria-label={`${label}: ${STATUS_LABEL[status]}`}
            className={cn("flex flex-col items-center gap-1", className)}
        >
            <span
                className={cn(
                    "size-8 rounded-full border-2 bg-card",
                    RING_BORDER[status],
                )}
            />
            <span className={cn("text-xs font-medium", statusToColor(status))}>
                {label}
            </span>
        </div>
    )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/frontend/telemetry-kit/components/status-ring.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/frontend/telemetry-kit/components/status-ring.tsx src/frontend/telemetry-kit/components/status-ring.test.tsx
git commit -m "feat: add StatusRing telemetry component"
```

---

## Task 8: PaybackGauge component

**Files:**
- Create: `src/frontend/telemetry-kit/components/payback-gauge.tsx`
- Test: `src/frontend/telemetry-kit/components/payback-gauge.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/frontend/telemetry-kit/components/payback-gauge.test.tsx`:
```tsx
// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PaybackGauge } from './payback-gauge'

describe('PaybackGauge', () => {
    it('shows the percent paid derived from invested/returned', () => {
        render(<PaybackGauge totalInvested={50000} returned={31000} />)
        expect(screen.getByText('62%')).toBeInTheDocument()
    })
    it('shows the invested vs returned amounts in BRL', () => {
        render(<PaybackGauge totalInvested={50000} returned={31000} />)
        expect(screen.getByText('R$ 31.000 / R$ 50.000')).toBeInTheDocument()
    })
    it('renders the optional payoff label when provided', () => {
        render(
            <PaybackGauge
                totalInvested={50000}
                returned={31000}
                payoffLabel="mar/2027"
            />,
        )
        expect(screen.getByText(/mar\/2027/)).toBeInTheDocument()
    })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/frontend/telemetry-kit/components/payback-gauge.test.tsx`
Expected: FAIL with "Failed to resolve import './payback-gauge'".

- [ ] **Step 3: Write minimal implementation**

Create `src/frontend/telemetry-kit/components/payback-gauge.tsx`:
```tsx
import { cn } from "@/lib/utils"
import { calcPaybackPercent } from "../lib/calc"
import { formatBRL, formatPercent } from "../lib/format"

export function PaybackGauge({
    totalInvested,
    returned,
    payoffLabel,
    className,
}: {
    totalInvested: number
    returned: number
    payoffLabel?: string
    className?: string
}) {
    const percent = calcPaybackPercent({ totalInvested, returned })

    return (
        <div
            data-slot="payback-gauge"
            className={cn(
                "flex flex-col items-center gap-2 rounded-2xl border bg-card p-6",
                className,
            )}
        >
            <span className="text-sm text-muted-foreground">Investimento pago</span>
            <span className="font-display text-5xl font-bold text-brand-gradient">
                {formatPercent(percent)}
            </span>
            <span className="text-sm text-foreground">
                {`${formatBRL(returned)} / ${formatBRL(totalInvested)}`}
            </span>
            {payoffLabel ? (
                <span className="text-xs text-muted-foreground">
                    {`quitação prevista: ${payoffLabel}`}
                </span>
            ) : null}
        </div>
    )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/frontend/telemetry-kit/components/payback-gauge.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/frontend/telemetry-kit/components/payback-gauge.tsx src/frontend/telemetry-kit/components/payback-gauge.test.tsx
git commit -m "feat: add PaybackGauge telemetry component"
```

---

## Task 9: MetricTile component

**Files:**
- Create: `src/frontend/telemetry-kit/components/metric-tile.tsx`
- Test: `src/frontend/telemetry-kit/components/metric-tile.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/frontend/telemetry-kit/components/metric-tile.test.tsx`:
```tsx
// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MetricTile } from './metric-tile'

describe('MetricTile', () => {
    it('renders label, value and sublabel', () => {
        render(<MetricTile label="DINHEIRO" value="R$ 643" sublabel="economia mês" />)
        expect(screen.getByText('DINHEIRO')).toBeInTheDocument()
        expect(screen.getByText('R$ 643')).toBeInTheDocument()
        expect(screen.getByText('economia mês')).toBeInTheDocument()
    })
    it('renders without a sublabel', () => {
        render(<MetricTile label="ENERGIA" value="980 kWh" />)
        expect(screen.getByText('980 kWh')).toBeInTheDocument()
    })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/frontend/telemetry-kit/components/metric-tile.test.tsx`
Expected: FAIL with "Failed to resolve import './metric-tile'".

- [ ] **Step 3: Write minimal implementation**

Create `src/frontend/telemetry-kit/components/metric-tile.tsx`:
```tsx
import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

export function MetricTile({
    label,
    value,
    sublabel,
    icon,
    className,
}: {
    label: string
    value: ReactNode
    sublabel?: ReactNode
    icon?: ReactNode
    className?: string
}) {
    return (
        <div
            data-slot="metric-tile"
            className={cn(
                "flex flex-col gap-1 rounded-2xl border bg-card p-4",
                className,
            )}
        >
            <span className="flex items-center gap-1 text-xs font-medium tracking-wide text-muted-foreground">
                {icon}
                {label}
            </span>
            <span className="font-display text-2xl font-semibold text-foreground">
                {value}
            </span>
            {sublabel ? (
                <span className="text-xs text-muted-foreground">{sublabel}</span>
            ) : null}
        </div>
    )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/frontend/telemetry-kit/components/metric-tile.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/frontend/telemetry-kit/components/metric-tile.tsx src/frontend/telemetry-kit/components/metric-tile.test.tsx
git commit -m "feat: add MetricTile telemetry component"
```

---

## Task 10: CopyPixButton component

**Files:**
- Create: `src/frontend/telemetry-kit/components/copy-pix-button.tsx`
- Test: `src/frontend/telemetry-kit/components/copy-pix-button.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/frontend/telemetry-kit/components/copy-pix-button.test.tsx`:
```tsx
// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CopyPixButton } from './copy-pix-button'

describe('CopyPixButton', () => {
    beforeEach(() => {
        Object.assign(navigator, {
            clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
        })
    })

    it('renders the default label', () => {
        render(<CopyPixButton code="PIX123" />)
        expect(screen.getByRole('button', { name: /copiar pix/i })).toBeInTheDocument()
    })

    it('copies the code and shows confirmation on click', async () => {
        const user = userEvent.setup()
        render(<CopyPixButton code="PIX123" />)
        await user.click(screen.getByRole('button'))
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith('PIX123')
        expect(await screen.findByText(/copiado/i)).toBeInTheDocument()
    })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/frontend/telemetry-kit/components/copy-pix-button.test.tsx`
Expected: FAIL with "Failed to resolve import './copy-pix-button'".

- [ ] **Step 3: Write minimal implementation**

Create `src/frontend/telemetry-kit/components/copy-pix-button.tsx`:
```tsx
"use client"

import { useState } from "react"
import { Check, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function CopyPixButton({
    code,
    label = "Copiar PIX",
    className,
}: {
    code: string
    label?: string
    className?: string
}) {
    const [copied, setCopied] = useState(false)

    async function handleCopy() {
        try {
            await navigator.clipboard.writeText(code)
            setCopied(true)
            window.setTimeout(() => setCopied(false), 2000)
        } catch {
            // Clipboard can be unavailable (insecure context); fail silently.
        }
    }

    return (
        <Button
            type="button"
            variant={copied ? "secondary" : "default"}
            onClick={handleCopy}
            aria-label={label}
            className={cn(className)}
        >
            {copied ? (
                <>
                    <Check className="size-4" /> Copiado
                </>
            ) : (
                <>
                    <Copy className="size-4" /> {label}
                </>
            )}
        </Button>
    )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/frontend/telemetry-kit/components/copy-pix-button.test.tsx`
Expected: PASS (both cases).

- [ ] **Step 5: Commit**

```bash
git add src/frontend/telemetry-kit/components/copy-pix-button.tsx src/frontend/telemetry-kit/components/copy-pix-button.test.tsx
git commit -m "feat: add CopyPixButton telemetry component"
```

---

## Task 11: LiveBadge component

**Files:**
- Create: `src/frontend/telemetry-kit/components/live-badge.tsx`
- Test: `src/frontend/telemetry-kit/components/live-badge.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/frontend/telemetry-kit/components/live-badge.test.tsx`:
```tsx
// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LiveBadge } from './live-badge'

describe('LiveBadge', () => {
    it('renders the default "ao vivo" text', () => {
        render(<LiveBadge />)
        expect(screen.getByText('ao vivo')).toBeInTheDocument()
    })
    it('renders custom label text', () => {
        render(<LiveBadge label="tempo real" />)
        expect(screen.getByText('tempo real')).toBeInTheDocument()
    })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/frontend/telemetry-kit/components/live-badge.test.tsx`
Expected: FAIL with "Failed to resolve import './live-badge'".

- [ ] **Step 3: Write minimal implementation**

Create `src/frontend/telemetry-kit/components/live-badge.tsx`:
```tsx
import { cn } from "@/lib/utils"

export function LiveBadge({
    label = "ao vivo",
    className,
}: {
    label?: string
    className?: string
}) {
    return (
        <span
            data-slot="live-badge"
            className={cn(
                "inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary",
                className,
            )}
        >
            <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-75 motion-reduce:animate-none" />
                <span className="relative inline-flex size-2 rounded-full bg-primary" />
            </span>
            {label}
        </span>
    )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/frontend/telemetry-kit/components/live-badge.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/frontend/telemetry-kit/components/live-badge.tsx src/frontend/telemetry-kit/components/live-badge.test.tsx
git commit -m "feat: add LiveBadge telemetry component"
```

---

## Task 12: GlowChart wrapper

**Files:**
- Create: `src/frontend/telemetry-kit/components/glow-chart.tsx`
- Test: `src/frontend/telemetry-kit/components/glow-chart.test.tsx`

Recharts does not render its SVG without a measured size under jsdom, so the automated test covers the deterministic empty-state branch; the populated chart is verified manually.

- [ ] **Step 1: Write the failing test**

Create `src/frontend/telemetry-kit/components/glow-chart.test.tsx`:
```tsx
// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { GlowChart } from './glow-chart'

describe('GlowChart', () => {
    it('shows an empty state when there is no data', () => {
        render(<GlowChart data={[]} dataKey="value" xKey="label" />)
        expect(screen.getByText('Sem dados no período')).toBeInTheDocument()
    })

    it('renders a chart container when data is present', () => {
        render(
            <GlowChart
                data={[{ label: '06h', value: 1 }, { label: '10h', value: 3 }]}
                dataKey="value"
                xKey="label"
            />,
        )
        expect(screen.getByTestId('glow-chart')).toBeInTheDocument()
    })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/frontend/telemetry-kit/components/glow-chart.test.tsx`
Expected: FAIL with "Failed to resolve import './glow-chart'".

- [ ] **Step 3: Write minimal implementation**

Create `src/frontend/telemetry-kit/components/glow-chart.tsx`:
```tsx
"use client"

import { useId } from "react"
import {
    Area,
    AreaChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts"
import { cn } from "@/lib/utils"

type Row = Record<string, string | number>

export function GlowChart({
    data,
    dataKey,
    xKey,
    height = 300,
    className,
}: {
    data: Row[]
    dataKey: string
    xKey: string
    height?: number
    className?: string
}) {
    const gradientId = useId()

    if (data.length === 0) {
        return (
            <div
                data-slot="glow-chart"
                className={cn(
                    "flex items-center justify-center rounded-2xl border bg-card text-sm text-muted-foreground",
                    className,
                )}
                style={{ height }}
            >
                Sem dados no período
            </div>
        )
    }

    return (
        <div
            data-slot="glow-chart"
            data-testid="glow-chart"
            className={cn("rounded-2xl border bg-card p-2", className)}
            style={{ height }}
        >
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#ff481e" stopOpacity={0.6} />
                            <stop offset="100%" stopColor="#f5a623" stopOpacity={0.05} />
                        </linearGradient>
                    </defs>
                    <XAxis dataKey={xKey} stroke="hsl(0 0% 60%)" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="hsl(0 0% 60%)" fontSize={12} tickLine={false} axisLine={false} width={36} />
                    <Tooltip
                        contentStyle={{
                            background: "hsl(0 0% 11%)",
                            border: "1px solid hsl(0 0% 16%)",
                            borderRadius: "0.75rem",
                            color: "hsl(48 9% 88%)",
                        }}
                    />
                    <Area
                        type="monotone"
                        dataKey={dataKey}
                        stroke="#ff481e"
                        strokeWidth={2}
                        fill={`url(#${gradientId})`}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/frontend/telemetry-kit/components/glow-chart.test.tsx`
Expected: PASS (both cases).

- [ ] **Step 5: Manual verification (visual)**

Use the `run` skill to render a `GlowChart` with sample data inside a sized container; confirm the orange→amber glow fill and stroke appear. Visual check only.

- [ ] **Step 6: Commit**

```bash
git add src/frontend/telemetry-kit/components/glow-chart.tsx src/frontend/telemetry-kit/components/glow-chart.test.tsx
git commit -m "feat: add GlowChart recharts wrapper"
```

---

## Task 13: Barrel export + full suite green

**Files:**
- Create: `src/frontend/telemetry-kit/index.ts`

- [ ] **Step 1: Create the barrel**

Create `src/frontend/telemetry-kit/index.ts`:
```ts
export { formatBRL, formatKwh, formatKw, formatPercent } from "./lib/format"
export { calcPaybackPercent, calcSavings } from "./lib/calc"
export { statusToColor, type TelemetryStatus } from "./lib/status"

export { StatusRing } from "./components/status-ring"
export { PaybackGauge } from "./components/payback-gauge"
export { MetricTile } from "./components/metric-tile"
export { CopyPixButton } from "./components/copy-pix-button"
export { LiveBadge } from "./components/live-badge"
export { GlowChart } from "./components/glow-chart"
```

- [ ] **Step 2: Add a barrel import test**

Create `src/frontend/telemetry-kit/index.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import * as kit from './index'

describe('telemetry-kit barrel', () => {
    it('re-exports helpers and components', () => {
        for (const name of [
            'formatBRL', 'formatKwh', 'formatKw', 'formatPercent',
            'calcPaybackPercent', 'calcSavings', 'statusToColor',
            'StatusRing', 'PaybackGauge', 'MetricTile', 'CopyPixButton',
            'LiveBadge', 'GlowChart',
        ]) {
            expect(kit[name as keyof typeof kit]).toBeDefined()
        }
    })
})
```

- [ ] **Step 3: Run the whole telemetry-kit suite**

Run: `npx vitest run src/frontend/telemetry-kit`
Expected: PASS (all lib + component + barrel tests).

- [ ] **Step 4: Type-check the project**

Run: `npx tsc --noEmit`
Expected: no new errors originating from `src/frontend/telemetry-kit/**`.

- [ ] **Step 5: Commit**

```bash
git add src/frontend/telemetry-kit/index.ts src/frontend/telemetry-kit/index.test.ts
git commit -m "feat: export telemetry-kit via barrel"
```

---

## Self-Review (completed during planning)

**Spec coverage (foundation portion of §4):** theme tokens → Task 5; fonts → Task 6; PaybackGauge → Task 8; MetricTile → Task 9; StatusRing → Task 7; GlowChart → Task 12; CopyPixButton → Task 10; LiveBadge → Task 11; payback/savings + consolidado math primitives → Tasks 2–3 (the consolidado⇄por-conta aggregation itself lives in the Economia plan, which consumes `calcSavings`); motion + `prefers-reduced-motion` → LiveBadge `motion-reduce` (Task 11), to be applied per-screen later. `AccountCard` is explicitly deferred to the Economia plan (documented in the header) because it depends on bill/payment data shapes defined there.

**Placeholder scan:** none — every code step contains complete code; every run step has an expected result.

**Type consistency:** `TelemetryStatus = 'ok' | 'warning' | 'critical' | 'unknown'` defined in Task 4 and consumed unchanged in Task 7 and the barrel (Task 13). `calcPaybackPercent` / `calcSavings` signatures defined in Task 3 are used unchanged by `PaybackGauge` (Task 8). Formatter signatures (Task 2) are used unchanged by `PaybackGauge` and `MetricTile`. The `--success` / `--warning` tokens introduced in Task 5 back the `text-success` / `text-warning` / `border-success` / `border-warning` classes used in Tasks 4 and 7.
