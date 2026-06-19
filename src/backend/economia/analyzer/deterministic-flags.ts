import { DeterministicBillFlags, RawBillData } from './types'

/* ------------------------------------------------------------------ */
/*  Minimum availability kWh by connection type                         */
/* ------------------------------------------------------------------ */

const MINIMUM_KWH_MAP: Record<string, number> = {
  monofasico: 30,
  bifasico: 50,
  trifasico: 100,
}

function getMinimumKwh(connectionType: string | null): number {
  if (!connectionType) return 0
  return MINIMUM_KWH_MAP[connectionType.toLowerCase()] ?? 0
}

/* ------------------------------------------------------------------ */
/*  Extra-charge total (skip nulls)                                     */
/* ------------------------------------------------------------------ */

function sumExtraCharges(raw: RawBillData): number {
  let total = 0
  if (raw.tariffFlagCost != null) total += raw.tariffFlagCost
  if (raw.publicLightingCost != null) total += raw.publicLightingCost
  if (raw.fineAmount != null) total += raw.fineAmount
  if (raw.interestAmount != null) total += raw.interestAmount
  if (raw.otherCharges != null) total += raw.otherCharges
  return total
}

/* ------------------------------------------------------------------ */
/*  Bill score (0-100)                                                  */
/* ------------------------------------------------------------------ */

function computeBillScore(
  extraChargesTotal: number,
  solarCoveredMinimum: boolean,
  isOverdue?: boolean,
): number {
  let score = 100
  if (isOverdue) score -= 20
  if (extraChargesTotal > 50) score -= 10
  if (!solarCoveredMinimum) score -= 30
  return Math.max(0, Math.min(100, score))
}

/* ------------------------------------------------------------------ */
/*  Public API                                                          */
/* ------------------------------------------------------------------ */

export function computeDeterministicFlags(
  raw: RawBillData,
  isOverdue?: boolean,
): DeterministicBillFlags {
  const minimumKwh = getMinimumKwh(raw.connectionType)
  const compensatedEnergyKwh = raw.compensatedEnergyKwh ?? 0
  const solarCoveredMinimum = compensatedEnergyKwh >= minimumKwh
  const extraChargesTotal = sumExtraCharges(raw)
  const billScore = computeBillScore(
    extraChargesTotal,
    solarCoveredMinimum,
    isOverdue,
  )

  return {
    minimumKwh,
    solarCoveredMinimum,
    extraChargesTotal,
    estimatedSavings: raw.estimatedSavings,
    billScore,
    connectionType: raw.connectionType,
  }
}
