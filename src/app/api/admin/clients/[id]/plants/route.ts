import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withHandle } from '@/app/api/api-utils';
import { AuthMiddleware } from '@/backend/auth/middleware/auth.middleware';
import prisma from '@/lib/prisma';

const plantSchema = z.object({
    name: z.string().trim().min(1).optional(),
    provider: z.string().trim().optional(),
    providerStatus: z.string().trim().optional(),
    providerPlantId: z.string().trim().optional(),
    installedPowerKw: z.coerce.number().min(0).optional(),
    totalEnergyKwh: z.coerce.number().min(0).optional(),
    address: z.string().trim().optional(),
    city: z.string().trim().optional(),
    state: z.string().trim().optional(),
    timezone: z.string().trim().optional(),
    latitude: z.coerce.number().optional(),
    longitude: z.coerce.number().optional(),
    providerMetadata: z.unknown().optional(),
});

const listPlants = async (
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) => {
    await AuthMiddleware.extractUserContext(request);
    const { id: clientId } = await params;

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

const createPlant = async (
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) => {
    await AuthMiddleware.extractUserContext(request);
    const { id: clientId } = await params;
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
