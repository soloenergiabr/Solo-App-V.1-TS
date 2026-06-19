import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { AuthMiddleware } from '@/backend/auth/middleware/auth.middleware'
import { withHandle } from '@/app/api/api-utils'
import { resolveAccessibleUnitIds } from '@/backend/controle/scope'

export interface CockpitSummary {
    pendingBills: number
    activePlants: number
    pendingRateios: number
    totalSavings: number
}

const getCockpitSummaryRoute = async (request: NextRequest): Promise<NextResponse> => {
    const userContext = await AuthMiddleware.requireAuth(request)

    // Server-enforced payer scope
    const scope = await resolveAccessibleUnitIds(userContext.userId)

    // Resolve the client ID
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

    const unitScopeWhere = scope === 'all' ? {} : { consumerUnitId: { in: scope } }

    // Count pending bills (a_pagar or vencida)
    const pendingBills = await prisma.energyBill.count({
        where: {
            clientId,
            ...unitScopeWhere,
            paymentStatus: { in: ['a_pagar', 'vencida'] },
        },
    })

    // Count active plants (not deleted)
    const activePlants = await prisma.plant.count({
        where: {
            clientId,
            deletedAt: null,
        },
    })

    // Count pending rateios (enelSyncStatus = 'pending_push', not deleted)
    const pendingRateios = await prisma.creditAllocation.count({
        where: {
            clientId,
            enelSyncStatus: 'pending_push',
            deletedAt: null,
        },
    })

    // Total lifetime savings from all bills
    const savingsAgg = await prisma.energyBill.aggregate({
        where: { clientId, ...unitScopeWhere },
        _sum: { estimatedSavings: true },
    })
    const totalSavings = Number(savingsAgg._sum.estimatedSavings ?? 0)

    const data: CockpitSummary = {
        pendingBills,
        activePlants,
        pendingRateios,
        totalSavings,
    }

    return NextResponse.json({ success: true, data })
}

export const GET = withHandle(getCockpitSummaryRoute)
