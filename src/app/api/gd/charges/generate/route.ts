import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { withHandle } from '@/app/api/api-utils'
import { AuthMiddleware } from '@/backend/auth/middleware/auth.middleware'
import { assertNotPayer } from '@/backend/controle/scope'
import { generateCharges, resolveGdClientId } from '@/backend/gd/gd.service'

const generateSchema = z.object({
    referenceYear: z.coerce.number().int().min(2000).max(2100),
    referenceMonth: z.coerce.number().int().min(1).max(12),
})

/**
 * POST /api/gd/charges/generate
 * Recalcula as cobrancas em rascunho da competencia a partir das faturas e das
 * regras. Idempotente: rodar de novo nao duplica nem altera o que ja foi enviado.
 */
const generate = async (request: NextRequest) => {
    const user = await AuthMiddleware.requireAuth(request)
    await assertNotPayer(user.userId)

    const clientId = resolveGdClientId(user, new URL(request.url).searchParams.get('clientId'))
    const { referenceYear, referenceMonth } = generateSchema.parse(await request.json())

    const result = await generateCharges(clientId, referenceYear, referenceMonth)

    return NextResponse.json({
        success: true,
        message: `${result.created} cobranca(s) criada(s), ${result.updated} atualizada(s)`,
        data: result,
    })
}

export const POST = withHandle(generate)
