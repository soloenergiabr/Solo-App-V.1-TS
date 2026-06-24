import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withHandle } from '@/app/api/api-utils';
import { AuthMiddleware } from '@/backend/auth/middleware/auth.middleware';
import prisma from '@/lib/prisma';
import { recordManualGeneration } from '@/backend/generation/manual-generation.service';

const createGenerationSchema = z.object({
    plantId: z.string().min(1, 'Usina é obrigatória'),
    referenceMonth: z.coerce.number().int().min(1).max(12),
    referenceYear: z.coerce.number().int().min(2000).max(2100),
    energyKwh: z.coerce.number().min(0, 'A geração deve ser maior ou igual a 0'),
});

const createGeneration = async (request: NextRequest) => {
    const userContext = await AuthMiddleware.requireAuth(request);
    const clientId = userContext.clientId;
    if (!clientId) throw new Error('Cliente nao identificado.');

    const data = createGenerationSchema.parse(await request.json());

    // Server-enforced scope: the plant must belong to the authenticated client.
    const plant = await prisma.plant.findFirst({
        where: { id: data.plantId, clientId, deletedAt: null },
    });
    if (!plant) throw new Error('Usina não encontrada');

    // Client proposals land as manual_pending and are excluded from active
    // generation aggregates until Solo validates them.
    const generationUnit = await recordManualGeneration({
        clientId,
        plantId: data.plantId,
        referenceYear: data.referenceYear,
        referenceMonth: data.referenceMonth,
        energyKwh: data.energyKwh,
        source: 'manual_pending',
    });

    return NextResponse.json(
        { success: true, message: 'Geração registrada para revisão', data: generationUnit },
        { status: 201 }
    );
};

export const POST = withHandle(createGeneration);
