import { describe, it, expect } from 'vitest'
import { calcPaybackPercent, calcSavings } from './calc'

describe('calcPaybackPercent', () => {
    it('returns the percent of investment returned', () => {
        expect(calcPaybackPercent({ totalInvested: 50000, returned: 31000 })).toBe(62)
    })
    it('clamps to 100 when fully returned or more', () => {
        expect(calcPaybackPercent({ totalInvested: 50000, returned: 60000 })).toBe(100)
    })
    it('returns 0 when nothing returned', () => {
        expect(calcPaybackPercent({ totalInvested: 50000, returned: 0 })).toBe(0)
    })
    it('returns 0 when investment is zero (avoid divide-by-zero)', () => {
        expect(calcPaybackPercent({ totalInvested: 0, returned: 1000 })).toBe(0)
    })
})

describe('calcSavings', () => {
    it('returns amount saved and percent', () => {
        expect(calcSavings({ wouldPay: 1890, actuallyPay: 643 })).toEqual({
            amount: 1247,
            percent: 66,
        })
    })
    it('returns zeros when there is nothing that would be paid', () => {
        expect(calcSavings({ wouldPay: 0, actuallyPay: 0 })).toEqual({
            amount: 0,
            percent: 0,
        })
    })
})
