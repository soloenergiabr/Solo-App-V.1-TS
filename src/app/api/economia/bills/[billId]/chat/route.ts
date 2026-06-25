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
    if (!messages || !Array.isArray(messages)) {
        return NextResponse.json(
            { success: false, message: 'messages array required' },
            { status: 400 },
        )
    }

    // Build system prompt from bill data
    const system = buildChatSystemPrompt(bill as any)

    // Stream chat response
    const analyzer = getBillAnalyzer()
    const stream = await analyzer.chat({ system, messages })

    return new NextResponse(stream as ReadableStream, {
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
}

export const POST = withHandle(chatRoute)
