import type { ChargeMode, ChargeStatus, ChargeSummary } from '@/shared/gd/types'

/**
 * Nucleo de calculo da geracao distribuida. Puro de proposito: nao toca Prisma,
 * nao formata moeda e nao conhece HTTP — assim a regra "quanto o responsavel
 * deve ao titular" fica testavel isolada do resto do app.
 */

export class ChargeCalculationError extends Error {
    constructor(message: string) {
        super(message)
        this.name = 'ChargeCalculationError'
    }
}

export interface ChargeRuleInput {
    mode: ChargeMode
    pricePerKwh?: number | null
    fixedAmount?: number | null
    dueDayOfMonth?: number | null
}

/** O que a fatura da distribuidora daquela UC/competencia entrega ao calculo. */
export interface BillBasis {
    amountDue?: number | null
    totalBillValue?: number | null
    compensatedEnergyKwh?: number | null
}

export interface ComputedCharge {
    mode: ChargeMode
    amount: number
    basisKwh: number | null
    pricePerKwh: number | null
}

/** Arredonda para centavos evitando o erro de ponto flutuante do `toFixed` direto. */
function roundCents(value: number): number {
    return Math.round((value + Number.EPSILON) * 100) / 100
}

function toNumber(value: number | null | undefined): number | null {
    if (value === null || value === undefined) return null
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
}

/**
 * Calcula o valor devido por uma unidade consumidora numa competencia.
 *
 * `bill` e obrigatorio para `pass_through` e `per_kwh` — os dois derivam da
 * fatura real do mes. `fixed` nao depende de fatura, entao o titular consegue
 * cobrar mesmo antes de a conta da distribuidora chegar.
 */
export function computeCharge(
    rule: ChargeRuleInput,
    bill: BillBasis | null,
): ComputedCharge {
    const basisKwh = toNumber(bill?.compensatedEnergyKwh)

    switch (rule.mode) {
        case 'pass_through': {
            if (!bill) {
                throw new ChargeCalculationError(
                    'Sem fatura da distribuidora nesta competencia para repassar. Envie a fatura antes de gerar a cobranca.',
                )
            }

            const amount = toNumber(bill.amountDue) ?? toNumber(bill.totalBillValue)
            if (amount === null) {
                throw new ChargeCalculationError(
                    'A fatura desta competencia esta sem valor a pagar. Revise a analise da fatura antes de repassar.',
                )
            }
            if (amount < 0) {
                throw new ChargeCalculationError('A fatura desta competencia tem valor negativo.')
            }

            return { mode: 'pass_through', amount: roundCents(amount), basisKwh, pricePerKwh: null }
        }

        case 'per_kwh': {
            const pricePerKwh = toNumber(rule.pricePerKwh)
            if (pricePerKwh === null) {
                throw new ChargeCalculationError(
                    'Defina o preco por kWh na regra de cobranca desta unidade.',
                )
            }
            if (pricePerKwh < 0) {
                throw new ChargeCalculationError('O preco por kWh nao pode ser negativo.')
            }
            if (basisKwh === null) {
                throw new ChargeCalculationError(
                    'A fatura desta competencia ainda nao tem energia compensada. Envie ou reanalise a fatura antes de cobrar por kWh.',
                )
            }
            if (basisKwh < 0) {
                throw new ChargeCalculationError(
                    'A energia compensada da fatura esta negativa. Revise a analise da fatura.',
                )
            }

            return {
                mode: 'per_kwh',
                amount: roundCents(basisKwh * pricePerKwh),
                basisKwh,
                pricePerKwh,
            }
        }

        case 'fixed': {
            const fixedAmount = toNumber(rule.fixedAmount)
            if (fixedAmount === null) {
                throw new ChargeCalculationError(
                    'Defina o valor fixo na regra de cobranca desta unidade.',
                )
            }
            if (fixedAmount < 0) {
                throw new ChargeCalculationError('O valor fixo nao pode ser negativo.')
            }

            return { mode: 'fixed', amount: roundCents(fixedAmount), basisKwh, pricePerKwh: null }
        }

        default: {
            const exhaustive: never = rule.mode
            throw new ChargeCalculationError(`Modo de cobranca desconhecido: ${String(exhaustive)}`)
        }
    }
}

/**
 * Vencimento da cobranca. O dia definido na regra vale para o mes SEGUINTE a
 * competencia — a fatura de julho so chega em agosto, entao e em agosto que o
 * responsavel paga. Sem dia na regra, herda o vencimento da propria fatura.
 */
export function resolveChargeDueDate(
    rule: Pick<ChargeRuleInput, 'dueDayOfMonth'>,
    billDueDate: Date | string | null,
    referenceYear: number,
    referenceMonth: number,
): Date | null {
    const day = rule.dueDayOfMonth

    if (day != null && Number.isFinite(day) && day >= 1 && day <= 31) {
        // competencia 12 rola para janeiro do ano seguinte
        const year = referenceMonth === 12 ? referenceYear + 1 : referenceYear
        const month = referenceMonth === 12 ? 1 : referenceMonth + 1
        // dia 0 do mes seguinte = ultimo dia do mes alvo
        const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate()
        return new Date(Date.UTC(year, month - 1, Math.min(day, lastDay)))
    }

    if (billDueDate) {
        const parsed = billDueDate instanceof Date ? billDueDate : new Date(billDueDate)
        return Number.isNaN(parsed.getTime()) ? null : parsed
    }

    return null
}

/**
 * Status efetivo da cobranca. `overdue` e derivado — nao precisa de job para
 * marcar vencimento, basta comparar com a data corrente na leitura.
 */
export function resolveChargeStatus(
    charge: { status: ChargeStatus; dueDate: string | Date | null; paidAt: string | Date | null },
    now: Date = new Date(),
): ChargeStatus {
    if (charge.status === 'canceled') return 'canceled'
    if (charge.paidAt || charge.status === 'paid') return 'paid'
    if (charge.status === 'draft') return 'draft'

    if (charge.dueDate) {
        const due = charge.dueDate instanceof Date ? charge.dueDate : new Date(charge.dueDate)
        if (!Number.isNaN(due.getTime()) && due < now) return 'overdue'
    }

    return charge.status
}

/** Consolida o mes para o painel de recebiveis do titular. */
export function summarizeCharges(
    charges: Array<{
        amount: number
        status: ChargeStatus
        dueDate: string | Date | null
        paidAt: string | Date | null
    }>,
    referenceYear: number,
    referenceMonth: number,
    now: Date = new Date(),
): ChargeSummary {
    const summary: ChargeSummary = {
        referenceMonth,
        referenceYear,
        totalCharged: 0,
        totalPaid: 0,
        totalOpen: 0,
        totalOverdue: 0,
        chargeCount: 0,
        paidCount: 0,
    }

    for (const charge of charges) {
        const status = resolveChargeStatus(charge, now)
        if (status === 'canceled') continue

        const amount = Number(charge.amount) || 0
        summary.chargeCount += 1
        summary.totalCharged += amount

        if (status === 'paid') {
            summary.totalPaid += amount
            summary.paidCount += 1
            continue
        }

        summary.totalOpen += amount
        if (status === 'overdue') summary.totalOverdue += amount
    }

    summary.totalCharged = roundCents(summary.totalCharged)
    summary.totalPaid = roundCents(summary.totalPaid)
    summary.totalOpen = roundCents(summary.totalOpen)
    summary.totalOverdue = roundCents(summary.totalOverdue)

    return summary
}
