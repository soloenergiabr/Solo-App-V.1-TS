import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withHandle } from '@/app/api/api-utils';
import { AuthMiddleware } from '@/backend/auth/middleware/auth.middleware';
import prisma from '@/lib/prisma';

const consumerUnitSchema = z.object({
    plantId: z.string().min(1),
    name: z.string().trim().min(1).optional(),
    isGenerator: z.boolean().optional(),
    isConsumer: z.boolean().optional(),
    accountHolder: z.string().trim().optional(),
    accountNumber: z.string().trim().optional(),
    clientNumber: z.string().trim().optional(),
    installationNumber: z.string().trim().optional(),
    distributor: z.string().trim().optional(),
    address: z.string().trim().optional(),
    city: z.string().trim().optional(),
    state: z.string().trim().optional(),
    status: z.string().trim().optional(),
});

const listConsumerUnits = async (
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) => {
    await AuthMiddleware.extractUserContext(request);
    const { id: clientId } = await params;

    const units = await prisma.consumerUnit.findMany({
        where: { clientId, deletedAt: null },
        include: {
            plant: { select: { id: true, name: true, providerPlantId: true } },
            _count: { select: { energyBills: true, allocationsFrom: true, allocationsTo: true } },
        },
        orderBy: [{ name: 'asc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json({ success: true, data: units });
};

const createConsumerUnit = async (
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) => {
    await AuthMiddleware.extractUserContext(request);
    const { id: clientId } = await params;
    const data = consumerUnitSchema.parse(await request.json());

    const plant = await prisma.plant.findFirst({ where: { id: data.plantId, clientId, deletedAt: null } });
    if (!plant) throw new Error('Usina not found');

    const unit = await prisma.consumerUnit.create({
        data: {
            ...data,
            clientId,
        },
    });

    return NextResponse.json({ success: true, message: 'Unidade consumidora criada com sucesso', data: unit }, { status: 201 });
};

export const GET = withHandle(listConsumerUnits);
export const POST = withHandle(createConsumerUnit);
