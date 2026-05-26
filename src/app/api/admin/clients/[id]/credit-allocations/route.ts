import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withHandle } from '@/app/api/api-utils';
import { AuthMiddleware } from '@/backend/auth/middleware/auth.middleware';
import prisma from '@/lib/prisma';

const allocationSchema = z.object({
    plantId: z.string().min(1),
    fromId: z.string().min(1),
    toId: z.string().min(1),
    allocationPercentage: z.coerce.number().min(0).max(100),
    startsAt: z.coerce.date().optional(),
    endsAt: z.coerce.date().optional(),
    isActive: z.boolean().optional(),
});

async function validateAllocationOwnership(clientId: string, data: z.infer<typeof allocationSchema>) {
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

const listCreditAllocations = async (
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) => {
    await AuthMiddleware.extractUserContext(request);
    const { id: clientId } = await params;

    const allocations = await prisma.creditAllocation.findMany({
        where: { clientId, deletedAt: null },
        include: {
            plant: { select: { id: true, name: true } },
            from: { select: { id: true, name: true, clientNumber: true, installationNumber: true } },
            to: { select: { id: true, name: true, clientNumber: true, installationNumber: true } },
        },
        orderBy: [{ isActive: 'desc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json({ success: true, data: allocations });
};

const createCreditAllocation = async (
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) => {
    await AuthMiddleware.extractUserContext(request);
    const { id: clientId } = await params;
    const data = allocationSchema.parse(await request.json());

    await validateAllocationOwnership(clientId, data);

    const allocation = await prisma.creditAllocation.create({
        data: {
            ...data,
            clientId,
        },
    });

    return NextResponse.json({ success: true, message: 'Rateio criado com sucesso', data: allocation }, { status: 201 });
};

export const GET = withHandle(listCreditAllocations);
export const POST = withHandle(createCreditAllocation);
