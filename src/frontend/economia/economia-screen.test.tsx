// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { EconomiaScreen } from './economia-screen'

// Mock next/navigation – PageLayout uses usePathname; AnalyzeBillDialog uses useRouter
vi.mock('next/navigation', () => ({
    usePathname: () => '/',
    useRouter: () => ({ push: vi.fn() }),
}))

// Mock next-themes – ThemeToggle (inside PageLayout) calls useTheme(); no ThemeProvider in tests
vi.mock('next-themes', () => ({
    useTheme: () => ({ theme: 'light', setTheme: vi.fn() }),
}))

// Mock use-economia so no network calls are needed
vi.mock('./hooks/use-economia', () => ({
    useEconomia: () => ({ bills: [], isLoading: false, error: null, refetch: vi.fn() }),
}))

// Mock useAuthenticatedApi – AddBillForm / AnalyzeBillDialog only fetch when their dialog
// OPENS; the closed trigger labels render without network, so a stub api is enough.
vi.mock('@/frontend/auth/hooks/useAuthenticatedApi', () => ({
    useAuthenticatedApi: () => ({
        get: vi.fn().mockResolvedValue({ data: { success: true, data: [] } }),
        post: vi.fn(),
        isAuthenticated: true,
    }),
}))

describe('EconomiaScreen', () => {
    it('renders both manual bill entry and AI upload entry points', async () => {
        render(<EconomiaScreen />)
        expect(await screen.findByText('Adicionar Fatura')).toBeInTheDocument()
        expect(screen.getByText('Analisar conta (PDF)')).toBeInTheDocument()
        expect(
            screen.getByText(/Tem o PDF da conta\? Use .*Analisar conta.* para a IA preencher tudo\./),
        ).toBeInTheDocument()
        // Page title should be present in non-embedded mode
        expect(screen.getByText('Economia')).toBeInTheDocument()
    })

    it('renders inline actions and body without page title when embedded', async () => {
        render(<EconomiaScreen embedded />)
        // Entry points should still be present
        expect(await screen.findByText('Adicionar Fatura')).toBeInTheDocument()
        expect(screen.getByText('Analisar conta (PDF)')).toBeInTheDocument()
        // Page title "Economia" should NOT be rendered in embedded mode
        expect(screen.queryByText('Economia')).not.toBeInTheDocument()
        // Empty state message should be present (bills mock returns [])
        expect(screen.getByText('Nenhuma conta ainda')).toBeInTheDocument()
    })
})
