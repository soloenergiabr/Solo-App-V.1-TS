import { NextRequest, NextResponse } from 'next/server'
import { withHandle } from '@/app/api/api-utils'
import { AuthMiddleware } from '@/backend/auth/middleware/auth.middleware'
import { resolveAccessibleUnitIds } from '@/backend/controle/scope'
import { listCharges, resolveGdClientId } from '@/backend/gd/gd.service'

/**
 * GET /api/gd/charges?year=&month=
 * Titular ve as cobrancas de todas as UCs; pagador ve apenas as suas.
 */
const getCharges = async (request: NextRequest) => {
    const user = await AuthMiddleware.requireAuth(request)
    const { searchParams } = new URL(request.url)

    const now = new Date()
    const year = Number(searchParams.get('year')) || now.getFullYear()
    const month = Number(searchParams.get('month')) || now.getMonth() + 1

    const scope = await resolveAccessibleUnitIds(user.userId)
    // Pagador nunca informa clientId — o escopo por UC ja o restringe.
    const clientId =
        scope === 'all'
            ? resolveGdClientId(user, searchParams.get('clientId'))
            : (user.clientId ?? '')

    const data = await listCharges(clientId, scope, year, month)

    return NextResponse.json({ success: true, data })
}

export const GET = withHandle(getCharges)
