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
}
