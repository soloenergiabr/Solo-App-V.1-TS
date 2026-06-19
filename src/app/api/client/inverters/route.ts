import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withHandle } from '@/app/api/api-utils';
import { AuthMiddleware } from '@/backend/auth/middleware/auth.middleware';
import { PrismaInverterRepository } from '@/backend/generation/repositories/implementations/prisma.inverter.repository';
import { InverterModel } from '@/backend/generation/models/inverter.model';
import prisma from '@/lib/prisma';
import { uuid } from '@/lib/uuid';

const inverterSchema = z.object({
    plantId: z.string().min(1),
    name: z.string().trim().optional(),
    serialNumber: z.string().trim().optional(),
    provider: z.string().trim().optional(),
    providerId: z.string().trim().optional(),
    providerApiKey: z.string().trim().optional(),
    providerApiSecret: z.string().trim().optional(),
    providerUrl: z.string().trim().optional(),
});

const inverterRepository = new PrismaInverterRepository(prisma);

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

    // Build inverter model — encryption is handled transparently by the repository
    const inverter = new InverterModel(
        uuid(),
        data.name || `Inversor ${data.provider || ''} ${data.serialNumber || ''}`.trim(),
        data.provider || 'other',
        data.providerId || uuid(),
        data.providerApiKey,
        data.providerApiSecret,
        data.providerUrl,
        clientId,
        {
            plantId: data.plantId,
            serialNumber: data.serialNumber,
        }
    );

    await inverterRepository.create(inverter);

    // Return success without exposing credentials
    return NextResponse.json({
        success: true,
        message: 'Inversor adicionado com sucesso',
        data: {
            id: inverter.id,
            name: inverter.name,
            provider: inverter.provider,
            providerId: inverter.providerId,
            plantId: inverter.plantId,
            serialNumber: inverter.serialNumber,
        },
    }, { status: 201 });
};

export const POST = withHandle(createInverter);
