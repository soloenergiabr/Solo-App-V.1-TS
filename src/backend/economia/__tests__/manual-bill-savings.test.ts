import { describe, it, expect } from 'vitest'
import { computeFallbackSavings } from '../manual-bill-savings'

describe('computeFallbackSavings', () => {
  it('passes through explicit estimatedSavings unchanged', () => {
    const result = computeFallbackSavings({ estimatedSavings: 150.5 })
    expect(result).toBe(150.5)
  })

  it('computes savings from consumptionKwh * tariffPerKwh - totalBillValue', () => {
    const result = computeFallbackSavings({
      consumptionKwh: 500,
      tariffPerKwh: 0.90,
      totalBillValue: 300,
    })
    // 500 * 0.90 - 300 = 150
    expect(result).toBe(150)
  })

  it('clamps negative result to 0', () => {
    const result = computeFallbackSavings({
      consumptionKwh: 200,
      tariffPerKwh: 0.50,
      totalBillValue: 200,
    })
    // 200 * 0.50 - 200 = -100 -> clamped to 0
    expect(result).toBe(0)
  })

  it('returns null when tariffPerKwh is missing', () => {
    const result = computeFallbackSavings({
      consumptionKwh: 500,
      tariffPerKwh: null,
      totalBillValue: 300,
    })
    expect(result).toBeNull()
  })

  it('returns null when consumptionKwh is missing', () => {
    const result = computeFallbackSavings({
      consumptionKwh: null,
      tariffPerKwh: 0.90,
      totalBillValue: 300,
    })
    expect(result).toBeNull()
  })
})
