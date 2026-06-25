import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// -- Mocks --
const mockFindUnique = vi.fn()
const mockChat = vi.fn()

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

vi.mock('@/backend/economia/analyzer', () => ({
    getBillAnalyzer: vi.fn(),
}))

// Import after mocks
const { AuthMiddleware } = await import('@/backend/auth/middleware/auth.middleware')
const { resolveAccessibleUnitIds } = await import('@/backend/controle/scope')
const { getBillAnalyzer } = await import('@/backend/economia/analyzer')

async function callPOST(
    billId: string,
    body: Record<string, unknown>,
    overrides?: RequestInit,
) {
    const { POST } = await import('../chat/route')
    const request = new NextRequest(
        new Request(
            `http://localhost/api/economia/bills/${billId}/chat`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
                ...overrides,
            },
        ),
    )
    return POST(request, { params: Promise.resolve({ billId }) })
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
        clientId: 'client-1',
        referenceMonth: 4,
        referenceYear: 2026,
        totalBillValue: 450.75,
        amountDue: 450.75,
        availabilityCost: 50,
        publicLightingCost: 15,
        monitoredGenerationKwh: 400,
        injectedEnergyKwh: 350,
        compensatedEnergyKwh: 300,
        estimatedSavings: 85,
        consumptionKwh: 500,
        billedConsumptionKwh: 200,
        distributor: 'ENEL',
        tariffFlag: 'verde',
        tariffFlagCost: 0,
        icmsCost: 0,
        pisCost: 5,
        cofinsCost: 20,
        pisCofinsCost: 25,
        energyCost: 300,
        tariffTeValue: 0.4,
        tariffTusdValue: 0.3,
        tariffPerKwh: 0.7,
        dueDate: new Date('2026-04-20'),
        paidAt: null,
        paymentStatus: 'a_pagar',
        status: null,
        consumerUnit: mockConsumerUnit,
        ...overrides,
    }
}

function makeStreamResponse(text: string): ReadableStream<Uint8Array> {
    const encoder = new TextEncoder()
    return new ReadableStream({
        start(controller) {
            controller.enqueue(encoder.encode(text))
            controller.close()
        },
    })
}

describe('buildChatSystemPrompt', () => {
    it('includes distributor and total value in the prompt', async () => {
        const { buildChatSystemPrompt } = await import(
            '@/backend/economia/analyzer/chat-prompt'
        )

        const mockBill = {
            distributor: 'ENEL',
            totalBillValue: 200,
            referenceMonth: 4,
            referenceYear: 2026,
            availabilityCost: 50,
            publicLightingCost: 15,
            monitoredGenerationKwh: 300,
            injectedEnergyKwh: 250,
            compensatedEnergyKwh: 200,
            estimatedSavings: 80,
            consumptionKwh: 400,
            billedConsumptionKwh: 150,
            tariffFlag: 'verde',
            tariffFlagCost: 0,
            icmsCost: 0,
            pisCost: 3,
            cofinsCost: 12,
            pisCofinsCost: 15,
            energyCost: 250,
            tariffTeValue: 0.4,
            tariffTusdValue: 0.3,
            tariffPerKwh: 0.7,
        }

        const prompt = buildChatSystemPrompt(mockBill as any)

        expect(prompt).toContain('ENEL')
        expect(prompt).toContain('200')
        expect(prompt).toContain('4/2026')
        expect(prompt).toContain('SCEE')
        expect(prompt).toContain('ICMS')
        expect(prompt).toContain('PIS')
        expect(prompt).toContain('COFINS')
        expect(prompt).toContain('CIP')
        expect(prompt).toContain('TE')
        expect(prompt).toContain('TUSD')
        expect(prompt).toContain('Bandeira tarifaria')
        expect(prompt).toContain('Custo de disponibilidade')
    })
})

describe('POST /api/economia/bills/[billId]/chat', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(AuthMiddleware.requireAuth).mockResolvedValue(mockUserContext as never)
    })

    describe('authorization', () => {
        it('returns 401 when auth fails', async () => {
            vi.mocked(AuthMiddleware.requireAuth).mockRejectedValue(
                new Error('Authentication required'),
            )

            const res = await callPOST('bill-1', {
                messages: [{ role: 'user', content: 'Ola' }],
            })
            expect(res.status).toBe(401)
        })
    })

    describe('scope = all (titular/admin) — owner POST', () => {
        beforeEach(() => {
            vi.mocked(resolveAccessibleUnitIds).mockResolvedValue('all')
        })

        it('returns 200 + streaming response for the bill owner', async () => {
            mockFindUnique.mockResolvedValue(makePrismaBill())
            const mockAnalyzer = { chat: mockChat }
            vi.mocked(getBillAnalyzer).mockReturnValue(mockAnalyzer as never)
            mockChat.mockResolvedValue(makeStreamResponse('Resposta do assistente'))

            const res = await callPOST('bill-1', {
                messages: [{ role: 'user', content: 'Quanto economizei?' }],
            })

            expect(res.status).toBe(200)
            expect(res.headers.get('Content-Type')).toBe('text/plain; charset=utf-8')

            const text = await res.text()
            expect(text).toBe('Resposta do assistente')
            expect(mockChat).toHaveBeenCalledTimes(1)
        })

        it('returns 401 when bill belongs to another client (chat NOT called)', async () => {
            mockFindUnique.mockResolvedValue(
                makePrismaBill({ clientId: 'client-2' }),
            )
            const mockAnalyzer = { chat: mockChat }
            vi.mocked(getBillAnalyzer).mockReturnValue(mockAnalyzer as never)

            const res = await callPOST('bill-2', {
                messages: [{ role: 'user', content: 'Quanto economizei?' }],
            })

            expect(res.status).toBe(401)
            expect(mockChat).not.toHaveBeenCalled()
        })
    })

    describe('scope = unit list (payer)', () => {
        beforeEach(() => {
            vi.mocked(resolveAccessibleUnitIds).mockResolvedValue(['unit-1'])
        })

        it('returns 200 for an accessible unit', async () => {
            mockFindUnique.mockResolvedValue(makePrismaBill())
            const mockAnalyzer = { chat: mockChat }
            vi.mocked(getBillAnalyzer).mockReturnValue(mockAnalyzer as never)
            mockChat.mockResolvedValue(makeStreamResponse('Resposta'))

            const res = await callPOST('bill-1', {
                messages: [{ role: 'user', content: 'Quanto economizei?' }],
            })

            expect(res.status).toBe(200)
        })

        it('returns 401 when bill unit is not in scope', async () => {
            mockFindUnique.mockResolvedValue(
                makePrismaBill({ consumerUnitId: 'unit-2' }),
            )
            const mockAnalyzer = { chat: mockChat }
            vi.mocked(getBillAnalyzer).mockReturnValue(mockAnalyzer as never)

            const res = await callPOST('bill-1', {
                messages: [{ role: 'user', content: 'Quanto economizei?' }],
            })

            expect(res.status).toBe(401)
            expect(mockChat).not.toHaveBeenCalled()
        })
    })

    describe('not found', () => {
        it('returns 404 when bill does not exist', async () => {
            vi.mocked(resolveAccessibleUnitIds).mockResolvedValue('all')
            mockFindUnique.mockResolvedValue(null)

            const res = await callPOST('nonexistent', {
                messages: [{ role: 'user', content: 'Ola' }],
            })

            expect(res.status).toBe(404)
            const body = await res.json()
            expect(body.message).toBe('Fatura nao encontrada')
        })
    })

    describe('validation', () => {
        it('returns 400 when messages array is missing', async () => {
            vi.mocked(resolveAccessibleUnitIds).mockResolvedValue('all')
            mockFindUnique.mockResolvedValue(makePrismaBill())

            const res = await callPOST('bill-1', {})

            expect(res.status).toBe(400)
            const body = await res.json()
            expect(body.message).toBe('messages array required')
        })

        it('returns 400 when messages is not an array', async () => {
            vi.mocked(resolveAccessibleUnitIds).mockResolvedValue('all')
            mockFindUnique.mockResolvedValue(makePrismaBill())

            const res = await callPOST('bill-1', { messages: 'not-an-array' })

            expect(res.status).toBe(400)
            const body = await res.json()
            expect(body.message).toBe('messages array required')
        })
    })
})
