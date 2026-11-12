import Stripe from 'stripe'

/**
 * Cliente Stripe do servidor, criado sob demanda. Sem STRIPE_SECRET_KEY o
 * pagamento online fica desligado: a UI esconde os botoes e as rotas recusam.
 */
let client: Stripe | null = null

export function isOnlinePaymentEnabled(): boolean {
    return Boolean(process.env.STRIPE_SECRET_KEY)
}

export function getStripe(): Stripe {
    const key = process.env.STRIPE_SECRET_KEY
    if (!key) throw new Error('Pagamento online não está configurado (STRIPE_SECRET_KEY ausente).')
    client ??= new Stripe(key)
    return client
}

/** Valor em reais (Decimal do Prisma, string ou number) para centavos inteiros. */
export function toCents(amount: unknown): number {
    const value = Number(amount)
    if (!Number.isFinite(value)) throw new Error('Valor da cobrança inválido.')
    return Math.round(value * 100)
}
