import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withHandle } from '@/app/api/api-utils';
import { AuthMiddleware } from '@/backend/auth/middleware/auth.middleware';
import prisma from '@/lib/prisma';

const consumerUnitSchema = z.object({
    plantId: z.string().min(1),
    name: z.string().trim().min(1),
    clientNumber: z.string().trim().optional(),
    installationNumber: z.string().trim().optional(),
    distributor: z.string().trim().optional(),
    address: z.string().trim().optional(),
    city: z.string().trim().optional(),
    state: z.string().trim().optional(),
});

const listConsumerUnits = async (request: NextRequest) => {
    const userContext = await AuthMiddleware.requireAuth(request);
    const clientId = userContext.clientId;
    if (!clientId) throw new Error('Cliente nao identificado.');

    const units = await prisma.consumerUnit.findMany({
        where: { clientId, deletedAt: null },
        select: {
            id: true,
            name: true,
            clientNumber: true,
            installationNumber: true,
            isGenerator: true,
            isConsumer: true,
            plantId: true,
            plant: { select: { id: true, name: true } },
        },
        orderBy: [{ name: 'asc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json({ success: true, data: units });
};

const createConsumerUnit = async (request: NextRequest) => {
    const userContext = await AuthMiddleware.requireAuth(request);
    const clientId = userContext.clientId;
    if (!clientId) throw new Error('Cliente nao identificado.');

    const data = consumerUnitSchema.parse(await request.json());

    const plant = await prisma.plant.findFirst({
        where: { id: data.plantId, clientId, deletedAt: null },
    });
    if (!plant) throw new Error('Usina nao encontrada');

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
