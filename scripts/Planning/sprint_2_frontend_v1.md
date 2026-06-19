Here is the strategic plan for your next front-end sprint. This document is
written cleanly, focusing on product vision, user stories, and the
**Jobs-to-be-Done (JTBD)** methodology to match your high-performance design
goals.

We are pulling the sleek, dark-themed, gold-accented typography and motion
patterns from the reference design system to establish a premium "McLaren-like"
elegance for the Solo App.

---

# Sprint Document: `sprint_2_frontend_refine_v1.md`

## 🌟 North Star Vision

To deliver a high-performance, dark-mode visual engine that transforms raw
energy data into a sophisticated financial asset dashboard. The app must make
the client feel like an elite asset investor who has absolute control over their
energy generation, multi-property distribution, and community referral network
with zero friction.

---

## 🏗️ Epic Breakdown & Feature Specs

### Epic 1: Geração Múltipla (The Generation Engine)

- **Core Concept:** Move away from cluttered engineering graphs. Bring an
  intuitive, "Golden Hour" glowing time-series visualization that aggregates
  multiple generation plants into a single asset overview while allowing quick
  drilling into specific inverters (Hoymiles, Auxsol, Deye, Canadian).
- **JTBD:** _When I check my investment production, I want to know immediately
  if my system is operating at maximum financial efficiency, so that I don't
  lose money on hidden downtime._
- **User Story:** As an admin/client, I can look at the main screen and see a
  unified live production indicator (kW) and aggregated energy (kWh), with clear
  visual indicators (Green/Yellow/Red status rings) if any specific inverter
  requires cleaning or support.

### Epic 2: Consumo & Split de Energia (The Virtual Power Plant Hub)

- **Core Concept:** The ultimate visualization of the energy distribution
  network. Showing how one generator property feeds multiple consumer properties
  (UCs) using clear, visual distribution rules and percent shares.
- **JTBD:** _When my utility bills are compiled, I want to see exactly how my
  generated credits were distributed across my accounts and pay them directly,
  so I can keep complete control over my network balance._
- **User Story:** As a client with multiple properties, I can toggle between a
  "Consolidated Network View" and a "Split Account View." Under the billing
  section, I see clear cards for each UC with its monthly Enel bill data,
  processed savings, and a single-click **"Copy PIX / Barcode"** button
  alongside an option to view the raw PDF statement.

### Epic 3: Clube Solo & Indicações (The Referral Machine)

- **Core Concept:** Gamifying the utility lifecycle. Translating solar
  production and customer referrals into "SoloCoins" that directly offset future
  utility costs.
- **JTBD:** _When I recommend Solo Energia to my business network, I want the
  progression tracked transparently and converted into monetary benefits, so
  that I feel properly rewarded as a strategic partner._
- **User Story:** As a Solo customer, I can access a premium membership portal
  displaying my **SoloCoin Balance**. I have access to a custom tracking screen
  showing the real-time status of my referred friends ("Onboarding", "Active
  Generation"). I can see how many credits are pending and have an immediate
  view of how many coins I can apply to pay my current month's bill.

---

## 🗺️ Visual Flow Architecture (User Journey mapping)

```
[Main Private App Shell]
   │
   ├── Dashboard ────────► Aggregate Live Production + Network Status Rings
   │
   ├── Energy Hub ───────► [Toggle] Consolidated vs. Per-Unit Split View
   │                          └── Utility Invoices with Live "Copy PIX" Button
   │
   └── Solo Club ────────► SoloCoin Wallet + Active Referral Status Tracker
```

---

## 🛠️ Engineering Acceptance Criteria (High-Level Framework)

1. **Design System Adherence:** The interface must strictly employ the
   high-contrast dark aesthetic from the design system payload, utilizing
   premium gradients (`#E2B714` to gold tones) for success metrics and balance
   highlights.
2. **The "PIX One-Click" Benchmark:** The copy action for the barcode or PIX
   string on any active energy bill card must copy immediately to the clipboard
   with crisp, native, haptic-feeling confirmation feedback.
3. **Data Agility:** Changing filters between network timelines (Day, Month,
   Year) or switching between consolidated and property-split modes must render
   instantly via optimistic data transformations without resetting scroll
   context.

---

This framework is optimized to keep your developer aligned on the **outcome**
rather than just completing coding tickets, ensuring the look and feel is
premium.
