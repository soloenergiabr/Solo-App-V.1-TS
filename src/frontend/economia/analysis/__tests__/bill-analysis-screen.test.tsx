// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import { BillAnalysisScreen } from '../bill-analysis-screen'

// Mock framer-motion (used by clarifier cards)
vi.mock('framer-motion', () => ({
  motion: { div: 'div', path: 'path' },
}))

// Mock recharts (used by CostPieChart)
vi.mock('recharts', () => ({
  PieChart: 'div',
  Pie: 'div',
  Cell: 'div',
  ResponsiveContainer: ({ children }: any) => children,
  Tooltip: () => null,
}))

// Mock Sheet (used by BillChatDrawer)
vi.mock('@/components/ui/sheet', () => ({
  Sheet: 'div',
  SheetContent: 'div',
  SheetHeader: 'div',
  SheetTitle: 'div',
  SheetTrigger: 'div',
}))

// Mock ScrollArea
vi.mock('@/components/ui/scroll-area', () => ({
  ScrollArea: 'div',
}))

// Mock Textarea
vi.mock('@/components/ui/textarea', () => ({
  Textarea: 'textarea',
}))

// Mock telemetry-kit (CopyPixButton, formatBRL)
vi.mock('@/frontend/telemetry-kit', () => ({
  CopyPixButton: 'button',
  formatBRL: (v: number) => String(v),
  formatKwh: (v: number) => `${v} kWh`,
  formatKw: (v: number) => `${v} kWp`,
}))

// Mock next/link
vi.mock('next/link', () => ({
  default: 'a',
}))

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({}),
  usePathname: () => '/economia/bill-1',
}))

// Mock page-layout (uses usePathname)
vi.mock('@/components/ui/page-layout', () => ({
  PageLayout: 'div',
  PageHeader: 'div',
}))

// Mock bill-status
vi.mock('@/frontend/economia/lib/bill-status', () => ({
  resolveBillStatus: () => 'a_pagar',
  statusToBadge: () => ({ label: 'A Pagar', tone: 'warning' }),
}))

// Mock EducationalFaq so it does not call useAuthenticatedApi
vi.mock('@/frontend/education/educational-faq', () => ({
  EducationalFaq: () => null,
}))

// Mock lucide icons (all icons the component tree uses)
vi.mock('lucide-react', () => {
  const icons = [
    'FileText','ChevronLeft','ChevronDown','CheckCircle2','Loader2','MessageCircle',
    'ArrowRight','Bot','User','Send','Sun','ArrowDown','Home','Zap','Info',
    'Package','CreditCard','Plus','X','TrendingUp','AlertTriangle','XCircle','Copy',
  ]
  const result: Record<string, string> = {}
  for (const name of icons) result[name] = 'div'
  return result
})

function makeBillDetail(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    id: 'bill-1',
    consumerUnitId: 'unit-1',
    consumerUnitName: 'Minha Casa',
    referenceMonth: 5,
    referenceYear: 2026,
    amountDue: 350,
    totalAmount: 350,
    dueDate: '2026-06-15T00:00:00.000Z',
    paidAt: null,
    paymentStatus: 'a_pagar',
    status: 'draft',
    pixCode: null,
    barcode: null,
    billFileUrl: null,
    estimatedSavings: 85,
    aiAnalysis: 'Análise detalhada da fatura.',
    aiExplanations: null,
    alerts: null,
    aiRecommendations: null,
    billingItems: null,
    creditSummary: null,
    billScore: 75,
    titularName: 'João',
    distributor: 'Enel',
    availabilityCost: 50,
    publicLightingCost: 30,
    monitoredGenerationKwh: 400,
    injectedEnergyKwh: 300,
    compensatedEnergyKwh: 280,
    currentCreditsKwh: 50,
    previousCreditsKwh: 20,
    billedConsumptionKwh: 500,
    expectedGenerationKwh: 450,
    generationEfficiency: 0.89,
    icmsCost: 40,
    pisCofinsCost: 15,
    tariffFlag: 'Verde',
    fineAmount: null,
    otherCharges: null,
    connectionType: 'trifasico',
    consumerClass: 'Residencial',
    tariffPeriod: 'Posto',
    readingPeriodFrom: '2026-05-01T00:00:00.000Z',
    readingPeriodTo: '2026-05-31T00:00:00.000Z',
    extraCharges: [],
    ...overrides,
  }
}

describe('BillAnalysisScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders loading state without crashing', () => {
    const { container } = render(<BillAnalysisScreen bill={null} isLoading={true} error={null} />)
    expect(container).toBeDefined()
  })

  it('renders error state with alert', () => {
    render(<BillAnalysisScreen bill={null} isLoading={false} error="Fatura não encontrada" />)
    expect(screen.getByText('Erro ao carregar fatura')).toBeDefined()
    expect(screen.getByText('Fatura não encontrada')).toBeDefined()
  })

  it('renders empty state when bill is null', () => {
    render(<BillAnalysisScreen bill={null} isLoading={false} error={null} />)
    expect(screen.getByText(/não encontrada/)).toBeDefined()
  })

  it('renders AI analysis without clarifier dashboard when clarifier data is missing', () => {
    const bill = makeBillDetail({
      availabilityCost: null,
      publicLightingCost: null,
      monitoredGenerationKwh: null,
      totalAmount: null,
    })
    render(<BillAnalysisScreen bill={bill as any} isLoading={false} error={null} />)
    expect(screen.getByText('Análise detalhada da fatura.')).toBeDefined()
  })

  it('renders "em andamento" when neither AI nor clarifier data is available', () => {
    const bill = makeBillDetail({
      aiAnalysis: null,
      availabilityCost: null,
      publicLightingCost: null,
      monitoredGenerationKwh: null,
      totalAmount: null,
    })
    render(<BillAnalysisScreen bill={bill as any} isLoading={false} error={null} />)
    expect(screen.getByText('Análise em andamento')).toBeDefined()
  })

  it('renders full clarifier dashboard when data is available (reachability guard)', () => {
    render(<BillAnalysisScreen bill={makeBillDetail() as any} isLoading={false} error={null} />)

    // Clarifier dashboard renders
    expect(screen.getByText('Energia solar este mês')).toBeDefined()
    expect(screen.getByText('Composição de custos')).toBeDefined()

    // computeClarifier-derived value: "Mínimo possível" header is present
    expect(screen.getByText('Mínimo possível')).toBeDefined()

    // AI analysis renders alongside
    expect(screen.getByText('Análise detalhada da fatura.')).toBeDefined()
  })

  it('renders distributor and reference month', () => {
    render(<BillAnalysisScreen bill={makeBillDetail() as any} isLoading={false} error={null} />)
    expect(screen.getByText('Enel')).toBeDefined()
    expect(screen.getByText(/Maio/)).toBeDefined()
  })

  it('renders payment section when pixCode is available', () => {
    const bill = makeBillDetail({ pixCode: '0002010102122611...' })
    render(<BillAnalysisScreen bill={bill as any} isLoading={false} error={null} />)
    expect(screen.getByText('Pagamento')).toBeDefined()
    // use getAllByText for "Confirmar Pagamento" since it appears as both h3 and button
    const confirmEls = screen.getAllByText('Confirmar Pagamento')
    expect(confirmEls.length).toBeGreaterThanOrEqual(1)
  })

  it('renders PDF link when billFileUrl is available', () => {
    const bill = makeBillDetail({ billFileUrl: 'https://example.com/bill.pdf' })
    render(<BillAnalysisScreen bill={bill as any} isLoading={false} error={null} />)
    expect(screen.getByText('Ver fatura em PDF')).toBeDefined()
  })

  it('renders score ring and does not crash', () => {
    render(<BillAnalysisScreen bill={makeBillDetail({ billScore: 85 }) as any} isLoading={false} error={null} />)
    // The dashboard should render without crashing — score ring is mounted
    expect(screen.getByText('Energia solar este mês')).toBeDefined()
  })

  it('renders system status when generation data is available', () => {
    render(<BillAnalysisScreen bill={makeBillDetail() as any} isLoading={false} error={null} />)
    expect(screen.getByText('Sistema operando bem')).toBeDefined()
  })

  it('renders "geração insuficientes" when no generation data', () => {
    const bill = makeBillDetail({ monitoredGenerationKwh: null })
    render(<BillAnalysisScreen bill={bill as any} isLoading={false} error={null} />)
    expect(screen.getByText(/Dados de geração insuficientes/)).toBeDefined()
  })
})
