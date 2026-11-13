import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockFindUnique = vi.fn()
const mockUpdate = vi.fn()
const mockCreate = vi.fn()
const mockRetrieve = vi.fn()

vi.mock('@/lib/prisma', () => ({
    default: { charge: { findUnique: mockFindUnique, update: mockUpdate } },
}))
vi.mock('@/lib/mail', () => ({ sendMail: vi.fn() }))
vi.mock('../stripe', async (importOriginal) => ({
    ...(await importOriginal<typeof import('../stripe')>()),
    isOnlinePaymentEnabled: () => true,
    getStripe: () => ({ checkout: { sessions: { create: mockCreate, retrieve: mockRetrieve } } }),
}))

const { createChargeCheckout } = await import('../gd.service')

const charge = {
    id: 'charge_1',
    clientId: 'client_1',
    consumerUnitId: 'unit_1',
    consumerUnit: { name: 'Apto 101', clientNumber: null },
    referenceMonth: 10,
    referenceYear: 2026,
    amount: '187.35',
    status: 'sent',
    payerEmail: 'pagador@example.com',
    paymentSessionId: null as string | null,
    deletedAt: null,
}

describe('createChargeCheckout', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        mockCreate.mockResolvedValue({ id: 'cs_new', url: 'https://checkout.stripe.com/c/cs_new' })
    })

    it('cria a sessao em BRL com o valor em centavos, cartao e PIX', async () => {
        mockFindUnique.mockResolvedValue(charge)

        const res = await createChargeCheckout('charge_1', 'client_1', 'all', 'https://app.example.com/')
        expect(res.url).toBe('https://checkout.stripe.com/c/cs_new')

        const params = mockCreate.mock.calls[0][0]
        expect(params.line_items[0].price_data).toMatchObject({ currency: 'brl', unit_amount: 18735 })
        expect(params.allowed_payment_method_types).toEqual(['card', 'pix'])
        expect(params.metadata).toEqual({ chargeId: 'charge_1' })
        expect(params.success_url).toBe('https://app.example.com/consumo?tab=gd')
        expect(mockUpdate).toHaveBeenCalledWith({
            where: { id: 'charge_1' },
            data: { paymentProvider: 'stripe', paymentSessionId: 'cs_new' },
        })
    })

    it('cai para so cartao quando o Stripe recusa PIX', async () => {
        mockFindUnique.mockResolvedValue(charge)
        mockCreate.mockRejectedValueOnce(Object.assign(new Error('pix not enabled'), { name: 'StripeInvalidRequestError' }))

        await createChargeCheckout('charge_1', 'client_1', 'all', 'https://app.example.com')
        expect(mockCreate.mock.calls[1][0].allowed_payment_method_types).toEqual(['card'])
    })

    it('reaproveita uma sessao aberta e nao expirada com o mesmo valor', async () => {
        mockFindUnique.mockResolvedValue({ ...charge, paymentSessionId: 'cs_old' })
        mockRetrieve.mockResolvedValue({
            status: 'open',
            url: 'https://checkout.stripe.com/c/cs_old',
            amount_total: 18735,
            expires_at: Math.floor(Date.now() / 1000) + 3600,
        })

        const res = await createChargeCheckout('charge_1', 'client_1', 'all', 'https://app.example.com')
        expect(res.url).toBe('https://checkout.stripe.com/c/cs_old')
        expect(mockCreate).not.toHaveBeenCalled()
    })

    it('recusa cobranca de outra unidade para o pagador', async () => {
        mockFindUnique.mockResolvedValue(charge)
        await expect(createChargeCheckout('charge_1', 'client_1', ['unit_9'], 'https://app.example.com')).rejects.toThrow(/not found/)
    })

    it('recusa cobranca ja paga', async () => {
        mockFindUnique.mockResolvedValue({ ...charge, status: 'paid' })
        await expect(createChargeCheckout('charge_1', 'client_1', 'all', 'https://app.example.com')).rejects.toThrow(/já foi paga/)
    })
})
