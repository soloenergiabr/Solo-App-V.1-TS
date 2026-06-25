# Sprint 4.1 Controle v1 — Comparative Study

Mateus View:

1. The sections of the side bar is:

- Controle
- Energia
- Consumo
- Solo Club
- Suporte

Everything else need reside inside this areas, everything well organized inside
your box that can open and down with an button.

2. In minhas usinas when trying to add an new usina: Erro Request failed with
   status code 404

3. In Rateio when i trying to open: pplication error: a client-side exception
   has occurred while loading soloapp.com.br (see the browser console for more
   information).

4. In Economia we need now implementing this project:
   "C:\Users\mateus\OneDrive\Desktop\MSM\Solo Energia - Analisador de Contas
   (APP)" for we have the Analisador de Contas Working with the ai,this is an
   diferetiator, can study, an utilizing the elements necessary to this project
   and input here.

5. We lost something in the generation, analyze the conection with the APIs

6. Lets fineshed all the Controle area with all the things inside this area.



**Date:** 2026-06-24

> **Purpose:** Comparative analysis between current Sprint 4 implementation and
> reference project "Solar Bill Clarity" to inform next sprint planning.

---

## Executive Summary

This study compares **Sprint 4 Controle v1** (current implementation) with
**Solar Bill Clarity** (reference project) to identify key differences in
workflow, architecture, and user experience. The goal is to understand how to
evolve the current manual-onboarding system toward a more automated, AI-powered
approach while preserving the cockpit functionality.

### Key Finding

**Solar Bill Clarity** uses a fundamentally different paradigm:

- **Upload-based workflow** → AI extracts data → detailed analysis
- **File storage** → URLs stored in database
- **No manual data entry** → everything automated

**Sprint 4 Controle v1** uses:

- **Manual data entry** → Solo team types data → cockpit shows results
- **Database storage** → Prisma models
- **Validation gate** → proposals must be approved

---

## 1. Workflow Comparison

### 1.1 Bill Analysis Flow

#### Solar Bill Clarity (Reference)

```
Client uploads bill (PDF/image)
    ↓
Select month/year
    ↓
System converts PDF to image (if needed)
    ↓
Upload to storage (bills bucket)
    ↓
Create analysis record (status: processing)
    ↓
Call edge function: analyze-bill
    ↓
Wait for AI analysis (2 min timeout)
    ↓
Show detailed results page
    ↓
User can:
  - View bill (signed URL)
  - See cost breakdown
  - See solar flow
  - See technical data
  - Ask questions via chat
  - Delete analysis
```

**Key Features:**

- Single-page upload form with drag-and-drop
- PDF password support
- Real-time processing indicator with stepper
- Auto-refresh while processing
- Detailed results with multiple cards:
  - Hero card (score + key numbers)
  - Cost pie chart
  - Cost composition detail
  - Solar energy flow
  - System status
  - AI analysis text
  - Alerts
  - Expansion recommendation
  - Chat assistant

#### Sprint 4 Controle v1 (Current)

```
Solo admin types bill data manually
    ↓
Select plant, UC, month, year
    ↓
Enter: monitoredGenerationKwh, consumptionKwh, tariffPerKwh, totalBillValue
    ↓
Optional: estimatedSavings (server computes if blank)
    ↓
POST to /api/admin/clients/[id]/energy-bills
    ↓
Status set to 'pending_review' (client) or 'confirmed' (admin)
    ↓
Show in client detail tab
    ↓
Cockpit aggregates from confirmed/paid bills
```

**Key Features:**

- Admin-only entry (client entry pending_review)
- Manual data entry form
- Status-based validation (pending_review → confirmed)
- Cockpit shows aggregated savings/payback
- No detailed bill breakdown
- No AI analysis

### 1.2 Property/Plant Management

#### Solar Bill Clarity

```
Dashboard (list of properties)
    ↓
Click property → Property Detail page
    ↓
Shows:
  - System overview cards (power, expected generation, savings, efficiency)
  - Year selector
  - Monthly calendar grid (click to view/add analysis)
  - Analysis history table
    ↓
Add new analysis → BillAnalyze page
```

**Navigation Structure:**

```
/ → Dashboard
/property/new → PropertyForm
/property/:id → PropertyDetail
/property/:id/analyze → BillAnalyze
/property/:id/analysis/:analysisId → AnalysisResult
```

#### Sprint 4 Controle v1

```
Dashboard (list of clients)
    ↓
Click client → Client Detail page
    ↓
Shows:
  - Client info
  - Plants tab
  - Consumer Units tab
  - Bills tab
  - Consumption tab
    ↓
Admin can add generation/bills via tabs
```

**Navigation Structure:**

```
/dashboard → Client list
/controle → Cockpit (payback, savings, lifetime)
/economia → Client bills/consumption
/admin/clients/[id] → Client detail with tabs
```

---

## 2. Architecture & Data Model

### 2.1 Storage Strategy

#### Solar Bill Clarity

**File Storage:**

```typescript
// Storage bucket: "bills"
// Path format: {userId}/{propertyId}/{year}-{month}.{ext}
// Example: user-123/property-456/2026-06.png

// Public URL format:
https://{project}.supabase.co/storage/v1/object/public/bills/user-123/property-456/2026-06.png

// Signed URL (for private access):
const { data } = await supabase.storage
  .from("bills")
  .createSignedUrl(filePath, 3600); // 1 hour expiry
```

**Database Schema:**

```typescript
// bill_analyses table
{
    id: string;
    property_id: string;
    solar_system_id: string;
    reference_month: number;
    reference_year: number;
    bill_file_url: string | null; // Public URL
    monitored_generation_kwh: number;
    expected_generation_kwh: number;
    status: "processing" | "completed" | "error";
    ai_analysis: string | null;
    bill_score: number | null;
    // ... many more fields
}

// bill_raw_data table (child of bill_analyses)
{
    bill_analysis_id: string;
    extracted_data: jsonb; // Raw AI extraction
    // ... detailed breakdown
}
```

#### Sprint 4 Controle v1

**Database-Only:**

```typescript
// EnergyBill table
{
    id: string;
    clientId: string;
    plantId: string;
    consumerUnitId: string;
    competenceDate: Date;
    monitoredGenerationKwh: number;
    consumptionKwh: number | null;
    tariffPerKwh: number | null;
    totalBillValue: number;
    estimatedSavings: number | null;
    paymentStatus: "a_pagar" | "paga" | "vencida" | null;
    status: "draft" | "pending_review" | "confirmed" | "paid" | "rejected";
    // ... other fields
}

// GenerationUnit table
{
    id: string;
    inverterId: string;
    energy: number;
    power: number;
    generationUnitType: "month" | "day";
    source: "manual" | "manual_pending" | "sync";
    providerRecordId: string;
    timestamp: Date;
}
```

**No file storage** — all data is typed manually.

### 2.2 API Structure

#### Solar Bill Clarity

```
POST /property/:id/analyze
  - Upload bill file
  - Convert PDF to image
  - Create analysis record
  - Call edge function
  - Return analysisId

GET /property/:id/analysis/:analysisId
  - Fetch analysis from database
  - Auto-refresh if status = "processing"

DELETE /property/:id/analysis/:analysisId
  - Delete analysis + raw data
```

#### Sprint 4 Controle v1

```
POST /api/admin/clients/[id]/energy-bills
  - Upsert bill from typed JSON
  - Apply savings fallback (A3)
  - Set status based on caller (admin = confirmed, client = pending_review)

POST /api/admin/clients/[id]/generation
  - Create/overwrite monthly generation
  - Force source = 'manual'

GET /api/controle/overview
  - Aggregate bills (exclude pending_review)
  - Return payback, savings, lifetime, per-account status
  - Include pendingValidationCount

PATCH /api/admin/energy-bills/pending-review/[billId]
  - Approve/reject bill
```

---

## 3. User Experience Differences

### 3.1 Form Design

#### Solar Bill Clarity — BillAnalyze Page

**Features:**

- Drag-and-drop file upload zone
- Month/year selectors (dropdowns)
- Monitored generation input (with Sun icon)
- Expected generation info card (if available)
- PDF password field (if protected)
- Stepper indicator (idle → uploading → extracting → completed)
- Loading states with spinner
- Error handling with retry button
- Success toast notification

**UI Components:**

- `Upload` zone with drag events
- `Input` with icons
- `Select` dropdowns
- `Button` with gradient variant
- `Alert` for PDF password
- `AnalysisStepper` component
- `Loader2` spinner

#### Sprint 4 Controle v1 — Admin Bill Entry

**Features:**

- Standard form with labels
- Plant/UC dropdowns (cascading)
- Month/year inputs
- Number inputs for kWh and values
- Optional savings field with helper text
- Status dropdown (a_pagar/paga/vencida)
- Success toast
- Form validation

**UI Components:**

- `Dialog` modal
- `Select` dropdowns
- `Input` fields
- `Button`
- `Label` components
- `Badge` for status

### 3.2 Results Display

#### Solar Bill Clarity — AnalysisResult Page

**Layout:**

```
Header (back button, logo, theme toggle, view bill button, refresh button)

Processing State:
  - Stepper
  - Loading spinner
  - "IA is extracting data..." text

Error State:
  - Alert triangle icon
  - Error message
  - Retry button

Completed State:
  ┌─────────────────────────────────────┐
  │ HERO CARD                          │
  │ - Distributor + UC                  │
  │ - Bill score gauge                  │
  │ - Total paid (R$)                   │
  │ - Minimum possible (R$)             │
  │ - Solar compensated highlight       │
  └─────────────────────────────────────┘

  ┌─────────────────────────────────────┐
  │ COST PIE CHART                      │
  └─────────────────────────────────────┘

  ┌─────────────────────────────────────┐
  │ COST COMPOSITION CARD               │
  └─────────────────────────────────────┘

  ┌─────────────────────────────────────┐
  │ SOLAR ENERGY CARD                  │
  │ - Generated, injected, compensated  │
  │ - Credits balance                   │
  └─────────────────────────────────────┘

  ┌─────────────────────────────────────┐
  │ SYSTEM STATUS CARD                  │
  │ - Expected vs actual generation     │
  │ - System adequacy status            │
  └─────────────────────────────────────┘

  ┌─────────────────────────────────────┐
  │ AI ANALYSIS CARD                    │
  │ - 🤖 header                         │
  │ - Text analysis from AI             │
  └─────────────────────────────────────┘

  ┌─────────────────────────────────────┐
  │ ALERTS SECTION                      │
  │ - Success (✅), Error (❌), Warning  │
  └─────────────────────────────────────┘

  ┌─────────────────────────────────────┐
  │ EXPANSION ACTION CARD               │
  │ - Extra generation needed           │
  │ - Expansion kWp/modules             │
  │ - WhatsApp expansion link           │
  └─────────────────────────────────────┘

  ┌─────────────────────────────────────┐
  │ CHAT CTA CARD                       │
  │ - "Ficou com dúvida?"               │
  │ - "Perguntar sobre esta conta" button│
  └─────────────────────────────────────┘

  ┌─────────────────────────────────────┐
  │ TECHNICAL DATA (collapsible)        │
  │ - General info (holder, UC, type)   │
  │ - B1 Residencial explanation        │
  │ - SCEE Credit Summary               │
  │ - Billing table with glossary       │
  │ - Taxes & efficiency                │
  └─────────────────────────────────────┘

  ┌─────────────────────────────────────┐
  │ BOTTOM ACTIONS                      │
  │ - Back to history                   │
  │ - View bill (signed URL)            │
  │ - Delete analysis (alert dialog)    │
  └─────────────────────────────────────┘

  ┌─────────────────────────────────────┐
  │ BILL CHAT DRAWER (FAB)              │
  │ - Chat interface for Q&A            │
  └─────────────────────────────────────┘
```

#### Sprint 4 Controle v1 — Cockpit

**Layout:**

```
Header (logo, theme toggle)

PENDING VALIDATION BANNER (if any)
  - Alert: "X item(s) aguardando validação da Solo"

ONBOARDING CHECKLIST
  - Card: "Configuração da sua conta"
  - 4 rows with badges:
    * Usina cadastrada
    * Geração informada
    * Unidade consumidora
    * Primeira fatura

CONTROLE CONTENT:
  ┌─────────────────────────────────────┐
  │ PAYBACK GAUGE                       │
  │ - Circular gauge showing payback     │
  └─────────────────────────────────────┘

  ┌─────────────────────────────────────┐
  │ METRIC TILES                        │
  │ - Monthly savings (R$)              │
  │ - Lifetime savings (R$)             │
  │ - Lifetime generation (kWh)         │
  │ - Active consumer units             │
  └─────────────────────────────────────┘

  ┌─────────────────────────────────────┐
  │ LIFETIME STRIP                      │
  │ - Bar chart showing monthly savings │
  └─────────────────────────────────────┘

  ┌─────────────────────────────────────┐
  │ PER-ACCOUNT STATUS                  │
  │ - List of consumer units            │
  │ - Status ring for each              │
  └─────────────────────────────────────┘
```

### 3.3 Navigation & Layout

#### Solar Bill Clarity

**Layout:**

- Top navigation bar (sticky)
  - Logo on left
  - Theme toggle on right
- Single-column content (max-w-2xl)
- No sidebar
- Mobile-responsive

**Navigation:**

- Uses React Router
- Clean URL structure
- Back buttons on all detail pages

#### Sprint 4 Controle v1

**Layout:**

- Top navigation bar (sticky)
  - Logo on left
  - Theme toggle on right
- Sidebar navigation (left)
  - Controle
  - Economia
  - Consumo
  - Clube
  - Suporte
- Main content area (right)
- Mobile-responsive with collapsible sidebar

**Navigation:**

- Uses Next.js App Router
- Protected routes with middleware
- Client-side routing

---

## 4. Key Technical Differences

### 4.1 AI Integration

#### Solar Bill Clarity

**Edge Function:**

```typescript
// Edge function: analyze-bill
// Input: { analysisId, fileUrl, expectedGeneration, monitoredGeneration }
// Output: {
//   success: boolean
//   error?: string
//   billed_consumption_kwh: number
//   injected_energy_kwh: number
//   compensated_energy_kwh: number
//   total_amount: number
//   energy_cost: number
//   availability_cost: number
//   public_lighting_cost: number
//   icms_cost: number
//   pis_cofins_cost: number
//   tariff_flag: string
//   fine_amount: number
//   real_consumption_kwh: number
//   generation_efficiency: number
//   estimated_savings: number
//   ai_analysis: string
//   alerts: string[]
//   bill_score: number
//   // ... more fields
// }
```

**PDF Processing:**

```typescript
// lib/pdfToImages.ts
// Converts PDF to images for OCR
// Supports password-protected PDFs
// Returns array of { base64, width, height }
const images = await pdfToImages(file, {
    maxPages: 1,
    scale: 2,
    password: pdfPassword || undefined,
});
```

#### Sprint 4 Controle v1

**No AI integration** — manual calculations only:

```typescript
// backend/economia/manual-bill-savings.ts
export function computeFallbackSavings(input: {
    estimatedSavings?: number | null;
    consumptionKwh?: number | null;
    tariffPerKwh?: number | null;
    totalBillValue?: number | null;
}): number | null {
    // Deterministic formula
    // No AI, no OCR
}
```

### 4.2 Real-time Updates

#### Solar Bill Clarity

**Auto-refresh while processing:**

```typescript
useEffect(() => {
    if (analysis?.status === "processing") {
        const interval = setInterval(() => {
            fetchAnalysis();
        }, 3000); // Check every 3 seconds

        return () => clearInterval(interval);
    }
}, [analysis?.status]);
```

**Timeout handling:**

```typescript
const controller = new AbortController()
const timeoutId = setTimeout(() => controller.abort(), 120000) // 2 min

try {
  const { data } = await functions.invoke("analyze-bill", {
    body: { ... },
    signal: controller.signal
  })
} catch (err) {
  if (err.name === "AbortError") {
    // Timeout — redirect anyway
    navigate(`/property/${id}/analysis/${analysis.id}`)
  }
}
```

#### Sprint 4 Controle v1

**No real-time updates** — manual refresh required.

### 4.3 File Handling

#### Solar Bill Clarity

**PDF to Image Conversion:**

```typescript
// Converts PDF to PNG for OCR
// Scales images for better accuracy
// Handles password-protected PDFs
const images = await pdfToImages(file, {
    maxPages: 1,
    scale: 2,
    password: pdfPassword || undefined,
});
```

**Storage Upload:**

```typescript
// Upload to Supabase Storage
const { error } = await storage
    .from("bills")
    .upload(fileName, fileToUpload, { upsert: true });

// Get public URL
const { data: urlData } = storage
    .from("bills")
    .getPublicUrl(fileName);
```

#### Sprint 4 Controle v1

**No file handling** — all data is typed.

---

## 5. Feature Comparison Matrix

| Feature                       | Solar Bill Clarity                | Sprint 4 Controle v1             |
| ----------------------------- | --------------------------------- | -------------------------------- |
| **Bill Entry**                | Upload file                       | Manual typing                    |
| **Data Extraction**           | AI OCR                            | Manual entry                     |
| **File Storage**              | Yes (Supabase Storage)            | No                               |
| **AI Analysis**               | Yes (edge function)               | No                               |
| **Detailed Breakdown**        | Yes (cost, solar flow, technical) | No (basic info only)             |
| **Bill Score**                | Yes (0-100 gauge)                 | No                               |
| **Chat Assistant**            | Yes (BillChatDrawer)              | No                               |
| **Auto-refresh**              | Yes (while processing)            | No                               |
| **PDF Password**              | Yes                               | No                               |
| **Cost Composition**          | Yes (pie chart + detail)          | No                               |
| **Solar Flow Visualization**  | Yes (injected/compensated)        | No                               |
| **Technical Data**            | Yes (collapsible)                 | No                               |
| **Alerts**                    | Yes (success/error/warning)       | No                               |
| **Expansion Recommendation**  | Yes (WhatsApp link)               | No                               |
| **Validation Gate**           | No (instant results)              | Yes (pending_review)             |
| **Admin Panel**               | No                                | Yes (client detail tabs)         |
| **Cockpit**                   | No                                | Yes (payback, savings, lifetime) |
| **Onboarding Checklist**      | No                                | Yes                              |
| **Pending Validation Banner** | No                                | Yes                              |
| **Sidebar Navigation**        | No                                | Yes                              |
| **Mobile Responsive**         | Yes                               | Yes                              |
| **Animations**                | Yes (Framer Motion)               | Limited                          |
| **Theme Toggle**              | Yes                               | Yes                              |

---

## 6. User Journey Comparison

### 6.1 Solar Bill Clarity Journey

```
1. Client logs in
2. Sees Dashboard with properties
3. Clicks property → Property Detail
4. Sees monthly calendar grid
5. Clicks month → BillAnalyze page
6. Uploads bill (drag & drop or select)
7. Selects month/year
8. Enters monitored generation (optional)
9. Clicks "Analisar Conta"
10. Sees processing stepper
11. Waits for AI analysis (auto-refreshes)
12. Redirected to AnalysisResult page
13. Views detailed breakdown
14. Can:
    - View bill (signed URL)
    - See cost breakdown
    - See solar flow
    - See technical data
    - Ask questions via chat
    - Delete analysis
15. Clicks back → Property Detail
16. Clicks another month → repeats
```

**Total Steps:** ~16 **Time per analysis:** ~5-10 minutes (including upload +
wait)

### 6.2 Sprint 4 Controle v1 Journey

```
1. Solo admin logs in
2. Goes to admin panel
3. Clicks client → Client Detail
4. Clicks "Adicionar fatura" tab
5. Fills form:
   - Select plant
   - Select UC
   - Select month/year
   - Enter monitoredGenerationKwh
   - Enter consumptionKwh
   - Enter tariffPerKwh
   - Enter totalBillValue
   - (Optional) estimatedSavings
   - Select paymentStatus
6. Clicks "Adicionar fatura"
7. Sees success toast
8. Refreshes page to see new bill
9. Goes to Controle page
10. Views cockpit (payback, savings, lifetime)
11. If bill was pending_review:
    - Goes back to client detail
    - Approves bill
12. Cockpit updates with new data
```

**Total Steps:** ~12 **Time per bill:** ~3-5 minutes (typing)

---

## 7. Recommendations for Sprint 4.1

### 7.1 Hybrid Approach (Recommended)

**Goal:** Combine the best of both worlds:

- **Upload-based workflow** for new bills (AI extraction)
- **Manual entry** for historical data (no files)
- **Cockpit** for high-level metrics
- **Validation gate** for AI-extracted data

**Proposed Architecture:**

```
┌─────────────────────────────────────────────────────────────┐
│                     NEW BILL ANALYSIS FLOW                   │
└─────────────────────────────────────────────────────────────┘

Client uploads bill (PDF/image)
    ↓
Select month/year
    ↓
System converts PDF to image (if needed)
    ↓
Upload to storage (bills bucket)
    ↓
Create analysis record (status: processing)
    ↓
Call edge function: analyze-bill
    ↓
Wait for AI analysis (2 min timeout)
    ↓
Status set to 'pending_review' (AI-extracted data)
    ↓
Show results preview (simplified)
    ↓
Client/Solo reviews AI-extracted data
    ↓
Approve → status = 'confirmed'
    ↓
Cockpit aggregates from confirmed bills
    ↓
Detailed results page (like Solar Bill Clarity)
    ↓
Chat assistant available
```

**Benefits:**

- Fast entry for new bills (AI does the work)
- Manual entry for historical data (no files)
- Validation ensures data quality
- Cockpit shows high-level metrics
- Detailed breakdown for deep dives

### 7.2 Key Changes Needed

#### 1. Add File Upload to Bill Entry

**New Route:**

```
POST /api/client/energy-bills/upload
  - Upload bill file
  - Convert PDF to image
  - Call edge function
  - Return analysisId with status='pending_review'
```

**New UI:**

- File upload zone (drag & drop)
- Month/year selectors
- Monitored generation input
- PDF password support
- Processing stepper

#### 2. Add AI Analysis Edge Function

**Edge Function:**

```typescript
// analyze-bill
// Input: { analysisId, fileUrl, expectedGeneration, monitoredGeneration }
// Output: {
//   billed_consumption_kwh: number
//   injected_energy_kwh: number
//   compensated_energy_kwh: number
//   total_amount: number
//   energy_cost: number
//   availability_cost: number
//   public_lighting_cost: number
//   icms_cost: number
//   pis_cofins_cost: number
//   tariff_flag: string
//   fine_amount: number
//   real_consumption_kwh: number
//   generation_efficiency: number
//   estimated_savings: number
//   ai_analysis: string
//   alerts: string[]
//   bill_score: number
// }
```

#### 3. Add Detailed Results Page

**New Page:**

```
/controle/analysis/:analysisId
  - Hero card (score + key numbers)
  - Cost pie chart
  - Cost composition card
  - Solar energy card
  - System status card
  - AI analysis card
  - Alerts section
  - Technical data (collapsible)
  - Expansion recommendation
  - Chat assistant drawer
```

#### 4. Add Chat Assistant

**New Component:**

```
BillChatDrawer
  - Chat interface
  - Context: analysisId, distributor, month, year
  - AI-powered Q&A about the bill
```

#### 5. Add Bill Score Gauge

**New Component:**

```
BillScoreGauge
  - Circular gauge (0-100)
  - Shows bill quality score
  - Color-coded (green/yellow/red)
```

#### 6. Add Cost Breakdown Components

**New Components:**

```
CostPieChart
  - Pie chart showing cost composition
  - Availability, public lighting, uncompensated, ICMS, PIS/COFINS, extra charges

CostCompositionCard
  - Detailed breakdown of each cost component
  - With explanations

SolarEnergyCard
  - Shows generated, injected, compensated energy
  - Credits balance

SystemStatusCard
  - Expected vs actual generation
  - System adequacy status
```

#### 7. Add Technical Data Section

**New Component:**

```
TechnicalDataCollapsible
  - General info (holder, UC, type, class, tariff flag)
  - B1 Residencial explanation
  - SCEE Credit Summary
  - Billing table with glossary
  - Taxes & efficiency
```

#### 8. Add Expansion Recommendation

**New Component:**

```
ExpansionActionCard
  - Extra generation needed
  - Expansion kWp
  - Expansion modules
  - WhatsApp expansion link
```

#### 9. Add Chat Assistant

**New Component:**

```
BillChatDrawer
  - Chat interface
  - Context: analysisId, distributor, month, year
  - AI-powered Q&A about the bill
```

### 7.3 Preserve Existing Features

**Keep from Sprint 4:**

- Manual generation entry (admin + client)
- Manual bill entry (admin)
- Cockpit with payback, savings, lifetime
- Onboarding checklist
- Pending validation banner
- Admin approval workflow
- Sidebar navigation
- Theme toggle

**Why:**

- Historical data needs manual entry
- Cockpit is valuable for high-level metrics
- Validation gate ensures data quality
- Admin panel is useful for Solo team

---

## 8. Implementation Phases

### Phase 1: Backend Foundation (Week 1)

**Tasks:**

1. Add file upload route (`POST /api/client/energy-bills/upload`)
2. Add PDF to image conversion utility
3. Add edge function `analyze-bill`
4. Add AI analysis schema to database
5. Add detailed results API (`GET /api/controle/analysis/:analysisId`)
6. Add bill score calculation logic

**Deliverables:**

- Edge function deployed
- Upload route working
- Analysis API returning detailed data

### Phase 2: Client-Facing Upload Flow (Week 2)

**Tasks:**

1. Create BillAnalyze page (upload form)
2. Add file upload zone with drag & drop
3. Add month/year selectors
4. Add monitored generation input
5. Add PDF password support
6. Add processing stepper
7. Add auto-refresh while processing
8. Add timeout handling

**Deliverables:**

- Client can upload bill
- AI analysis runs
- Results returned with status='pending_review'

### Phase 3: Detailed Results Page (Week 3)

**Tasks:**

1. Create AnalysisResult page
2. Add hero card (score + key numbers)
3. Add cost pie chart
4. Add cost composition card
5. Add solar energy card
6. Add system status card
7. Add AI analysis card
8. Add alerts section
9. Add technical data (collapsible)
10. Add expansion recommendation
11. Add chat assistant drawer

**Deliverables:**

- Detailed results page
- All cards rendering correctly
- Chat assistant working

### Phase 4: Admin Review & Validation (Week 4)

**Tasks:**

1. Add AI-extracted data review to admin panel
2. Add approve/reject actions
3. Update cockpit to aggregate confirmed AI-extracted bills
4. Add pending validation banner for AI-extracted data
5. Add onboarding checklist for AI-extracted bills

**Deliverables:**

- Admin can review AI-extracted data
- Validation workflow working
- Cockpit shows correct aggregates

### Phase 5: Polish & Testing (Week 5)

**Tasks:**

1. Add loading states
2. Add error handling
3. Add success toasts
4. Add responsive design
5. Add animations (Framer Motion)
6. Add accessibility
7. Add unit tests
8. Add integration tests
9. User acceptance testing

**Deliverables:**

- All features working
- Tests passing
- User acceptance

---

## 9. Risks & Mitigations

### Risk 1: AI Accuracy

**Risk:** AI may extract incorrect data from bills.

**Mitigation:**

- Validation gate (pending_review) before data is used
- Admin can correct AI-extracted data
- Manual entry still available for historical data
- Collect feedback on AI accuracy

### Risk 2: Edge Function Latency

**Risk:** AI analysis may take longer than 2 minutes.

**Mitigation:**

- Timeout handling with auto-redirect
- Progress indicator
- Manual entry fallback
- Optimize AI model

### Risk 3: PDF Complexity

**Risk:** Some PDFs may be difficult to parse.

**Mitigation:**

- Support for password-protected PDFs
- Manual entry fallback
- Error handling with clear messages
- User can upload clearer images

### Risk 4: Cost of AI

**Risk:** AI edge function may be expensive.

**Mitigation:**

- Use free tier of edge functions
- Cache results
- Limit to one analysis per bill
- Monitor costs

### Risk 5: User Adoption

**Risk:** Users may prefer manual entry over upload.

**Mitigation:**

- Provide both options (upload + manual)
- Make upload flow simple
- Show benefits of AI (faster, more accurate)
- Collect user feedback

---

## 10. Success Metrics

### Technical Metrics

- **Upload success rate:** >95%
- **AI accuracy:** >90% (correct extraction)
- **Processing time:** <2 minutes
- **Error rate:** <5%
- **Test coverage:** >80%

### User Metrics

- **Upload adoption:** >70% of new bills uploaded
- **Manual entry fallback:** <30% of users use manual entry
- **Validation approval rate:** >95% of AI-extracted data approved
- **User satisfaction:** >4/5 stars

### Business Metrics

- **Time saved per bill:** >50% (AI vs manual)
- **Data quality:** >90% of bills have correct data
- **Cockpit accuracy:** 100% (matches real bills)
- **Client satisfaction:** >4/5 stars

---

## 11. Conclusion

### Key Takeaways

1. **Solar Bill Clarity** uses an AI-powered, upload-based workflow that is fast
   and accurate.
2. **Sprint 4 Controle v1** uses a manual, validation-gated workflow that is
   slower but gives full control.
3. **Hybrid approach** is recommended: upload for new bills, manual for
   historical data.
4. **Detailed results page** from Solar Bill Clarity adds significant value.
5. **Chat assistant** improves user experience significantly.
6. **Validation gate** ensures data quality.

### Next Steps

1. **Review this study** with the team.
2. **Decide on hybrid approach** or full AI migration.
3. **Create detailed sprint plan** for Sprint 4.1.
4. **Set up edge function infrastructure**.
5. **Start Phase 1 implementation**.

---

## 12. Appendix

### A. File Structure Comparison

#### Solar Bill Clarity

```
src/
├── pages/
│   ├── BillAnalyze.tsx          # Upload form
│   ├── AnalysisResult.tsx       # Detailed results
│   ├── Dashboard.tsx            # Property list
│   ├── PropertyDetail.tsx       # Property details
│   ├── PropertyForm.tsx         # Create property
│   └── Auth.tsx                 # Login
├── components/
│   ├── clarifier/
│   │   ├── BillScoreGauge.tsx
│   │   ├── CostPieChart.tsx
│   │   ├── CostCompositionCard.tsx
│   │   ├── SolarEnergyCard.tsx
│   │   ├── SystemStatusCard.tsx
│   │   └── ActionCard.tsx
│   ├── chat/
│   │   ├── BillChatDrawer.tsx
│   │   ├── ChatInput.tsx
│   │   └── ChatMessage.tsx
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   └── ...
│   └── ...
├── lib/
│   └── pdfToImages.ts           # PDF conversion
└── integrations/
    └── supabase/
        └── clientUntyped.ts     # Supabase client
```

#### Sprint 4 Controle v1

```
src/
├── app/
│   ├── (private)/
│   │   ├── @user/
│   │   │   ├── controle/
│   │   │   │   └── page.tsx          # Cockpit
│   │   │   ├── economia/
│   │   │   │   └── page.tsx          # Bills/Consumption
│   │   │   └── plants/
│   │   │       └── page.tsx          # Plant list
│   │   └── admin/
│   │       └── clients/
│   │           └── [id]/
│   │               └── page.tsx      # Client detail
│   └── api/
│       ├── controle/
│       │   └── overview/
│       │       └── route.ts          # Cockpit API
│       └── admin/
│           └── clients/
│               └── [id]/
│                   ├── energy-bills/
│                   │   └── route.ts  # Bill API
│                   └── generation/
│                       └── route.ts  # Generation API
├── frontend/
│   ├── controle/
│   │   └── components/
│   │       ├── onboarding-checklist.tsx
│   │       └── ...
│   └── admin/
│       └── components/
│           ├── add-bill-dialog.tsx
│           ├── add-generation-dialog.tsx
│           └── client-details.tsx
└── backend/
    ├── economia/
    │   └── manual-bill-savings.ts
    └── generation/
        └── manual-generation.service.ts
```

### B. Database Schema Comparison

#### Solar Bill Clarity

```sql
-- Properties table
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  average_consumption NUMERIC,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Solar Systems table
CREATE TABLE solar_systems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  total_power_kw NUMERIC NOT NULL,
  expected_monthly_generation NUMERIC NOT NULL,
  number_of_modules INTEGER NOT NULL,
  module_power_watts INTEGER NOT NULL,
  module_brand TEXT,
  inverter_brand TEXT,
  installation_year INTEGER,
  system_cost NUMERIC,
  last_maintenance_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Bill Analyses table
CREATE TABLE bill_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  solar_system_id UUID REFERENCES solar_systems(id) ON DELETE SET NULL,
  reference_month INTEGER NOT NULL,
  reference_year INTEGER NOT NULL,
  bill_file_url TEXT,
  monitored_generation_kwh NUMERIC NOT NULL,
  expected_generation_kwh NUMERIC,
  status TEXT DEFAULT 'processing',
  ai_analysis TEXT,
  bill_score NUMERIC,
  billed_consumption_kwh NUMERIC,
  injected_energy_kwh NUMERIC,
  compensated_energy_kwh NUMERIC,
  total_amount NUMERIC,
  energy_cost NUMERIC,
  availability_cost NUMERIC,
  public_lighting_cost NUMERIC,
  icms_cost NUMERIC,
  pis_cofins_cost NUMERIC,
  tariff_flag TEXT,
  fine_amount NUMERIC,
  real_consumption_kwh NUMERIC,
  generation_efficiency NUMERIC,
  estimated_savings NUMERIC,
  alerts JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Bill Raw Data table (child of bill_analyses)
CREATE TABLE bill_raw_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bill_analysis_id UUID REFERENCES bill_analyses(id) ON DELETE CASCADE,
  extracted_data JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Sprint 4 Controle v1

```sql
-- Clients table
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  cpf TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Plants table
CREATE TABLE plants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  state TEXT,
  validation_status TEXT DEFAULT 'pending_review',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Consumer Units table
CREATE TABLE consumer_units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plant_id UUID REFERENCES plants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT,
  validation_status TEXT DEFAULT 'pending_review',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Energy Bills table
CREATE TABLE energy_bills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  plant_id UUID REFERENCES plants(id) ON DELETE CASCADE,
  consumer_unit_id UUID REFERENCES consumer_units(id) ON DELETE SET NULL,
  competence_date TIMESTAMP NOT NULL,
  monitored_generation_kwh NUMERIC NOT NULL,
  consumption_kwh NUMERIC,
  tariff_per_kwh NUMERIC,
  total_bill_value NUMERIC NOT NULL,
  estimated_savings NUMERIC,
  payment_status TEXT,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Generation Units table
CREATE TABLE generation_units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inverter_id UUID REFERENCES inverters(id) ON DELETE CASCADE,
  energy NUMERIC NOT NULL,
  power NUMERIC,
  generation_unit_type TEXT NOT NULL,
  source TEXT NOT NULL,
  provider_record_id TEXT NOT NULL,
  timestamp TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Inverters table
CREATE TABLE inverters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plant_id UUID REFERENCES plants(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  provider_id TEXT NOT NULL,
  name TEXT NOT NULL,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  sync_enabled BOOLEAN DEFAULT false,
  provider_status TEXT,
  deleted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### C. Dependencies Comparison

#### Solar Bill Clarity

```json
{
    "dependencies": {
        "react": "^18.2.0",
        "react-router-dom": "^6.20.0",
        "@tanstack/react-query": "^5.14.0",
        "framer-motion": "^10.16.0",
        "lucide-react": "^0.294.0",
        "supabase": "^2.38.0",
        "zod": "^3.22.0"
    }
}
```

#### Sprint 4 Controle v1

```json
{
    "dependencies": {
        "next": "^14.0.0",
        "react": "^18.2.0",
        "@tanstack/react-query": "^5.14.0",
        "framer-motion": "^10.16.0",
        "lucide-react": "^0.294.0",
        "@prisma/client": "^5.7.0",
        "zod": "^3.22.0",
        "sonner": "^1.3.0"
    }
}
```

---

**Document Version:** 1.0 **Last Updated:** 2026-06-24 **Next Review:** After
Sprint 4.1 planning meeting

---

## 13. Deepseek Recommendations — Per-Item Backlog Analysis

> **Flag:** `Deepseek`
> **Date:** 2026-06-24
> **Method:** Each item from `todo.md` (backlog/deferred scope) is evaluated against the Sprint 4.1 Comparative Study findings, project maturity, and launch strategy. Items are classified into tiers.

**Tier Definitions:**
- **🚀 Ship Now (Sprint 4.1)** — Implement in the next sprint; unblocks launch value
- **⏳ Post-Launch (Sprint 4.2+)** — Build after first real clients are onboarded; needs validation first
- **🧊 Icebox** — Keep in backlog; do not schedule until product-market fit is confirmed
- **❓ Needs Decision** — Requires a product/business decision before any code can be written
- **🔮 Distant Future** — Vision-level; revisit at 12-24 month horizon

---

### 13.1 🎨 Brand / Navigation / IA

| # | Item | Tier | Recommendation |
|---|------|------|---------------|
| 1 | **Navigation rebrand to 5 sections** (Controle/Energia/Consumo/Clube Solo/Suporte) | ⏳ Post-Launch | The study shows Solar Bill Clarity uses a single-column layout with no sidebar (Section 3.3). Our sidebar works for the admin-heavy workflow. Rebranching navigation touches every screen (XL effort). **Recommendation:** Do this only after launching to real clients and validating the information architecture. Currently Controle + Economia + Consumo covers the core value — rename later when you add Clube Solo. |
| 2 | **Dark "McLaren/Tesla" design-token pass** | ⏳ Post-Launch | The study shows our current UI works (theme toggle exists, Section 3.3). Solar Bill Clarity has no special dark theme. **Recommendation:** Cosmetic only. Ship first, polish later. If you do this, scope it to cockpit + bill detail only (not global). |
| 3 | **Animated Solo logo** (pulse on live data) | 🧊 Icebox | No comparative value in study (neither project has this). Pure delight. **Recommendation:** Zero priority. Revisit when live telemetry exists and the app has daily-active users. |

### 13.2 💼 Controle → "Carteira de Energia" (cockpit redesign)

| # | Item | Tier | Recommendation |
|---|------|------|---------------|
| 4 | **Energy Portfolio card** (assets/liabilities/cashflow/equity/health-score) | 🧊 Icebox | The study's Solar Bill Clarity comparison (Section 5) shows no equivalent — the reference project focuses on bill analysis, not portfolio abstraction. **Recommendation:** Innovative idea but unvalidated. No benchmark shows users need this. Only build after 10+ real clients confirm they want "financial portfolio" treatment. |
| 5 | **Portfolio Wheel** (circular viz) | 🧊 Icebox | Derivative of item 4. **Recommendation:** Don't build until Energy Portfolio itself is validated. |
| 6 | **Interactive economy timeline** (month-by-month savings vs "without solar") | ⏳ Post-Launch | Solar Bill Clarity shows individual analysis results but no ongoing savings timeline (Section 3.2). This is a differentiated feature. **Recommendation:** Build a simpler version first (the current Lifetime Strip in cockpit is the foundation — just add the "without solar" reference line). Scope as M, not L. |
| 7 | **Activity feed** (bank-statement-style) | 🧊 Icebox | No equivalent in Solar Bill Clarity. The cockpit already shows per-account status (Section 3.2). **Recommendation:** Pure scope-creep risk. Clients don't expect this without a banking context. Icebox. |
| 8 | **"Modo Apresentação" / share screen** | ⏳ Post-Launch | The study's expansion recommendation (Section 7.2, Item 8) includes WhatsApp sharing. Solar Bill Clarity has expansion links. **Recommendation:** Valuable for B2C2B referral flywheel. Build a minimal version (static page, no real-time data) after first clients are live. |
| 9 | **"Modo Investidor" toggle + Terminal de Energia** | 🧊 Icebox | The study shows our current cockpit (payback gauge + metric tiles + lifetime strip) already serves the core needs. Solar Bill Clarity has no "advanced mode." **Recommendation:** Premature. Real-time inverter data (item 10) is a prerequisite. Build that first, then decide if a toggle is needed. |

### 13.3 ⚡ Generation / Energia

| # | Item | Tier | Recommendation |
|---|------|------|---------------|
| 10 | **Real-time live generation** (WebSocket/SSE) | ⏳ Post-Launch | The study's Section 4.2 shows Solar Bill Clarity doesn't have real-time — it uses 3s polling for analysis status only. Our current manual generation entry works for monthly billing. **Recommendation:** Wait until you have real inverter API integration (Sprint 3 had encryption, so the foundation exists). Start with SSE (simpler, no WebSocket infra). |
| 11 | **Inverter status rings from real sync health** | ⏳ Post-Launch | Prerequisite: inverter API integration working. **Recommendation:** Build alongside item 10. Use green/yellow/red based on last-sync timestamp. |
| 12 | **Unified "virtual plant" view** (aggregate multi-inverter) | ⏳ Post-Launch | The study's Sprint 4 model already supports per-plant structure. Airton's 2-plant case is real. **Recommendation:** Build a simple aggregation layer at the cockpit level before client onboarding. Don't create a whole new view. |

### 13.4 🔄 Consumo / Distribution / Rateio

| # | Item | Tier | Recommendation |
|---|------|------|---------------|
| 13 | **Rateio automation bot ("Bot Enel")** | 🔮 Distant Future | The study shows no equivalent in Solar Bill Clarity — it's a consumer tool. Rateio automation is an admin/ops feature. **Recommendation:** Massive scope (XL). Depends on distributor API partnership. Don't touch until you have 50+ active clients and rateio is a bottleneck. |
| 14 | **Distributor API integration** (Enel, Cemig, etc.) | 🔮 Distant Future | The study's hybrid approach (Section 7.1) assumes manual entry for now. **Recommendation:** Building 7+ distributor integrations is a company-level effort. Revisit when you have a partnership agreement with at least one distributor. |
| 15 | **Bill OCR / auto-analysis at scale** (BullMQ + Redis) | 🧊 Icebox → ⏳ Post-Launch | **Nuanced.** The study's entire Phase 1-2 is about AI upload (Section 8). BUT: the study recommends a simpler edge function (no queue), not BullMQ+Redis. **Recommendation:** Build the simple version first (edge function + direct API, as in Phase 1-2). Only add BullMQ/Redis if you process 100+ bills/day. The study's edge function approach is correct for v1. |

### 13.5 💳 Payments

| # | Item | Tier | Recommendation |
|---|------|------|---------------|
| 16 | **PIX one-click pay** (copy code + Solo Coins path) | ⏳ Post-Launch | The study's Sprint 4 already has `paymentStatus` (a_pagar/paga/vencida). PIX is the natural next step. **Recommendation:** Build after first client onboarding. Start with "copy PIX code" (low effort, high value). Coins integration is a separate M item. |
| 17 | **Credit-card payment** via gateway | 🔮 Distant Future | Requires gateway partnership, PCI compliance, recurring billing model. **Recommendation:** Don't touch until pricing model is decided and you have paying clients asking for credit cards. |

### 13.6 🏆 Clube Solo / Gamification / Growth

| # | Item | Tier | Recommendation |
|---|------|------|---------------|
| 18 | **Solo Coins value model + tiered referral** | 🧊 Icebox | No equivalent in Solar Bill Clarity — pure innovation. **Recommendation:** High risk. You need to define real R$ value (accounting impact) before writing code. Requires pricing model decision first (item 24). |
| 19 | **"Momentos" / notification engine** | ❓ Needs Decision | The study's chat assistant (Section 7.2, Item 9) overlaps with this — both are user-engagement features. **Recommendation:** Decide: AI chat or push notifications? Not both. Start with a simple notification (Conta Chegou, Vencimento) via email, not in-app. No "personality" until you have DAU > 100. |
| 20 | **Weekly recap (Spotify Wrapped-style)** | 🧊 Icebox | Pure delight, zero utility. **Recommendation:** Build for a marketing campaign after you have 6+ months of client data. Not now. |
| 21 | **Goals & challenges** | 🧊 Icebox | Gamification before product-market fit is premature optimization. **Recommendation:** Icebox until Clube Solo has a real value proposition. |

### 13.7 🛠️ Admin "Operations Center"

| # | Item | Tier | Recommendation |
|---|------|------|---------------|
| 22 | **Solo Operations Center dashboard** | ⏳ Post-Launch | The study shows our admin panel works but lacks consolidated alerts. **Recommendation:** Build after 5+ clients are onboarded and you feel the pain of switching between tabs. Start simple: a page with the pending-validation count + recent activity. |
| 23 | **"Modo Suporte"** (single-screen full client context) | ⏳ Post-Launch | Dependent on item 22. **Recommendation:** Build as a drill-down from Operations Center. Not standalone. |
| 24 | **Automated reports (GDASH-style)** | ⏳ Post-Launch | GDASH benchmarking (team memory) flags this as table-stakes for integrators. **Recommendation:** This is higher priority than most items here. Integrators expect monthly reports. Build a minimal PDF generation (Puppeteer/PDF-lib) after first client onboarding, not a full email/WhatsApp pipeline. |

### 13.8 🧱 Platform / Infra

| # | Item | Tier | Recommendation |
|---|------|------|---------------|
| 25 | **Feature-flag system** | ❓ Needs Decision | The study shows no feature flags in Solar Bill Clarity. **Recommendation:** Do you have multiple environments? Are you doing beta rollouts? If not, you don't need feature flags. Use environment variables instead. Only build when you need per-tenant feature gating (multi-tenant). |
| 26 | **PWA + offline** | 🧊 Icebox | The study's Phase 5 (Polish) doesn't include PWA. **Recommendation:** Massive effort for uncertain mobile/web distribution benefit. Revisit when PWA vs native decision is made (item 27). |
| 27 | **Performance SLAs** (SSR + streaming, prefetch) | ⏳ Post-Launch | **Recommendation:** Build incrementally. Start with image optimization + route prefetching (low effort). Don't aim for "under 1s" until you measure and find it's slow. Premature optimization. |
| 28 | **Multi-tenant / white-label foundation** | 🔮 Distant Future | Team memory explicitly says: "Do NOT build full multi-tenant now. Prepare the soil, plant later." **Recommendation:** Follow the existing directive. Add optional `tenantId` to schema when you refactor, but don't build middleware/queries until second paying customer exists. |

### 13.9 ❓ Open Product Questions

| # | Item | Tier | Recommendation |
|---|------|------|---------------|
| 29 | **Pricing model** | ❓ Needs Decision | **Recommendation:** This is the #1 blocker for half the backlog (Coins, payments, multi-tenant). Decide before Sprint 4.2. Talk to 3 integrators. Test: SaaS/month per client vs per-seat vs freemium. |
| 30 | **First distributor to integrate** | ❓ Needs Decision | **Recommendation:** Enel is assumed but unconfirmed. Check: do your first clients use Enel? If not, integrate the right distributor. |
| 31 | **Solo Coins real R$ value** | ❓ Needs Decision | Blocked by pricing model (item 29). **Recommendation:** Don't decide this in isolation. It's an accounting/compliance question. |
| 32 | **PWA vs native for v2** | ❓ Needs Decision | **Recommendation:** Not urgent. Ship the web app first. If clients ask for mobile app, survey them: "would you use a website (PWA) or install from App Store?" before deciding. |
| 33 | **WebSocket vs SSE for live data** | ❓ Needs Decision | **Recommendation:** SSE wins for this use case. Simpler (HTTP, no upgrade), auto-reconnect, works through proxies. WebSocket only if you need bidirectional (you don't — generation data is server-to-client). The decision matters when item 10 is unblocked. |

---

### 13.10 Deepseek — Prioritized Sprint Roadmap (Post-Launch)

**Based on the comparative study and backlog analysis, here is the recommended execution order:**

```
🚀 NOW — Merge Sprint 3 + Sprint 4 → main, deploy to VPS
   |
   v
👥 ONBOARD 1-3 REAL CLIENTS (2-week validation)
   |
   v
📋 Sprint 4.1 — AI Upload (the study's Phase 1-3)
   ├── POST /api/client/energy-bills/upload
   ├── Edge function: analyze-bill
   ├── BillAnalyze page (upload form)
   ├── Simplified results page
   └── Status: pending_review → admin approves
   |
   v
📋 Sprint 4.2 — Launch Pad
   ├── #12 Virtual plant aggregation (low effort, high value)
   ├── #16 PIX one-click (copy code)
   ├── #24 Automated reports (PDF)
   ├── #22 Operations Center v1 (pending count + activity)
   └── #10 Live generation via SSE (if inverter API ready)
   |
   v
📋 Sprint 4.3 — Engagement
   ├── #6 Economy timeline (add "without solar" line)
   ├── #8 Modo Apresentação (static share page)
   ├── #11 Inverter status rings
   └── #23 Modo Suporte (drill-down from Ops Center)
   |
   v
🧊 Everything else → Icebox (revisit at 50+ clients)
```

**Key Principle from the Study (Section 7.1):**
> "Hybrid approach: upload for new bills, manual for historical data. Preserve existing cockpit and admin features."

This applies to the **entire backlog**: preserve what works (cockpit, manual entry, admin panel), add incrementally, validate with real clients before each major investment.

---

*Recommendations generated by Deepseek analysis of `sprint_4.1_controle_v1.md` (Comparative Study) × `todo.md` (Backlog). Each item cross-referenced against the study's findings, risk assessment, and launch strategy.*
