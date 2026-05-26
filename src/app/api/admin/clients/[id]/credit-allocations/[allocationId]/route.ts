import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withHandle } from '@/app/api/api-utils';
import { AuthMiddleware } from '@/backend/auth/middleware/auth.middleware';
import prisma from '@/lib/prisma';

const allocationSchema = z.object({
    plantId: z.string().min(1).optional(),
    fromId: z.string().min(1).optional(),
    toId: z.string().min(1).optional(),
    allocationPercentage: z.coerce.number().min(0).max(100).optional(),
    startsAt: z.coerce.date().optional().nullable(),
    endsAt: z.coerce.date().optional().nullable(),
    isActive: z.boolean().optional(),
});

async function validateAllocationOwnership(
    clientId: string,
    data: { plantId: string; fromId: string; toId: string }
) {
    const [plant, from, to] = await Promise.all([
        prisma.plant.findFirst({ where: { id: data.plantId, clientId, deletedAt: null } }),
        prisma.consumerUnit.findFirst({ where: { id: data.fromId, clientId, deletedAt: null } }),
        prisma.consumerUnit.findFirst({ where: { id: data.toId, clientId, deletedAt: null } }),
    ]);

    if (!plant) throw new Error('Usina not found');
    if (!from || !to) throw new Error('Unidade consumidora not found');
    if (!from.isGenerator) {
        throw new Error('A unidade de origem precisa estar marcada como geradora');
    }
    if (!to.isConsumer) {
        throw new Error('A unidade de destino precisa estar marcada como consumidora');
    }
    if (from.plantId !== data.plantId || to.plantId !== data.plantId) {
        throw new Error('Unidades de origem e destino devem pertencer à mesma usina do rateio');
    }
}

const updateCreditAllocation = async (
    request: NextRequest,
    { params }: { params: Promise<{ id: string; allocationId: string }> }
) => {
    await AuthMiddleware.extractUserContext(request);
    const { id: clientId, allocationId } = await params;
    const data = allocationSchema.parse(await request.json());

    const existing = await prisma.creditAllocation.findFirst({
        where: { id: allocationId, clientId, deletedAt: null },
    });
    if (!existing) throw new Error('Rateio not found');

    const nextOwnership = {
        plantId: data.plantId ?? existing.plantId,
        fromId: data.fromId ?? existing.fromId,
        toId: data.toId ?? existing.toId,
    };
    await validateAllocationOwnership(clientId, nextOwnership);

    const allocation = await prisma.creditAllocation.update({
        where: { id: allocationId },
        data,
    });

    return NextResponse.json({ success: true, message: 'Rateio atualizado com sucesso', data: allocation });
};

const deleteCreditAllocation = async (
    request: NextRequest,
    { params }: { params: Promise<{ id: string; allocationId: string }> }
) => {
    await AuthMiddleware.extractUserContext(request);
    const { id: clientId, allocationId } = await params;

    const existing = await prisma.creditAllocation.findFirst({
        where: { id: allocationId, clientId, deletedAt: null },
    });
    if (!existing) throw new Error('Rateio not found');

    await prisma.creditAllocation.update({
        where: { id: allocationId },
        data: { deletedAt: new Date() },
    });

    return NextResponse.json({ success: true, message: 'Rateio removido com sucesso' });
};

export const PUT = withHandle(updateCreditAllocation);
export const DELETE = withHandle(deleteCreditAllocation);
