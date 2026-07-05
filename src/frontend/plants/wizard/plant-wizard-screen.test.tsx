// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PlantWizardScreen } from './plant-wizard-screen'

const mockGet = vi.fn()
const mockPush = vi.fn()

vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockPush,
    }),
    usePathname: () => '/plants/wizard',
}))

vi.mock('next-themes', () => ({
    useTheme: () => ({ theme: 'dark', setTheme: vi.fn() }),
}))

vi.mock('@/frontend/auth/hooks/useAuthenticatedApi', () => ({
    useAuthenticatedApi: () => ({
        get: mockGet,
        post: vi.fn(),
        isAuthenticated: true,
    }),
}))

vi.mock('sonner', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}))

describe('PlantWizardScreen existing plant statuses', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        mockGet.mockResolvedValue({
            data: {
                success: true,
                data: [
                    {
                        id: 'plant-pending',
                        name: 'Usina Pendente',
                        validationStatus: 'pending_review',
                        createdAt: '2026-07-05T12:00:00.000Z',
                        rejectionReason: null,
                    },
                    {
                        id: 'plant-rejected',
                        name: 'Usina Rejeitada',
                        validationStatus: 'rejected',
                        createdAt: '2026-07-04T12:00:00.000Z',
                        rejectionReason: 'Falta comprovante de titularidade',
                    },
                ],
            },
        })
    })

    it('shows pending request date and rejected reason in the review status block', async () => {
        const user = userEvent.setup()

        render(<PlantWizardScreen />)

        await waitFor(() => {
            expect(mockGet).toHaveBeenCalledWith('/client/plants')
        })

        await user.type(screen.getByLabelText('Nome da Usina *'), 'Nova Usina')
        await user.click(screen.getByRole('button', { name: /Proximo/ }))
        await user.click(screen.getByRole('button', { name: /Proximo/ }))
        await user.type(screen.getByLabelText('Nome *'), 'UC Centro')
        await user.click(screen.getByRole('button', { name: /Proximo/ }))

        expect(await screen.findByText('Suas Usinas')).toBeInTheDocument()
        expect(screen.getByText('Usina Pendente')).toBeInTheDocument()
        expect(screen.getByText('Aguardando aprovacao')).toBeInTheDocument()
        expect(screen.getByText('Criada em 05/07/2026')).toBeInTheDocument()

        expect(screen.getByText('Usina Rejeitada')).toBeInTheDocument()
        expect(screen.getByText('Rejeitada')).toBeInTheDocument()
        expect(screen.getByText('Criada em 04/07/2026')).toBeInTheDocument()
        expect(screen.getByText('Motivo: Falta comprovante de titularidade')).toBeInTheDocument()
    })
})
