import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withHandle } from '@/app/api/api-utils';
import { AuthMiddleware } from '@/backend/auth/middleware/auth.middleware';
import prisma from '@/lib/prisma';

const inverterSchema = z.object({
    plantId: z.string().min(1),
    name: z.string().trim().optional(),
    serialNumber: z.string().trim().optional(),
    provider: z.string().trim().optional(),
    providerId: z.string().trim().optional(),
});

const createInverter = async (request: NextRequest) => {
    const userContext = await AuthMiddleware.requireAuth(request);
    const clientId = userContext.clientId;
    if (!clientId) throw new Error('Cliente nao identificado.');

    const data = inverterSchema.parse(await request.json());

    // Verify plant belongs to client
    const plant = await prisma.plant.findFirst({
        where: { id: data.plantId, clientId, deletedAt: null },
    });
    if (!plant) throw new Error('Usina nao encontrada');

    const inverter = await prisma.inverter.create({
        data: {
            ...data,
            plantId: data.plantId,
        },
    });

    return NextResponse.json({ success: true, message: 'Inversor adicionado com sucesso', data: inverter }, { status: 201 });
};

export const POST = withHandle(createInverter);
