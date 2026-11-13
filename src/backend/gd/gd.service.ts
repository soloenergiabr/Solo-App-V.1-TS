import bcrypt from 'bcryptjs'
import prisma from '@/lib/prisma'
import { sendMail } from '@/lib/mail'
import { eventBus, EventType } from '@/backend/shared/event-bus'
import { PAYER_ROLE, type AccessibleUnits } from '@/backend/controle/scope'
import type { UserContextModel } from '@/backend/auth/models/user-context.model'
import type {
    ChargeDTO,
    ChargeMode,
    ChargeRuleDTO,
    ChargeStatus,
    GdOverview,
    PayerInviteDTO,
} from '@/shared/gd/types'
import {
    ChargeCalculationError,
    computeCharge,
    resolveChargeDueDate,
    resolveChargeStatus,
    summarizeCharges,
} from './charge-calculator'
import {
    computeInviteExpiry,
    generateInviteToken,
    hashInviteToken,
    resolveInviteUsability,
} from './invite-token'
import { payerInviteEmail, chargeNotificationEmail } from './emails'
import type Stripe from 'stripe'
import { getStripe, isOnlinePaymentEnabled, toCents } from './stripe'

/** Permissoes minimas de um usuario pagador: ve as contas das UCs dele e nada mais. */
const PAYER_PERMISSIONS = ['read_generation_data']

/**
 * Resolve em qual client a operacao acontece. Um `master` pode operar em nome de
 * um cliente (o espelho do admin) passando `clientId`; o titular so opera no
 * proprio client.
 */
export function resolveGdClientId(
    userContext: UserContextModel,
    requestedClientId?: string | null,
): string {
    if (userContext.hasRole('master')) {
        const clientId = requestedClientId ?? userContext.clientId
        if (!clientId) {
            throw new Error('Informe o cliente (clientId) para operar a gestao de geracao distribuida.')
        }
        return clientId
    }

    if (requestedClientId && requestedClientId !== userContext.clientId) {
        throw new Error('Voce nao tem permissao para operar a gestao de outro cliente.')
    }

    if (!userContext.clientId) {
        throw new Error('Usuario sem cliente vinculado.')
    }

    return userContext.clientId
}

function toNum(value: unknown): number | null {
    if (value === null || value === undefined) return null
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
}

// ---------------------------------------------------------------------------
// Regras de cobranca
// ---------------------------------------------------------------------------

export async function listChargeRules(clientId: string): Promise<ChargeRuleDTO[]> {
    const units = await prisma.consumerUnit.findMany({
        where: { clientId, deletedAt: null, isConsumer: true },
        include: {
            chargeRule: true,
            payerUser: { select: { id: true } },
        },
        orderBy: { createdAt: 'asc' },
    })

    return units.map((unit) => ({
        id: unit.chargeRule?.id ?? '',
        consumerUnitId: unit.id,
        consumerUnitName: unit.name ?? unit.clientNumber ?? 'Unidade consumidora',
        mode: (unit.chargeRule?.mode ?? 'pass_through') as ChargeMode,
        pricePerKwh: toNum(unit.chargeRule?.pricePerKwh),
        fixedAmount: toNum(unit.chargeRule?.fixedAmount),
        dueDayOfMonth: unit.chargeRule?.dueDayOfMonth ?? null,
        isActive: unit.chargeRule?.isActive ?? false,
        notes: unit.chargeRule?.notes ?? null,
        payerName: unit.payerName ?? null,
        payerEmail: unit.payerEmail ?? null,
        payerUserId: unit.payerUserId ?? null,
        hasPayerLogin: Boolean(unit.payerUser),
    }))
}

export interface UpsertChargeRuleInput {
    consumerUnitId: string
    mode: ChargeMode
    pricePerKwh?: number | null
    fixedAmount?: number | null
    dueDayOfMonth?: number | null
    isActive?: boolean
    notes?: string | null
}

export async function upsertChargeRule(clientId: string, input: UpsertChargeRuleInput) {
    const unit = await prisma.consumerUnit.findFirst({
        where: { id: input.consumerUnitId, clientId, deletedAt: null },
    })
    if (!unit) throw new Error('Unidade consumidora not found')

    // Valida a regra antes de gravar: uma regra que nao calcula nao serve.
    if (input.mode === 'per_kwh' && toNum(input.pricePerKwh) === null) {
        throw new Error('Defina o preco por kWh para cobrar pela energia fornecida.')
    }
    if (input.mode === 'fixed' && toNum(input.fixedAmount) === null) {
        throw new Error('Defina o valor fixo mensal para esta unidade.')
    }
    if (input.dueDayOfMonth != null && (input.dueDayOfMonth < 1 || input.dueDayOfMonth > 31)) {
        throw new Error('O dia de vencimento deve estar entre 1 e 31.')
    }

    const data = {
        mode: input.mode,
        pricePerKwh: input.mode === 'per_kwh' ? input.pricePerKwh : null,
        fixedAmount: input.mode === 'fixed' ? input.fixedAmount : null,
        dueDayOfMonth: input.dueDayOfMonth ?? null,
        isActive: input.isActive ?? true,
        notes: input.notes ?? null,
    }

    return prisma.chargeRule.upsert({
        where: { consumerUnitId: input.consumerUnitId },
        create: { clientId, consumerUnitId: input.consumerUnitId, ...data },
        update: data,
    })
}

// ---------------------------------------------------------------------------
// Cobrancas
// ---------------------------------------------------------------------------

export interface GenerateChargesResult {
    created: number
    updated: number
    skipped: number
    errors: Array<{ consumerUnitId: string; consumerUnitName: string; message: string }>
}

/**
 * Gera (ou atualiza) as cobrancas de uma competencia para todas as UCs com
 * regra ativa. Cobrancas ja enviadas ou pagas nao sao tocadas — o valor que o
 * responsavel recebeu nao muda pelas costas dele.
 */
export async function generateCharges(
    clientId: string,
    referenceYear: number,
    referenceMonth: number,
): Promise<GenerateChargesResult> {
    const rules = await prisma.chargeRule.findMany({
        where: { clientId, isActive: true, deletedAt: null },
        include: { consumerUnit: true },
    })

    const result: GenerateChargesResult = { created: 0, updated: 0, skipped: 0, errors: [] }

    for (const rule of rules) {
        const unit = rule.consumerUnit
        const unitName = unit.name ?? unit.clientNumber ?? 'Unidade consumidora'

        if (unit.deletedAt) {
            result.skipped += 1
            continue
        }

        try {
            const bill = await prisma.energyBill.findFirst({
                where: { consumerUnitId: unit.id, referenceYear, referenceMonth },
            })

            const computed = computeCharge(
                {
                    mode: rule.mode as ChargeMode,
                    pricePerKwh: toNum(rule.pricePerKwh),
                    fixedAmount: toNum(rule.fixedAmount),
                },
                bill
                    ? {
                          amountDue: toNum(bill.amountDue),
                          totalBillValue: toNum(bill.totalBillValue),
                          compensatedEnergyKwh: toNum(bill.compensatedEnergyKwh),
                      }
                    : null,
            )

            const dueDate = resolveChargeDueDate(
                { dueDayOfMonth: rule.dueDayOfMonth },
                bill?.dueDate ?? null,
                referenceYear,
                referenceMonth,
            )

            const existing = await prisma.charge.findUnique({
                where: {
                    consumerUnitId_referenceYear_referenceMonth: {
                        consumerUnitId: unit.id,
                        referenceYear,
                        referenceMonth,
                    },
                },
            })

            if (existing && existing.status !== 'draft') {
                result.skipped += 1
                continue
            }

            const payload = {
                mode: computed.mode,
                basisKwh: computed.basisKwh,
                pricePerKwh: computed.pricePerKwh,
                amount: computed.amount,
                dueDate,
                energyBillId: bill?.id ?? null,
                chargeRuleId: rule.id,
                payerUserId: unit.payerUserId,
                payerName: unit.payerName,
                payerEmail: unit.payerEmail,
            }

            if (existing) {
                await prisma.charge.update({ where: { id: existing.id }, data: payload })
                result.updated += 1
            } else {
                await prisma.charge.create({
                    data: {
                        clientId,
                        consumerUnitId: unit.id,
                        referenceYear,
                        referenceMonth,
                        status: 'draft',
                        ...payload,
                    },
                })
                result.created += 1
            }
        } catch (error) {
            result.errors.push({
                consumerUnitId: unit.id,
                consumerUnitName: unitName,
                message:
                    error instanceof ChargeCalculationError || error instanceof Error
                        ? error.message
                        : 'Falha inesperada ao calcular a cobranca.',
            })
        }
    }

    return result
}

function toChargeDTO(charge: {
    id: string
    consumerUnitId: string
    consumerUnit?: { name: string | null; clientNumber: string | null } | null
    referenceMonth: number
    referenceYear: number
    mode: string
    basisKwh: unknown
    pricePerKwh: unknown
    amount: unknown
    dueDate: Date | null
    status: string
    payerName: string | null
    payerEmail: string | null
    sentAt: Date | null
    paidAt: Date | null
    paymentProvider: string | null
    notes: string | null
    energyBillId: string | null
    energyBill?: { amountDue: unknown; totalBillValue: unknown } | null
}): ChargeDTO {
    return {
        id: charge.id,
        consumerUnitId: charge.consumerUnitId,
        consumerUnitName:
            charge.consumerUnit?.name ?? charge.consumerUnit?.clientNumber ?? 'Unidade consumidora',
        referenceMonth: charge.referenceMonth,
        referenceYear: charge.referenceYear,
        mode: charge.mode as ChargeMode,
        basisKwh: toNum(charge.basisKwh),
        pricePerKwh: toNum(charge.pricePerKwh),
        amount: toNum(charge.amount) ?? 0,
        dueDate: charge.dueDate ? charge.dueDate.toISOString() : null,
        status: resolveChargeStatus({
            status: charge.status as ChargeStatus,
            dueDate: charge.dueDate,
            paidAt: charge.paidAt,
        }),
        payerName: charge.payerName,
        payerEmail: charge.payerEmail,
        sentAt: charge.sentAt ? charge.sentAt.toISOString() : null,
        paidAt: charge.paidAt ? charge.paidAt.toISOString() : null,
        paymentProvider: charge.paymentProvider,
        notes: charge.notes,
        energyBillId: charge.energyBillId,
        billAmountDue: toNum(charge.energyBill?.amountDue) ?? toNum(charge.energyBill?.totalBillValue),
    }
}

/**
 * Lista as cobrancas da competencia. `scope` vem do `resolveAccessibleUnitIds`:
 * o titular ve tudo do client, o pagador ve so as UCs dele.
 */
export async function listCharges(
    clientId: string,
    scope: AccessibleUnits,
    referenceYear: number,
    referenceMonth: number,
): Promise<GdOverview> {
    const charges = await prisma.charge.findMany({
        where: {
            referenceYear,
            referenceMonth,
            deletedAt: null,
            ...(scope === 'all' ? { clientId } : { consumerUnitId: { in: scope } }),
        },
        include: {
            consumerUnit: { select: { name: true, clientNumber: true } },
            energyBill: { select: { amountDue: true, totalBillValue: true } },
        },
        orderBy: { createdAt: 'asc' },
    })

    const dtos = charges.map(toChargeDTO)

    return {
        summary: summarizeCharges(
            charges.map((c) => ({
                amount: toNum(c.amount) ?? 0,
                status: c.status as ChargeStatus,
                dueDate: c.dueDate,
                paidAt: c.paidAt,
            })),
            referenceYear,
            referenceMonth,
        ),
        charges: dtos,
        onlinePaymentEnabled: isOnlinePaymentEnabled(),
    }
}

/** Carrega uma cobranca respeitando o escopo de quem pede. */
async function findChargeInScope(chargeId: string, clientId: string, scope: AccessibleUnits) {
    const charge = await prisma.charge.findUnique({
        where: { id: chargeId },
        include: {
            consumerUnit: { select: { name: true, clientNumber: true } },
            energyBill: { select: { billFileUrl: true } },
        },
    })

    if (!charge || charge.deletedAt) throw new Error('Cobranca not found')

    if (scope === 'all') {
        if (charge.clientId !== clientId) throw new Error('Cobranca not found')
    } else if (!scope.includes(charge.consumerUnitId)) {
        throw new Error('Cobranca not found')
    }

    return charge
}

/** Envia a cobranca ao responsavel por e-mail e marca como enviada. */
export async function sendCharge(chargeId: string, clientId: string, titularName: string, appUrl?: string) {
    const charge = await findChargeInScope(chargeId, clientId, 'all')

    if (charge.status === 'paid') throw new Error('Esta cobranca ja foi paga.')
    if (charge.status === 'canceled') throw new Error('Esta cobranca foi cancelada.')

    const email = charge.payerEmail
    if (!email) {
        throw new Error(
            'Esta unidade nao tem e-mail de responsavel. Cadastre o responsavel antes de enviar a cobranca.',
        )
    }

    const unitName = charge.consumerUnit?.name ?? charge.consumerUnit?.clientNumber ?? 'sua unidade'

    await sendMail({
        to: email,
        subject: `Sua conta de energia — ${String(charge.referenceMonth).padStart(2, '0')}/${charge.referenceYear}`,
        html: chargeNotificationEmail({
            payerName: charge.payerName ?? 'Ola',
            titularName,
            unitName,
            amount: toNum(charge.amount) ?? 0,
            dueDate: charge.dueDate,
            mode: charge.mode as ChargeMode,
            basisKwh: toNum(charge.basisKwh),
            pricePerKwh: toNum(charge.pricePerKwh),
            // O billFileUrl salvo e o endereco interno do MinIO (http://minio:9000), que nao abre
            // fora do servidor. O responsavel ve a conta e o PDF pelo app, logado.
            billFileUrl: charge.energyBill?.billFileUrl && appUrl ? `${appUrl.replace(/\/$/, '')}/consumo?tab=gd` : null,
            // Aponta para o app, nao para o Stripe: a sessao de Checkout expira em 24h.
            payUrl: isOnlinePaymentEnabled() && appUrl ? `${appUrl.replace(/\/$/, '')}/consumo?tab=gd` : null,
        }),
    })

    const updated = await prisma.charge.update({
        where: { id: chargeId },
        data: { status: 'sent', sentAt: new Date() },
    })

    eventBus.emit(EventType.GD_CHARGE_SENT, {
        chargeId,
        clientId,
        consumerUnitId: charge.consumerUnitId,
        payerEmail: email,
    })

    return updated
}

/**
 * Baixa de pagamento. Vale para o titular (recebi), o pagador (paguei) e o
 * webhook do gateway (`userId` nulo, `payment` com provedor e meio).
 */
export async function confirmChargePayment(
    chargeId: string,
    clientId: string,
    scope: AccessibleUnits,
    userId: string | null,
    payment?: { provider: string; method: string | null },
) {
    const charge = await findChargeInScope(chargeId, clientId, scope)

    if (charge.status === 'paid') throw new Error('Esta cobranca ja foi baixada.')
    if (charge.status === 'canceled') throw new Error('Esta cobranca foi cancelada.')

    const paidAt = new Date()
    // O filtro de status torna a baixa atomica: duas confirmacoes simultaneas
    // (ex.: reentrega do webhook) nao baixam nem emitem o evento duas vezes.
    const updated = await prisma.charge
        .update({
            where: { id: chargeId, status: { notIn: ['paid', 'canceled'] } },
            data: {
                status: 'paid',
                paidAt,
                confirmedByUserId: userId,
                // Baixa manual zera o provedor: "Pago online" so quando o gateway confirmou.
                paymentProvider: payment?.provider ?? null,
                paymentMethod: payment?.method ?? null,
            },
        })
        .catch((error: unknown) => {
            if ((error as { code?: string }).code === 'P2025') {
                throw new Error('Esta cobranca ja foi baixada.')
            }
            throw error
        })

    eventBus.emit(EventType.GD_CHARGE_PAID, {
        chargeId,
        clientId,
        consumerUnitId: charge.consumerUnitId,
        paidAt: paidAt.toISOString(),
    })

    return updated
}

// ---------------------------------------------------------------------------
// Pagamento online (Stripe Checkout)
// ---------------------------------------------------------------------------

/**
 * Cria (ou reaproveita) a sessao de Checkout da cobranca e devolve a URL de
 * pagamento. Cartao + PIX; se a conta Stripe nao tiver PIX, so cartao.
 */
export async function createChargeCheckout(
    chargeId: string,
    clientId: string,
    scope: AccessibleUnits,
    appUrl: string,
): Promise<{ url: string }> {
    const stripe = getStripe()
    const charge = await findChargeInScope(chargeId, clientId, scope)

    if (charge.status === 'paid') throw new Error('Esta cobrança já foi paga.')
    if (charge.status === 'canceled') throw new Error('Esta cobrança foi cancelada.')

    const amount = toCents(charge.amount)
    if (amount <= 0) throw new Error('Esta cobrança não tem valor a pagar.')

    if (charge.paymentSessionId) {
        const existing = await stripe.checkout.sessions.retrieve(charge.paymentSessionId).catch(() => null)
        // Reaproveita so se ainda estiver aberta por mais 5 min e com o mesmo valor.
        if (
            existing?.status === 'open' &&
            existing.url &&
            existing.amount_total === amount &&
            existing.expires_at * 1000 > Date.now() + 5 * 60 * 1000
        ) {
            return { url: existing.url }
        }
    }

    const base = appUrl.replace(/\/$/, '')
    const unitName = charge.consumerUnit?.name ?? charge.consumerUnit?.clientNumber ?? 'Unidade consumidora'
    const competencia = `${String(charge.referenceMonth).padStart(2, '0')}/${charge.referenceYear}`
    const params: Stripe.Checkout.SessionCreateParams = {
        mode: 'payment',
        line_items: [
            {
                quantity: 1,
                price_data: {
                    currency: 'brl',
                    unit_amount: amount,
                    product_data: { name: `Conta de energia — ${unitName} (${competencia})` },
                },
            },
        ],
        client_reference_id: charge.id,
        metadata: { chargeId: charge.id },
        payment_intent_data: { metadata: { chargeId: charge.id } },
        ...(charge.payerEmail && { customer_email: charge.payerEmail }),
        success_url: `${base}/consumo?tab=gd`,
        cancel_url: `${base}/consumo?tab=gd`,
    }

    let session: Stripe.Checkout.Session
    try {
        session = await stripe.checkout.sessions.create({ ...params, allowed_payment_method_types: ['card', 'pix'] })
    } catch (error) {
        if (!(error instanceof Error && error.name === 'StripeInvalidRequestError')) throw error
        // Conta sem PIX habilitado: segue so com cartao.
        session = await stripe.checkout.sessions.create({ ...params, allowed_payment_method_types: ['card'] })
    }

    if (!session.url) throw new Error('O Stripe não devolveu a URL de pagamento.')

    await prisma.charge.update({
        where: { id: charge.id },
        data: { paymentProvider: 'stripe', paymentSessionId: session.id },
    })

    return { url: session.url }
}

/** Meio usado no pagamento (card, pix), lido do PaymentIntent. Melhor esforco. */
async function resolvePaymentMethod(session: Stripe.Checkout.Session): Promise<string | null> {
    const intentId = typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id
    if (!intentId) return null
    try {
        const intent = await getStripe().paymentIntents.retrieve(intentId, { expand: ['latest_charge'] })
        const latest = intent.latest_charge
        return typeof latest === 'object' && latest ? (latest.payment_method_details?.type ?? null) : null
    } catch {
        return null
    }
}

/**
 * Baixa a cobranca a partir de uma sessao de Checkout paga. Idempotente: uma
 * cobranca ja paga (ou reentrega do evento) e ignorada sem erro.
 */
export async function confirmOnlinePayment(session: Stripe.Checkout.Session): Promise<'paid' | 'ignored'> {
    // PIX conclui o Checkout antes de compensar; a baixa vem no async_payment_succeeded.
    if (session.payment_status !== 'paid') return 'ignored'

    const chargeId = session.metadata?.chargeId ?? session.client_reference_id
    if (!chargeId) return 'ignored'

    const charge = await prisma.charge.findUnique({
        where: { id: chargeId },
        select: { id: true, clientId: true, status: true },
    })
    if (!charge) {
        console.warn(`[stripe] cobranca ${chargeId} da sessao ${session.id} nao encontrada`)
        return 'ignored'
    }
    if (charge.status === 'paid') return 'ignored'
    if (charge.status === 'canceled') {
        // Dinheiro recebido numa cobranca cancelada: precisa de acao manual (reativar ou estornar).
        console.error(`[stripe] pagamento ${session.id} recebido para cobranca cancelada ${chargeId}`)
        return 'ignored'
    }

    const method = await resolvePaymentMethod(session)
    try {
        await confirmChargePayment(chargeId, charge.clientId, 'all', null, { provider: 'stripe', method })
    } catch (error) {
        if (error instanceof Error && error.message.includes('ja foi baixada')) return 'ignored'
        throw error
    }
    return 'paid'
}

export async function cancelCharge(chargeId: string, clientId: string) {
    const charge = await findChargeInScope(chargeId, clientId, 'all')
    if (charge.status === 'paid') throw new Error('Nao e possivel cancelar uma cobranca ja paga.')

    return prisma.charge.update({
        where: { id: chargeId },
        data: { status: 'canceled', canceledAt: new Date() },
    })
}

// ---------------------------------------------------------------------------
// Convites de pagador
// ---------------------------------------------------------------------------

export async function listPayerInvites(clientId: string): Promise<PayerInviteDTO[]> {
    const invites = await prisma.payerInvite.findMany({
        where: { clientId },
        include: { consumerUnit: { select: { name: true, clientNumber: true } } },
        orderBy: { createdAt: 'desc' },
    })

    return invites.map((invite) => ({
        id: invite.id,
        consumerUnitId: invite.consumerUnitId,
        consumerUnitName:
            invite.consumerUnit?.name ?? invite.consumerUnit?.clientNumber ?? 'Unidade consumidora',
        name: invite.name,
        email: invite.email,
        status: invite.status,
        expiresAt: invite.expiresAt.toISOString(),
        acceptedAt: invite.acceptedAt ? invite.acceptedAt.toISOString() : null,
        createdAt: invite.createdAt.toISOString(),
    }))
}

/**
 * Convida o responsavel de uma UC a criar um login proprio. O usuario nasce sob
 * o client do titular, com role `payer` — e o `resolveAccessibleUnitIds` o
 * restringe as UCs em que ele e o pagador.
 */
export async function invitePayer(params: {
    clientId: string
    consumerUnitId: string
    name: string
    email: string
    invitedByUserId: string
    appUrl: string
    titularName: string
}): Promise<PayerInviteDTO> {
    const email = params.email.trim().toLowerCase()

    const unit = await prisma.consumerUnit.findFirst({
        where: { id: params.consumerUnitId, clientId: params.clientId, deletedAt: null },
    })
    if (!unit) throw new Error('Unidade consumidora not found')

    // Um e-mail ja usado por outro client nao pode ser reaproveitado: o vinculo
    // usuario -> client e unico no modelo atual.
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser && existingUser.clientId !== params.clientId) {
        throw new Error('Este e-mail ja tem cadastro em outra conta. Use outro e-mail para o responsavel.')
    }

    const { token, tokenHash } = generateInviteToken()

    // Um convite pendente por UC de cada vez.
    await prisma.payerInvite.updateMany({
        where: { consumerUnitId: params.consumerUnitId, status: 'pending' },
        data: { status: 'revoked', revokedAt: new Date() },
    })

    const invite = await prisma.payerInvite.create({
        data: {
            clientId: params.clientId,
            consumerUnitId: params.consumerUnitId,
            name: params.name.trim(),
            email,
            tokenHash,
            expiresAt: computeInviteExpiry(),
            invitedByUserId: params.invitedByUserId,
        },
        include: { consumerUnit: { select: { name: true, clientNumber: true } } },
    })

    // Guarda o contato na UC — o e-mail de cobranca usa esses campos mesmo que o
    // convite nunca seja aceito.
    await prisma.consumerUnit.update({
        where: { id: params.consumerUnitId },
        data: { payerName: params.name.trim(), payerEmail: email },
    })

    const unitName = unit.name ?? unit.clientNumber ?? 'uma unidade consumidora'
    await sendMail({
        to: email,
        subject: `${params.titularName} convidou voce para acompanhar sua conta de energia`,
        html: payerInviteEmail({
            payerName: params.name.trim(),
            titularName: params.titularName,
            unitName,
            acceptUrl: `${params.appUrl.replace(/\/$/, '')}/convite/${token}`,
        }),
    })

    eventBus.emit(EventType.GD_PAYER_INVITED, {
        inviteId: invite.id,
        clientId: params.clientId,
        consumerUnitId: params.consumerUnitId,
        email,
    })

    return {
        id: invite.id,
        consumerUnitId: invite.consumerUnitId,
        consumerUnitName:
            invite.consumerUnit?.name ?? invite.consumerUnit?.clientNumber ?? 'Unidade consumidora',
        name: invite.name,
        email: invite.email,
        status: invite.status,
        expiresAt: invite.expiresAt.toISOString(),
        acceptedAt: null,
        createdAt: invite.createdAt.toISOString(),
    }
}

export async function revokePayerInvite(inviteId: string, clientId: string) {
    const invite = await prisma.payerInvite.findFirst({ where: { id: inviteId, clientId } })
    if (!invite) throw new Error('Convite not found')
    if (invite.status !== 'pending') throw new Error('Este convite nao esta mais pendente.')

    return prisma.payerInvite.update({
        where: { id: inviteId },
        data: { status: 'revoked', revokedAt: new Date() },
    })
}

/** Dados publicos do convite, para a tela de aceite mostrar o contexto. */
export async function describeInvite(token: string) {
    const invite = await prisma.payerInvite.findUnique({
        where: { tokenHash: hashInviteToken(token) },
        include: {
            consumerUnit: { select: { name: true, clientNumber: true } },
            client: { select: { name: true } },
        },
    })

    if (!invite) throw new Error('Convite not found')

    const usability = resolveInviteUsability(invite)

    return {
        valid: usability.usable,
        reason: usability.reason ?? null,
        name: invite.name,
        email: invite.email,
        titularName: invite.client?.name ?? 'o titular',
        consumerUnitName:
            invite.consumerUnit?.name ?? invite.consumerUnit?.clientNumber ?? 'sua unidade',
    }
}

/**
 * Aceita o convite: cria (ou reaproveita) o usuario pagador, vincula ao client
 * do titular e o marca como pagador da UC.
 */
export async function acceptPayerInvite(token: string, password: string) {
    const invite = await prisma.payerInvite.findUnique({
        where: { tokenHash: hashInviteToken(token) },
    })
    if (!invite) throw new Error('Convite not found')

    const usability = resolveInviteUsability(invite)
    if (!usability.usable) throw new Error(usability.reason ?? 'Convite invalido.')

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.$transaction(async (tx) => {
        const existing = await tx.user.findUnique({ where: { email: invite.email } })

        if (existing && existing.clientId !== invite.clientId) {
            throw new Error('Este e-mail ja tem cadastro em outra conta.')
        }

        const payerUser = existing
            ? await tx.user.update({
                  where: { id: existing.id },
                  data: {
                      password: hashedPassword,
                      isActive: true,
                      roles: Array.from(new Set([...(existing.roles ?? []), PAYER_ROLE])),
                  },
              })
            : await tx.user.create({
                  data: {
                      name: invite.name,
                      email: invite.email,
                      password: hashedPassword,
                      clientId: invite.clientId,
                      roles: [PAYER_ROLE],
                      permissions: PAYER_PERMISSIONS,
                  },
              })

        await tx.consumerUnit.update({
            where: { id: invite.consumerUnitId },
            data: { payerUserId: payerUser.id },
        })

        // Cobrancas ja emitidas passam a apontar para o login recem-criado.
        await tx.charge.updateMany({
            where: { consumerUnitId: invite.consumerUnitId, payerUserId: null },
            data: { payerUserId: payerUser.id },
        })

        await tx.payerInvite.update({
            where: { id: invite.id },
            data: { status: 'accepted', acceptedAt: new Date(), acceptedUserId: payerUser.id },
        })

        return payerUser
    })

    eventBus.emit(EventType.GD_PAYER_ACCEPTED, {
        inviteId: invite.id,
        clientId: invite.clientId,
        consumerUnitId: invite.consumerUnitId,
        userId: user.id,
    })

    return { id: user.id, email: user.email, name: user.name }
}
