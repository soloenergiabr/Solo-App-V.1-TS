# Solo App — Backlog / Deferred Scope (parked out of Sprint 4)

> Source vision: `scripts/Planning/pré_sprint_4_controle_v1.md` (Brainstorm Sessions 1 & 2).
> Sprint 4 (`sprint_4_controle_v1.md`) deliberately ships **only** manual onboarding + cockpit correctness so Solo can migrate real clients now, without supplier/Enel automation.
> Everything below is **explicitly out of Sprint 4** — do NOT build it this sprint. Each item is a candidate for a future sprint; rough sizing and the vision section it came from are noted.

---

## 🎨 Brand / Navigation / IA

- [ ] **Navigation rebrand to 5 sections** — Controle / Energia / Consumo / Clube Solo / Suporte, with brand-styled names. Merge `plants` + `generation` → **Energia**; merge `consumption` + `rateio` → **Consumo**. Touches every screen + `app-sidebar.tsx`. _(XL — Vision §2)_
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

## ❓ Open product questions (decide before the relevant sprint)

- [ ] Pricing model — who pays (integrator SaaS? client freemium?), how much, how. _(Vision §5.4 / Session 2 §10.2)_
- [ ] First distributor to integrate (Enel assumed) + rateio-without-Enel-partnership viability. _(Session 2 §10.2)_
- [ ] Solo Coins: real R$ value vs. discount-only (accounting impact). _(Session 2 §10.2)_
- [ ] PWA vs. native for v2. _(Vision §5.4)_
- [ ] WebSocket vs. SSE for live data. _(Session 2 §10.1)_

---

_Pulled from the Sprint 4 brainstorm so nothing from the vision is lost. Promote an item into a sprint file when it's next; keep this list as the running product backlog._
