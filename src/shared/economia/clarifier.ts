export interface ClarifierInput {
  totalPaid: number
  availabilityCost: number
  publicLightingCost: number
  extraCharges: { value: number }[]
  otherCharges: number
  monitoredGenerationKwh: number
  injectedEnergyKwh: number
  compensatedEnergyKwh: number
  currentCreditsKwh: number
  billedConsumptionKwh: number
  expectedGenerationKwh: number
  connectionType: string | null
}

export interface ClarifierResult {
  totalPaid: number
  minimumPossible: number
  availabilityCost: number
  publicLightingCost: number
  uncompensatedCost: number
  extraChargesTotal: number
  generated: number
  injected: number
  compensated: number
  creditsBalance: number
  expectedGeneration: number
  actualGeneration: number
  systemStatus: 'adequate' | 'slightly_below' | 'below_needed'
  extraGenerationNeeded: number
  expansionKwp?: number
  expansionModules?: number
}

function toNumber(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const n = Number(value)
    return Number.isFinite(n) ? n : fallback
  }
  return fallback
}

export function computeClarifier(input: ClarifierInput): ClarifierResult {
  const availabilityCost = toNumber(input.availabilityCost, 0)
  const publicLightingCost = toNumber(input.publicLightingCost, 0)
  const extraChargesArray = Array.isArray(input.extraCharges) ? input.extraCharges : []
  const extraChargesFromItems = extraChargesArray.reduce((sum, c) => sum + (c.value || 0), 0)
  // Use other_charges as fallback when extra_charges aren't individually itemized
  const extraChargesTotal = extraChargesFromItems > 0 ? extraChargesFromItems : toNumber(input.otherCharges, 0)
  // Minimum = availability (min kWh by connection type) + CIP + extra charges (services/installments)
  const minimumPossible = availabilityCost + publicLightingCost + extraChargesTotal
  const totalPaid = toNumber(input.totalPaid, 0)
  const uncompensatedCost = Math.max(0, totalPaid - minimumPossible)

  const generated = toNumber(input.monitoredGenerationKwh, 0)
  const injected = toNumber(input.injectedEnergyKwh, 0)
  const compensated = toNumber(input.compensatedEnergyKwh, 0)
  const creditsBalance = toNumber(input.currentCreditsKwh, 0)

  const expectedGeneration = toNumber(input.expectedGenerationKwh, 0) || generated
  const billedConsumption = toNumber(input.billedConsumptionKwh, 0)
  const geracaoNecessaria = Math.max(0, billedConsumption - compensated)

  let systemStatus: ClarifierResult['systemStatus'] = 'adequate'
  if (generated >= geracaoNecessaria) {
    systemStatus = 'adequate'
  } else if (generated >= geracaoNecessaria * 0.8) {
    systemStatus = 'slightly_below'
  } else {
    systemStatus = 'below_needed'
  }

  const extraGenerationNeeded = Math.max(0, geracaoNecessaria - generated)
  const expansionKwp = extraGenerationNeeded > 0 ? extraGenerationNeeded / 150 : undefined
  const expansionModules = expansionKwp ? Math.ceil(expansionKwp / 0.4) : undefined

  return {
    totalPaid,
    minimumPossible,
    availabilityCost,
    publicLightingCost,
    uncompensatedCost,
    extraChargesTotal,
    generated,
    injected,
    compensated,
    creditsBalance,
    expectedGeneration,
    actualGeneration: generated,
    systemStatus,
    extraGenerationNeeded,
    expansionKwp,
    expansionModules,
  }
}
