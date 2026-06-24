import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { AuthMiddleware } from '@/backend/auth/middleware/auth.middleware'
import { resolveAccessibleUnitIds } from '@/backend/controle/scope'
import { withHandle } from '@/app/api/api-utils'
import type { ControleOverview } from '@/shared/controle/types'

const getControleOverviewRoute = async (request: NextRequest): Promise<NextResponse> => {
    const userContext = await AuthMiddleware.requireAuth(request)

    // Server-enforced payer scope: payers see only the units they pay for.
    const scope = await resolveAccessibleUnitIds(userContext.userId)

    // Resolve the client. Titular/admin carry a clientId; a payer inherits it
    // from their assigned units.
    let clientId = userContext.clientId ?? new URL(request.url).searchParams.get('clientId') ?? undefined
    if (scope !== 'all' && !clientId) {
        const firstUnit = await prisma.consumerUnit.findFirst({
            where: { id: { in: scope } },
            select: { clientId: true },
        })
        clientId = firstUnit?.clientId ?? undefined
    }

    if (!clientId) {
        return NextResponse.json({ success: false, message: 'unauthorized' }, { status: 401 })
    }

    // Unit-level filter applied to every per-account query when the caller is a payer.
    const unitScopeWhere = scope === 'all' ? {} : { consumerUnitId: { in: scope } }

    // Fetch latest investment for client
    const investment = await prisma.investment.findFirst({
        where: { clientId, deletedAt: null },
        orderBy: { createdAt: 'desc' },
    })

    // Fetch energy bills for the accessible scope, newest first
    const allBills = await prisma.energyBill.findMany({
        where: { clientId, ...unitScopeWhere },
        orderBy: [{ referenceYear: 'desc' }, { referenceMonth: 'desc' }],
    })

    const now = new Date()
    const currentMonth = now.getMonth() + 1
    const currentYear = now.getFullYear()

    // Active-bill filter: pending_review bills are excluded from aggregates.
    // This status means the bill's data has not been validated yet.
    const isActiveBill = (b: { status: string | null }) =>
        b.status == null || b.status === 'confirmed' || b.status === 'paid'

    // ── Investment summary ────────────────────────────────────────────────────

    const totalInvested = Number(investment?.totalInvested ?? 0)

    // monthsActive = full calendar months elapsed since startDate
    let monthsActive = 0
    if (investment?.startDate) {
        const start = new Date(investment.startDate)
        monthsActive = Math.max(
            0,
            (currentYear - start.getFullYear()) * 12 + (currentMonth - (start.getMonth() + 1))
        )
    }

    // returned: use monthlyReturn override when available; else sum estimatedSavings
    // from bills whose (referenceYear, referenceMonth) >= investment startDate
    let returned = 0
    if (investment?.monthlyReturn) {
        returned = Number(investment.monthlyReturn) * monthsActive
    } else if (investment?.startDate) {
        const startYear = investment.startDate.getFullYear()
        const startMonth = investment.startDate.getMonth() + 1
        returned = allBills
            .filter(isActiveBill)
            .filter(
                (b) =>
                    b.referenceYear > startYear ||
                    (b.referenceYear === startYear && b.referenceMonth >= startMonth)
            )
            .reduce((sum, b) => sum + Number(b.estimatedSavings ?? 0), 0)
    }

    // expectedPayoffLabel: Portuguese locale date string, e.g. "janeiro de 2027"
    const expectedPayoffLabel =
        investment?.expectedPayoff
            ? new Date(investment.expectedPayoff).toLocaleDateString('pt-BR', {
                  month: 'long',
                  year: 'numeric',
              })
            : null

    // ── Month summary ─────────────────────────────────────────────────────────

    const currentMonthBills = allBills
        .filter(isActiveBill)
        .filter(
            (b) => b.referenceMonth === currentMonth && b.referenceYear === currentYear
        )

    const moneySaved = currentMonthBills.reduce(
        (sum, b) => sum + Number(b.estimatedSavings ?? 0),
        0
    )
    const energyGeneratedKwh = currentMonthBills.reduce(
        (sum, b) => sum + Number(b.monitoredGenerationKwh ?? 0),
        0
    )
    const energyConsumedKwh = currentMonthBills.reduce(
        (sum, b) => sum + Number(b.consumptionKwh ?? 0),
        0
    )
    const returnVsInvestment = moneySaved

    // Previous month for percent change
    let prevMonth = currentMonth - 1
    let prevYear = currentYear
    if (prevMonth === 0) {
        prevMonth = 12
        prevYear -= 1
    }
    const prevMonthBills = allBills
        .filter(isActiveBill)
        .filter(
            (b) => b.referenceMonth === prevMonth && b.referenceYear === prevYear
        )
    const prevMoneySaved = prevMonthBills.reduce(
        (sum, b) => sum + Number(b.estimatedSavings ?? 0),
        0
    )
    const monthChangePercent =
        prevMoneySaved > 0
            ? Math.round(((moneySaved - prevMoneySaved) / prevMoneySaved) * 100)
            : 0

    // ── Lifetime summary ──────────────────────────────────────────────────────

    const totalGeneratedKwh = allBills
        .filter(isActiveBill)
        .reduce(
        (sum, b) => sum + Number(b.monitoredGenerationKwh ?? 0),
        0
    )
    const totalReturn = allBills
        .filter(isActiveBill)
        .reduce(
        (sum, b) => sum + Number(b.estimatedSavings ?? 0),
        0
    )

    // Use investment monthsActive if available; otherwise count distinct (year, month) pairs
    const lifetimeMonthsActive =
        investment
            ? monthsActive
            : new Set(allBills.filter(isActiveBill).map((b) => `${b.referenceYear}-${b.referenceMonth}`)).size

    // Brazil grid emission factor: ~0.0817 kg CO2/kWh (MCTIC 2023 national average).
    // Formula: totalGeneratedKwh * 0.0817 kg/kWh ÷ 1000 kg/ton
    const co2AvoidedTons = (totalGeneratedKwh * 0.0817) / 1000

    // ── Accounts (consumer units) ──────────────────────────────────────────────

    const consumerUnits = await prisma.consumerUnit.findMany({
        where: {
            clientId,
            ...(scope === 'all' ? {} : { id: { in: scope } }),
        },
    })

    // Build a lookup of latest bill paymentStatus per consumerUnitId
    const latestBillStatusByUnit = new Map<
        string,
        'ok' | 'warning' | 'critical' | 'unknown'
    >()
    for (const bill of allBills.filter(isActiveBill)) {
        if (!latestBillStatusByUnit.has(bill.consumerUnitId)) {
            let status: 'ok' | 'warning' | 'critical' | 'unknown'
            switch (bill.paymentStatus) {
                case 'paga':
                    status = 'ok'
                    break
                case 'a_pagar':
                    status = 'warning'
                    break
                case 'vencida':
                    status = 'critical'
                    break
                default:
                    status = 'unknown'
            }
            latestBillStatusByUnit.set(bill.consumerUnitId, status)
        }
    }

    const accounts = consumerUnits.map((cu) => ({
        id: cu.id,
        name: cu.name ?? cu.clientNumber ?? 'Conta',
        status: latestBillStatusByUnit.get(cu.id) ?? ('unknown' as const),
    }))

    // ── Live generation ───────────────────────────────────────────────────────
    // liveGenerationKw defaults to 0 here; real-time inverter telemetry is
    // sourced from the generation service and is out of scope for this read API.
    const liveGenerationKw = 0

    // ── Pending validation count ─────────────────────────────────────────────
    // Count bills with status = 'pending_review'
    const pendingReviewBillCount = allBills.filter(
        (b) => b.status === 'pending_review'
    ).length

    // Count generation units with source = 'manual_pending' for this client's inverters
    const clientInverters = await prisma.inverter.findMany({
        where: { plant: { clientId } },
        select: { id: true },
    })
    const pendingGenCount = await prisma.generationUnit.count({
        where: {
            inverterId: { in: clientInverters.map((i) => i.id) },
            source: 'manual_pending',
        },
    })
    const pendingValidationCount = pendingReviewBillCount + pendingGenCount

    // ── Assemble response ─────────────────────────────────────────────────────

    const data: ControleOverview = {
        clientName: userContext.name ?? 'Cliente',
        pendingValidationCount,
        investment: {
            totalInvested,
            returned,
            expectedPayoffLabel,
            monthsActive,
        },
        month: {
            moneySaved,
            energyGeneratedKwh,
            energyConsumedKwh,
            returnVsInvestment,
            monthChangePercent,
        },
        lifetime: {
            totalGeneratedKwh,
            totalReturn,
            monthsActive: lifetimeMonthsActive,
            co2AvoidedTons,
        },
        accounts,
        liveGenerationKw,
        pendingValidationCount,
    }

    return NextResponse.json({ success: true, data })
}

export const GET = withHandle(getControleOverviewRoute)
