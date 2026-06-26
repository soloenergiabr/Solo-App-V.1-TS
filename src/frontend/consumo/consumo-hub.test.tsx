// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ConsumoHub } from './consumo-hub'
import type { AccountBill } from '@/shared/controle/types'

// Mock next/navigation – PageLayout uses usePathname; AnalyzeBillDialog uses useRouter
vi.mock('next/navigation', () => ({
    usePathname: () => '/',
    useRouter: () => ({ push: vi.fn() }),
}))

// Mock next-themes – ThemeToggle (inside PageLayout) calls useTheme()
vi.mock('next-themes', () => ({
    useTheme: () => ({ theme: 'light', setTheme: vi.fn() }),
}))

// Mock use-economia so no network calls are needed
vi.mock('@/frontend/economia/hooks/use-economia', () => ({
    useEconomia: vi.fn(),
}))

// Mock useAuthenticatedApi – AnalyzeBillDialog only fetches when dialog OPENS;
// the closed trigger label renders without network.
vi.mock('@/frontend/auth/hooks/useAuthenticatedApi', () => ({
    useAuthenticatedApi: () => ({
        get: vi.fn().mockResolvedValue({ data: { success: true, data: [] } }),
        post: vi.fn(),
        isAuthenticated: true,
    }),
}))

import { useEconomia } from '@/frontend/economia/hooks/use-economia'

const minimalBill: AccountBill = {
    id: 'b1',
    consumerUnitId: 'u1',
    consumerUnitName: 'Casa',
    distributor: 'Enel',
    accountNumber: 'UC 123456',
    referenceMonth: 3,
    referenceYear: 2026,
    amountDue: 187,
    dueDate: '2026-04-12',
    paidAt: null,
    paymentStatus: 'a_pagar',
    pixCode: 'PIX-CASA',
    barcode: null,
    billFileUrl: 'http://x/bill.pdf',
    estimatedSavings: 410,
    titularName: 'Gabriel',
    payerName: 'Mateus',
    aiAnalysis: 'bandeira vermelha elevou R$ 38',
}

describe('ConsumoHub', () => {
    it('has bills → analyzer reachable + Economia card links to /economia', () => {
        vi.mocked(useEconomia).mockReturnValue({
            bills: [minimalBill],
            isLoading: false,
            error: null,
            refetch: vi.fn(),
        } as any)

        render(<ConsumoHub />)

        // Reachability proof: real AnalyzeBillDialog trigger is present from Consumo hub
        expect(screen.getByText('Analisar conta (PDF)')).toBeInTheDocument()

        // Economia card is present with correct href
        const economiaLink = screen.getByRole('link', { name: /Economia/ })
        expect(economiaLink).toBeInTheDocument()
        expect(economiaLink).toHaveAttribute('href', '/economia')

        // Count copy reflects the bill count
        expect(screen.getByText(/1 conta\(s\) analisada\(s\)/)).toBeInTheDocument()
    })

    it('empty bills → empty-state copy is shown + analyzer trigger still present', () => {
        vi.mocked(useEconomia).mockReturnValue({
            bills: [],
            isLoading: false,
            error: null,
            refetch: vi.fn(),
        } as any)

        render(<ConsumoHub />)

        // Exact empty-state copy must be present
        expect(
            screen.getByText(
                'Ainda não analisamos nenhuma conta sua. Envie o PDF da sua conta de luz e a IA cuida do resto.',
            ),
        ).toBeInTheDocument()

        // Analyzer is still reachable even without bills
        expect(screen.getByText('Analisar conta (PDF)')).toBeInTheDocument()
    })
})
