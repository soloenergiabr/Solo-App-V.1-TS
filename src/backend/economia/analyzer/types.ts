import { Buffer } from 'buffer';

/* ------------------------------------------------------------------ */
/*  Sub-types for structured bill data                                 */
/* ------------------------------------------------------------------ */

export interface RawBillLineItem {
  description: string
  quantity_kwh?: number | null
  unit_price?: number | null
  total_value: number
  icms_base?: number | null
  icms_rate?: number | null
  icms_value?: number | null
  is_credit?: boolean | null
}

export interface RawCreditSummary {
  injected_kwh?: number | null
  used_kwh?: number | null
  balance_kwh?: number | null
  expiring_kwh?: number | null
}

export interface RawExtraCharge {
  description: string
  value: number
  type: 'service' | 'installment'
  remaining_installments?: number | null
}

/* ------------------------------------------------------------------ */
/*  Raw data extracted from a bill PDF                                */
/* ------------------------------------------------------------------ */

export interface RawBillData {
  referenceMonth: number
  referenceYear: number
  competenceDate: string | null
  accountHolder: string | null
  accountNumber: string | null
  clientNumber: string | null
  instalationNumber: string | null
  distributor: string | null
  consumerClass: string | null
  tariffModality: string | null
  connectionType: string | null
  tariffPeriod: string | null
  billingDays: number | null
  readingPeriodFrom: string | null
  readingPeriodTo: string | null
  creditExpiryDate: string | null
  monitoredGenerationKwh: number | null
  billedConsumptionKwh: number | null
  consumptionKwh: number | null
  realConsumptionKwh: number | null
  injectedEnergyKwh: number | null
  compensatedEnergyKwh: number | null
  previousCreditsKwh: number | null
  currentCreditsKwh: number | null
  expectedGenerationKwh: number | null
  generationEfficiency: number | null
  meterReadingCurrent: number | null
  meterReadingPrevious: number | null
  demandContractedKw: number | null
  demandMeasuredKw: number | null
  totalBillValue: number | null
  totalAmount: number | null
  energyCost: number | null
  availabilityCost: number | null
  publicLightingCost: number | null
  icmsCost: number | null
  pisCost: number | null
  cofinsCost: number | null
  pisCofinsCost: number | null
  tariffPerKwh: number | null
  tariffTeValue: number | null
  tariffTusdValue: number | null
  tariffFlag: string | null
  tariffFlagCost: number | null
  sectoralCharges: number | null
  fineAmount: number | null
  interestAmount: number | null
  otherCharges: number | null
  estimatedSavings: number | null
  // Typed structured fields (canonical — populated by mapRawToBillJson or AI analysis)
  billingItems: RawBillLineItem[]
  creditSummary: RawCreditSummary
  extraCharges: RawExtraCharge[]
  alerts: unknown[]
  // Raw snake_case source fields extracted verbatim by the model (used by mapRawToBillJson)
  billing_table_items?: RawBillLineItem[]
  scee_injected_kwh?: number | null
  scee_used_kwh?: number | null
  scee_balance_kwh?: number | null
  scee_expiring_kwh?: number | null
  service_items?: Array<{ description: string; value: number }>
  installment_items?: Array<{ description: string; value: number; remaining_installments?: number | null }>
  aiAnalysis: string | null
  aiExplanations: Record<string, unknown>
  aiRecommendations: unknown[]
  billScore: number | null
}

/* ------------------------------------------------------------------ */
/*  Deterministic (math-based) flags                                   */
/* ------------------------------------------------------------------ */

export interface DeterministicBillFlags {
  minimumKwh: number
  solarCoveredMinimum: boolean
  extraChargesTotal: number
  estimatedSavings: number | null
  billScore: number
  connectionType: string | null
}

/* ------------------------------------------------------------------ */
/*  AI-powered specialist analysis                                     */
/* ------------------------------------------------------------------ */

export interface SpecialistAnalysis {
  aiAnalysis: string | null
  aiExplanations: Record<string, unknown>
  aiRecommendations: unknown[]
  alerts: unknown[]
  billingItems: unknown[]
  creditSummary: Record<string, unknown>
  extraCharges: unknown[]
  billScore: number | null
  estimatedSavings: number | null
}

/* ------------------------------------------------------------------ */
/*  Analyzer contract                                                  */
/* ------------------------------------------------------------------ */

export interface BillAnalyzer {
  extract(input: { buffer: Buffer; mimeType: string }): Promise<RawBillData>
  analyze(input: { raw: RawBillData; flags: DeterministicBillFlags }): Promise<SpecialistAnalysis>
}

/* ------------------------------------------------------------------ */
/*  Error type                                                         */
/* ------------------------------------------------------------------ */

export class AnalyzerError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message)
    this.name = 'AnalyzerError'
  }
}
