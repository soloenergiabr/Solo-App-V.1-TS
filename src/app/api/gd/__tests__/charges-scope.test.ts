import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// -- Mocks --
const mockChargeFindMany = vi.fn()

vi.mock('@/lib/prisma', () => ({
    default: {
        charge: { findMany: mockChargeFindMany },
    },
}))

vi.mock('@/backend/auth/middleware/auth.middleware', () => ({
    AuthMiddleware: { requireAuth: vi.fn() },
}))

vi.mock('@/backend/controle/scope', () => ({
    resolveAccessibleUnitIds: vi.fn(),
    assertNotPayer: vi.fn(),
    PAYER_ROLE: 'payer',
}))

const { AuthMiddleware } = await import('@/backend/auth/middleware/auth.middleware')
const { resolveAccessibleUnitIds } = await import('@/backend/controle/scope')

function makeContext(overrides: Record<string, unknown> = {}) {
    return {
        userId: 'user-1',
        clientId: 'client-1',
        hasRole: (role: string) => role === 'user',
        ...overrides,
    }
}

async function callGET(searchParams = 'year=2026&month=7') {
    const { GET } = await import('../charges/route')
    const request = new NextRequest(new Request(`http://localhost/api/gd/charges?${searchParams}`))
    return GET(request)
}

describe('GET /api/gd/charges', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(AuthMiddleware.requireAuth).mockResolvedValue(makeContext() as never)
        mockChargeFindMany.mockResolvedValue([])
    })

    it('escopa o titular pelo clientId', async () => {
        vi.mocked(resolveAccessibleUnitIds).mockResolvedValue('all')

        const res = await callGET()
        expect(res.status).toBe(200)

        const where = mockChargeFindMany.mock.calls[0][0].where
        expect(where).toHaveProperty('clientId', 'client-1')
        expect(where).not.toHaveProperty('consumerUnitId')
    })

    it('restringe o pagador as unidades dele', async () => {
        vi.mocked(resolveAccessibleUnitIds).mockResolvedValue(['unit-9'])

        const res = await callGET()
        expect(res.status).toBe(200)

        const where = mockChargeFindMany.mock.calls[0][0].where
        expect(where.consumerUnitId).toEqual({ in: ['unit-9'] })
        expect(where).not.toHaveProperty('clientId')
    })

    // Um pagador nao pode escapar do proprio escopo passando clientId na URL.
    it('ignora clientId da query quando quem chama e pagador', async () => {
        vi.mocked(resolveAccessibleUnitIds).mockResolvedValue(['unit-9'])

        const res = await callGET('year=2026&month=7&clientId=client-outro')
        expect(res.status).toBe(200)

        const where = mockChargeFindMany.mock.calls[0][0].where
        expect(where.consumerUnitId).toEqual({ in: ['unit-9'] })
        expect(where).not.toHaveProperty('clientId')
    })

    it('recusa um titular que tenta ler outro cliente', async () => {
        vi.mocked(resolveAccessibleUnitIds).mockResolvedValue('all')

        const res = await callGET('year=2026&month=7&clientId=client-outro')
        expect(res.status).toBe(400)

        const body = await res.json()
        expect(body.message).toMatch(/permissao/i)
    })

    it('deixa o admin (master) operar em nome de um cliente', async () => {
        vi.mocked(AuthMiddleware.requireAuth).mockResolvedValue(
            makeContext({ clientId: undefined, hasRole: (r: string) => r === 'master' }) as never,
        )
        vi.mocked(resolveAccessibleUnitIds).mockResolvedValue('all')

        const res = await callGET('year=2026&month=7&clientId=client-42')
        expect(res.status).toBe(200)

        const where = mockChargeFindMany.mock.calls[0][0].where
        expect(where).toHaveProperty('clientId', 'client-42')
    })

    it('usa a competencia informada', async () => {
        vi.mocked(resolveAccessibleUnitIds).mockResolvedValue('all')

        await callGET('year=2025&month=3')

        const where = mockChargeFindMany.mock.calls[0][0].where
        expect(where).toHaveProperty('referenceYear', 2025)
        expect(where).toHaveProperty('referenceMonth', 3)
    })

    it('retorna 401 quando a autenticacao falha', async () => {
        vi.mocked(AuthMiddleware.requireAuth).mockRejectedValue(new Error('Authentication required'))

        const res = await callGET()
        expect(res.status).toBe(401)
    })
})
