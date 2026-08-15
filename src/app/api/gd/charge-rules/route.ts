import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { withHandle } from '@/app/api/api-utils'
import { AuthMiddleware } from '@/backend/auth/middleware/auth.middleware'
import { assertNotPayer } from '@/backend/controle/scope'
import { listChargeRules, resolveGdClientId, upsertChargeRule } from '@/backend/gd/gd.service'

const ruleSchema = z.object({
    consumerUnitId: z.string().min(1, 'Unidade consumidora e obrigatoria'),
    mode: z.enum(['pass_through', 'per_kwh', 'fixed']),
    pricePerKwh: z.coerce.number().min(0).optional().nullable(),
    fixedAmount: z.coerce.number().min(0).optional().nullable(),
    dueDayOfMonth: z.coerce.number().int().min(1).max(31).optional().nullable(),
    isActive: z.boolean().optional(),
    notes: z.string().trim().max(500).optional().nullable(),
})

/** GET /api/gd/charge-rules — regra de cobranca por unidade consumidora. */
const listRules = async (request: NextRequest) => {
    const user = await AuthMiddleware.requireAuth(request)
    await assertNotPayer(user.userId)

    const clientId = resolveGdClientId(user, new URL(request.url).searchParams.get('clientId'))
    const data = await listChargeRules(clientId)

    return NextResponse.json({ success: true, data })
}

/** POST /api/gd/charge-rules — cria ou atualiza a regra de uma unidade. */
const saveRule = async (request: NextRequest) => {
    const user = await AuthMiddleware.requireAuth(request)
    await assertNotPayer(user.userId)

    const clientId = resolveGdClientId(user, new URL(request.url).searchParams.get('clientId'))
    const input = ruleSchema.parse(await request.json())
    const rule = await upsertChargeRule(clientId, input)

    return NextResponse.json({ success: true, message: 'Regra de cobranca salva', data: rule })
}

export const GET = withHandle(listRules)
export const POST = withHandle(saveRule)
