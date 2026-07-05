// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ApprovalsPage from './page'
import { useAdminApprovals } from '@/frontend/admin/hooks/use-admin-approvals'

const {
    mockGet,
    mockPatch,
    mockAuthContext,
    mockUseIsMobile,
    toastSuccess,
    toastError,
} = vi.hoisted(() => ({
    mockGet: vi.fn(),
    mockPatch: vi.fn(),
    mockAuthContext: vi.fn(),
    mockUseIsMobile: vi.fn(),
    toastSuccess: vi.fn(),
    toastError: vi.fn(),
}))

function createTestQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: { retry: false, gcTime: 0 },
            mutations: { retry: false },
        },
    })
}

function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={createTestQueryClient()}>{children}</QueryClientProvider>
}

function ApprovalsBadgeProbe() {
    const { data: pendingCount = 0 } = useAdminApprovals({
        select: (items) => items.length,
        enabled: true,
    })

    return <span>{pendingCount > 0 ? `Aprovacoes (${pendingCount})` : 'Aprovacoes'}</span>
}

vi.mock('@/frontend/auth/contexts/auth-context', () => ({
    useAuthContext: () => mockAuthContext(),
    withAuth: (Component: React.ComponentType) => Component,
}))

vi.mock('@/frontend/auth/hooks/useAuthenticatedApi', () => ({
    useAuthenticatedApi: () => ({
        get: mockGet,
        patch: mockPatch,
        isAuthenticated: true,
    }),
}))

vi.mock('@/hooks/use-mobile', () => ({
    useIsMobile: () => mockUseIsMobile(),
}))

vi.mock('next-themes', () => ({
    useTheme: () => ({ resolvedTheme: 'dark' }),
}))

vi.mock('next/navigation', () => ({
    usePathname: () => '/admin/approvals',
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

vi.mock('sonner', () => ({
    toast: {
        success: toastSuccess,
        error: toastError,
    },
}))

describe('Admin approvals query sharing', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        mockUseIsMobile.mockReturnValue(false)
        mockAuthContext.mockReturnValue({
            user: { name: 'Admin', roles: ['master'] },
            logout: vi.fn(),
        })
    })

    it('refreshes the sidebar badge after approval without a duplicate sidebar fetch', async () => {
        const user = userEvent.setup()
        let approvals = [
            {
                type: 'plant',
                id: 'plant-1',
                name: 'Usina Centro',
                clientName: 'Joao Silva',
                clientId: 'client-1',
                createdAt: '2026-07-01T10:00:00.000Z',
                validationStatus: 'pending_review',
                rejectionReason: null,
            },
        ]

        mockGet.mockImplementation(async () => ({
            data: { success: true, data: approvals },
        }))
        mockPatch.mockImplementation(async () => {
            approvals = []
            return { data: { success: true } }
        })

        render(
            <>
                <ApprovalsBadgeProbe />
                <ApprovalsPage />
            </>,
            { wrapper: Wrapper },
        )

        expect(await screen.findByText('Aprovacoes (1)')).toBeInTheDocument()
        expect(await screen.findByText('Usina Centro')).toBeInTheDocument()
        expect(mockGet).toHaveBeenCalledTimes(1)

        await user.click(screen.getByRole('button', { name: /Aprovar/ }))

        await waitFor(() => {
            expect(screen.getByText('Aprovacoes')).toBeInTheDocument()
        })
        await waitFor(() => {
            expect(screen.getByText('Nenhuma pendencia')).toBeInTheDocument()
        })
        expect(mockPatch).toHaveBeenCalledWith('/admin/clients/client-1/plants/plant-1', {
            validationStatus: 'confirmed',
        })
        expect(mockGet).toHaveBeenCalledTimes(2)
    })
})
