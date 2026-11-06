import { describe, expect, it } from 'vitest'
import { mapFaturapiParsedToBill } from '../faturapi-parsed'

describe('mapFaturapiParsedToBill', () => {
    it('mapeia o parsed (schemaVersion 1) para os campos da EnergyBill', () => {
        const fields = mapFaturapiParsedToBill({
            schemaVersion: 1,
            customer: { consumerClass: 'B1 RESIDENCIAL-CONV.' },
            identification: { billingDays: 28, previousReadingDate: '2026-09-10', currentReadingDate: '2026-10-08' },
            consumption: { totalKwh: 194, billedKwh: 194, peakKwh: null },
            charges: { energy: 49.25, publicLighting: 12.58, fine: 1.04, interest: null, rateTe: 0.21326, rateTusd: 0.48849, sectorCharges: null },
            tariffFlag: { flag: 'AMARELA', value: 3.41 },
            demand: { contractedKw: null, measuredPeakKw: null },
            distributedGeneration: { compensatedKwh: 164, creditBalanceKwh: 2190.4 },
        })

        expect(fields).toEqual({
            consumerClass: 'B1 RESIDENCIAL-CONV.',
            billingDays: 28,
            readingPeriodFrom: new Date('2026-09-10'),
            readingPeriodTo: new Date('2026-10-08'),
            consumptionKwh: 194,
            billedConsumptionKwh: 194,
            compensatedEnergyKwh: 164,
            currentCreditsKwh: 2190.4,
            energyCost: 49.25,
            publicLightingCost: 12.58,
            fineAmount: 1.04,
            tariffTeValue: 0.21326,
            tariffTusdValue: 0.48849,
            tariffFlag: 'AMARELA',
            tariffFlagCost: 3.41,
        })
    })

    it('tolera parsed vazio ou malformado', () => {
        expect(mapFaturapiParsedToBill(null)).toEqual({})
        expect(mapFaturapiParsedToBill({ consumption: 'x', charges: [1] })).toEqual({})
    })
})
