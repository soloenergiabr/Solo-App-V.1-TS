import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

const mockFindUnique = vi.fn()
const mockRequireAuth = vi.fn()
const mockResolveScope = vi.fn()
const mockSend = vi.fn()

vi.mock('@/lib/prisma', () => ({ default: { energyBill: { findUnique: mockFindUnique } } }))
vi.mock('@/backend/auth/middleware/auth.middleware', () => ({ AuthMiddleware: { requireAuth: mockRequireAuth } }))
vi.mock('@/backend/controle/scope', () => ({ resolveAccessibleUnitIds: mockResolveScope }))
vi.mock('@/backend/storage/s3-client', () => ({ getS3Client: () => ({ send: mockSend }) }))

const { GET } = await import('./route')

function user(overrides: { roles?: string[]; clientId?: string } = {}) {
    const roles = overrides.roles ?? ['user']
    return { userId: 'user-1', clientId: overrides.clientId ?? 'client-1', hasRole: (r: string) => roles.includes(r) }
}

const call = (billId = 'bill-1') =>
    GET(new NextRequest(`http://localhost/api/energy-bills/${billId}/file`), { params: Promise.resolve({ billId }) })

describe('GET /api/energy-bills/[billId]/file', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        mockFindUnique.mockResolvedValue({ clientId: 'client-1', consumerUnitId: 'cu-1', rawBillFileKey: 'energy-bills/a.pdf' })
        mockSend.mockResolvedValue({
            ContentType: 'application/pdf',
            Body: { transformToWebStream: () => new Blob(['%PDF-1.4']).stream() },
        })
    })

    it('entrega o PDF ao titular da fatura', async () => {
        mockRequireAuth.mockResolvedValue(user())
        mockResolveScope.mockResolvedValue('all')

        const res = await call()

        expect(res.status).toBe(200)
        expect(res.headers.get('content-type')).toBe('application/pdf')
        expect(await res.text()).toBe('%PDF-1.4')
        expect(mockSend.mock.calls[0][0].input).toMatchObject({ Key: 'energy-bills/a.pdf' })
    })

    it('admin master acessa fatura de qualquer cliente', async () => {
        mockRequireAuth.mockResolvedValue(user({ roles: ['master'], clientId: 'outro' }))

        const res = await call()

        expect(res.status).toBe(200)
        expect(mockResolveScope).not.toHaveBeenCalled()
    })

    it('responsavel (payer) so acessa faturas das proprias UCs', async () => {
        mockRequireAuth.mockResolvedValue(user({ clientId: 'client-1' }))
        mockResolveScope.mockResolvedValue(['cu-2'])

        const res = await call()

        expect(res.status).toBe(404)
        expect(mockSend).not.toHaveBeenCalled()
    })

    it('nega fatura de outro cliente', async () => {
        mockRequireAuth.mockResolvedValue(user({ clientId: 'client-2' }))
        mockResolveScope.mockResolvedValue('all')

        const res = await call()

        expect(res.status).toBe(404)
        expect(mockSend).not.toHaveBeenCalled()
    })

    it('404 quando a fatura nao tem arquivo', async () => {
        mockRequireAuth.mockResolvedValue(user())
        mockFindUnique.mockResolvedValue({ clientId: 'client-1', consumerUnitId: 'cu-1', rawBillFileKey: null })

        const res = await call()

        expect(res.status).toBe(404)
    })
})
