import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// -- Mocks --
const mockFindUnique = vi.fn()

vi.mock('@/lib/prisma', () => ({
    default: {
        energyBill: {
            findUnique: mockFindUnique,
        },
    },
}))

vi.mock('@/backend/auth/middleware/auth.middleware', () => ({
    AuthMiddleware: {
        requireAuth: vi.fn(),
    },
}))

vi.mock('@/backend/controle/scope', () => ({
    resolveAccessibleUnitIds: vi.fn(),
}))

// Import after mocks
const { AuthMiddleware } = await import('@/backend/auth/middleware/auth.middleware')
const { resolveAccessibleUnitIds } = await import('@/backend/controle/scope')

async function callGET(billId: string, overrides?: RequestInit) {
    const { GET } = await import('./route')
    const request = new NextRequest(
        new Request(`http://localhost/api/economia/bills/${billId}`, overrides),
    )
    return GET(request, { params: Promise.resolve({ billId }) })
}

const mockUserContext = { userId: 'user-1', clientId: 'client-1' }
const mockConsumerUnit = {
    id: 'unit-1',
    name: 'Unidade 1',
    clientNumber: 'CN-001',
    installationNumber: 'IN-001',
    distributor: 'Distribuidora A',
}

function makePrismaBill(overrides: Record<string, unknown> = {}) {
    return {
        id: 'bill-1',
        consumerUnitId: 'unit-1',
        referenceMonth: 4,
        referenceYear: 2026,
        amountDue: 450.75,
        totalBillValue: 450.75,
        dueDate: new Date('2026-04-20'),
        paidAt: null,
        paymentStatus: 'a_pagar',
        status: null,
        pixCode: 'pix-123',
        barcode: 'barcode-123',
        billFileUrl: 'https://example.com/bill.pdf',
        estimatedSavings: 85.0,
        aiAnalysis: 'Analise da fatura.',
        aiExplanations: { energia: 'Consumo elevado' },
        alerts: ['Alerta de consumo'],
        aiRecommendations: ['Recomendacao 1'],
        billingItems: [],
        creditSummary: {},
        billScore: 72,
        accountHolder: 'Joao Silva',
        distributor: null,
        clientId: 'client-1',
        consumerUnit: mockConsumerUnit,
        ...overrides,
    }
}

describe('GET /api/economia/bills/[billId]', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(AuthMiddleware.requireAuth).mockResolvedValue(mockUserContext as never)
    })

    describe('authorization', () => {
        it('returns 401 when auth fails', async () => {
            vi.mocked(AuthMiddleware.requireAuth).mockRejectedValue(
                new Error('Authentication required'),
            )

            const res = await callGET('bill-1')
            expect(res.status).toBe(401)
        })
    })

    describe('scope = all (titular/admin)', () => {
        beforeEach(() => {
            vi.mocked(resolveAccessibleUnitIds).mockResolvedValue('all')
        })

        it('returns bill detail for the user client', async () => {
            mockFindUnique.mockResolvedValue(makePrismaBill())

            const res = await callGET('bill-1')
            expect(res.status).toBe(200)

            const body = await res.json()
            expect(body.success).toBe(true)
            expect(body.data.id).toBe('bill-1')
            expect(body.data.billScore).toBe(72)
            expect(body.data.consumerUnitName).toBe('Unidade 1')
        })

        it('returns 401 when bill belongs to another client', async () => {
            mockFindUnique.mockResolvedValue(
                makePrismaBill({ clientId: 'other-client' }),
            )

            const res = await callGET('bill-1')
            expect(res.status).toBe(401)
        })
    })

    describe('scope = unit list (payer)', () => {
        beforeEach(() => {
            vi.mocked(resolveAccessibleUnitIds).mockResolvedValue(['unit-1'])
        })

        it('returns bill detail for an accessible unit', async () => {
            mockFindUnique.mockResolvedValue(makePrismaBill())

            const res = await callGET('bill-1')
            expect(res.status).toBe(200)

            const body = await res.json()
            expect(body.success).toBe(true)
            expect(body.data.id).toBe('bill-1')
        })

        it('returns 401 when bill unit is not in scope', async () => {
            mockFindUnique.mockResolvedValue(
                makePrismaBill({ consumerUnitId: 'unit-2' }),
            )

            const res = await callGET('bill-1')
            expect(res.status).toBe(401)
        })
    })

    describe('not found', () => {
        it('returns 404 when bill does not exist', async () => {
            vi.mocked(resolveAccessibleUnitIds).mockResolvedValue('all')
            mockFindUnique.mockResolvedValue(null)

            const res = await callGET('nonexistent')
            expect(res.status).toBe(404)

            const body = await res.json()
            expect(body.message).toBe('Fatura nao encontrada')
        })
    })

    describe('response shape', () => {
        it('includes all expected fields', async () => {
            vi.mocked(resolveAccessibleUnitIds).mockResolvedValue('all')
            mockFindUnique.mockResolvedValue(makePrismaBill())

            const res = await callGET('bill-1')
            const body = await res.json()
            const d = body.data

            expect(d).toHaveProperty('id')
            expect(d).toHaveProperty('consumerUnitId')
            expect(d).toHaveProperty('consumerUnitName')
            expect(d).toHaveProperty('referenceMonth')
            expect(d).toHaveProperty('referenceYear')
            expect(d).toHaveProperty('amountDue')
            expect(d).toHaveProperty('dueDate')
            expect(d).toHaveProperty('paidAt')
            expect(d).toHaveProperty('paymentStatus')
            expect(d).toHaveProperty('status')
            expect(d).toHaveProperty('pixCode')
            expect(d).toHaveProperty('barcode')
            expect(d).toHaveProperty('billFileUrl')
            expect(d).toHaveProperty('estimatedSavings')
            expect(d).toHaveProperty('aiAnalysis')
            expect(d).toHaveProperty('aiExplanations')
            expect(d).toHaveProperty('alerts')
            expect(d).toHaveProperty('aiRecommendations')
            expect(d).toHaveProperty('billingItems')
            expect(d).toHaveProperty('creditSummary')
            expect(d).toHaveProperty('billScore')
            expect(d).toHaveProperty('titularName')
            expect(d).toHaveProperty('distributor')
            expect(d).toHaveProperty('consumerUnit')
            expect(d.consumerUnit).toHaveProperty('name')
            expect(d.consumerUnit).toHaveProperty('clientNumber')
            expect(d.consumerUnit).toHaveProperty('installationNumber')
        })

        it('returns null billScore when not set', async () => {
            vi.mocked(resolveAccessibleUnitIds).mockResolvedValue('all')
            mockFindUnique.mockResolvedValue(makePrismaBill({ billScore: null }))

            const res = await callGET('bill-1')
            const body = await res.json()
            expect(body.data.billScore).toBeNull()
        })
    })
})
