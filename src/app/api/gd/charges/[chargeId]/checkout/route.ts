import { NextRequest, NextResponse } from 'next/server'
import { withHandle } from '@/app/api/api-utils'
import { AuthMiddleware } from '@/backend/auth/middleware/auth.middleware'
import { resolveAccessibleUnitIds } from '@/backend/controle/scope'
import { createChargeCheckout, resolveGdClientId } from '@/backend/gd/gd.service'
import { isOnlinePaymentEnabled } from '@/backend/gd/stripe'
import { config } from '@/config'

/**
 * POST /api/gd/charges/[chargeId]/checkout
 * Abre (ou reaproveita) a sessao de Checkout do Stripe. Pagador so paga a
 * propria cobranca; titular/admin gera o link para enviar ao responsavel.
 */
const checkout = async (request: NextRequest, context: { params: Promise<{ chargeId: string }> }) => {
    if (!isOnlinePaymentEnabled()) {
        return NextResponse.json(
            { success: false, error: 'Not found', message: 'O pagamento online não está habilitado.' },
            { status: 404 },
        )
    }

    const user = await AuthMiddleware.requireAuth(request)
    const { chargeId } = await context.params

    const scope = await resolveAccessibleUnitIds(user.userId)
    const clientId =
        scope === 'all'
            ? resolveGdClientId(user, new URL(request.url).searchParams.get('clientId'))
            : (user.clientId ?? '')

    // Mesma origem dos links de e-mail (ver /api/gd/invites).
    const appUrl = config.base_url || new URL(request.url).origin
    const data = await createChargeCheckout(chargeId, clientId, scope, appUrl)

    return NextResponse.json({ success: true, data })
}

export const POST = withHandle(checkout)
