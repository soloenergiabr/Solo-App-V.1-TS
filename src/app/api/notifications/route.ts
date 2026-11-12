import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { withHandle } from '@/app/api/api-utils'
import { AuthMiddleware } from '@/backend/auth/middleware/auth.middleware'

// Notificacoes in-app do cliente logado (mais recentes primeiro) + contador de nao lidas.
const listNotifications = async (request: NextRequest) => {
    const user = await AuthMiddleware.requireAuth(request)
    if (!user.clientId) return NextResponse.json({ success: true, data: { items: [], unread: 0 } })

    const [items, unread] = await Promise.all([
        prisma.notification.findMany({
            where: { clientId: user.clientId },
            orderBy: { createdAt: 'desc' },
            take: 30,
            select: { id: true, type: true, title: true, body: true, link: true, readAt: true, createdAt: true },
        }),
        prisma.notification.count({ where: { clientId: user.clientId, readAt: null } }),
    ])

    return NextResponse.json({ success: true, data: { items, unread } })
}

export const GET = withHandle(listNotifications)
