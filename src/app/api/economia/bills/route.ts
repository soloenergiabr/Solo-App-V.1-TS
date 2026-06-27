import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { AuthMiddleware } from '@/backend/auth/middleware/auth.middleware'
import { resolveAccessibleUnitIds } from '@/backend/controle/scope'
import { withHandle } from '@/app/api/api-utils'
import type { AccountBill } from '@/shared/controle/types'

const getEconomiaBillsRoute = async (request: NextRequest): Promise<NextResponse> => {
    const userContext = await AuthMiddleware.requireAuth(request)

    const { searchParams } = new URL(request.url)
    const yearParam = searchParams.get('year')
    const filterByYear = yearParam !== 'all'
    const year = filterByYear ? Number(yearParam) || new Date().getFullYear() : 0
    const month = searchParams.get('month') ? Number(searchParams.get('month')) : undefined

    // Server-enforced payer scope: payers are restricted to their own units;
    // titular/admin ('all') are scoped to the client.
    const scope = await resolveAccessibleUnitIds(userContext.userId)

    const clientId =
        userContext.clientId ?? searchParams.get('clientId') ?? undefined

    if (scope === 'all' && !clientId) {
        return NextResponse.json({ success: false, message: 'unauthorized' }, { status: 401 })
    }

    const bills = await prisma.energyBill.findMany({
        where: {
            ...(filterByYear ? { referenceYear: year } : {}),
            ...(month ? { referenceMonth: month } : {}),
            ...(scope === 'all'
                ? { clientId }
                : { consumerUnitId: { in: scope } }),
        },
        include: { consumerUnit: true },
        orderBy: [{ referenceYear: 'desc' }, { referenceMonth: 'desc' }],
    })

    const data: AccountBill[] = bills.map((b) => ({
        id: b.id,
        consumerUnitId: b.consumerUnitId ?? '',
        consumerUnitName: b.consumerUnit?.name ?? b.consumerUnit?.clientNumber ?? 'Conta',
        distributor: b.consumerUnit?.distributor ?? b.distributor ?? null,
        accountNumber: b.consumerUnit?.accountNumber ?? b.accountNumber ?? null,
        referenceMonth: b.referenceMonth ?? 0,
        referenceYear: b.referenceYear ?? year,
        amountDue: Number(b.amountDue ?? b.totalBillValue ?? 0),
        dueDate: b.dueDate ? b.dueDate.toISOString() : null,
        paidAt: b.paidAt ? b.paidAt.toISOString() : null,
        paymentStatus: b.paymentStatus ?? 'a_pagar',
        pixCode: b.pixCode ?? null,
        barcode: b.barcode ?? null,
        billFileUrl: b.billFileUrl ?? null,
        estimatedSavings: Number(b.estimatedSavings ?? 0),
        titularName: b.consumerUnit?.accountHolder ?? b.accountHolder ?? null,
        payerName: b.consumerUnit?.payerName ?? null,
        aiAnalysis: b.aiAnalysis ?? null,
        energyCost: b.energyCost != null ? Number(b.energyCost) : null,
        tariffTusdValue: b.tariffTusdValue != null ? Number(b.tariffTusdValue) : null,
        tariffTeValue: b.tariffTeValue != null ? Number(b.tariffTeValue) : null,
        icmsCost: b.icmsCost != null ? Number(b.icmsCost) : null,
        publicLightingCost: b.publicLightingCost != null ? Number(b.publicLightingCost) : null,
        tariffFlag: b.tariffFlag ?? null,
        tariffFlagCost: b.tariffFlagCost != null ? Number(b.tariffFlagCost) : null,
    }))

    return NextResponse.json({ success: true, data })
}

export const GET = withHandle(getEconomiaBillsRoute)
