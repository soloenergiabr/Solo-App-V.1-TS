import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

const mockConsumerUnitFindFirst = vi.fn()
const mockConsumerUnitUpdate = vi.fn()
const mockExtractUserContext = vi.fn()

vi.mock('@/lib/prisma', () => ({
    default: {
        consumerUnit: {
            findFirst: mockConsumerUnitFindFirst,
            update: mockConsumerUnitUpdate,
        },
    },
}))

vi.mock('@/backend/auth/middleware/auth.middleware', () => ({
    AuthMiddleware: {
        extractUserContext: mockExtractUserContext,
    },
}))

async function callPATCH(body: unknown) {
    const { PATCH } = await import('./route')
    const request = new NextRequest(
        new Request('http://localhost/api/admin/clients/client-1/consumer-units/unit-1', {
            method: 'PATCH',
            body: JSON.stringify(body),
            headers: { 'Content-Type': 'application/json' },
        }),
    )

    return PATCH(request, { params: Promise.resolve({ id: 'client-1', unitId: 'unit-1' }) })
}

describe('PATCH /api/admin/clients/[id]/consumer-units/[unitId]', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        mockExtractUserContext.mockResolvedValue({ userId: 'admin-1', roles: ['master'] })
        mockConsumerUnitFindFirst.mockResolvedValue({
            id: 'unit-1',
            clientId: 'client-1',
            rejectionReason: 'Motivo anterior',
        })
        mockConsumerUnitUpdate.mockResolvedValue({ id: 'unit-1' })
    })

    it('stores the trimmed rejection reason when rejected', async () => {
        const response = await callPATCH({
            validationStatus: 'rejected',
            rejectionReason: '  Dados divergentes  ',
        })

        expect(response.status).toBe(200)
        expect(mockConsumerUnitUpdate).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { id: 'unit-1' },
                data: {
                    validationStatus: 'rejected',
                    rejectionReason: 'Dados divergentes',
                },
            }),
        )
    })

    it('stores null when rejected without a meaningful reason', async () => {
        const response = await callPATCH({
            validationStatus: 'rejected',
            rejectionReason: '   ',
        })

        expect(response.status).toBe(200)
        expect(mockConsumerUnitUpdate).toHaveBeenCalledWith(
            expect.objectContaining({
                data: {
                    validationStatus: 'rejected',
                    rejectionReason: null,
                },
            }),
        )
    })

    it('clears any prior rejection reason when confirmed', async () => {
        const response = await callPATCH({
            validationStatus: 'confirmed',
        })

        expect(response.status).toBe(200)
        expect(mockConsumerUnitUpdate).toHaveBeenCalledWith(
            expect.objectContaining({
                data: {
                    validationStatus: 'confirmed',
                    rejectionReason: null,
                },
            }),
        )
    })
})
