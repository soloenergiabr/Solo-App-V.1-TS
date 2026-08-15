import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { withHandle } from '@/app/api/api-utils'
import { acceptPayerInvite, describeInvite } from '@/backend/gd/gd.service'

/**
 * Rota publica: quem chega aqui ainda nao tem login. O token do convite e a
 * unica credencial, por isso ele e longo, aleatorio e expira em 7 dias.
 */

const acceptSchema = z.object({
    token: z.string().min(1),
    password: z
        .string()
        .min(8, 'A senha deve ter no minimo 8 caracteres')
        .regex(/[A-Z]/, 'A senha deve conter pelo menos uma letra maiuscula')
        .regex(/[a-z]/, 'A senha deve conter pelo menos uma letra minuscula')
        .regex(/[0-9]/, 'A senha deve conter pelo menos um numero'),
})

/** GET /api/gd/invites/accept?token= — contexto do convite para a tela de aceite. */
const describe = async (request: NextRequest) => {
    const token = new URL(request.url).searchParams.get('token')
    if (!token) throw new Error('Convite not found')

    const data = await describeInvite(token)

    return NextResponse.json({ success: true, data })
}

/** POST /api/gd/invites/accept — cria o login do responsavel. */
const accept = async (request: NextRequest) => {
    const { token, password } = acceptSchema.parse(await request.json())
    const user = await acceptPayerInvite(token, password)

    return NextResponse.json({
        success: true,
        message: 'Acesso criado com sucesso! Faca login para acompanhar sua conta.',
        data: user,
    })
}

export const GET = withHandle(describe)
export const POST = withHandle(accept)
