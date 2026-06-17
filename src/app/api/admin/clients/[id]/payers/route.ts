import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withHandle } from '@/app/api/api-utils';
import { AuthMiddleware } from '@/backend/auth/middleware/auth.middleware';
import prisma from '@/lib/prisma';

const payerSchema = z.object({
    unitId: z.string().min(1),
    payerName: z.string().trim().optional().nullable(),
    payerEmail: z.string().trim().optional().nullable(),
    payerPhone: z.string().trim().optional().nullable(),
    payerUserId: z.string().trim().optional().nullable(),
});

const assignPayer = async (
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) => {
    await AuthMiddleware.extractUserContext(request);
    const { id: clientId } = await params;
    const { unitId, ...payer } = payerSchema.parse(await request.json());

    const existing = await prisma.consumerUnit.findFirst({
        where: { id: unitId, clientId, deletedAt: null },
    });
    if (!existing) throw new Error('Unidade consumidora not found');

    if (payer.payerUserId) {
        const user = await prisma.user.findFirst({ where: { id: payer.payerUserId } });
        if (!user) throw new Error('Usuário pagador not found');
    }

    const unit = await prisma.consumerUnit.update({
        where: { id: unitId },
        data: payer,
    });

    return NextResponse.json({ success: true, message: 'Pagador atualizado com sucesso', data: unit });
};

export const PUT = withHandle(assignPayer);
