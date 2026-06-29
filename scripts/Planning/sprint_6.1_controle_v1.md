# Sprint 6.1 — Controle Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to
> implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

## Original Reported Issues (source of truth)

1. The **rateio** sector returns an error: *"Application error: a client-side exception has
   occurred while loading soloapp.com.br"*.
2. The **Generation** dashboard is not pulling data from the client's inverter — correct it.
3. The **dashboards and graphics** are out of our style / desired design system — correct it.

## Clarified Scope (confirmed with product owner 2026-06-28)

- **Issue 1:** No reproducible console stack available → **diagnose & harden defensively**
  (error boundary + null/undefined guards on the rateio render path).
- **Issue 2:** Treat as **both** — (a) data never refreshes because nothing schedules a sync,
  and (b) verify the provider fetch path end-to-end. Add an automatic sync trigger.
- **Issue 3:** **All dashboards app-wide** aligned to the telemetry-kit / token design system.

---

**Goal:** Eliminate the rateio client-side crash, make the generation dashboard pull live
inverter data automatically, and bring every dashboard chart onto the design-token system.

**Architecture:** Next.js 15 App Router + React 19, TanStack Query on the client, a clean
backend `use-case/service/repository` layout for generation, Prisma for persistence, and a
shadcn/Tailwind design system whose colors live as CSS variables in `src/app/globals.css`
(`--primary`, `--chart-1..5`, `--background`, `--border`, etc.). Charts use `recharts`.

**Tech Stack:** TypeScript, Next.js 15 (turbopack), React 19, TanStack Query v5, recharts,
Prisma 6, Vitest + @testing-library/react, Tailwind v4.

## Global Constraints

- Test runner: `npm test -- <path>` (vitest). Type check: `npm run typecheck`.
- All user-facing copy stays in **Brazilian Portuguese**, matching existing tone.
- Design tokens are **complete CSS color values** already (e.g. `--chart-1: #ff481e`,
  `--background: hsl(0 0% 8%)`). Therefore reference them as `var(--token)` — **never**
  `hsl(var(--token))` (double-wrapping produces invalid CSS that silently falls back).
- Do not introduce new dependencies. Reuse existing shadcn primitives.
- TDD: write the failing test first, watch it fail, implement minimally, watch it pass, commit.
- Frequent commits — one per task, message prefix per area (`fix(rateio)`, `feat(geracao)`,
  `style(dash)`).

---

## File Structure (what changes)

**Issue 1 — Rateio hardening**
- Create: `src/components/ui/error-boundary.tsx` (reusable client error boundary)
- Create: `src/components/ui/error-boundary.test.tsx`
- Modify: `src/frontend/rateio/rateio-screen.tsx` (wrap body, guard grouping/map logic)
- Modify: `src/frontend/rateio/rateio-screen.test.tsx` (crash-resilience cases)

**Issue 2 — Generation auto-sync + provider path**
- Modify: `src/backend/generation/services/generation.service.ts` (already has
  `syncAllInvertersData`; add `syncClientInvertersData(clientId)` scoped helper)
- Create: `src/app/api/generation/sync/client/route.ts` (auth'd, client-scoped sync POST)
- Create: `src/app/api/generation/sync/client/route.test.ts`
- Modify: `src/frontend/generation/hooks/use-generation-dashboard.ts` (kick a sync on mount /
  on manual refresh, then refetch analytics)
- Modify: `src/backend/generation/__tests__/generation.service.test.ts`

**Issue 3 — Design-system alignment (all charts)**
- Modify: `src/frontend/telemetry-kit/components/glow-chart.tsx`
- Modify: `src/frontend/consumption/components/consumption-chart.tsx`
- Modify: `src/frontend/generation/components/dashboard/time-series-chart.tsx`
- Modify: `src/frontend/generation/components/dashboard/type-distribution-chart.tsx`
- Modify: `src/frontend/generation/components/dashboard/inverters-comparison-chart.tsx`
- Modify: `src/frontend/generation/components/dashboard/adaptive-chart.tsx`
- Create: `src/frontend/telemetry-kit/components/glow-chart.test.tsx` (token assertions)

---

## Task 1: Reusable Error Boundary

**Files:**
- Create: `src/components/ui/error-boundary.tsx`
- Test: `src/components/ui/error-boundary.test.tsx`

**Interfaces:**
- Produces: `export class ErrorBoundary extends React.Component<{ fallback?: React.ReactNode; children: React.ReactNode }>` — catches render errors in its subtree and renders `fallback` (default: a `destructive` Alert reading "Algo deu errado ao carregar esta seção.").

- [ ] **Step 1: Write the failing test**

```tsx
// src/components/ui/error-boundary.test.tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { ErrorBoundary } from './error-boundary'

function Boom(): React.ReactNode { throw new Error('boom') }

describe('ErrorBoundary', () => {
  it('renders children when no error', () => {
    render(<ErrorBoundary><span>ok</span></ErrorBoundary>)
    expect(screen.getByText('ok')).toBeInTheDocument()
  })

  it('renders fallback when a child throws', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    render(<ErrorBoundary><Boom /></ErrorBoundary>)
    expect(screen.getByText(/algo deu errado/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test, verify it fails**
Run: `npm test -- src/components/ui/error-boundary.test.tsx`
Expected: FAIL — module `./error-boundary` not found.

- [ ] **Step 3: Implement minimal component**

```tsx
// src/components/ui/error-boundary.tsx
'use client'

import * as React from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

interface Props { fallback?: React.ReactNode; children: React.ReactNode }
interface State { hasError: boolean }

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: unknown) {
    console.error('[ErrorBoundary]', error)
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <Alert variant="destructive">
            <AlertTitle>Algo deu errado</AlertTitle>
            <AlertDescription>
              Algo deu errado ao carregar esta seção. Tente recarregar a página.
            </AlertDescription>
          </Alert>
        )
      )
    }
    return this.props.children
  }
}
```

- [ ] **Step 4: Run test, verify it passes**
Run: `npm test -- src/components/ui/error-boundary.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**
```bash
git add src/components/ui/error-boundary.tsx src/components/ui/error-boundary.test.tsx
git commit -m "feat(ui): add reusable ErrorBoundary component"
```

---

## Task 2: Harden Rateio Screen against client-side crash

**Files:**
- Modify: `src/frontend/rateio/rateio-screen.tsx`
- Test: `src/frontend/rateio/rateio-screen.test.tsx`

**Interfaces:**
- Consumes: `ErrorBoundary` from Task 1; `useRateio()` from `./hooks/use-rateio`.

**Root-cause guards to apply** (defensive — covers the unreproduced production crash):
1. The `useEffect` fetch chain on lines ~58-80 has **no `.catch`** — if `/client/plants` or
   `/client/consumer-units` rejects or returns a non-array `data.data`, the `.map` throws an
   unhandled rejection. Add `.catch` and array guards.
2. Grouping logic (lines ~88-101) keys a Map by `a.plant?.id ?? a.plantId`; if both are
   nullish the key is `undefined`. Guard with a stable fallback key and skip rows missing ids.
3. Wrap the returned `body` in `<ErrorBoundary>` so any residual render error degrades to a
   friendly message instead of taking down the whole route.

- [ ] **Step 1: Write the failing tests** (append to existing `rateio-screen.test.tsx`)

```tsx
// Add inside the existing describe block. Adjust mock helpers to match the file's existing
// useRateio / useAuthenticatedApi mocks.
it('does not crash when an allocation is missing plant info', async () => {
  mockUseRateio.mockReturnValue({
    data: [{ id: 'a1', plantId: '', plant: null, fromId: 'f', toId: 't',
      allocationPercentage: 50, enelSyncStatus: 'applied', requestedAt: null,
      from: null, to: null, createdAt: '', updatedAt: '' }],
    isLoading: false, error: null, refetch: vi.fn(),
  })
  render(<RateioScreen embedded />)
  // Renders the row fallback ("Usina") instead of throwing
  expect(await screen.findByText('Usina')).toBeInTheDocument()
})

it('renders error state when plants/units fetch rejects', async () => {
  mockApiGet.mockRejectedValue(new Error('network'))
  mockUseRateio.mockReturnValue({ data: [], isLoading: false, error: null, refetch: vi.fn() })
  render(<RateioScreen embedded />)
  // Screen still renders the empty-state, editor simply stays unavailable — no crash
  expect(await screen.findByText(/nenhum rateio configurado/i)).toBeInTheDocument()
})
```

- [ ] **Step 2: Run tests, verify the new ones fail**
Run: `npm test -- src/frontend/rateio/rateio-screen.test.tsx`
Expected: the two new cases FAIL (unhandled throw / rejection).

- [ ] **Step 3: Apply the guards**

In `rateio-screen.tsx`, replace the fetch `useEffect` body so it tolerates failures and
non-arrays:

```tsx
useEffect(() => {
  if (!api.isAuthenticated) return
  Promise.all([
    api.get('/client/plants'),
    api.get('/client/consumer-units'),
  ])
    .then(([plantsRes, unitsRes]) => {
      const plantList = Array.isArray(plantsRes?.data?.data) ? plantsRes.data.data : []
      if (plantsRes?.data?.success) {
        setPlants(plantList.map((p: PlantOption) => ({ id: p.id, name: p.name ?? null })))
      }
      const unitList = Array.isArray(unitsRes?.data?.data) ? unitsRes.data.data : []
      if (unitsRes?.data?.success) {
        const units: UnitOption[] = unitList.map((u: UnitOption) => ({
          id: u.id, name: u.name ?? null, clientNumber: u.clientNumber ?? null, plantId: u.plantId,
        }))
        setGeneratorUnits(units)
        setConsumerUnits(units)
      }
    })
    .catch((err) => { console.error('[rateio] failed to load plants/units', err) })
    .finally(() => setEditorReady(true))
}, [api, api.isAuthenticated])
```

Guard the grouping (skip ids-less rows, stable key):

```tsx
if (allocations) {
  for (const a of allocations) {
    const plantId = a.plant?.id ?? a.plantId ?? 'unknown'
    if (!plantsMap.has(plantId)) {
      plantsMap.set(plantId, { id: plantId, name: a.plant?.name ?? 'Usina', allocations: [] })
    }
    plantsMap.get(plantId)!.allocations.push(a)
  }
}
```

Wrap the body in the error boundary — change the two returns:

```tsx
import { ErrorBoundary } from '@/components/ui/error-boundary'
// ...
if (embedded) {
  return <ErrorBoundary>{body}</ErrorBoundary>
}
return (
  <PageLayout header={<PageHeader title="Rateio de Créditos" subtitle="Acompanhe a distribuição dos créditos de energia entre as unidades consumidoras" />}>
    <ErrorBoundary>{body}</ErrorBoundary>
  </PageLayout>
)
```

- [ ] **Step 4: Run tests, verify all pass**
Run: `npm test -- src/frontend/rateio/rateio-screen.test.tsx`
Expected: PASS (existing + 2 new).

- [ ] **Step 5: Typecheck + commit**
```bash
npm run typecheck
git add src/frontend/rateio/rateio-screen.tsx src/frontend/rateio/rateio-screen.test.tsx
git commit -m "fix(rateio): harden screen against client-side crash (guards + error boundary)"
```

---

## Task 3: Client-scoped generation sync service method

**Files:**
- Modify: `src/backend/generation/services/generation.service.ts`
- Test: `src/backend/generation/__tests__/generation.service.test.ts`

**Interfaces:**
- Produces: `syncClientInvertersData(clientId: string): Promise<{ results, errors, skipped }>` on
  `GenerationService` — same return shape as `syncAllInvertersData()` but only iterates
  inverters whose `clientId` matches. Reuses the existing per-provider min-interval throttle
  (`PROVIDER_MIN_SYNC_INTERVAL_MS`) so we respect the Hoymiles 15-min / AUXSOL limits.

- [ ] **Step 1: Write the failing test** (add to `generation.service.test.ts`, matching its
  existing mock-repository setup)

```ts
it('syncClientInvertersData only syncs inverters of the given client', async () => {
  // Arrange: two inverters, different clientIds, in the mocked inverter repo
  inverterRepo.find.mockResolvedValue([
    { id: 'inv-a', clientId: 'client-1', provider: 'mock' },
    { id: 'inv-b', clientId: 'client-2', provider: 'mock' },
  ])
  generationUnitRepo.findByInverterId.mockResolvedValue([])
  const syncSpy = vi.spyOn(service, 'syncInverterData').mockResolvedValue({
    success: true, inverterId: 'inv-a', unitsCreated: 4, unitsUpdated: 0, message: 'ok',
  })

  const result = await service.syncClientInvertersData('client-1')

  expect(syncSpy).toHaveBeenCalledTimes(1)
  expect(syncSpy).toHaveBeenCalledWith({ inverterId: 'inv-a' })
  expect(result.results).toHaveLength(1)
})
```

- [ ] **Step 2: Run test, verify it fails**
Run: `npm test -- src/backend/generation/__tests__/generation.service.test.ts`
Expected: FAIL — `service.syncClientInvertersData is not a function`.

- [ ] **Step 3: Implement the method** (mirror `syncAllInvertersData`, add the clientId filter)

```ts
async syncClientInvertersData(clientId: string): Promise<{ results: SyncInverterGenerationDataResponse[], errors: any[], skipped: string[] }> {
  const inverters = (await this.inverterRepository.find()).filter(inv => inv.clientId === clientId)
  const results: SyncInverterGenerationDataResponse[] = []
  const errors: any[] = []
  const skipped: string[] = []

  for (const inverter of inverters) {
    try {
      const minInterval = PROVIDER_MIN_SYNC_INTERVAL_MS[inverter.provider]
      if (minInterval) {
        const units = await this.generationUnitRepository.findByInverterId(inverter.id)
        const latest = units.length > 0
          ? units.reduce((l, c) => c.timestamp > l.timestamp ? c : l)
          : null
        if (latest?.timestamp && (Date.now() - latest.timestamp.getTime()) < minInterval) {
          skipped.push(inverter.id)
          continue
        }
      }
      results.push(await this.syncInverterData({ inverterId: inverter.id }))
    } catch (error) {
      errors.push({ inverterId: inverter.id, error: error instanceof Error ? error.message : 'Unknown error' })
    }
  }
  return { results, errors, skipped }
}
```

- [ ] **Step 4: Run test, verify it passes**
Run: `npm test -- src/backend/generation/__tests__/generation.service.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**
```bash
git add src/backend/generation/services/generation.service.ts src/backend/generation/__tests__/generation.service.test.ts
git commit -m "feat(geracao): add client-scoped inverter sync to GenerationService"
```

---

## Task 4: Authenticated client-scoped sync route

**Files:**
- Create: `src/app/api/generation/sync/client/route.ts`
- Test: `src/app/api/generation/sync/client/route.test.ts`

**Interfaces:**
- Consumes: `GenerationService.syncClientInvertersData` (Task 3), `AuthMiddleware.requireAuth`.
- Produces: `POST /api/generation/sync/client` → `{ success, data: { results, errors, skipped } }`.
  Resolves `clientId` from the authenticated user context (master may pass `?clientId=`),
  throws "Usuário sem cliente vinculado" when absent. Mirrors the auth pattern in
  `src/app/api/rateio/route.ts`.

> NOTE: the existing `src/app/api/generation/sync/route.ts` has **no auth guard** — leave it as
> the admin/cron-style endpoint, but the new client route MUST require auth.

- [ ] **Step 1: Write the failing test**

```ts
// src/app/api/generation/sync/client/route.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

const requireAuth = vi.fn()
const syncClientInvertersData = vi.fn()

vi.mock('@/backend/auth/middleware/auth.middleware', () => ({
  AuthMiddleware: { requireAuth: (...a: unknown[]) => requireAuth(...a) },
}))
vi.mock('@/backend/generation/services/generation.service', () => ({
  GenerationService: vi.fn(() => ({ syncClientInvertersData })),
}))
vi.mock('@/lib/prisma', () => ({ default: {} }))

import { POST } from './route'

describe('POST /api/generation/sync/client', () => {
  beforeEach(() => { requireAuth.mockReset(); syncClientInvertersData.mockReset() })

  it('syncs the authenticated user\'s client inverters', async () => {
    requireAuth.mockResolvedValue({ clientId: 'client-1', hasRole: () => false })
    syncClientInvertersData.mockResolvedValue({ results: [{}], errors: [], skipped: [] })
    const res = await POST(new Request('http://x/api/generation/sync/client', { method: 'POST' }) as any)
    const json = await res.json()
    expect(json.success).toBe(true)
    expect(syncClientInvertersData).toHaveBeenCalledWith('client-1')
  })
})
```

- [ ] **Step 2: Run test, verify it fails**
Run: `npm test -- src/app/api/generation/sync/client/route.test.ts`
Expected: FAIL — `./route` not found.

- [ ] **Step 3: Implement the route**

```ts
// src/app/api/generation/sync/client/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { withHandle } from '@/app/api/api-utils'
import { AuthMiddleware } from '@/backend/auth/middleware/auth.middleware'
import { GenerationService } from '@/backend/generation/services/generation.service'
import { PrismaInverterRepository } from '@/backend/generation/repositories/implementations/prisma.inverter.repository'
import { PrismaGenerationUnitRepository } from '@/backend/generation/repositories/implementations/prisma.generation-unit.repository'
import prisma from '@/lib/prisma'

const generationService = new GenerationService(
  new PrismaInverterRepository(prisma),
  new PrismaGenerationUnitRepository(prisma),
)

const syncClientInverters = async (request: NextRequest) => {
  const user = await AuthMiddleware.requireAuth(request)
  const url = new URL(request.url)
  const clientId = (user.hasRole?.('master') && url.searchParams.get('clientId')) || user.clientId
  if (!clientId) throw new Error('Usuário sem cliente vinculado')

  const result = await generationService.syncClientInvertersData(clientId)
  return NextResponse.json({ success: true, data: result })
}

export const POST = withHandle(syncClientInverters)
```

- [ ] **Step 4: Run test, verify it passes**
Run: `npm test -- src/app/api/generation/sync/client/route.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**
```bash
git add src/app/api/generation/sync/client/route.ts src/app/api/generation/sync/client/route.test.ts
git commit -m "feat(geracao): add authenticated client-scoped sync route"
```

---

## Task 5: Dashboard triggers a sync so it pulls live inverter data

**Files:**
- Modify: `src/frontend/generation/hooks/use-generation-dashboard.ts`
- Test: `src/frontend/generation/hooks/use-generation-dashboard.test.ts` (create if absent)

**Interfaces:**
- Consumes: `POST /api/generation/sync/client` (Task 4).
- Produces: the hook fires the client sync once on mount (and on manual `refetch`), then
  invalidates/refetches the analytics query. A `useRef` guard prevents duplicate sync on the
  5s real-time poll — we sync on mount + explicit refresh only, not on every poll tick.

- [ ] **Step 1: Write the failing test**

```ts
// src/frontend/generation/hooks/use-generation-dashboard.test.ts
import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

const post = vi.fn().mockResolvedValue({ data: { success: true, data: {} } })
const get = vi.fn().mockResolvedValue({ data: { success: true, data: { overview: {}, timeSeries: [], byInverter: [], byType: {}, filters: { appliedFilters: 0 } } } })

vi.mock('@/frontend/auth/hooks/useAuthenticatedApi', () => ({
  useAuthenticatedApi: () => ({ get, post, isAuthenticated: true }),
}))

import { useGenerationDashboard } from './use-generation-dashboard'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'

const wrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(QueryClientProvider, { client: new QueryClient() }, children)

describe('useGenerationDashboard', () => {
  it('triggers a client sync on mount before reading analytics', async () => {
    renderHook(() => useGenerationDashboard({}), { wrapper })
    await waitFor(() => expect(post).toHaveBeenCalledWith('/generation/sync/client'))
  })
})
```

- [ ] **Step 2: Run test, verify it fails**
Run: `npm test -- src/frontend/generation/hooks/use-generation-dashboard.test.ts`
Expected: FAIL — `post` never called.

- [ ] **Step 3: Add the sync-on-mount effect** to `use-generation-dashboard.ts`

Add imports `useEffect, useRef` and, inside the hook before the `return`:

```ts
const syncedRef = useRef(false)
useEffect(() => {
  if (!api.isAuthenticated || syncedRef.current) return
  syncedRef.current = true
  api.post('/generation/sync/client')
    .catch((err) => console.error('[geracao] sync on mount failed', err))
    .finally(() => { refetch() })
}, [api, api.isAuthenticated, refetch])
```

And make the exposed `refetch` also trigger a fresh sync — wrap it:

```ts
const refetchWithSync = useCallback(async () => {
  try { await api.post('/generation/sync/client') } catch (e) { console.error('[geracao] manual sync failed', e) }
  return refetch()
}, [api, refetch])
```

Return `refetch: refetchWithSync` instead of the raw `refetch`.

- [ ] **Step 4: Run test, verify it passes**
Run: `npm test -- src/frontend/generation/hooks/use-generation-dashboard.test.ts`
Expected: PASS.

- [ ] **Step 5: Typecheck + commit**
```bash
npm run typecheck
git add src/frontend/generation/hooks/use-generation-dashboard.ts src/frontend/generation/hooks/use-generation-dashboard.test.ts
git commit -m "feat(geracao): dashboard auto-syncs client inverters on mount and refresh"
```

---

## Task 6: GlowChart — design-token colors + theme-aware tooltip

**Files:**
- Modify: `src/frontend/telemetry-kit/components/glow-chart.tsx`
- Test: `src/frontend/telemetry-kit/components/glow-chart.test.tsx`

**Root cause:** GlowChart hardcodes `#ff481e`/`#f5a623` and a **dark-only** tooltip
(`hsl(0 0% 11%)`), so it ignores theme and the design tokens.

- [ ] **Step 1: Write the failing test**

```tsx
// src/frontend/telemetry-kit/components/glow-chart.test.tsx
import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { GlowChart } from './glow-chart'

describe('GlowChart', () => {
  it('uses design tokens, not hardcoded hex, for stroke', () => {
    const { container } = render(
      <GlowChart data={[{ label: 'a', v: 1 }, { label: 'b', v: 2 }]} dataKey="v" xKey="label" />,
    )
    const html = container.innerHTML
    expect(html).not.toContain('#ff481e')
    expect(html).toContain('var(--chart-1)')
  })
})
```

- [ ] **Step 2: Run test, verify it fails**
Run: `npm test -- src/frontend/telemetry-kit/components/glow-chart.test.tsx`
Expected: FAIL — still contains `#ff481e`.

- [ ] **Step 3: Replace hardcoded colors with tokens**

In `glow-chart.tsx`:
- gradient stops: `stopColor="var(--chart-1)"` (top) and `stopColor="var(--chart-2)"` (bottom).
- axes `stroke="var(--muted-foreground)"`.
- `Area` `stroke="var(--chart-1)"`.
- Tooltip `contentStyle`: `{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '0.75rem', color: 'var(--foreground)' }`.

- [ ] **Step 4: Run test, verify it passes**
Run: `npm test -- src/frontend/telemetry-kit/components/glow-chart.test.tsx`
Expected: PASS. Also re-run the kit suite: `npm test -- src/frontend/telemetry-kit`.

- [ ] **Step 5: Commit**
```bash
git add src/frontend/telemetry-kit/components/glow-chart.tsx src/frontend/telemetry-kit/components/glow-chart.test.tsx
git commit -m "style(dash): GlowChart uses design tokens and theme-aware tooltip"
```

---

## Task 7: Fix invalid `hsl(var(--token))` wrapping across generation charts

**Files:**
- Modify: `src/frontend/generation/components/dashboard/time-series-chart.tsx`
- Modify: `src/frontend/generation/components/dashboard/type-distribution-chart.tsx`
- Modify: `src/frontend/generation/components/dashboard/inverters-comparison-chart.tsx`
- Modify: `src/frontend/generation/components/dashboard/adaptive-chart.tsx`

**Root cause:** tokens are complete color values, so `hsl(var(--chart-1))` →
`hsl(#ff481e)` (invalid) and `hsl(var(--background))` → `hsl(hsl(0 0% 8%))` (invalid). These
silently fall back to recharts defaults — the visible "off design system" symptom. Also
`type-distribution-chart` hardcodes `#8884d8`, and `adaptive-chart` uses `stroke="#fff"` dots.

- [ ] **Step 1: Write the guard test** (one shared assertion file)

```tsx
// src/frontend/generation/components/dashboard/chart-tokens.test.tsx
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const files = [
  'time-series-chart.tsx',
  'type-distribution-chart.tsx',
  'inverters-comparison-chart.tsx',
  'adaptive-chart.tsx',
]

describe('generation charts use valid design tokens', () => {
  for (const f of files) {
    it(`${f} has no double-wrapped hsl(var()) or stray hex`, () => {
      const src = readFileSync(join(__dirname, f), 'utf8')
      expect(src).not.toMatch(/hsl\(var\(/)
      expect(src).not.toContain('#8884d8')
      expect(src).not.toContain('#fff')
    })
  }
})
```

- [ ] **Step 2: Run test, verify it fails**
Run: `npm test -- src/frontend/generation/components/dashboard/chart-tokens.test.tsx`
Expected: FAIL — matches found.

- [ ] **Step 3: Apply replacements** in each listed file:
- `hsl(var(--chart-1))` → `var(--chart-1)`, `hsl(var(--chart-2))` → `var(--chart-2)`, etc.
- `hsl(var(--background))` → `var(--card)`; `hsl(var(--border))` → `var(--border)`.
- `type-distribution-chart.tsx`: `fill="#8884d8"` → `fill="var(--chart-1)"` (or map slices
  to `var(--chart-1..5)` if it renders multiple cells).
- `adaptive-chart.tsx`: dot `stroke: '#fff'` → `stroke: 'var(--background)'`.

- [ ] **Step 4: Run test + typecheck, verify pass**
Run: `npm test -- src/frontend/generation/components/dashboard/chart-tokens.test.tsx`
Then: `npm run typecheck`
Expected: PASS, no type errors.

- [ ] **Step 5: Commit**
```bash
git add src/frontend/generation/components/dashboard/
git commit -m "style(dash): use valid design tokens in generation charts (fix hsl() wrapping)"
```

---

## Task 8: ConsumptionChart — tokenize savings line + dot

**Files:**
- Modify: `src/frontend/consumption/components/consumption-chart.tsx`

**Root cause:** the savings `Line` hardcodes `#22c55e` and dot `stroke="#fff"`. Consumption and
injected bars already correctly use `var(--chart-1/2)`. Move the green to a token so the chart
stays on-system in both themes. Use `--chart-3` (teal) for the savings series, dot stroke
`var(--background)`.

- [ ] **Step 1: Write the guard test**

```tsx
// src/frontend/consumption/components/consumption-chart.test.tsx
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

it('consumption chart uses tokens, not hardcoded hex', () => {
  const src = readFileSync(join(__dirname, 'consumption-chart.tsx'), 'utf8')
  expect(src).not.toContain('#22c55e')
  expect(src).not.toContain('#fff')
  expect(src).toContain('var(--chart-3)')
})
```

- [ ] **Step 2: Run test, verify it fails**
Run: `npm test -- src/frontend/consumption/components/consumption-chart.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Apply replacements** — `stroke="#22c55e"` → `stroke="var(--chart-3)"`;
  dot `fill: "#22c55e"` → `fill: "var(--chart-3)"`, `stroke: "#fff"` → `stroke: "var(--background)"`.

- [ ] **Step 4: Run test, verify it passes**
Run: `npm test -- src/frontend/consumption/components/consumption-chart.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**
```bash
git add src/frontend/consumption/components/consumption-chart.tsx src/frontend/consumption/components/consumption-chart.test.tsx
git commit -m "style(dash): tokenize ConsumptionChart savings series"
```

---

## Task 9: Full-suite verification gate

**Files:** none (verification only).

- [ ] **Step 1: Run the whole test suite**
Run: `npm test -- --run`
Expected: all suites green (no regressions from Tasks 1-8).

- [ ] **Step 2: Typecheck**
Run: `npm run typecheck`
Expected: no errors.

- [ ] **Step 3: Production build smoke (catches prod-only client exceptions like Issue 1)**
Run: `npm run build`
Expected: build completes; no "client-side exception" / serialization errors.

- [ ] **Step 4: Final commit (if any verification fixups were needed)**
```bash
git add -A
git commit -m "chore(sprint6.1): verification gate — tests, typecheck, build green"
```

---

## Verification Limits (be honest at hand-off)

- **Issue 1:** The exact production stack could not be reproduced locally; the fix is defensive
  (guards + error boundary + prod build smoke). If the crash recurs, capture the browser console
  stack and reopen with the precise frame.
- **Issue 2:** Provider HTTP calls to real inverters cannot be exercised in this environment
  (live credentials / network). Tests cover the sync orchestration + route + dashboard trigger
  with mocked providers; live correctness must be confirmed on the VPS against a real inverter.

## Self-Review (author checklist — completed at write time)

- Spec coverage: Issue 1 → Tasks 1-2; Issue 2 → Tasks 3-5; Issue 3 → Tasks 6-8; gate → Task 9. ✓
- Placeholder scan: no TBD/TODO; every code step shows concrete code. ✓
- Type consistency: `syncClientInvertersData` signature identical across Tasks 3-4; `ErrorBoundary`
  prop names identical across Tasks 1-2; `var(--chart-N)` token usage consistent across 6-8. ✓
