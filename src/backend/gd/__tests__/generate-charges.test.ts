import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockRuleFindMany = vi.fn()
const mockBillFindFirst = vi.fn()
const mockChargeFindUnique = vi.fn()
const mockChargeCreate = vi.fn()
const mockChargeUpdate = vi.fn()

vi.mock('@/lib/prisma', () => ({
    default: {
        chargeRule: { findMany: mockRuleFindMany },
        energyBill: { findFirst: mockBillFindFirst },
        charge: {
            findUnique: mockChargeFindUnique,
            create: mockChargeCreate,
            update: mockChargeUpdate,
        },
    },
}))

vi.mock('@/lib/mail', () => ({ sendMail: vi.fn() }))

const { generateCharges } = await import('../gd.service')

function makeRule(overrides: Record<string, unknown> = {}) {
    return {
        id: 'rule-1',
        clientId: 'client-1',
        mode: 'per_kwh',
        pricePerKwh: 0.8,
        fixedAmount: null,
        dueDayOfMonth: 10,
        consumerUnit: {
            id: 'unit-1',
            name: 'Apto 101',
            clientNumber: 'CN-1',
            deletedAt: null,
            payerUserId: 'payer-1',
            payerName: 'Maria',
            payerEmail: 'maria@email.com',
        },
        ...overrides,
    }
}

describe('generateCharges', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        mockChargeFindUnique.mockResolvedValue(null)
        mockChargeCreate.mockResolvedValue({ id: 'charge-1' })
        mockChargeUpdate.mockResolvedValue({ id: 'charge-1' })
    })

    it('cria a cobranca a partir da energia compensada da fatura', async () => {
        mockRuleFindMany.mockResolvedValue([makeRule()])
        mockBillFindFirst.mockResolvedValue({
            id: 'bill-1',
            amountDue: 500,
            totalBillValue: 500,
            compensatedEnergyKwh: 250,
            dueDate: new Date('2026-08-15'),
        })

        const result = await generateCharges('client-1', 2026, 7)

        expect(result.created).toBe(1)
        expect(result.errors).toHaveLength(0)

        const data = mockChargeCreate.mock.calls[0][0].data
        expect(data.amount).toBe(200) // 250 kWh * 0,80
        expect(data.basisKwh).toBe(250)
        expect(data.energyBillId).toBe('bill-1')
        expect(data.status).toBe('draft')
        // dia 10 da regra vale para o mes seguinte a competencia
        expect(data.dueDate.toISOString().slice(0, 10)).toBe('2026-08-10')
    })

    it('snapshota o responsavel da unidade na cobranca', async () => {
        mockRuleFindMany.mockResolvedValue([makeRule()])
        mockBillFindFirst.mockResolvedValue({
            id: 'bill-1',
            amountDue: 500,
            compensatedEnergyKwh: 100,
            dueDate: null,
        })

        await generateCharges('client-1', 2026, 7)

        const data = mockChargeCreate.mock.calls[0][0].data
        expect(data.payerUserId).toBe('payer-1')
        expect(data.payerName).toBe('Maria')
        expect(data.payerEmail).toBe('maria@email.com')
    })

    it('atualiza uma cobranca ainda em rascunho', async () => {
        mockRuleFindMany.mockResolvedValue([makeRule()])
        mockBillFindFirst.mockResolvedValue({
            id: 'bill-1',
            amountDue: 500,
            compensatedEnergyKwh: 300,
            dueDate: null,
        })
        mockChargeFindUnique.mockResolvedValue({ id: 'charge-existing', status: 'draft' })

        const result = await generateCharges('client-1', 2026, 7)

        expect(result.updated).toBe(1)
        expect(result.created).toBe(0)
        expect(mockChargeUpdate).toHaveBeenCalledWith(
            expect.objectContaining({ where: { id: 'charge-existing' } }),
        )
    })

    // O valor que o responsavel ja recebeu por e-mail nao muda pelas costas dele.
    it('nao mexe numa cobranca ja enviada', async () => {
        mockRuleFindMany.mockResolvedValue([makeRule()])
        mockBillFindFirst.mockResolvedValue({
            id: 'bill-1',
            amountDue: 500,
            compensatedEnergyKwh: 300,
            dueDate: null,
        })
        mockChargeFindUnique.mockResolvedValue({ id: 'charge-sent', status: 'sent' })

        const result = await generateCharges('client-1', 2026, 7)

        expect(result.skipped).toBe(1)
        expect(mockChargeUpdate).not.toHaveBeenCalled()
        expect(mockChargeCreate).not.toHaveBeenCalled()
    })

    it('nao mexe numa cobranca ja paga', async () => {
        mockRuleFindMany.mockResolvedValue([makeRule()])
        mockBillFindFirst.mockResolvedValue({
            id: 'bill-1',
            amountDue: 500,
            compensatedEnergyKwh: 300,
            dueDate: null,
        })
        mockChargeFindUnique.mockResolvedValue({ id: 'charge-paid', status: 'paid' })

        const result = await generateCharges('client-1', 2026, 7)

        expect(result.skipped).toBe(1)
        expect(mockChargeCreate).not.toHaveBeenCalled()
    })

    it('cobra valor fixo mesmo sem fatura no mes', async () => {
        mockRuleFindMany.mockResolvedValue([
            makeRule({ mode: 'fixed', pricePerKwh: null, fixedAmount: 350 }),
        ])
        mockBillFindFirst.mockResolvedValue(null)

        const result = await generateCharges('client-1', 2026, 7)

        expect(result.created).toBe(1)
        expect(mockChargeCreate.mock.calls[0][0].data.amount).toBe(350)
    })

    it('reporta a unidade sem fatura em vez de derrubar o lote inteiro', async () => {
        mockRuleFindMany.mockResolvedValue([
            makeRule({ id: 'rule-ok', mode: 'fixed', pricePerKwh: null, fixedAmount: 100 }),
            makeRule({
                id: 'rule-bad',
                consumerUnit: {
                    id: 'unit-2',
                    name: 'Apto 202',
                    clientNumber: 'CN-2',
                    deletedAt: null,
                    payerUserId: null,
                    payerName: null,
                    payerEmail: null,
                },
            }),
        ])
        mockBillFindFirst.mockResolvedValue(null)

        const result = await generateCharges('client-1', 2026, 7)

        expect(result.created).toBe(1)
        expect(result.errors).toHaveLength(1)
        expect(result.errors[0].consumerUnitName).toBe('Apto 202')
        expect(result.errors[0].message).toMatch(/energia compensada/i)
    })

    it('repassa o valor da fatura no modo pass_through', async () => {
        mockRuleFindMany.mockResolvedValue([
            makeRule({ mode: 'pass_through', pricePerKwh: null, dueDayOfMonth: null }),
        ])
        mockBillFindFirst.mockResolvedValue({
            id: 'bill-1',
            amountDue: 432.1,
            totalBillValue: 432.1,
            compensatedEnergyKwh: 180,
            dueDate: new Date('2026-08-15'),
        })

        await generateCharges('client-1', 2026, 7)

        const data = mockChargeCreate.mock.calls[0][0].data
        expect(data.amount).toBe(432.1)
        // sem dia na regra, herda o vencimento da fatura
        expect(data.dueDate.toISOString().slice(0, 10)).toBe('2026-08-15')
    })
})
