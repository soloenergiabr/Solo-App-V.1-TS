import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { config } from '@/config'
import { withHandle } from '@/app/api/api-utils'
import { AuthMiddleware } from '@/backend/auth/middleware/auth.middleware'
import { assertNotPayer } from '@/backend/controle/scope'
import { invitePayer, listPayerInvites, resolveGdClientId } from '@/backend/gd/gd.service'

const inviteSchema = z.object({
    consumerUnitId: z.string().min(1, 'Unidade consumidora e obrigatoria'),
    name: z.string().trim().min(2, 'Informe o nome do responsavel'),
    email: z.string().trim().email('E-mail invalido'),
})

/** GET /api/gd/invites — convites de responsaveis do cliente. */
const listInvites = async (request: NextRequest) => {
    const user = await AuthMiddleware.requireAuth(request)
    await assertNotPayer(user.userId)

    const clientId = resolveGdClientId(user, new URL(request.url).searchParams.get('clientId'))
    const data = await listPayerInvites(clientId)

    return NextResponse.json({ success: true, data })
}

/** POST /api/gd/invites — convida o responsavel de uma UC a criar login proprio. */
const createInvite = async (request: NextRequest) => {
    const user = await AuthMiddleware.requireAuth(request)
    await assertNotPayer(user.userId)

    const clientId = resolveGdClientId(user, new URL(request.url).searchParams.get('clientId'))
    const input = inviteSchema.parse(await request.json())

    const client = await prisma.client.findUnique({
        where: { id: clientId },
        select: { name: true },
    })

    // Mesma fonte de verdade do link de reset de senha (forgot-password.use-case).
    // Producao define NEXT_PUBLIC_BASE_URL; o fallback de origin so vale em dev,
    // porque atras do proxy ele pode resolver para o host interno do container.
    const appUrl = config.base_url || new URL(request.url).origin

    const invite = await invitePayer({
        clientId,
        consumerUnitId: input.consumerUnitId,
        name: input.name,
        email: input.email,
        invitedByUserId: user.userId,
        appUrl,
        titularName: client?.name ?? 'O titular da conta',
    })

    return NextResponse.json({
        success: true,
        message: `Convite enviado para ${invite.email}`,
        data: invite,
    })
}

export const GET = withHandle(listInvites)
export const POST = withHandle(createInvite)
