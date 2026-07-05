// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { useAdminApprovals } from './use-admin-approvals'

const mockGet = vi.fn()
const mockUseAuthenticatedApi = vi.fn()

function createTestQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: { retry: false },
        },
    })
}

function createWrapper() {
    const queryClient = createTestQueryClient()

    return function Wrapper({ children }: { children: React.ReactNode }) {
        return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    }
}

vi.mock('@/frontend/auth/hooks/useAuthenticatedApi', () => ({
    useAuthenticatedApi: () => mockUseAuthenticatedApi(),
}))

describe('useAdminApprovals', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        mockGet.mockResolvedValue({ data: { success: true, data: [] } })
        mockUseAuthenticatedApi.mockReturnValue({
            get: mockGet,
            isAuthenticated: true,
        })
    })

    it('does not call the API when auth is not ready even if enabled=true is passed', async () => {
        mockUseAuthenticatedApi.mockReturnValue({
            get: mockGet,
            isAuthenticated: false,
        })

        const { result } = renderHook(
            () => useAdminApprovals({ enabled: true }),
            { wrapper: createWrapper() },
        )

        await waitFor(() => {
            expect(result.current.fetchStatus).toBe('idle')
        })
        expect(mockGet).not.toHaveBeenCalled()
    })
})
