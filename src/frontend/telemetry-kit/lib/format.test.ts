import { describe, it, expect } from 'vitest'
import { formatBRL, formatKwh, formatKw, formatPercent } from './format'

describe('formatBRL', () => {
    it('formats whole reais with R$ and pt-BR thousands', () => {
        expect(formatBRL(1247)).toBe('R$ 1.247')
    })
    it('rounds to whole reais by default', () => {
        expect(formatBRL(642.6)).toBe('R$ 643')
    })
    it('supports cents when asked', () => {
        expect(formatBRL(187.5, { cents: true })).toBe('R$ 187,50')
    })
})

describe('formatKwh', () => {
    it('formats kWh with pt-BR thousands and unit', () => {
        expect(formatKwh(18420)).toBe('18.420 kWh')
    })
    it('keeps one decimal when fractional', () => {
        expect(formatKwh(980.4)).toBe('980,4 kWh')
    })
})

describe('formatKw', () => {
    it('formats kW with one decimal', () => {
        expect(formatKw(3.4)).toBe('3,4 kW')
    })
})

describe('formatPercent', () => {
    it('formats an integer percent', () => {
        expect(formatPercent(62)).toBe('62%')
    })
    it('supports one decimal', () => {
        expect(formatPercent(1.3, { decimals: 1 })).toBe('1,3%')
    })
})
