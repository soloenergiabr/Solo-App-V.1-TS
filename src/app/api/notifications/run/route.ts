import { NextRequest, NextResponse } from 'next/server'
import { withHandle } from '@/app/api/api-utils'
import { AuthMiddleware } from '@/backend/auth/middleware/auth.middleware'
import { runDailyNotifications } from '@/backend/notifications/triggers'

/**
 * Dispara o job diario de notificacoes (cron externo). Aceita o header
 * x-sync-token == GENERATION_SYNC_TOKEN ou sessao master. Sem a env, so master.
 * Rodar mais de uma vez no dia nao reenvia nada (dedupeKey).
 */
const runNotifications = async (request: NextRequest) => {
    const expected = process.env.GENERATION_SYNC_TOKEN
    if (!expected || request.headers.get('x-sync-token') !== expected) {
        await AuthMiddleware.requireRole(request, 'master')
    }

    return NextResponse.json({ success: true, data: await runDailyNotifications() })
}

export const POST = withHandle(runNotifications)
