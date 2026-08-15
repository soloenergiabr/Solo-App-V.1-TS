import { NextRequest, NextResponse } from 'next/server'
import { withHandle } from '@/app/api/api-utils'
import { AuthMiddleware } from '@/backend/auth/middleware/auth.middleware'
import { assertNotPayer } from '@/backend/controle/scope'
import { resolveGdClientId, revokePayerInvite } from '@/backend/gd/gd.service'

/** DELETE /api/gd/invites/[inviteId] — cancela um convite pendente. */
const revoke = async (request: NextRequest, context: { params: Promise<{ inviteId: string }> }) => {
    const user = await AuthMiddleware.requireAuth(request)
    await assertNotPayer(user.userId)

    const { inviteId } = await context.params
    const clientId = resolveGdClientId(user, new URL(request.url).searchParams.get('clientId'))

    await revokePayerInvite(inviteId, clientId)

    return NextResponse.json({ success: true, message: 'Convite cancelado' })
}

export const DELETE = withHandle(revoke)
