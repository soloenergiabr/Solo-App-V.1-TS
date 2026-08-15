import { NextRequest, NextResponse } from 'next/server'
import { withHandle } from '@/app/api/api-utils'
import { AuthMiddleware } from '@/backend/auth/middleware/auth.middleware'
import { assertNotPayer } from '@/backend/controle/scope'
import { cancelCharge, resolveGdClientId } from '@/backend/gd/gd.service'

/** DELETE /api/gd/charges/[chargeId] — cancela a cobranca (nao apaga o historico). */
const cancel = async (request: NextRequest, context: { params: Promise<{ chargeId: string }> }) => {
    const user = await AuthMiddleware.requireAuth(request)
    await assertNotPayer(user.userId)

    const { chargeId } = await context.params
    const clientId = resolveGdClientId(user, new URL(request.url).searchParams.get('clientId'))

    const charge = await cancelCharge(chargeId, clientId)

    return NextResponse.json({
        success: true,
        message: 'Cobranca cancelada',
        data: { id: charge.id, status: charge.status },
    })
}

export const DELETE = withHandle(cancel)
