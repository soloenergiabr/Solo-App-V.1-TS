import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { AuthMiddleware } from '@/backend/auth/middleware/auth.middleware'
import { resolveAccessibleUnitIds } from '@/backend/controle/scope'
import { withHandle } from '@/app/api/api-utils'
import { eventBus, EventType } from '@/backend/shared/event-bus'

const confirmPaymentRoute = async (
    request: NextRequest,
    context: { params: Promise<{ billId: string }> },
): Promise<NextResponse> => {
    const userContext = await AuthMiddleware.requireAuth(request)
    const { billId } = await context.params

    const clientId = userContext.clientId
    if (!clientId) {
        return NextResponse.json(
            { success: false, message: 'Conta de cliente nao encontrada' },
            { status: 400 },
        )
    }

    // Server-enforced payer scope
    const scope = await resolveAccessibleUnitIds(userContext.userId)

    const bill = await prisma.energyBill.findUnique({
        where: { id: billId },
    })

    if (!bill) {
        return NextResponse.json(
            { success: false, message: 'Fatura nao encontrada' },
            { status: 404 },
        )
    }

    // Scope enforcement: titular/admin checks clientId; payers check unit membership
    if (scope === 'all') {
        if (bill.clientId !== clientId) {
            return NextResponse.json(
                { success: false, message: 'unauthorized' },
                { status: 401 },
            )
        }
    } else {
        if (!bill.consumerUnitId || !scope.includes(bill.consumerUnitId)) {
            return NextResponse.json(
                { success: false, message: 'unauthorized' },
                { status: 401 },
            )
        }
    }

    // Validate payment status
    if (bill.paymentStatus === 'paga') {
        return NextResponse.json(
            { success: false, message: 'Esta fatura ja foi paga' },
            { status: 400 },
        )
    }

    if (bill.paymentStatus !== 'a_pagar' && bill.paymentStatus !== 'vencida') {
        return NextResponse.json(
            { success: false, message: 'Esta fatura nao pode ser paga' },
            { status: 400 },
        )
    }

    const paidAt = new Date()

    const updatedBill = await prisma.energyBill.update({
        where: { id: billId },
        data: {
            paymentStatus: 'paga',
            paidAt,
        },
    })

    eventBus.emit(EventType.BILL_PAID, {
        billId,
        clientId,
        paidAt: paidAt.toISOString(),
    })

    return NextResponse.json({
        success: true,
        message: 'Pagamento confirmado com sucesso',
        data: {
            id: updatedBill.id,
            paymentStatus: updatedBill.paymentStatus,
            paidAt: updatedBill.paidAt ? updatedBill.paidAt.toISOString() : null,
        },
    })
}

export const POST = withHandle(confirmPaymentRoute)
