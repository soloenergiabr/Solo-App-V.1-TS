// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AppSidebar } from './app-sidebar'

const mockUseIsMobile = vi.fn()
const mockAuthContext = vi.fn()
const mockUseAdminApprovals = vi.fn()

function createTestQueryClient() {
    return new QueryClient({
        defaultOptions: { queries: { retry: false } },
    })
}

function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={createTestQueryClient()}>{children}</QueryClientProvider>
}

vi.mock('@/frontend/auth/contexts/auth-context', () => ({
    useAuthContext: () => mockAuthContext(),
}))

vi.mock('@/frontend/auth/hooks/useAuthenticatedApi', () => ({
    useAuthenticatedApi: () => ({
        isAuthenticated: true,
    }),
}))

vi.mock('@/frontend/admin/hooks/use-admin-approvals', () => ({
    useAdminApprovals: (options?: { select?: (items: unknown[]) => unknown }) => mockUseAdminApprovals(options),
}))

vi.mock('@/hooks/use-mobile', () => ({
    useIsMobile: () => mockUseIsMobile(),
}))

vi.mock('next-themes', () => ({
    useTheme: () => ({ resolvedTheme: 'dark' }),
}))

vi.mock('next/navigation', () => ({
    usePathname: () => '/controle',
}))

vi.mock('next/link', () => ({
    default: ({ href, children, onClick }: { href: string; children: React.ReactNode; onClick?: () => void }) => (
        <a href={href} onClick={onClick}>{children}</a>
    ),
}))

vi.mock('next/image', () => ({
    default: ({ src, alt }: { src: string; alt: string }) => (
        <img src={src} alt={alt} />
    ),
}))

describe('AppSidebar', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        mockUseIsMobile.mockReturnValue(false)
        mockUseAdminApprovals.mockImplementation((options?: { select?: (items: unknown[]) => unknown }) => ({
            data: options?.select ? options.select([]) : [],
        }))
        mockAuthContext.mockReturnValue({
            user: { name: 'Cliente', roles: [] },
            logout: vi.fn(),
        })
    })

    it('desktop vendedor renders the section headings and representative sub-items', () => {
        render(<AppSidebar />, { wrapper: Wrapper })

        expect(screen.getByRole('heading', { name: 'Controle' })).toBeInTheDocument()
        expect(screen.getByRole('heading', { name: 'Energia' })).toBeInTheDocument()
        expect(screen.getByRole('heading', { name: 'Consumo' })).toBeInTheDocument()
        expect(screen.getByRole('heading', { name: 'Solo Club' })).toBeInTheDocument()

        expect(screen.getByText('Geração')).toBeInTheDocument()
        expect(screen.getByText('Minhas Usinas')).toBeInTheDocument()
        expect(screen.getByText('Economia')).toBeInTheDocument()
        expect(screen.getByText('Rateio')).toBeInTheDocument()
        expect(screen.getByText('Clube Solo')).toBeInTheDocument()
        expect(screen.getByText('Suporte')).toBeInTheDocument()

        expect(screen.getByRole('link', { name: /Economia/ })).toHaveAttribute('href', '/consumo?tab=economia')
        expect(screen.getByRole('link', { name: /Rateio/ })).toHaveAttribute('href', '/consumo?tab=rateio')
        expect(screen.getByRole('link', { name: /Histórico/ })).toHaveAttribute('href', '/consumo?tab=historico')
    })

    it('keeps Investor Demo out of the vendedor nav', () => {
        render(<AppSidebar />, { wrapper: Wrapper })
        expect(screen.queryByText('Investor Demo')).toBeNull()
    })

    it('mobile footer shows the 5 hub labels and hides desktop-only sub-items', () => {
        mockUseIsMobile.mockReturnValue(true)
        render(<AppSidebar />, { wrapper: Wrapper })

        expect(screen.getByText('Energia')).toBeInTheDocument()
        expect(screen.getByText('Consumo')).toBeInTheDocument()
        expect(screen.getByText('Club')).toBeInTheDocument()

        expect(screen.queryByText('Minhas Usinas')).toBeNull()
        expect(screen.queryByText('Solo Coins')).toBeNull()
        expect(screen.queryByText('Solo Club')).toBeNull()
    })

    it('master nav shows the approvals badge count from the approvals list query', async () => {
        mockAuthContext.mockReturnValue({
            user: { name: 'Admin', roles: ['master'] },
            logout: vi.fn(),
        })
        mockUseAdminApprovals.mockImplementation((options?: { select?: (items: unknown[]) => unknown }) => ({
            data: options?.select ? options.select([{ id: 'plant-1' }, { id: 'unit-1' }]) : [{ id: 'plant-1' }, { id: 'unit-1' }],
        }))

        render(<AppSidebar />, { wrapper: Wrapper })

        await waitFor(() => {
            expect(screen.getByRole('link', { name: /Aprovacoes \(2\)/ })).toBeInTheDocument()
        })
        expect(mockUseAdminApprovals).toHaveBeenCalledWith(
            expect.objectContaining({
                enabled: true,
                select: expect.any(Function),
            }),
        )
    })
})
