import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

const mockPlantFindFirst = vi.fn()
const mockPlantUpdate = vi.fn()
const mockExtractUserContext = vi.fn()

vi.mock('@/lib/prisma', () => ({
    default: {
        plant: {
            findFirst: mockPlantFindFirst,
            update: mockPlantUpdate,
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
        new Request('http://localhost/api/admin/clients/client-1/plants/plant-1', {
            method: 'PATCH',
            body: JSON.stringify(body),
            headers: { 'Content-Type': 'application/json' },
        }),
    )

    return PATCH(request, { params: Promise.resolve({ id: 'client-1', plantId: 'plant-1' }) })
}

describe('PATCH /api/admin/clients/[id]/plants/[plantId]', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        mockExtractUserContext.mockResolvedValue({ userId: 'admin-1', roles: ['master'] })
        mockPlantFindFirst.mockResolvedValue({
            id: 'plant-1',
            clientId: 'client-1',
            rejectionReason: 'Motivo anterior',
        })
        mockPlantUpdate.mockResolvedValue({ id: 'plant-1' })
    })

    it('stores the trimmed rejection reason when rejected', async () => {
        const response = await callPATCH({
            validationStatus: 'rejected',
            rejectionReason: '  Documento ilegivel  ',
        })

        expect(response.status).toBe(200)
        expect(mockPlantUpdate).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { id: 'plant-1' },
                data: {
                    validationStatus: 'rejected',
                    rejectionReason: 'Documento ilegivel',
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
        expect(mockPlantUpdate).toHaveBeenCalledWith(
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
        expect(mockPlantUpdate).toHaveBeenCalledWith(
            expect.objectContaining({
                data: {
                    validationStatus: 'confirmed',
                    rejectionReason: null,
                },
            }),
        )
    })
})
