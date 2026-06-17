import { describe, it, expect } from 'vitest'
import { aggregateEconomy } from './aggregate'
import type { AccountBill } from '@/shared/controle/types'

const bill = (over: Partial<AccountBill>): AccountBill => ({
    id: 'b', consumerUnitId: 'u', consumerUnitName: 'UC', distributor: 'Enel', accountNumber: null,
    referenceMonth: 3, referenceYear: 2026, amountDue: 0, dueDate: null, paidAt: null,
    paymentStatus: 'a_pagar', pixCode: null, barcode: null, billFileUrl: null,
    estimatedSavings: 0, titularName: null, payerName: null, aiAnalysis: null, ...over,
})

describe('aggregateEconomy', () => {
    it('sums actually-paid and savings into would-pay + percent', () => {
        const result = aggregateEconomy([
            bill({ amountDue: 187, estimatedSavings: 410 }),
            bill({ amountDue: 142, estimatedSavings: 300 }),
        ])
        expect(result.actuallyPay).toBe(329)
        expect(result.savedAmount).toBe(710)
        expect(result.wouldPay).toBe(1039)
        expect(result.savedPercent).toBe(68)
    })
    it('returns zeros for no bills', () => {
        expect(aggregateEconomy([])).toEqual({ wouldPay: 0, actuallyPay: 0, savedAmount: 0, savedPercent: 0, creditsKwh: 0 })
    })
})
