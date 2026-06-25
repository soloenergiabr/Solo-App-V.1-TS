import { describe, it, expect } from 'vitest'
import { Prisma } from '@/app/generated/prisma'
import { mapRawToBillJson } from '../mapping'
import { RawBillData } from '../types'

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */

function makeEmptyRaw(overrides: Partial<RawBillData> = {}): RawBillData {
  return {
    referenceMonth: 1,
    referenceYear: 2026,
    competenceDate: null,
    accountHolder: null,
    accountNumber: null,
    clientNumber: null,
    instalationNumber: null,
    distributor: null,
    consumerClass: null,
    tariffModality: null,
    connectionType: null,
    tariffPeriod: null,
    billingDays: null,
    readingPeriodFrom: null,
    readingPeriodTo: null,
    creditExpiryDate: null,
    monitoredGenerationKwh: null,
    billedConsumptionKwh: null,
    consumptionKwh: null,
    realConsumptionKwh: null,
    injectedEnergyKwh: null,
    compensatedEnergyKwh: null,
    previousCreditsKwh: null,
    currentCreditsKwh: null,
    expectedGenerationKwh: null,
    generationEfficiency: null,
    meterReadingCurrent: null,
    meterReadingPrevious: null,
    demandContractedKw: null,
    demandMeasuredKw: null,
    totalBillValue: null,
    totalAmount: null,
    energyCost: null,
    availabilityCost: null,
    publicLightingCost: null,
    icmsCost: null,
    pisCost: null,
    cofinsCost: null,
    pisCofinsCost: null,
    tariffPerKwh: null,
    tariffTeValue: null,
    tariffTusdValue: null,
    tariffFlag: null,
    tariffFlagCost: null,
    sectoralCharges: null,
    fineAmount: null,
    interestAmount: null,
    otherCharges: null,
    estimatedSavings: null,
    billingItems: [],
    creditSummary: {},
    extraCharges: [],
    alerts: [],
    aiAnalysis: null,
    aiExplanations: {},
    aiRecommendations: [],
    billScore: null,
    ...overrides,
  }
}

/* ------------------------------------------------------------------ */
/*  Full-data scenario                                                  */
/* ------------------------------------------------------------------ */

describe('mapRawToBillJson — full data', () => {
  const raw = makeEmptyRaw({
    billing_table_items: [
      {
        description: 'Energia Consumida Faturada TE',
        quantity_kwh: 150,
        unit_price: 0.45,
        total_value: 67.5,
        icms_base: 67.5,
        icms_rate: 25,
        icms_value: 16.875,
        is_credit: false,
      },
      {
        description: 'Energia Atv Inj TE mUC',
        quantity_kwh: 80,
        unit_price: 0.45,
        total_value: -36.0,
        icms_base: null,
        icms_rate: null,
        icms_value: null,
        is_credit: true,
      },
    ],
    scee_injected_kwh: 120,
    scee_used_kwh: 80,
    scee_balance_kwh: 40,
    scee_expiring_kwh: 5,
    service_items: [
      { description: 'Seguro Residencial', value: 12.5 },
    ],
    installment_items: [
      {
        description: 'Parcelamento Normal 3/12',
        value: 45.0,
        remaining_installments: 9,
      },
    ],
  })

  it('billingItems is an array with two line items', () => {
    const result = mapRawToBillJson(raw)
    expect(Array.isArray(result.billingItems)).toBe(true)
    const items = result.billingItems as Array<unknown>
    expect(items).toHaveLength(2)
  })

  it('first billing item has correct shape', () => {
    const result = mapRawToBillJson(raw)
    const items = result.billingItems as unknown as Array<Record<string, unknown>>
    expect(items[0].description).toBe('Energia Consumida Faturada TE')
    expect(items[0].quantity_kwh).toBe(150)
    expect(items[0].unit_price).toBe(0.45)
    expect(items[0].total_value).toBe(67.5)
    expect(items[0].icms_rate).toBe(25)
    expect(items[0].is_credit).toBe(false)
  })

  it('second billing item is a credit', () => {
    const result = mapRawToBillJson(raw)
    const items = result.billingItems as unknown as Array<Record<string, unknown>>
    expect(items[1].is_credit).toBe(true)
    expect(items[1].total_value).toBe(-36.0)
  })

  it('creditSummary is built from scee_* fields', () => {
    const result = mapRawToBillJson(raw)
    const cs = result.creditSummary as Record<string, unknown>
    expect(cs.injected_kwh).toBe(120)
    expect(cs.used_kwh).toBe(80)
    expect(cs.balance_kwh).toBe(40)
    expect(cs.expiring_kwh).toBe(5)
  })

  it('extraCharges has length 2 with both types', () => {
    const result = mapRawToBillJson(raw)
    const charges = result.extraCharges as unknown as Array<Record<string, unknown>>
    expect(charges).toHaveLength(2)
  })

  it('service item is tagged type:service', () => {
    const result = mapRawToBillJson(raw)
    const charges = result.extraCharges as unknown as Array<Record<string, unknown>>
    const service = charges.find((c) => c.type === 'service')
    expect(service).toBeDefined()
    expect(service?.description).toBe('Seguro Residencial')
    expect(service?.value).toBe(12.5)
  })

  it('installment item is tagged type:installment with remaining_installments', () => {
    const result = mapRawToBillJson(raw)
    const charges = result.extraCharges as unknown as Array<Record<string, unknown>>
    const installment = charges.find((c) => c.type === 'installment')
    expect(installment).toBeDefined()
    expect(installment?.description).toBe('Parcelamento Normal 3/12')
    expect(installment?.value).toBe(45.0)
    expect(installment?.remaining_installments).toBe(9)
  })
})

/* ------------------------------------------------------------------ */
/*  Empty data scenario — all three must be Prisma.JsonNull             */
/* ------------------------------------------------------------------ */

describe('mapRawToBillJson — empty raw', () => {
  const raw = makeEmptyRaw()

  it('billingItems is Prisma.JsonNull when no line items', () => {
    const result = mapRawToBillJson(raw)
    expect(result.billingItems).toBe(Prisma.JsonNull)
  })

  it('creditSummary is Prisma.JsonNull when no scee fields and no creditSummary', () => {
    const result = mapRawToBillJson(raw)
    expect(result.creditSummary).toBe(Prisma.JsonNull)
  })

  it('extraCharges is Prisma.JsonNull when no service or installment items', () => {
    const result = mapRawToBillJson(raw)
    expect(result.extraCharges).toBe(Prisma.JsonNull)
  })
})

/* ------------------------------------------------------------------ */
/*  Typed billingItems fallback (already typed on raw)                  */
/* ------------------------------------------------------------------ */

describe('mapRawToBillJson — typed billingItems fallback', () => {
  it('falls back to raw.billingItems when billing_table_items is absent', () => {
    const raw = makeEmptyRaw({
      billingItems: [
        {
          description: 'Custo de Disponibilidade',
          total_value: 45.0,
          is_credit: false,
        },
      ],
    })
    const result = mapRawToBillJson(raw)
    const items = result.billingItems as unknown as Array<Record<string, unknown>>
    expect(items).toHaveLength(1)
    expect(items[0].description).toBe('Custo de Disponibilidade')
  })
})

/* ------------------------------------------------------------------ */
/*  Typed creditSummary fallback                                        */
/* ------------------------------------------------------------------ */

describe('mapRawToBillJson — typed creditSummary fallback', () => {
  it('falls back to raw.creditSummary when scee_* fields are absent', () => {
    const raw = makeEmptyRaw({
      creditSummary: {
        injected_kwh: 50,
        used_kwh: 30,
        balance_kwh: 20,
        expiring_kwh: null,
      },
    })
    const result = mapRawToBillJson(raw)
    const cs = result.creditSummary as Record<string, unknown>
    expect(cs.injected_kwh).toBe(50)
    expect(cs.used_kwh).toBe(30)
  })
})
