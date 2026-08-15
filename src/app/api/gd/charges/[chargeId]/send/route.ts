import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { withHandle } from '@/app/api/api-utils'
import { AuthMiddleware } from '@/backend/auth/middleware/auth.middleware'
import { assertNotPayer } from '@/backend/controle/scope'
import { resolveGdClientId, sendCharge } from '@/backend/gd/gd.service'

/** POST /api/gd/charges/[chargeId]/send — envia a cobranca ao responsavel. */
const send = async (request: NextRequest, context: { params: Promise<{ chargeId: string }> }) => {
    const user = await AuthMiddleware.requireAuth(request)
    await assertNotPayer(user.userId)

    const { chargeId } = await context.params
    const clientId = resolveGdClientId(user, new URL(request.url).searchParams.get('clientId'))

    const client = await prisma.client.findUnique({
        where: { id: clientId },
        select: { name: true },
    })

    const charge = await sendCharge(chargeId, clientId, client?.name ?? 'O titular da conta')

    return NextResponse.json({
        success: true,
        message: 'Cobranca enviada ao responsavel',
        data: { id: charge.id, status: charge.status, sentAt: charge.sentAt },
    })
}

export const POST = withHandle(send)
