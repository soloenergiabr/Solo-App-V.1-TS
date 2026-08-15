import { NextRequest, NextResponse } from 'next/server';
import { withHandle } from '@/app/api/api-utils';
import { AuthMiddleware } from '@/backend/auth/middleware/auth.middleware';
import { assertNotPayer } from '@/backend/controle/scope';
import prisma from '@/lib/prisma';

/**
 * GET /api/rateio
 * List all credit allocations for the current user's client.
 */
const listAllocations = async (request: NextRequest) => {
    const user = await AuthMiddleware.requireAuth(request);
    // O rateio é do titular: um pagador não enxerga a distribuição de créditos
    // entre as outras unidades do prédio.
    await assertNotPayer(user.userId);
    if (!user.clientId) throw new Error('Usuário sem cliente vinculado');

    const allocations = await prisma.creditAllocation.findMany({
        where: { clientId: user.clientId, deletedAt: null },
        include: {
            plant: { select: { id: true, name: true } },
            from: { select: { id: true, name: true, clientNumber: true } },
            to: { select: { id: true, name: true, clientNumber: true } },
        },
        orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: allocations });
};

export const GET = withHandle(listAllocations);
