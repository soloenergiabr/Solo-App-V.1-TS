import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { AuthMiddleware } from '@/backend/auth/middleware/auth.middleware'
import { withHandle } from '@/app/api/api-utils'
import type { AccountBill } from '@/shared/controle/types'

const getEconomiaBillsRoute = async (request: NextRequest): Promise<NextResponse> => {
    const userContext = await AuthMiddleware.requireAuth(request)

    const { searchParams } = new URL(request.url)
    const year = Number(searchParams.get('year')) || new Date().getFullYear()
    const month = searchParams.get('month') ? Number(searchParams.get('month')) : undefined

    const payerUnits = await prisma.consumerUnit.findMany({
        where: { payerUserId: userContext.userId },
        select: { id: true },
    })
    const payerUnitIds = payerUnits.map((u) => u.id)

    const clientId =
        userContext.clientId ?? searchParams.get('clientId') ?? undefined

    if (payerUnitIds.length === 0 && !clientId) {
        return NextResponse.json({ success: false, message: 'unauthorized' }, { status: 401 })
    }

    const bills = await prisma.energyBill.findMany({
        where: {
            referenceYear: year,
            ...(month ? { referenceMonth: month } : {}),
            ...(payerUnitIds.length
                ? { consumerUnitId: { in: payerUnitIds } }
                : { clientId }),
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
    }))

    return NextResponse.json({ success: true, data })
}

export const GET = withHandle(getEconomiaBillsRoute)
