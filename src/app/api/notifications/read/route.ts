import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { withHandle } from '@/app/api/api-utils'
import { AuthMiddleware } from '@/backend/auth/middleware/auth.middleware'

const bodySchema = z.object({ id: z.string().min(1).optional() })

// Marca uma notificacao (id) ou todas do cliente como lidas.
const markRead = async (request: NextRequest) => {
    const user = await AuthMiddleware.requireAuth(request)
    const { id } = bodySchema.parse(await request.json().catch(() => ({})))
    if (!user.clientId) return NextResponse.json({ success: true, data: { updated: 0 } })

    const { count } = await prisma.notification.updateMany({
        where: { clientId: user.clientId, readAt: null, ...(id ? { id } : {}) },
        data: { readAt: new Date() },
    })

    return NextResponse.json({ success: true, data: { updated: count } })
}

export const PATCH = withHandle(markRead)
