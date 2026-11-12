import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextRequest } from 'next/server'
import Stripe from 'stripe'

const mockFindUnique = vi.fn()
const mockUpdate = vi.fn()
const mockEmit = vi.fn()

vi.mock('@/lib/prisma', () => ({
    default: { charge: { findUnique: mockFindUnique, update: mockUpdate } },
}))
vi.mock('@/lib/mail', () => ({ sendMail: vi.fn() }))
vi.mock('@/backend/shared/event-bus', () => ({
    eventBus: { emit: mockEmit },
    EventType: { GD_CHARGE_PAID: 'gd.charge_paid' },
}))

const { POST } = await import('./route')

const SECRET = 'whsec_test_secret'

function event(type: string, session: Record<string, unknown>) {
    return JSON.stringify({
        id: 'evt_1',
        object: 'event',
        type,
        data: { object: { id: 'cs_1', object: 'checkout.session', payment_intent: null, ...session } },
    })
}

function request(body: string, signature?: string | null) {
    const headers: Record<string, string> = { 'content-type': 'application/json' }
    const sig = signature === undefined ? Stripe.webhooks.generateTestHeaderString({ payload: body, secret: SECRET }) : signature
    if (sig) headers['stripe-signature'] = sig
    return new NextRequest('http://localhost/api/webhooks/stripe', { method: 'POST', body, headers })
}

const paidSession = { payment_status: 'paid', metadata: { chargeId: 'charge_1' } }

describe('POST /api/webhooks/stripe', () => {
    beforeEach(() => {
        vi.stubEnv('STRIPE_SECRET_KEY', 'sk_test_dummy')
        vi.stubEnv('STRIPE_WEBHOOK_SECRET', SECRET)
        mockFindUnique.mockReset()
        mockUpdate.mockReset()
        mockEmit.mockReset()
        vi.spyOn(console, 'error').mockImplementation(() => {})
    })

    afterEach(() => {
        vi.unstubAllEnvs()
        vi.restoreAllMocks()
    })

    it('recusa assinatura invalida sem tocar no banco', async () => {
        const body = event('checkout.session.completed', paidSession)
        const res = await POST(request(body, 't=1,v1=deadbeef'))
        expect(res.status).toBe(400)
        expect(mockFindUnique).not.toHaveBeenCalled()
    })

    it('recusa requisicao sem assinatura', async () => {
        const res = await POST(request(event('checkout.session.completed', paidSession), null))
        expect(res.status).toBe(400)
    })

    it('responde 404 quando o Stripe nao esta configurado', async () => {
        vi.stubEnv('STRIPE_SECRET_KEY', '')
        const res = await POST(request(event('checkout.session.completed', paidSession)))
        expect(res.status).toBe(404)
    })

    it('baixa a cobranca paga, marcando o provedor', async () => {
        const charge = { id: 'charge_1', clientId: 'client_1', consumerUnitId: 'unit_1', status: 'sent', deletedAt: null }
        mockFindUnique.mockResolvedValue(charge)
        mockUpdate.mockResolvedValue({ ...charge, status: 'paid' })

        const res = await POST(request(event('checkout.session.completed', paidSession)))
        expect(res.status).toBe(200)
        expect((await res.json()).result).toBe('paid')

        const args = mockUpdate.mock.calls[0][0]
        expect(args.where).toEqual({ id: 'charge_1', status: { notIn: ['paid', 'canceled'] } })
        expect(args.data).toMatchObject({ status: 'paid', paymentProvider: 'stripe', confirmedByUserId: null })
        expect(mockEmit).toHaveBeenCalledTimes(1)
    })

    it('e idempotente: cobranca ja paga nao e baixada de novo', async () => {
        mockFindUnique.mockResolvedValue({ id: 'charge_1', clientId: 'client_1', status: 'paid', deletedAt: null })

        const res = await POST(request(event('checkout.session.async_payment_succeeded', paidSession)))
        expect(res.status).toBe(200)
        expect((await res.json()).result).toBe('ignored')
        expect(mockUpdate).not.toHaveBeenCalled()
        expect(mockEmit).not.toHaveBeenCalled()
    })

    it('e idempotente na corrida: outra entrega baixou entre a leitura e a escrita', async () => {
        mockFindUnique.mockResolvedValue({ id: 'charge_1', clientId: 'client_1', consumerUnitId: 'u', status: 'sent', deletedAt: null })
        mockUpdate.mockRejectedValue(Object.assign(new Error('Record not found'), { code: 'P2025' }))

        const res = await POST(request(event('checkout.session.completed', paidSession)))
        expect(res.status).toBe(200)
        expect((await res.json()).result).toBe('ignored')
        expect(mockEmit).not.toHaveBeenCalled()
    })

    it('nao baixa PIX ainda pendente na conclusao do Checkout', async () => {
        const res = await POST(
            request(event('checkout.session.completed', { ...paidSession, payment_status: 'unpaid' })),
        )
        expect(res.status).toBe(200)
        expect(mockFindUnique).not.toHaveBeenCalled()
    })

    it('ignora outros eventos com 200', async () => {
        const res = await POST(request(event('payment_intent.created', {})))
        expect(res.status).toBe(200)
        expect(mockFindUnique).not.toHaveBeenCalled()
    })
})
