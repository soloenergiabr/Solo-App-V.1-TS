// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { RateioScreen } from './rateio-screen'

// Mock next/navigation – PageLayout uses usePathname
vi.mock('next/navigation', () => ({
    usePathname: () => '/',
    useRouter: () => ({ push: vi.fn() }),
}))

// Mock next-themes – ThemeToggle (inside PageLayout) calls useTheme()
vi.mock('next-themes', () => ({
    useTheme: () => ({ theme: 'light', setTheme: vi.fn() }),
}))

// Mock use-rateio so no network calls are needed
vi.mock('./hooks/use-rateio', () => ({
    useRateio: () => ({ data: null, isLoading: true, error: null, refetch: vi.fn() }),
    useCreateProposal: () => ({ mutateAsync: vi.fn(), isPending: false }),
}))

// Mock useAuthenticatedApi
vi.mock('@/frontend/auth/hooks/useAuthenticatedApi', () => ({
    useAuthenticatedApi: () => ({
        get: vi.fn().mockResolvedValue({ data: { success: true, data: [] } }),
        post: vi.fn(),
        isAuthenticated: true,
    }),
}))

describe('RateioScreen', () => {
    it('renders page title in default mode', async () => {
        render(<RateioScreen />)
        expect(await screen.findByText('Rateio de Créditos')).toBeInTheDocument()
    })

    it('renders loading skeleton in embedded mode without page title', async () => {
        render(<RateioScreen embedded />)
        // Skeleton elements should be rendered (loading state)
        const skeletons = document.querySelectorAll('.space-y-3')
        expect(skeletons.length).toBeGreaterThan(0)
        // Page title should NOT be rendered in embedded mode
        expect(screen.queryByText('Rateio de Créditos')).not.toBeInTheDocument()
    })
})
