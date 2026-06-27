import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// -- Mocks --
const mockFindMany = vi.fn()

vi.mock('@/lib/prisma', () => ({
    default: {
        energyBill: {
            findMany: mockFindMany,
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

async function callGET(searchParams: string = '') {
    const { GET } = await import('../route')
    const url = searchParams
        ? `http://localhost/api/economia/bills?${searchParams}`
        : 'http://localhost/api/economia/bills'
    const request = new NextRequest(new Request(url))
    return GET(request)
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
        pixCode: 'pix-123',
        barcode: 'barcode-123',
        billFileUrl: 'https://example.com/bill.pdf',
        estimatedSavings: 85.0,
        aiAnalysis: null,
        energyCost: 300,
        tariffTusdValue: 0.3,
        tariffTeValue: 0.4,
        icmsCost: 20,
        publicLightingCost: 15,
        tariffFlag: 'verde',
        tariffFlagCost: 0,
        accountHolder: 'Joao Silva',
        accountNumber: '12345',
        distributor: null,
        clientId: 'client-1',
        consumerUnit: mockConsumerUnit,
        ...overrides,
    }
}

describe('GET /api/economia/bills', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(AuthMiddleware.requireAuth).mockResolvedValue(mockUserContext as never)
        mockFindMany.mockResolvedValue([])
    })

    describe('year=all (multi-year fetch)', () => {
        beforeEach(() => {
            vi.mocked(resolveAccessibleUnitIds).mockResolvedValue('all')
        })

        it('omits referenceYear from the where clause', async () => {
            mockFindMany.mockResolvedValue([
                makePrismaBill({ referenceYear: 2024 }),
                makePrismaBill({ referenceYear: 2025 }),
                makePrismaBill({ referenceYear: 2026 }),
            ])

            const res = await callGET('year=all')
            expect(res.status).toBe(200)

            const body = await res.json()
            expect(body.success).toBe(true)
            expect(body.data).toHaveLength(3)

            const whereArg = mockFindMany.mock.calls[0][0].where
            expect(whereArg).not.toHaveProperty('referenceYear')
        })

        it('still applies scope=all clientId filter', async () => {
            const res = await callGET('year=all')
            expect(res.status).toBe(200)

            const whereArg = mockFindMany.mock.calls[0][0].where
            expect(whereArg).toHaveProperty('clientId', 'client-1')
        })
    })

    describe('default behavior (no year param)', () => {
        beforeEach(() => {
            vi.mocked(resolveAccessibleUnitIds).mockResolvedValue('all')
        })

        it('filters by current year when no year param', async () => {
            const res = await callGET('')
            expect(res.status).toBe(200)

            const whereArg = mockFindMany.mock.calls[0][0].where
            expect(whereArg).toHaveProperty('referenceYear', new Date().getFullYear())
        })

        it('filters by provided year when year param is numeric', async () => {
            const res = await callGET('year=2024')
            expect(res.status).toBe(200)

            const whereArg = mockFindMany.mock.calls[0][0].where
            expect(whereArg).toHaveProperty('referenceYear', 2024)
        })
    })

    describe('authorization', () => {
        it('returns 401 when auth fails', async () => {
            vi.mocked(AuthMiddleware.requireAuth).mockRejectedValue(
                new Error('Authentication required'),
            )

            const res = await callGET('year=all')
            expect(res.status).toBe(401)
        })

        it('returns 401 when scope=all and no clientId', async () => {
            vi.mocked(AuthMiddleware.requireAuth).mockResolvedValue({
                userId: 'user-1',
                clientId: null,
            } as never)
            vi.mocked(resolveAccessibleUnitIds).mockResolvedValue('all')

            const res = await callGET('year=all')
            expect(res.status).toBe(401)

            const body = await res.json()
            expect(body.message).toBe('unauthorized')
        })
    })

    describe('payer scope (unit list)', () => {
        beforeEach(() => {
            vi.mocked(resolveAccessibleUnitIds).mockResolvedValue(['unit-1'])
        })

        it('filters by accessible unit ids', async () => {
            const res = await callGET('year=all')
            expect(res.status).toBe(200)

            const whereArg = mockFindMany.mock.calls[0][0].where
            expect(whereArg).toHaveProperty('consumerUnitId')
            expect(whereArg.consumerUnitId).toEqual({ in: ['unit-1'] })
        })

        it('does not include clientId in where clause for unit scope', async () => {
            const res = await callGET('year=all')
            expect(res.status).toBe(200)

            const whereArg = mockFindMany.mock.calls[0][0].where
            expect(whereArg).not.toHaveProperty('clientId')
        })
    })

    describe('month filter interaction', () => {
        beforeEach(() => {
            vi.mocked(resolveAccessibleUnitIds).mockResolvedValue('all')
        })

        it('combines year=all with month filter', async () => {
            const res = await callGET('year=all&month=3')
            expect(res.status).toBe(200)

            const whereArg = mockFindMany.mock.calls[0][0].where
            expect(whereArg).not.toHaveProperty('referenceYear')
            expect(whereArg).toHaveProperty('referenceMonth', 3)
        })

        it('combines specific year with month filter', async () => {
            const res = await callGET('year=2025&month=3')
            expect(res.status).toBe(200)

            const whereArg = mockFindMany.mock.calls[0][0].where
            expect(whereArg).toHaveProperty('referenceYear', 2025)
            expect(whereArg).toHaveProperty('referenceMonth', 3)
        })
    })
})
