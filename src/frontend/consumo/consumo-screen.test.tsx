// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ConsumoScreen } from './consumo-screen'

// Mock next/navigation
const mockRouterReplace = vi.fn()
const mockSearchParamsGet = vi.fn()

vi.mock('next/navigation', () => ({
    useSearchParams: () => ({
        get: mockSearchParamsGet,
    }),
    useRouter: () => ({
        replace: mockRouterReplace,
    }),
    usePathname: () => '/consumo',
}))

// Mock next-themes – ThemeToggle (inside PageLayout) calls useTheme()
vi.mock('next-themes', () => ({
    useTheme: () => ({ theme: 'light', setTheme: vi.fn() }),
}))

// Mock useAuth
const mockUseAuth = vi.fn()
vi.mock('@/frontend/auth/hooks/useAuth', () => ({
    useAuth: () => mockUseAuth(),
}))

// Mock useAuthenticatedApi – needed by useEconomia which is used by ConsumoScreen
vi.mock('@/frontend/auth/hooks/useAuthenticatedApi', () => ({
    useAuthenticatedApi: () => ({
        get: vi.fn().mockResolvedValue({ data: { success: true, data: [] } }),
        post: vi.fn(),
        isAuthenticated: true,
    }),
}))

// Mock child components
vi.mock('@/frontend/economia/economia-screen', () => ({
    EconomiaScreen: ({ embedded }: { embedded?: boolean }) => (
        <div data-testid="economia-screen" data-embedded={String(embedded)}>
            EconomiaScreen
        </div>
    ),
}))

vi.mock('@/frontend/rateio/rateio-screen', () => ({
    RateioScreen: ({ embedded }: { embedded?: boolean }) => (
        <div data-testid="rateio-screen" data-embedded={String(embedded)}>
            RateioScreen
        </div>
    ),
}))

vi.mock('@/frontend/consumption/components/consumption-dashboard', () => ({
    ConsumptionDashboard: ({ clientId, embedded }: { clientId: string; embedded?: boolean }) => (
        <div
            data-testid="consumption-dashboard"
            data-client-id={clientId}
            data-embedded={String(embedded)}
        >
            ConsumptionDashboard
        </div>
    ),
}))

vi.mock('@/frontend/economia/history/bill-history', () => ({
    BillHistory: () => <div data-testid="bill-history">BillHistory</div>,
}))

vi.mock('@/frontend/economia/history/bill-compare', () => ({
    BillCompare: () => <div data-testid="bill-compare">BillCompare</div>,
}))

describe('ConsumoScreen', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        mockSearchParamsGet.mockReturnValue(null) // default: no tab param
        mockUseAuth.mockReturnValue({
            user: { clientId: 'client-123' },
            isAuthenticated: true,
            isLoading: false,
        })
    })

    it('shows loader while auth is loading', () => {
        mockUseAuth.mockReturnValue({
            user: null,
            isAuthenticated: false,
            isLoading: true,
        })

        render(<ConsumoScreen />)

        expect(screen.getByTestId('loader')).toBeInTheDocument()
        // Child screens should NOT render when loading
        expect(screen.queryByTestId('economia-screen')).not.toBeInTheDocument()
    })

    it('shows loader when user has no clientId', () => {
        mockUseAuth.mockReturnValue({
            user: { clientId: undefined },
            isAuthenticated: true,
            isLoading: false,
        })

        render(<ConsumoScreen />)

        expect(screen.getByTestId('loader')).toBeInTheDocument()
        expect(screen.queryByTestId('economia-screen')).not.toBeInTheDocument()
    })

    it('renders the PageHeader with title and subtitle', () => {
        render(<ConsumoScreen />)

        expect(screen.getByText('Consumo')).toBeInTheDocument()
        expect(
            screen.getByText('Suas contas, rateio e consumo em um só lugar'),
        ).toBeInTheDocument()
    })

    it('renders the AnalyzeBillDialog and helper text in actions', () => {
        render(<ConsumoScreen />)

        expect(screen.getByText('Analisar conta (PDF)')).toBeInTheDocument()
        expect(
            screen.getByText(/Tem o PDF da conta/),
        ).toBeInTheDocument()
    })

    it('renders three tab triggers', () => {
        render(<ConsumoScreen />)

        expect(screen.getByRole('tab', { name: 'Economia' })).toBeInTheDocument()
        expect(screen.getByRole('tab', { name: 'Rateio' })).toBeInTheDocument()
        expect(screen.getByRole('tab', { name: 'Histórico' })).toBeInTheDocument()
    })

    it('defaults to economia tab when no ?tab= is provided', () => {
        mockSearchParamsGet.mockReturnValue(null)

        render(<ConsumoScreen />)

        // Economia tab should be active (aria-selected)
        expect(screen.getByRole('tab', { name: 'Economia' })).toHaveAttribute(
            'data-state',
            'active',
        )
        expect(screen.getByTestId('economia-screen')).toBeInTheDocument()
        expect(screen.queryByTestId('rateio-screen')).not.toBeInTheDocument()
        expect(screen.queryByTestId('consumption-dashboard')).not.toBeInTheDocument()
    })

    it('respects ?tab=rateio from URL', () => {
        mockSearchParamsGet.mockReturnValue('rateio')

        render(<ConsumoScreen />)

        expect(screen.getByRole('tab', { name: 'Rateio' })).toHaveAttribute(
            'data-state',
            'active',
        )
        expect(screen.getByTestId('rateio-screen')).toBeInTheDocument()
        expect(screen.queryByTestId('economia-screen')).not.toBeInTheDocument()
    })

    it('respects ?tab=historico from URL', () => {
        mockSearchParamsGet.mockReturnValue('historico')

        render(<ConsumoScreen />)

        expect(screen.getByRole('tab', { name: 'Histórico' })).toHaveAttribute(
            'data-state',
            'active',
        )
        expect(screen.getByTestId('bill-history')).toBeInTheDocument()
        expect(screen.getByTestId('consumption-dashboard')).toBeInTheDocument()
        expect(screen.queryByTestId('economia-screen')).not.toBeInTheDocument()
    })

    it('falls back to economia for unknown tab value', () => {
        mockSearchParamsGet.mockReturnValue('unknown-tab')

        render(<ConsumoScreen />)

        expect(screen.getByRole('tab', { name: 'Economia' })).toHaveAttribute(
            'data-state',
            'active',
        )
        expect(screen.getByTestId('economia-screen')).toBeInTheDocument()
    })

    it('navigates on tab click via router.replace', async () => {
        const user = userEvent.setup()
        mockSearchParamsGet.mockReturnValue('economia')
        render(<ConsumoScreen />)

        const rateioTab = screen.getByRole('tab', { name: 'Rateio' })
        await user.click(rateioTab)

        expect(mockRouterReplace).toHaveBeenCalledWith('/consumo?tab=rateio')
    })

    it('passes embedded prop to EconomiaScreen', () => {
        mockSearchParamsGet.mockReturnValue('economia')
        render(<ConsumoScreen />)

        expect(screen.getByTestId('economia-screen')).toHaveAttribute(
            'data-embedded',
            'true',
        )
    })

    it('passes embedded prop to RateioScreen', () => {
        mockSearchParamsGet.mockReturnValue('rateio')
        render(<ConsumoScreen />)

        expect(screen.getByTestId('rateio-screen')).toHaveAttribute(
            'data-embedded',
            'true',
        )
    })

    it('passes clientId and embedded to ConsumptionDashboard', () => {
        mockSearchParamsGet.mockReturnValue('historico')
        render(<ConsumoScreen />)

        const dashboard = screen.getByTestId('consumption-dashboard')
        expect(dashboard).toHaveAttribute('data-client-id', 'client-123')
        expect(dashboard).toHaveAttribute('data-embedded', 'true')
    })
})
