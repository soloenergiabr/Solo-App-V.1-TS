export interface BillDetail {
    id: string
    consumerUnitId: string
    consumerUnitName: string
    referenceMonth: number
    referenceYear: number
    amountDue: number
    dueDate: string | null
    paidAt: string | null
    paymentStatus: string
    status: string | null
    pixCode: string | null
    barcode: string | null
    billFileUrl: string | null
    estimatedSavings: number
    aiAnalysis: string | null
    aiExplanations: Record<string, unknown> | null
    alerts: unknown[] | null
    aiRecommendations: unknown[] | null
    billingItems: unknown[] | null
    creditSummary: Record<string, unknown> | null
    billScore: number | null
    titularName: string | null
    distributor: string | null
    // Clarifier / rich-analysis fields (Sprint 5 C1)
    totalAmount: number | null
    availabilityCost: number | null
    publicLightingCost: number | null
    monitoredGenerationKwh: number | null
    injectedEnergyKwh: number | null
    compensatedEnergyKwh: number | null
    currentCreditsKwh: number | null
    previousCreditsKwh: number | null
    billedConsumptionKwh: number | null
    expectedGenerationKwh: number | null
    generationEfficiency: number | null
    icmsCost: number | null
    pisCofinsCost: number | null
    tariffFlag: string | null
    fineAmount: number | null
    otherCharges: number | null
    connectionType: string | null
    consumerClass: string | null
    tariffPeriod: string | null
    readingPeriodFrom: string | null
    readingPeriodTo: string | null
    extraCharges: unknown[] | null
}
