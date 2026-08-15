import { describe, expect, it } from 'vitest'
import {
    computeCharge,
    resolveChargeDueDate,
    resolveChargeStatus,
    summarizeCharges,
    ChargeCalculationError,
} from './charge-calculator'

describe('computeCharge', () => {
    describe('pass_through', () => {
        it('repassa o valor devido da fatura da distribuidora', () => {
            const result = computeCharge(
                { mode: 'pass_through' },
                { amountDue: 432.1, compensatedEnergyKwh: 300 },
            )

            expect(result.amount).toBe(432.1)
            expect(result.mode).toBe('pass_through')
        })

        it('usa totalBillValue quando amountDue nao veio na extracao', () => {
            const result = computeCharge(
                { mode: 'pass_through' },
                { amountDue: null, totalBillValue: 289.55 },
            )

            expect(result.amount).toBe(289.55)
        })

        it('registra a energia compensada como base informativa', () => {
            const result = computeCharge(
                { mode: 'pass_through' },
                { amountDue: 100, compensatedEnergyKwh: 250.5 },
            )

            expect(result.basisKwh).toBe(250.5)
            expect(result.pricePerKwh).toBeNull()
        })

        it('falha quando nao ha fatura para repassar', () => {
            expect(() => computeCharge({ mode: 'pass_through' }, null)).toThrow(
                ChargeCalculationError,
            )
        })

        it('falha quando a fatura nao tem valor', () => {
            expect(() =>
                computeCharge({ mode: 'pass_through' }, { amountDue: null, totalBillValue: null }),
            ).toThrow(/sem valor/i)
        })
    })

    describe('per_kwh', () => {
        it('multiplica a energia compensada pelo preco do titular', () => {
            const result = computeCharge(
                { mode: 'per_kwh', pricePerKwh: 0.72 },
                { compensatedEnergyKwh: 250 },
            )

            expect(result.amount).toBe(180)
            expect(result.basisKwh).toBe(250)
            expect(result.pricePerKwh).toBe(0.72)
        })

        it('arredonda o valor para centavos', () => {
            const result = computeCharge(
                { mode: 'per_kwh', pricePerKwh: 0.834567 },
                { compensatedEnergyKwh: 137.4 },
            )

            // 137.4 * 0.834567 = 114.66950...
            expect(result.amount).toBe(114.67)
        })

        it('falha sem preco por kWh configurado', () => {
            expect(() =>
                computeCharge({ mode: 'per_kwh', pricePerKwh: null }, { compensatedEnergyKwh: 100 }),
            ).toThrow(/preco por kwh/i)
        })

        it('falha quando a fatura do mes ainda nao tem energia compensada', () => {
            expect(() =>
                computeCharge(
                    { mode: 'per_kwh', pricePerKwh: 0.8 },
                    { compensatedEnergyKwh: null },
                ),
            ).toThrow(/energia compensada/i)
        })

        it('aceita energia compensada zero e cobra zero', () => {
            const result = computeCharge(
                { mode: 'per_kwh', pricePerKwh: 0.8 },
                { compensatedEnergyKwh: 0 },
            )

            expect(result.amount).toBe(0)
        })
    })

    describe('fixed', () => {
        it('cobra o valor fixo independente da fatura', () => {
            const result = computeCharge({ mode: 'fixed', fixedAmount: 350 }, null)

            expect(result.amount).toBe(350)
            expect(result.basisKwh).toBeNull()
        })

        it('mantem a energia compensada como base informativa quando ha fatura', () => {
            const result = computeCharge(
                { mode: 'fixed', fixedAmount: 350 },
                { compensatedEnergyKwh: 410 },
            )

            expect(result.amount).toBe(350)
            expect(result.basisKwh).toBe(410)
        })

        it('falha sem valor fixo configurado', () => {
            expect(() => computeCharge({ mode: 'fixed', fixedAmount: null }, null)).toThrow(
                /valor fixo/i,
            )
        })

        it('falha com valor fixo negativo', () => {
            expect(() => computeCharge({ mode: 'fixed', fixedAmount: -10 }, null)).toThrow(
                /negativo/i,
            )
        })
    })
})

describe('resolveChargeDueDate', () => {
    it('usa o dia de vencimento da regra no mes seguinte a competencia', () => {
        const due = resolveChargeDueDate({ dueDayOfMonth: 10 }, null, 2026, 7)

        expect(due?.toISOString().slice(0, 10)).toBe('2026-08-10')
    })

    it('vira o ano quando a competencia e dezembro', () => {
        const due = resolveChargeDueDate({ dueDayOfMonth: 5 }, null, 2026, 12)

        expect(due?.toISOString().slice(0, 10)).toBe('2027-01-05')
    })

    it('encaixa o dia 31 no ultimo dia de um mes curto', () => {
        const due = resolveChargeDueDate({ dueDayOfMonth: 31 }, null, 2026, 1)

        expect(due?.toISOString().slice(0, 10)).toBe('2026-02-28')
    })

    it('herda o vencimento da fatura quando a regra nao define um dia', () => {
        const billDue = new Date('2026-08-15T00:00:00.000Z')
        const due = resolveChargeDueDate({ dueDayOfMonth: null }, billDue, 2026, 7)

        expect(due?.toISOString().slice(0, 10)).toBe('2026-08-15')
    })

    it('retorna null quando nao ha nem regra nem fatura com vencimento', () => {
        expect(resolveChargeDueDate({ dueDayOfMonth: null }, null, 2026, 7)).toBeNull()
    })
})

describe('resolveChargeStatus', () => {
    const now = new Date('2026-08-20T12:00:00.000Z')

    it('mantem paga quando ja houve baixa', () => {
        expect(
            resolveChargeStatus({ status: 'paid', dueDate: '2026-08-10', paidAt: '2026-08-09' }, now),
        ).toBe('paid')
    })

    it('marca como vencida a cobranca enviada e nao paga apos o vencimento', () => {
        expect(
            resolveChargeStatus({ status: 'sent', dueDate: '2026-08-10', paidAt: null }, now),
        ).toBe('overdue')
    })

    it('nao vence cobranca ainda em rascunho', () => {
        expect(
            resolveChargeStatus({ status: 'draft', dueDate: '2026-08-10', paidAt: null }, now),
        ).toBe('draft')
    })

    it('mantem enviada antes do vencimento', () => {
        expect(
            resolveChargeStatus({ status: 'sent', dueDate: '2026-08-25', paidAt: null }, now),
        ).toBe('sent')
    })

    it('nunca reabre uma cobranca cancelada', () => {
        expect(
            resolveChargeStatus({ status: 'canceled', dueDate: '2026-08-01', paidAt: null }, now),
        ).toBe('canceled')
    })
})

describe('summarizeCharges', () => {
    const now = new Date('2026-08-20T12:00:00.000Z')

    it('soma cobrado, pago, em aberto e vencido do periodo', () => {
        const summary = summarizeCharges(
            [
                { amount: 100, status: 'paid', dueDate: '2026-08-10', paidAt: '2026-08-05' },
                { amount: 200, status: 'sent', dueDate: '2026-08-10', paidAt: null }, // vencida
                { amount: 50, status: 'sent', dueDate: '2026-08-30', paidAt: null }, // em aberto
                { amount: 999, status: 'canceled', dueDate: '2026-08-10', paidAt: null },
            ],
            2026,
            8,
            now,
        )

        expect(summary.totalCharged).toBe(350)
        expect(summary.totalPaid).toBe(100)
        expect(summary.totalOverdue).toBe(200)
        expect(summary.totalOpen).toBe(250)
        expect(summary.chargeCount).toBe(3)
        expect(summary.paidCount).toBe(1)
    })

    it('devolve zeros para um periodo sem cobrancas', () => {
        const summary = summarizeCharges([], 2026, 8, now)

        expect(summary.totalCharged).toBe(0)
        expect(summary.chargeCount).toBe(0)
    })
})
