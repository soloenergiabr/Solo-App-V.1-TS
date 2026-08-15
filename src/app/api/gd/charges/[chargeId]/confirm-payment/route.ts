import { NextRequest, NextResponse } from 'next/server'
import { withHandle } from '@/app/api/api-utils'
import { AuthMiddleware } from '@/backend/auth/middleware/auth.middleware'
import { resolveAccessibleUnitIds } from '@/backend/controle/scope'
import { confirmChargePayment, resolveGdClientId } from '@/backend/gd/gd.service'

/**
 * POST /api/gd/charges/[chargeId]/confirm-payment
 * Registra a baixa. Aceita tanto o titular ("recebi") quanto o pagador ("paguei") —
 * o escopo por UC garante que o pagador so baixa a propria cobranca.
 */
const confirm = async (request: NextRequest, context: { params: Promise<{ chargeId: string }> }) => {
    const user = await AuthMiddleware.requireAuth(request)
    const { chargeId } = await context.params

    const scope = await resolveAccessibleUnitIds(user.userId)
    const clientId =
        scope === 'all'
            ? resolveGdClientId(user, new URL(request.url).searchParams.get('clientId'))
            : (user.clientId ?? '')

    const charge = await confirmChargePayment(chargeId, clientId, scope, user.userId)

    return NextResponse.json({
        success: true,
        message: 'Pagamento confirmado com sucesso',
        data: { id: charge.id, status: charge.status, paidAt: charge.paidAt },
    })
}

export const POST = withHandle(confirm)
