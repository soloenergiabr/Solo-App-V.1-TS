import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withHandle } from '@/app/api/api-utils';
import { AuthMiddleware } from '@/backend/auth/middleware/auth.middleware';
import prisma from '@/lib/prisma';

const plantSchema = z.object({
    name: z.string().trim().min(1),
    installedPowerKw: z.coerce.number().min(0).optional(),
    address: z.string().trim().optional(),
    city: z.string().trim().optional(),
    state: z.string().trim().optional(),
    provider: z.string().trim().optional(),
    providerPlantId: z.string().trim().optional(),
    timezone: z.string().trim().optional(),
});

const listPlants = async (request: NextRequest) => {
    const userContext = await AuthMiddleware.requireAuth(request);
    const clientId = userContext.clientId;
    if (!clientId) throw new Error('Cliente nao identificado.');

    const plants = await prisma.plant.findMany({
        where: { clientId, deletedAt: null },
        include: {
            _count: {
                select: {
                    inverters: true,
                    consumerUnits: true,
                    creditAllocations: true,
                    energyBills: true,
                },
            },
        },
        orderBy: [{ name: 'asc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json({ success: true, data: plants });
};

const createPlant = async (request: NextRequest) => {
    const userContext = await AuthMiddleware.requireAuth(request);
    const clientId = userContext.clientId;
    if (!clientId) throw new Error('Cliente nao identificado.');

    const data = plantSchema.parse(await request.json());

    const plant = await prisma.plant.create({
        data: {
            ...data,
            clientId,
        },
    });

    return NextResponse.json({ success: true, message: 'Usina criada com sucesso', data: plant }, { status: 201 });
};

export const GET = withHandle(listPlants);
export const POST = withHandle(createPlant);
