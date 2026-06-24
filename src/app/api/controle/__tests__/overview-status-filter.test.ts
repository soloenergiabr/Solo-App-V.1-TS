import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// ── Prisma mock ────────────────────────────────────────────────────────────
// Use vi.hoisted() so these are available inside the hoisted vi.mock factory.

const {
    mockEnergyBillFindMany,
    mockInvestmentFindFirst,
    mockConsumerUnitFindMany,
    mockInverterFindMany,
    mockGenerationUnitCount,
} = vi.hoisted(() => ({
    mockEnergyBillFindMany: vi.fn(),
    mockInvestmentFindFirst: vi.fn(),
    mockConsumerUnitFindMany: vi.fn(),
    mockInverterFindMany: vi.fn(),
    mockGenerationUnitCount: vi.fn(),
}))

vi.mock('@/lib/prisma', () => ({
    default: {
        energyBill: { findMany: mockEnergyBillFindMany },
        investment: { findFirst: mockInvestmentFindFirst },
        consumerUnit: { findMany: mockConsumerUnitFindMany },
        inverter: { findMany: mockInverterFindMany },
        generationUnit: { count: mockGenerationUnitCount },
    },
}))

// ── Auth / scope mocks ─────────────────────────────────────────────────────

vi.mock('@/backend/auth/middleware/auth.middleware', () => ({
    AuthMiddleware: {
        requireAuth: vi.fn(),
    },
}))

vi.mock('@/backend/controle/scope', () => ({
    resolveAccessibleUnitIds: vi.fn(),
}))

// ── Import after mocks ─────────────────────────────────────────────────────

import { AuthMiddleware } from '@/backend/auth/middleware/auth.middleware'
import { resolveAccessibleUnitIds } from '@/backend/controle/scope'
import { GET } from '../overview/route'

// ── Helpers ────────────────────────────────────────────────────────────────

const currentMonth = new Date().getMonth() + 1
const currentYear = new Date().getFullYear()

const mockUserContext = {
    userId: 'user-1',
    clientId: 'client-1',
    name: 'Test User',
    email: 'test@test.com',
    isAuthenticated: true,
    roles: ['user'],
    permissions: [] as string[],
    hasPermission: () => true,
    hasRole: () => true,
}

const mockConsumerUnitId = 'cu-1'

// ── Suite ──────────────────────────────────────────────────────────────────

describe('Controle Overview — status filter + pending count (A2)', () => {
    beforeEach(() => {
        vi.clearAllMocks()

        // Auth — always pass
        vi.mocked(AuthMiddleware.requireAuth).mockResolvedValue(mockUserContext as any)
        vi.mocked(resolveAccessibleUnitIds).mockResolvedValue('all')

        // Investment exists, no monthlyReturn override
        mockInvestmentFindFirst.mockResolvedValue({
            id: 'inv-1',
            clientId: 'client-1',
            totalInvested: 10000,
            startDate: new Date('2025-01-01'),
            expectedPayoff: null,
            monthlyReturn: null,
            deletedAt: null,
        })

        // One consumer unit
        mockConsumerUnitFindMany.mockResolvedValue([
            { id: mockConsumerUnitId, name: 'Unit 1', clientNumber: '12345' },
        ])

        // Three bills for the current month with different statuses:
        //   bill-1: status = 'confirmed'       -> active
        //   bill-2: status = 'pending_review'  -> inactive
        //   bill-3: status = null              -> active
        mockEnergyBillFindMany.mockResolvedValue([
            {
                id: 'bill-1',
                clientId: 'client-1',
                consumerUnitId: mockConsumerUnitId,
                referenceMonth: currentMonth,
                referenceYear: currentYear,
                estimatedSavings: 100,
                monitoredGenerationKwh: 50,
                consumptionKwh: 200,
                paymentStatus: 'paga',
                status: 'confirmed',
            },
            {
                id: 'bill-2',
                clientId: 'client-1',
                consumerUnitId: mockConsumerUnitId,
                referenceMonth: currentMonth,
                referenceYear: currentYear,
                estimatedSavings: 200,
                monitoredGenerationKwh: 100,
                consumptionKwh: 300,
                paymentStatus: 'a_pagar',
                status: 'pending_review',
            },
            {
                id: 'bill-3',
                clientId: 'client-1',
                consumerUnitId: mockConsumerUnitId,
                referenceMonth: currentMonth,
                referenceYear: currentYear,
                estimatedSavings: 300,
                monitoredGenerationKwh: 150,
                consumptionKwh: 400,
                paymentStatus: 'paga',
                status: null,
            },
        ])

        // No client inverters → zero manual_pending generation units
        mockInverterFindMany.mockResolvedValue([])
        mockGenerationUnitCount.mockResolvedValue(0)
    })

    // ── Status filter ──────────────────────────────────────────────────────

    it('excludes pending_review bills from month aggregates', async () => {
        const request = new NextRequest('http://localhost:3000/api/controle/overview')
        const response = await GET(request)
        const body = await response.json()

        expect(body.success).toBe(true)

        // confirmed(100) + null(300) = 400; pending_review(200) excluded
        expect(body.data.month.moneySaved).toBe(400)
        // confirmed(50) + null(150) = 200; pending_review(100) excluded
        expect(body.data.month.energyGeneratedKwh).toBe(200)
        // confirmed(200) + null(400) = 600; pending_review(300) excluded
        expect(body.data.month.energyConsumedKwh).toBe(600)
    })

    it('includes paid-status bills in month aggregates', async () => {
        // Override bills to include a 'paid' status bill alongside others
        mockEnergyBillFindMany.mockResolvedValue([
            {
                id: 'bill-paid',
                clientId: 'client-1',
                consumerUnitId: mockConsumerUnitId,
                referenceMonth: currentMonth,
                referenceYear: currentYear,
                estimatedSavings: 150,
                monitoredGenerationKwh: 75,
                consumptionKwh: 250,
                paymentStatus: 'paga',
                status: 'paid',
            },
            {
                id: 'bill-pending',
                clientId: 'client-1',
                consumerUnitId: mockConsumerUnitId,
                referenceMonth: currentMonth,
                referenceYear: currentYear,
                estimatedSavings: 200,
                monitoredGenerationKwh: 100,
                consumptionKwh: 300,
                paymentStatus: 'a_pagar',
                status: 'pending_review',
            },
        ])

        const request = new NextRequest('http://localhost:3000/api/controle/overview')
        const response = await GET(request)
        const body = await response.json()

        // paid(150) included, pending_review(200) excluded
        expect(body.data.month.moneySaved).toBe(150)
        expect(body.data.month.energyGeneratedKwh).toBe(75)
    })

    it('excludes pending_review bills from lifetime aggregates', async () => {
        const request = new NextRequest('http://localhost:3000/api/controle/overview')
        const response = await GET(request)
        const body = await response.json()

        // totalGeneratedKwh: confirmed(50) + null(150) = 200
        expect(body.data.lifetime.totalGeneratedKwh).toBe(200)
        // totalReturn: confirmed(100) + null(300) = 400
        expect(body.data.lifetime.totalReturn).toBe(400)
    })

    // ── Pending validation count ───────────────────────────────────────────

    it('reports pendingValidationCount = 1 (one pending_review bill)', async () => {
        const request = new NextRequest('http://localhost:3000/api/controle/overview')
        const response = await GET(request)
        const body = await response.json()

        // 1 pending_review bill + 0 manual_pending generation units
        expect(body.data.pendingValidationCount).toBe(1)
    })

    it('counts manual_pending generation units toward pendingValidationCount', async () => {
        // Simulate one client inverter with a manual_pending generation unit
        mockInverterFindMany.mockResolvedValue([{ id: 'inv-1' }])
        mockGenerationUnitCount.mockResolvedValue(1)

        const request = new NextRequest('http://localhost:3000/api/controle/overview')
        const response = await GET(request)
        const body = await response.json()

        // 1 pending_review bill + 1 manual_pending gen unit = 2
        expect(body.data.pendingValidationCount).toBe(2)
    })
})
