// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'

// Mocks — factories must not use JSX (hoisted before React import)
vi.mock('framer-motion', () => ({
  motion: {
    div: 'div',
    path: 'path',
  },
}))

vi.mock('recharts', () => ({
  PieChart: 'div',
  Pie: 'div',
  Cell: 'div',
  ResponsiveContainer: ({ children }: any) => children,
  Tooltip: () => null,
}))

describe('BillScoreGauge', () => {
  it('renders score value', async () => {
    const { BillScoreGauge } = await import('@/frontend/economia/analysis/clarifier/bill-score-gauge')
    render(<BillScoreGauge score={75} size="lg" />)
    expect(screen.getByText('75')).toBeDefined()
  })

  it('renders "Excelente" for score >= 80', async () => {
    const { BillScoreGauge } = await import('@/frontend/economia/analysis/clarifier/bill-score-gauge')
    render(<BillScoreGauge score={85} size="sm" />)
    expect(screen.getByText('Excelente')).toBeDefined()
  })

  it('renders "Crítico" for score < 45', async () => {
    const { BillScoreGauge } = await import('@/frontend/economia/analysis/clarifier/bill-score-gauge')
    render(<BillScoreGauge score={30} size="sm" />)
    expect(screen.getByText('Crítico')).toBeDefined()
  })
})

describe('SolarEnergyCard', () => {
  it('renders generated kWh', async () => {
    const { SolarEnergyCard } = await import('@/frontend/economia/analysis/clarifier/solar-energy-card')
    render(<SolarEnergyCard generated={400} injected={300} compensated={280} creditsBalance={50} />)
    expect(screen.getByText('400')).toBeDefined()
    expect(screen.getByText('Energia solar este mês')).toBeDefined()
  })

  it('shows credits balance when > 0', async () => {
    const { SolarEnergyCard } = await import('@/frontend/economia/analysis/clarifier/solar-energy-card')
    render(<SolarEnergyCard generated={400} injected={300} compensated={280} creditsBalance={50} />)
    expect(screen.getByText(/Saldo de créditos/)).toBeDefined()
  })
})

describe('CostPieChart', () => {
  it('renders pie chart with data', async () => {
    const { CostPieChart } = await import('@/frontend/economia/analysis/clarifier/cost-pie-chart')
    render(
      <CostPieChart
        availabilityCost={50}
        publicLightingCost={30}
        uncompensatedCost={100}
        totalPaid={350}
      />
    )
    expect(screen.getByText('Composição de custos')).toBeDefined()
  })

  it('shows empty state when no data', async () => {
    const { CostPieChart } = await import('@/frontend/economia/analysis/clarifier/cost-pie-chart')
    render(
      <CostPieChart
        availabilityCost={0}
        publicLightingCost={0}
        uncompensatedCost={0}
        totalPaid={0}
      />
    )
    expect(screen.getByText(/Dados insuficientes/)).toBeDefined()
  })
})

describe('BillSummaryCard', () => {
  it('renders paid and minimum values', async () => {
    const { BillSummaryCard } = await import('@/frontend/economia/analysis/clarifier/bill-summary-card')
    render(<BillSummaryCard totalPaid={350} minimumPossible={80} connectionType="trifasico" />)
    expect(screen.getByText('Você pagou')).toBeDefined()
    expect(screen.getByText('Mínimo possível')).toBeDefined()
  })
})

describe('SystemStatusCard', () => {
  it('renders adequate status', async () => {
    const { SystemStatusCard } = await import('@/frontend/economia/analysis/clarifier/system-status-card')
    render(<SystemStatusCard expectedGeneration={450} actualGeneration={420} status="adequate" />)
    expect(screen.getByText('Sistema operando bem')).toBeDefined()
  })

  it('renders below_needed status', async () => {
    const { SystemStatusCard } = await import('@/frontend/economia/analysis/clarifier/system-status-card')
    render(<SystemStatusCard expectedGeneration={450} actualGeneration={200} status="below_needed" />)
    expect(screen.getByText('Geração abaixo do esperado')).toBeDefined()
  })
})

describe('CostCompositionCard', () => {
  it('renders fixed fees breakdown', async () => {
    const { CostCompositionCard } = await import('@/frontend/economia/analysis/clarifier/cost-composition-card')
    render(<CostCompositionCard availabilityCost={50} publicLightingCost={30} uncompensatedCost={100} />)
    expect(screen.getByText('Composição da conta')).toBeDefined()
  })
})

describe('ActionCard', () => {
  it('shows positive message when no expansion needed', async () => {
    const { ActionCard } = await import('@/frontend/economia/analysis/clarifier/action-card')
    render(<ActionCard extraGenerationNeeded={0} />)
    expect(screen.getByText(/Você está no caminho certo/)).toBeDefined()
  })

  it('shows expansion CTA when needed', async () => {
    const { ActionCard } = await import('@/frontend/economia/analysis/clarifier/action-card')
    render(<ActionCard extraGenerationNeeded={150} expansionKwp={1.5} expansionModules={4} />)
    expect(screen.getByText(/Quero avaliar expansão/)).toBeDefined()
  })
})
