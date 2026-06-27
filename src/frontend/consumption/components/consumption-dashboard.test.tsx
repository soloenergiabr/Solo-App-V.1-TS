// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ConsumptionDashboard } from './consumption-dashboard'

// Mock next/navigation – PageLayout uses usePathname
vi.mock('next/navigation', () => ({
    usePathname: () => '/',
}))

// Mock next-themes – PageLayout/ThemeToggle calls useTheme()
vi.mock('next-themes', () => ({
    useTheme: () => ({ theme: 'light', setTheme: vi.fn() }),
}))

// Mock useConsumptionDashboard so no network calls are needed
const mockUseConsumptionDashboard = vi.fn()
vi.mock('../hooks/use-consumption-dashboard', () => ({
    useConsumptionDashboard: () => mockUseConsumptionDashboard(),
}))

const mockData = {
    history: [
        { competenceDate: '2026-01', consumptionKwh: 300, injectedEnergyKwh: 100, tariffPerKwh: 0.85, totalBillValue: 255 },
    ],
    savings: [
        { period: '2026-01', expectedBill: 400, actualBill: 255, savings: 145 },
    ],
    totalSavings: 145,
}

describe('ConsumptionDashboard', () => {
    beforeEach(() => {
        // Default: loading complete with data
        mockUseConsumptionDashboard.mockReturnValue({
            data: mockData,
            isLoading: false,
            error: null,
            getCurrentPeriodLabel: () => '2026',
            goToPreviousPeriod: vi.fn(),
            goToNextPeriod: vi.fn(),
            goToToday: vi.fn(),
            refetch: vi.fn(),
        })
    })

    it('default mode renders page title and subtitle', () => {
        render(<ConsumptionDashboard clientId="c1" />)

        expect(screen.getByText('Economia e Consumo')).toBeInTheDocument()
        expect(
            screen.getByText('Acompanhe sua economia mensal e histórico de consumo'),
        ).toBeInTheDocument()
    })

    it('embedded mode renders savings card without page chrome', () => {
        render(<ConsumptionDashboard clientId="c1" embedded />)

        // Savings card content is present
        expect(screen.getByText('Economia Total')).toBeInTheDocument()
        expect(screen.getByText('Economia Último Mês')).toBeInTheDocument()

        // Page chrome must NOT be present
        expect(screen.queryByText('Economia e Consumo')).toBeNull()
        expect(
            screen.queryByText('Acompanhe sua economia mensal e histórico de consumo'),
        ).toBeNull()
    })

    it('embedded mode renders navigation controls', () => {
        render(<ConsumptionDashboard clientId="c1" embedded />)

        // Period navigation is present
        expect(screen.getByText('2026')).toBeInTheDocument()
        expect(screen.getByText('Hoje')).toBeInTheDocument()
    })

    it('embedded mode renders error state without page chrome', () => {
        mockUseConsumptionDashboard.mockReturnValue({
            data: null,
            isLoading: false,
            error: 'Erro de rede',
            getCurrentPeriodLabel: () => '2026',
            goToPreviousPeriod: vi.fn(),
            goToNextPeriod: vi.fn(),
            goToToday: vi.fn(),
            refetch: vi.fn(),
        })

        render(<ConsumptionDashboard clientId="c1" embedded />)

        // Error message is present
        expect(screen.getByText('Erro ao carregar dashboard')).toBeInTheDocument()
        expect(screen.getByText('Erro de rede')).toBeInTheDocument()

        // Page chrome must NOT be present
        expect(screen.queryByText('Economia e Consumo')).toBeNull()
    })
})
