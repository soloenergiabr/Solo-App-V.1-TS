export type BillPaymentStatus = 'a_pagar' | 'paga' | 'vencida'

export interface AccountBill {
    id: string
    consumerUnitId: string
    consumerUnitName: string
    distributor: string | null
    accountNumber: string | null
    referenceMonth: number
    referenceYear: number
    amountDue: number
    dueDate: string | null
    paidAt: string | null
    paymentStatus: BillPaymentStatus
    pixCode: string | null
    barcode: string | null
    billFileUrl: string | null
    estimatedSavings: number
    titularName: string | null
    payerName: string | null
    aiAnalysis: string | null
    // Cost breakdown fields (optional — populated when available from EnergyBill)
    energyCost?: number | null
    tariffTusdValue?: number | null
    tariffTeValue?: number | null
    icmsCost?: number | null
    publicLightingCost?: number | null
    tariffFlag?: string | null
    tariffFlagCost?: number | null
}

export interface RateioSlice {
    toUnitId: string
    toUnitName: string
    percentage: number
}

export interface InvestmentSummary {
    totalInvested: number
    returned: number
    expectedPayoffLabel: string | null
    monthsActive: number
}

export interface EconomyConsolidated {
    wouldPay: number
    actuallyPay: number
    savedAmount: number
    savedPercent: number
    creditsKwh: number
}

export interface ControleOverview {
    clientName: string
    pendingValidationCount: number
    investment: InvestmentSummary
    month: {
        moneySaved: number
        energyGeneratedKwh: number
        energyConsumedKwh: number
        returnVsInvestment: number
        monthChangePercent: number
    }
    lifetime: {
        totalGeneratedKwh: number
        totalReturn: number
        monthsActive: number
        co2AvoidedTons: number
    }
    accounts: Array<{ id: string; name: string; status: 'ok' | 'warning' | 'critical' | 'unknown' }>
    liveGenerationKw: number
}
