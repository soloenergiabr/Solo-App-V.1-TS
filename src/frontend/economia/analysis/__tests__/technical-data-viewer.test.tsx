// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import { TechnicalDataViewer } from '../technical-data-viewer'

// Mock lucide-react icons used by TechnicalDataViewer
vi.mock('lucide-react', () => ({
  ChevronDown: 'div',
  Info: 'div',
}))

// Mock telemetry-kit
vi.mock('@/frontend/telemetry-kit', () => ({
  formatBRL: (v: number) => String(v),
}))

// <dl> children with <> fragments: add data-testid on each dd for querying
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
    aiAnalysis: null,
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
    generationEfficiency: null,
    icmsCost: null,
    pisCofinsCost: null,
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

describe('TechnicalDataViewer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders collapsible trigger title', async () => {
    render(<TechnicalDataViewer bill={makeBillDetail() as any} />)
    expect(screen.getByText('Dados Técnicos da Fatura')).toBeDefined()
  }, 15000)

  it('starts collapsed — general info is not visible', async () => {
    render(<TechnicalDataViewer bill={makeBillDetail() as any} />)
    // General info content should not be visible when collapsed
    expect(screen.queryByText('Informações Gerais')).toBeNull()
    expect(screen.queryByText('Distribuidora')).toBeNull()
  })

  it('renders general info section when expanded with full data', async () => {
    render(<TechnicalDataViewer bill={makeBillDetail() as any} />)

    // Click to expand
    fireEvent.click(screen.getByText('Dados Técnicos da Fatura'))

    expect(screen.getByText('Informações Gerais')).toBeDefined()
    expect(screen.getByText('Distribuidora')).toBeDefined()
    expect(screen.getByText('Enel')).toBeDefined()
    expect(screen.getByText('Maio/2026')).toBeDefined()
    expect(screen.getByText('Minha Casa')).toBeDefined()
    expect(screen.getByText('Trifásico')).toBeDefined()
    expect(screen.getByText('Residencial')).toBeDefined()
    expect(screen.getByText('Verde')).toBeDefined()
  })

  it('renders credit summary section when creditSummary is provided', async () => {
    const { TechnicalDataViewer } = await import('../technical-data-viewer')
    render(
      <TechnicalDataViewer
        bill={
          makeBillDetail({
            creditSummary: {
              totalCredits: 150,
              consumption: 500,
              injected: 300,
              compensated: 280,
              balance: 20,
            },
          }) as any
        }
      />,
    )

    fireEvent.click(screen.getByText('Dados Técnicos da Fatura'))

    expect(screen.getByText('Saldo SCEE — Sistema de Compensação')).toBeDefined()
    expect(screen.getByText('Total de créditos')).toBeDefined()
  })

  it('renders billing items table when billingItems is provided', async () => {
    const { TechnicalDataViewer } = await import('../technical-data-viewer')
    render(
      <TechnicalDataViewer
        bill={
          makeBillDetail({
            billingItems: [
              {
                description: 'TUSD',
                quantity: 300,
                unit: 'kWh',
                unitPrice: 0.45,
                total: 135,
                type: 'consumption',
              },
              {
                description: 'SCEE Créditos',
                quantity: 280,
                unit: 'kWh',
                unitPrice: 0.40,
                total: 112,
                type: 'credit',
              },
              {
                description: 'ICMS',
                quantity: 1,
                unit: 'mes',
                unitPrice: 40,
                total: 40,
                type: 'tax',
              },
            ],
          }) as any
        }
      />,
    )

    fireEvent.click(screen.getByText('Dados Técnicos da Fatura'))

    expect(screen.getByText('Tabela de Faturamento Linha a Linha')).toBeDefined()
    expect(screen.getByText('TUSD')).toBeDefined()
    expect(screen.getByText('SCEE Créditos')).toBeDefined()
    expect(screen.getByText('ICMS')).toBeDefined()
  })

  it('renders taxes section when tax fields are present', async () => {
    const { TechnicalDataViewer } = await import('../technical-data-viewer')
    render(
      <TechnicalDataViewer
        bill={
          makeBillDetail({
            icmsCost: 40,
            pisCofinsCost: 15,
            generationEfficiency: 0.89,
          }) as any
        }
      />,
    )

    fireEvent.click(screen.getByText('Dados Técnicos da Fatura'))

    expect(screen.getByText('Tributos e Eficiência')).toBeDefined()
    expect(screen.getByText('ICMS')).toBeDefined()
    expect(screen.getByText('PIS/COFINS')).toBeDefined()
    expect(screen.getByText('Eficiência de geração')).toBeDefined()
  })

  it('renders empty state message when no technical data is available', async () => {
    const { TechnicalDataViewer } = await import('../technical-data-viewer')
    // Bill with no creditSummary, no billingItems, no tax fields
    render(
      <TechnicalDataViewer
        bill={
          makeBillDetail({
            creditSummary: null,
            billingItems: null,
            icmsCost: null,
            pisCofinsCost: null,
            generationEfficiency: null,
          }) as any
        }
      />,
    )

    fireEvent.click(screen.getByText('Dados Técnicos da Fatura'))

    expect(screen.getByText('Informações Gerais')).toBeDefined()
    expect(screen.getByText('Nenhum dado técnico disponível.')).toBeDefined()
  })

  it('handles partial data gracefully — only billing items, no credits or taxes', async () => {
    const { TechnicalDataViewer } = await import('../technical-data-viewer')
    render(
      <TechnicalDataViewer
        bill={
          makeBillDetail({
            creditSummary: null,
            billingItems: [
              {
                description: 'Consumo',
                quantity: 500,
                unit: 'kWh',
                unitPrice: 0.55,
                total: 275,
                type: 'consumption',
              },
            ],
            icmsCost: null,
            pisCofinsCost: null,
            generationEfficiency: null,
          }) as any
        }
      />,
    )

    fireEvent.click(screen.getByText('Dados Técnicos da Fatura'))

    expect(screen.getByText('Informações Gerais')).toBeDefined()
    expect(screen.getByText('Tabela de Faturamento Linha a Linha')).toBeDefined()
    expect(screen.queryByText('Saldo SCEE — Sistema de Compensação')).toBeNull()
    expect(screen.queryByText('Tributos e Eficiência')).toBeNull()
    expect(screen.queryByText('Nenhum dado técnico disponível.')).toBeNull()
  })

  it('handles null billingItems gracefully', async () => {
    const { TechnicalDataViewer } = await import('../technical-data-viewer')
    render(
      <TechnicalDataViewer
        bill={
          makeBillDetail({
            billingItems: null,
            creditSummary: { totalCredits: 100 },
          }) as any
        }
      />,
    )

    fireEvent.click(screen.getByText('Dados Técnicos da Fatura'))

    expect(screen.getByText('Informações Gerais')).toBeDefined()
    expect(screen.getByText('Saldo SCEE — Sistema de Compensação')).toBeDefined()
    expect(screen.queryByText('Tabela de Faturamento Linha a Linha')).toBeNull()
  })

  it('renders connection type label correctly', async () => {
    const { TechnicalDataViewer } = await import('../technical-data-viewer')

    const { unmount } = render(
      <TechnicalDataViewer
        bill={makeBillDetail({ connectionType: 'monofasico' }) as any}
      />,
    )
    fireEvent.click(screen.getByText('Dados Técnicos da Fatura'))
    expect(screen.getByText('Monofásico')).toBeDefined()
    unmount()

    const { rerender } = render(
      <TechnicalDataViewer
        bill={makeBillDetail({ connectionType: 'bifasico' }) as any}
      />,
    )
    fireEvent.click(screen.getByText('Dados Técnicos da Fatura'))
    expect(screen.getByText('Bifásico')).toBeDefined()
  })

  it('expands and collapses on click', async () => {
    render(<TechnicalDataViewer bill={makeBillDetail() as any} />)

    expect(screen.queryByText('Informações Gerais')).toBeNull()

    fireEvent.click(screen.getByText('Dados Técnicos da Fatura'))
    expect(screen.getByText('Informações Gerais')).toBeDefined()

    fireEvent.click(screen.getByText('Dados Técnicos da Fatura'))
    expect(screen.queryByText('Informações Gerais')).toBeNull()
  })
})
