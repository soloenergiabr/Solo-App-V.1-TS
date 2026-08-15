/**
 * Geracao distribuida — contratos compartilhados entre backend e frontend.
 *
 * O titular (ex: dono do predio) recebe as faturas de todas as UCs, rateia a
 * energia gerada (ver `CreditAllocation`) e define, por UC, QUEM paga e QUANTO
 * paga. Uma `Charge` e o que o responsavel deve ao titular — nao ha
 * processamento de pagamento no app, apenas calculo, envio e baixa.
 */

export type ChargeMode = 'pass_through' | 'per_kwh' | 'fixed'

export type ChargeStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'canceled'

export type PayerInviteStatus = 'pending' | 'accepted' | 'revoked'

export const CHARGE_MODE_LABEL: Record<ChargeMode, string> = {
    pass_through: 'Repassar a fatura',
    per_kwh: 'Por energia fornecida',
    fixed: 'Valor fixo',
}

export const CHARGE_MODE_HINT: Record<ChargeMode, string> = {
    pass_through: 'O responsavel paga exatamente o valor da fatura da distribuidora.',
    per_kwh: 'O valor vem da energia compensada no mes multiplicada pelo preco que voce define.',
    fixed: 'O responsavel paga o mesmo valor todo mes, independente do consumo.',
}

export interface ChargeRuleDTO {
    id: string
    consumerUnitId: string
    consumerUnitName: string
    mode: ChargeMode
    pricePerKwh: number | null
    fixedAmount: number | null
    dueDayOfMonth: number | null
    isActive: boolean
    notes: string | null
    /** Responsavel atual da UC, para a tela nao precisar de um segundo fetch. */
    payerName: string | null
    payerEmail: string | null
    payerUserId: string | null
    hasPayerLogin: boolean
}

export interface ChargeDTO {
    id: string
    consumerUnitId: string
    consumerUnitName: string
    referenceMonth: number
    referenceYear: number
    mode: ChargeMode
    basisKwh: number | null
    pricePerKwh: number | null
    amount: number
    dueDate: string | null
    status: ChargeStatus
    payerName: string | null
    payerEmail: string | null
    sentAt: string | null
    paidAt: string | null
    notes: string | null
    /** Fatura da distribuidora que originou a cobranca, quando houver. */
    energyBillId: string | null
    billAmountDue: number | null
}

export interface PayerInviteDTO {
    id: string
    consumerUnitId: string
    consumerUnitName: string
    name: string
    email: string
    status: PayerInviteStatus
    expiresAt: string
    acceptedAt: string | null
    createdAt: string
}

/** Resumo do mes para o painel de recebiveis do titular. */
export interface ChargeSummary {
    referenceMonth: number
    referenceYear: number
    totalCharged: number
    totalPaid: number
    totalOpen: number
    totalOverdue: number
    chargeCount: number
    paidCount: number
}

export interface GdOverview {
    summary: ChargeSummary
    charges: ChargeDTO[]
}
