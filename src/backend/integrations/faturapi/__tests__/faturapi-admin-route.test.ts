import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { z } from 'zod'

const mockRequireRole = vi.fn()
vi.mock('@/backend/auth/middleware/auth.middleware', () => ({ AuthMiddleware: { requireRole: mockRequireRole } }))
vi.mock('@/lib/prisma', () => ({ default: {} }))
vi.stubEnv('FATURAPI_KEY', 'fp_test')

const { faturapiAdminRoute, ok } = await import('../faturapi-admin-route')
const { FaturapiError } = await import('../faturapi.client')
const { FaturapiAdminError } = await import('../faturapi-admin.service')

const call = (handler: Parameters<typeof faturapiAdminRoute>[0]) =>
    faturapiAdminRoute(handler)(new NextRequest('http://localhost/api/admin/faturapi'), { params: Promise.resolve({ id: 'c1' }) })

describe('faturapiAdminRoute', () => {
    beforeEach(() => {
        mockRequireRole.mockReset().mockResolvedValue({})
        vi.spyOn(console, 'error').mockImplementation(() => {})
    })

    it('exige papel master', async () => {
        mockRequireRole.mockRejectedValue(new Error('User does not have role: master'))
        const handler = vi.fn()

        const res = await call(handler)

        expect(res.status).toBe(403)
        expect(handler).not.toHaveBeenCalled()
        expect(mockRequireRole).toHaveBeenCalledWith(expect.anything(), 'master')
    })

    it('401 sem token', async () => {
        mockRequireRole.mockRejectedValue(new Error('No valid authorization token provided'))
        expect((await call(vi.fn())).status).toBe(401)
    })

    it('entrega params e responde o envelope', async () => {
        const res = await call(async ({ params }) => ok(params, 201))
        expect(res.status).toBe(201)
        expect(await res.json()).toEqual({ success: true, data: { id: 'c1' } })
    })

    it.each([
        [new FaturapiAdminError(409, 'ja vinculada'), 409, 'ja vinculada'],
        [new FaturapiError(402, 'insufficient_credits', 'Sem saldo'), 402, '[Faturapi] 402 insufficient_credits: Sem saldo'],
        // Erro de chave da Faturapi nao pode parecer sessao expirada do admin.
        [new FaturapiError(401, 'unauthorized', 'chave'), 502, '[Faturapi] 401 unauthorized: chave'],
        [new FaturapiError(503, 'unavailable', 'fora'), 502, '[Faturapi] 503 unavailable: fora'],
    ])('traduz %s', async (error, status, message) => {
        const res = await call(async () => { throw error })
        expect(res.status).toBe(status)
        expect((await res.json()).message).toBe(message)
    })

    it('erro de validacao vira 400', async () => {
        const res = await call(async () => { z.object({ a: z.string() }).parse({}); return ok(null) })
        expect(res.status).toBe(400)
    })

    it('erro inesperado vira 500 sem vazar detalhes', async () => {
        const res = await call(async () => { throw new Error('segredo interno') })
        expect(res.status).toBe(500)
        expect((await res.json()).message).toBe('Erro interno')
    })
})
