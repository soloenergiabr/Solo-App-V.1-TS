import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// O link do convite e a unica credencial do pagador. Se ele sair com o host
// interno do container, o convite chega inutilizavel — dai este teste.

vi.mock('@/lib/prisma', () => ({
    default: { client: { findUnique: vi.fn().mockResolvedValue({ name: 'Afonso' }) } },
}))

vi.mock('@/backend/auth/middleware/auth.middleware', () => ({
    AuthMiddleware: { requireAuth: vi.fn() },
}))

vi.mock('@/backend/controle/scope', () => ({
    assertNotPayer: vi.fn(),
    PAYER_ROLE: 'payer',
}))

const mockInvitePayer = vi.fn()
vi.mock('@/backend/gd/gd.service', () => ({
    invitePayer: mockInvitePayer,
    listPayerInvites: vi.fn(),
    resolveGdClientId: vi.fn(() => 'client-1'),
}))

vi.mock('@/config', () => ({ config: { base_url: 'https://soloapp.com.br' } }))

const { AuthMiddleware } = await import('@/backend/auth/middleware/auth.middleware')

async function callPOST() {
    const { POST } = await import('../invites/route')
    const request = new NextRequest(
        new Request('http://app:3000/api/gd/invites', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                consumerUnitId: 'unit-1',
                name: 'Maria Souza',
                email: 'maria@email.com',
            }),
        }),
    )
    return POST(request)
}

describe('POST /api/gd/invites — base do link do convite', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(AuthMiddleware.requireAuth).mockResolvedValue({
            userId: 'user-1',
            clientId: 'client-1',
            hasRole: () => false,
        } as never)
        mockInvitePayer.mockResolvedValue({ id: 'inv-1', email: 'maria@email.com' })
    })

    it('usa config.base_url, nao a origin da requisicao', async () => {
        const res = await callPOST()
        expect(res.status).toBe(200)

        // A requisicao chegou como http://app:3000 (host interno atras do proxy).
        // O convite ainda assim precisa apontar para o dominio publico.
        expect(mockInvitePayer).toHaveBeenCalledWith(
            expect.objectContaining({ appUrl: 'https://soloapp.com.br' }),
        )
    })

    it('nunca deixa o host interno do container vazar para o link', async () => {
        await callPOST()

        const { appUrl } = mockInvitePayer.mock.calls[0][0]
        expect(appUrl).not.toContain('app:3000')
        expect(appUrl).toMatch(/^https:\/\//)
    })
})
