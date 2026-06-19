import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withHandle } from '@/app/api/api-utils';
import { AuthMiddleware } from '@/backend/auth/middleware/auth.middleware';
import { encrypt } from '@/backend/crypto/encryption';
import prisma from '@/lib/prisma';

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

    // Encrypt sensitive credentials before storing
    const encryptedData: Record<string, unknown> = { ...data };
    if (data.providerApiKey) {
        encryptedData.providerApiKey = encrypt(data.providerApiKey);
    }
    if (data.providerApiSecret) {
        encryptedData.providerApiSecret = encrypt(data.providerApiSecret);
    }

    const inverter = await prisma.inverter.create({
        data: encryptedData as typeof data & { plantId: string },
    });

    return NextResponse.json({ success: true, message: 'Inversor adicionado com sucesso', data: inverter }, { status: 201 });
};

export const POST = withHandle(createInverter);
