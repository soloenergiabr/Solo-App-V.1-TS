import { NextRequest, NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { getStripe, isOnlinePaymentEnabled } from '@/backend/gd/stripe'
import { confirmOnlinePayment } from '@/backend/gd/gd.service'

export const runtime = 'nodejs'

/**
 * POST /api/webhooks/stripe — baixa as cobrancas de GD pagas pelo Checkout.
 * A assinatura e verificada sobre o corpo cru com STRIPE_WEBHOOK_SECRET.
 */
export async function POST(request: NextRequest) {
    const secret = process.env.STRIPE_WEBHOOK_SECRET
    if (!isOnlinePaymentEnabled() || !secret) {
        return NextResponse.json({ message: 'Pagamento online não está habilitado.' }, { status: 404 })
    }

    const signature = request.headers.get('stripe-signature')
    const body = await request.text()

    let event: Stripe.Event
    try {
        if (!signature) throw new Error('missing signature')
        event = getStripe().webhooks.constructEvent(body, signature, secret)
    } catch {
        return NextResponse.json({ message: 'Assinatura inválida.' }, { status: 400 })
    }

    if (
        event.type === 'checkout.session.completed' ||
        event.type === 'checkout.session.async_payment_succeeded'
    ) {
        try {
            const result = await confirmOnlinePayment(event.data.object)
            return NextResponse.json({ received: true, result })
        } catch (error) {
            // 500 faz o Stripe reentregar; a baixa e idempotente.
            console.error(`[stripe] falha ao processar ${event.id}:`, error)
            return NextResponse.json({ message: 'Falha ao processar o evento.' }, { status: 500 })
        }
    }

    return NextResponse.json({ received: true, result: 'ignored' })
}
