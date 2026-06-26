# Client Navigation IA — Sprint 5.1 Phase B (decision record)

> Contract for B2–B5. The client (`vendedor`) sidebar consolidates from 9 flat items into **4 sections**. Admin (`master`) nav is untouched.

## The 4 sections

| Section (desktop group title) | Mobile hub entry → route | Sub-items (desktop, in order) | Icon |
| --- | --- | --- | --- |
| **Controle** | `/controle` | Controle (cockpit) | `Gauge` |
| **Energia** | `/energia` (new hub) | Geração → `/dashboard` · Minhas Usinas → `/plants/wizard` | `Zap` |
| **Consumo** | `/consumo` (new hub) | Economia (analisador IA) → `/economia` · Rateio → `/rateio` · Consumo → `/consumo` | `DollarSign` |
| **Solo Club** | `/club` | Clube Solo → `/club` · Meus Vouchers → `/vouchers` · Solo Coins → `/solo-coins` | `Gift` |
| _(footer / utility)_ | `/support` | Suporte | `HelpCircleIcon` |

## Desktop vs mobile (no `sidebar.tsx` change needed)

`src/components/ui/sidebar.tsx` renders `sections` on desktop (grouped, with sub-items) and uses `items ?? sections.flatMap(...)` on the mobile footer. So `AppSidebar` passes **both**:

- `sections={vendedorSections}` — the 4 titled groups with their sub-items (desktop).
- `items={vendedorMobileItems}` — the 4 hub entries + Suporte (mobile footer; ≤5 icons, replacing the old 9-cramped flat list).

`mobileLabel` per hub: `Controle`, `Energia`, `Consumo`, `Club`, `Suporte`.

## Decisions

- **Investor Demo is REMOVED from the client nav** (per owner instruction). Keep it reachable by direct URL / master role only; do not show it to clients on desktop or mobile.
- **Hub pages are light landing pages**, NOT embeds of full screen components. Each hub = `PageLayout`/`PageHeader` + a row of large navigation `Card` links (icon + title + one-line pt-BR description) to the existing sub-routes. This avoids nested `PageLayout` headers and keeps the existing screens authoritative. The sidebar already gives direct sub-item access on desktop; the hub is primarily the mobile destination + a section overview.
- **`/economia/[billId]` stays the canonical bill-analysis URL.** Consumo links to `/economia` (and to individual bills at `/economia/[billId]`). The upload redirect (`router.push('/economia/'+id)`) is unchanged. Do NOT move bills under `/consumo/...` this sprint.
- **No route retirement.** `/economia`, `/rateio`, `/plants/wizard`, `/dashboard`, `/club`, `/vouchers`, `/solo-coins` all stay valid (the hubs link to them; existing bookmarks/links keep working). No redirects are required for these. Only NEW routes `/energia` and `/consumo` are added.

## Sub-item route note (Energia / Consumo)

Where a sub-item has no standalone short route (e.g. "Geração" is the dashboard, "Consumo" is the consumption screen under `src/frontend/consumption`), the desktop sub-item links to the existing route (`/dashboard`) or to the hub anchor; the consumption screen, if it has no dedicated route yet, is reached from the `/consumo` hub card. B3a/B3b confirm the exact existing routes and wire to them — they do not create new business screens.
