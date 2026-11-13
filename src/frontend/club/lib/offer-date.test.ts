import { describe, expect, it } from 'vitest'
import { formatOfferDay, offerDateInput } from './offer-date'

describe('datas de validade da oferta', () => {
    it('data pura (meia-noite UTC) não volta um dia', () => {
        expect(formatOfferDay('2026-09-01T00:00:00.000Z')).toBe('01/09/2026')
        expect(offerDateInput('2026-09-01T00:00:00.000Z')).toBe('2026-09-01')
    })
    it('datas gravadas pela API no fuso de Brasília', () => {
        expect(formatOfferDay('2026-09-01T03:00:00.000Z')).toBe('01/09/2026')
        // validTo = 31/12 23:59:59 -03:00
        expect(formatOfferDay('2027-01-01T02:59:59.000Z')).toBe('31/12/2026')
        expect(offerDateInput('2027-01-01T02:59:59.000Z')).toBe('2026-12-31')
    })
})
