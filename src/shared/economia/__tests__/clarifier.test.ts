import { describe, it, expect } from 'vitest'
import { computeClarifier } from '../clarifier'

const baseInput = {
  totalPaid: 0,
  availabilityCost: 0,
  publicLightingCost: 0,
  extraCharges: [] as { value: number }[],
  otherCharges: 0,
  monitoredGenerationKwh: 0,
  injectedEnergyKwh: 0,
  compensatedEnergyKwh: 0,
  currentCreditsKwh: 0,
  billedConsumptionKwh: 0,
  expectedGenerationKwh: 0,
  connectionType: null as string | null,
}

// (a) minimumPossible and uncompensatedCost with no extra charges
describe('computeClarifier — cost breakdown', () => {
  it('(a) computes minimumPossible and uncompensatedCost correctly', () => {
    const result = computeClarifier({
      ...baseInput,
      totalPaid: 200,
      availabilityCost: 50,
      publicLightingCost: 20,
    })
    expect(result.minimumPossible).toBe(70)
    expect(result.uncompensatedCost).toBe(130)
  })
})

// (b) adequate: generated >= geracaoNecessaria
describe('computeClarifier — systemStatus adequate', () => {
  it('(b) returns adequate when generated >= geracaoNecessaria, no expansion fields', () => {
    const result = computeClarifier({
      ...baseInput,
      billedConsumptionKwh: 300,
      compensatedEnergyKwh: 100,
      monitoredGenerationKwh: 200, // geracaoNecessaria = 300-100 = 200; generated 200 >= 200
    })
    expect(result.systemStatus).toBe('adequate')
    expect(result.extraGenerationNeeded).toBe(0)
    expect(result.expansionKwp).toBeUndefined()
    expect(result.expansionModules).toBeUndefined()
  })
})

// (c) slightly_below: generated between 80% and 100% of geracaoNecessaria
describe('computeClarifier — systemStatus slightly_below', () => {
  it('(c) returns slightly_below when generated is between 80% and 100% of geracaoNecessaria', () => {
    // geracaoNecessaria = 300 - 100 = 200; 80% = 160; generated 170 is between 160 and 200
    const result = computeClarifier({
      ...baseInput,
      billedConsumptionKwh: 300,
      compensatedEnergyKwh: 100,
      monitoredGenerationKwh: 170,
    })
    expect(result.systemStatus).toBe('slightly_below')
  })
})

// (d) below_needed: generated below 80% of geracaoNecessaria
describe('computeClarifier — systemStatus below_needed', () => {
  it('(d) returns below_needed with exact expansion numbers when generated < 80% of geracaoNecessaria', () => {
    // geracaoNecessaria = 300 - 100 = 200; 80% = 160; generated 100 < 160
    // extraGenerationNeeded = 200 - 100 = 100
    // expansionKwp = 100 / 150 ≈ 0.6667
    // expansionModules = ceil(0.6667 / 0.4) = ceil(1.6667) = 2
    const result = computeClarifier({
      ...baseInput,
      billedConsumptionKwh: 300,
      compensatedEnergyKwh: 100,
      monitoredGenerationKwh: 100,
    })
    expect(result.systemStatus).toBe('below_needed')
    expect(result.extraGenerationNeeded).toBe(100)
    expect(result.expansionKwp).toBeCloseTo(100 / 150, 10)
    expect(result.expansionModules).toBe(2)
  })
})

// (e) extraCharges sum used; falls back to otherCharges when sum is 0
describe('computeClarifier — extra charges fallback', () => {
  it('(e) uses sum of extraCharges[].value when non-zero', () => {
    const result = computeClarifier({
      ...baseInput,
      totalPaid: 200,
      availabilityCost: 50,
      publicLightingCost: 20,
      extraCharges: [{ value: 15 }, { value: 10 }],
      otherCharges: 999, // should be ignored
    })
    expect(result.extraChargesTotal).toBe(25)
    expect(result.minimumPossible).toBe(95) // 50 + 20 + 25
  })

  it('(e) falls back to otherCharges when extraCharges sum is 0', () => {
    const result = computeClarifier({
      ...baseInput,
      totalPaid: 200,
      availabilityCost: 50,
      publicLightingCost: 20,
      extraCharges: [],
      otherCharges: 30,
    })
    expect(result.extraChargesTotal).toBe(30)
    expect(result.minimumPossible).toBe(100) // 50 + 20 + 30
  })
})

// (f) null/undefined numeric inputs coerce to 0 without throwing
describe('computeClarifier — null/undefined coercion', () => {
  it('(f) coerces null/undefined numeric inputs to 0 without throwing', () => {
    expect(() => {
      computeClarifier({
        totalPaid: null as unknown as number,
        availabilityCost: undefined as unknown as number,
        publicLightingCost: null as unknown as number,
        extraCharges: null as unknown as { value: number }[],
        otherCharges: undefined as unknown as number,
        monitoredGenerationKwh: null as unknown as number,
        injectedEnergyKwh: undefined as unknown as number,
        compensatedEnergyKwh: null as unknown as number,
        currentCreditsKwh: undefined as unknown as number,
        billedConsumptionKwh: null as unknown as number,
        expectedGenerationKwh: undefined as unknown as number,
        connectionType: null,
      })
    }).not.toThrow()

    const result = computeClarifier({
      totalPaid: null as unknown as number,
      availabilityCost: undefined as unknown as number,
      publicLightingCost: null as unknown as number,
      extraCharges: null as unknown as { value: number }[],
      otherCharges: undefined as unknown as number,
      monitoredGenerationKwh: null as unknown as number,
      injectedEnergyKwh: undefined as unknown as number,
      compensatedEnergyKwh: null as unknown as number,
      currentCreditsKwh: undefined as unknown as number,
      billedConsumptionKwh: null as unknown as number,
      expectedGenerationKwh: undefined as unknown as number,
      connectionType: null,
    })
    expect(result.totalPaid).toBe(0)
    expect(result.minimumPossible).toBe(0)
    expect(result.systemStatus).toBe('adequate')
  })
})
