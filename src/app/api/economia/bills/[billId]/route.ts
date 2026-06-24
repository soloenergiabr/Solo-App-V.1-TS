import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { AuthMiddleware } from '@/backend/auth/middleware/auth.middleware'
import { resolveAccessibleUnitIds } from '@/backend/controle/scope'
import { withHandle } from '@/app/api/api-utils'

const getEconomiaBillDetailRoute = async (
    request: NextRequest,
    context: { params: Promise<{ billId: string }> },
): Promise<NextResponse> => {
    const userContext = await AuthMiddleware.requireAuth(request)
    const { billId } = await context.params

    // Server-enforced payer scope: payers are restricted to their own units;
    // titular/admin ('all') are scoped to the client.
    const scope = await resolveAccessibleUnitIds(userContext.userId)

    const bill = await prisma.energyBill.findUnique({
        where: { id: billId },
        include: { consumerUnit: true },
    })

    if (!bill) {
        return NextResponse.json(
            { success: false, message: 'Fatura nao encontrada' },
            { status: 404 },
        )
    }

    // Enforce scope: titular/admin checks clientId; payers check unit membership
    if (scope === 'all') {
        if (bill.clientId !== userContext.clientId) {
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

    const data = {
        id: bill.id,
        consumerUnitId: bill.consumerUnitId ?? '',
        consumerUnitName: bill.consumerUnit?.name ?? bill.consumerUnit?.clientNumber ?? 'Conta',
        referenceMonth: bill.referenceMonth ?? 0,
        referenceYear: bill.referenceYear ?? 0,
        amountDue: Number(bill.amountDue ?? bill.totalBillValue ?? 0),
        dueDate: bill.dueDate ? bill.dueDate.toISOString() : null,
        paidAt: bill.paidAt ? bill.paidAt.toISOString() : null,
        paymentStatus: bill.paymentStatus ?? 'a_pagar',
        status: bill.status ?? null,
        pixCode: bill.pixCode ?? null,
        barcode: bill.barcode ?? null,
        billFileUrl: bill.billFileUrl ?? null,
        estimatedSavings: Number(bill.estimatedSavings ?? 0),
        aiAnalysis: bill.aiAnalysis ?? null,
        aiExplanations: bill.aiExplanations as Record<string, unknown> | null,
        alerts: bill.alerts as unknown[] | null,
        aiRecommendations: bill.aiRecommendations as unknown[] | null,
        billingItems: bill.billingItems as unknown[] | null,
        creditSummary: bill.creditSummary as Record<string, unknown> | null,
        billScore: bill.billScore != null ? Number(bill.billScore) : null,
        titularName: bill.accountHolder ?? null,
        distributor: bill.distributor ?? bill.consumerUnit?.distributor ?? null,
        // Clarifier / rich-analysis fields (Sprint 5 C1)
        totalAmount: bill.totalAmount != null ? Number(bill.totalAmount) : null,
        availabilityCost: bill.availabilityCost != null ? Number(bill.availabilityCost) : null,
        publicLightingCost: bill.publicLightingCost != null ? Number(bill.publicLightingCost) : null,
        monitoredGenerationKwh: bill.monitoredGenerationKwh != null ? Number(bill.monitoredGenerationKwh) : null,
        injectedEnergyKwh: bill.injectedEnergyKwh != null ? Number(bill.injectedEnergyKwh) : null,
        compensatedEnergyKwh: bill.compensatedEnergyKwh != null ? Number(bill.compensatedEnergyKwh) : null,
        currentCreditsKwh: bill.currentCreditsKwh != null ? Number(bill.currentCreditsKwh) : null,
        previousCreditsKwh: bill.previousCreditsKwh != null ? Number(bill.previousCreditsKwh) : null,
        billedConsumptionKwh: bill.billedConsumptionKwh != null ? Number(bill.billedConsumptionKwh) : null,
        expectedGenerationKwh: bill.expectedGenerationKwh != null ? Number(bill.expectedGenerationKwh) : null,
        generationEfficiency: bill.generationEfficiency != null ? Number(bill.generationEfficiency) : null,
        icmsCost: bill.icmsCost != null ? Number(bill.icmsCost) : null,
        pisCofinsCost: bill.pisCofinsCost != null ? Number(bill.pisCofinsCost) : null,
        tariffFlag: bill.tariffFlag ?? null,
        fineAmount: bill.fineAmount != null ? Number(bill.fineAmount) : null,
        otherCharges: bill.otherCharges != null ? Number(bill.otherCharges) : null,
        connectionType: bill.connectionType ?? null,
        consumerClass: bill.consumerClass ?? null,
        tariffPeriod: bill.tariffPeriod ?? null,
        readingPeriodFrom: bill.readingPeriodFrom ? bill.readingPeriodFrom.toISOString() : null,
        readingPeriodTo: bill.readingPeriodTo ? bill.readingPeriodTo.toISOString() : null,
        extraCharges: bill.extraCharges as unknown[] | null,
        consumerUnit: {
            name: bill.consumerUnit?.name ?? null,
            clientNumber: bill.consumerUnit?.clientNumber ?? null,
            installationNumber: bill.consumerUnit?.installationNumber ?? null,
        },
    }

    return NextResponse.json({ success: true, data })
}

export const GET = withHandle(getEconomiaBillDetailRoute)
