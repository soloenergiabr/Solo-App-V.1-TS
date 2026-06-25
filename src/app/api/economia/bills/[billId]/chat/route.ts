import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { AuthMiddleware } from '@/backend/auth/middleware/auth.middleware'
import { resolveAccessibleUnitIds } from '@/backend/controle/scope'
import { getBillAnalyzer } from '@/backend/economia/analyzer'
import { buildChatSystemPrompt } from '@/backend/economia/analyzer/chat-prompt'
import { withHandle } from '@/app/api/api-utils'

const chatRoute = async (
    request: NextRequest,
    context: { params: Promise<{ billId: string }> },
): Promise<NextResponse> => {
    const userContext = await AuthMiddleware.requireAuth(request)
    const { billId } = await context.params

    // Load bill
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

    // Enforce scope (same pattern as detail route)
    const scope = await resolveAccessibleUnitIds(userContext.userId)
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

    // Parse body
    const body = await request.json()
    const { messages } = body
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return NextResponse.json(
            { success: false, message: 'messages array required' },
            { status: 400 },
        )
    }

    // Validate each message format
    for (const msg of messages) {
        if (
            !msg ||
            typeof msg !== 'object' ||
            !['user', 'assistant'].includes(msg.role) ||
            typeof msg.content !== 'string'
        ) {
            return NextResponse.json(
                { success: false, message: 'Invalid message format' },
                { status: 400 },
            )
        }
    }

    // Build system prompt — adapt Prisma bill to ChatBillContext
    const chatContext = {
        distributor: bill.distributor,
        totalBillValue: bill.totalBillValue != null ? Number(bill.totalBillValue) : null,
        referenceMonth: bill.referenceMonth,
        referenceYear: bill.referenceYear,
        amountDue: bill.amountDue != null ? Number(bill.amountDue) : null,
        estimatedSavings: bill.estimatedSavings != null ? Number(bill.estimatedSavings) : null,
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
        tariffFlag: bill.tariffFlag,
        fineAmount: bill.fineAmount != null ? Number(bill.fineAmount) : null,
        otherCharges: bill.otherCharges != null ? Number(bill.otherCharges) : null,
        connectionType: bill.connectionType,
        consumerClass: bill.consumerClass,
        readingPeriodFrom: bill.readingPeriodFrom,
        readingPeriodTo: bill.readingPeriodTo,
    }
    const system = buildChatSystemPrompt(chatContext)

    // Stream chat response
    const analyzer = getBillAnalyzer()
    const stream = await analyzer.chat({ system, messages })

    return new NextResponse(stream as ReadableStream, {
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
}

export const POST = withHandle(chatRoute)
