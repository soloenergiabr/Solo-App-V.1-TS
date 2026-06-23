import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withHandle } from '@/app/api/api-utils';
import { AuthMiddleware } from '@/backend/auth/middleware/auth.middleware';
import prisma from '@/lib/prisma';

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

    // Validate plant belongs to client
    const plant = await prisma.plant.findFirst({
        where: { id: data.plantId, clientId, deletedAt: null },
    });
    if (!plant) throw new Error('Usina não encontrada');

    // Find-or-create manual inverter for this plant
    let inverter = await prisma.inverter.findFirst({
        where: {
            clientId,
            plantId: data.plantId,
            provider: 'manual',
            deletedAt: null,
        },
    });

    if (!inverter) {
        inverter = await prisma.inverter.create({
            data: {
                clientId,
                plantId: data.plantId,
                provider: 'manual',
                providerId: 'manual',
                name: 'Entrada Manual',
                syncEnabled: false,
            },
        });
    }

    const providerRecordId = `${data.referenceYear}-${data.referenceMonth}`;
    const timestamp = new Date(data.referenceYear, data.referenceMonth - 1, 1);

    // Upsert GenerationUnit using the @@unique constraint
    const generationUnit = await prisma.generationUnit.upsert({
        where: {
            inverterId_generationUnitType_providerRecordId: {
                inverterId: inverter.id,
                generationUnitType: 'month',
                providerRecordId,
            },
        },
        create: {
            inverterId: inverter.id,
            generationUnitType: 'month',
            energy: data.energyKwh,
            power: 0,
            source: 'manual_pending',
            providerRecordId,
            timestamp,
        },
        update: {
            energy: data.energyKwh,
            power: 0,
            source: 'manual_pending',
            timestamp,
        },
    });

    return NextResponse.json(
        { success: true, message: 'Geração registrada para revisão', data: generationUnit },
        { status: 201 }
    );
};

export const POST = withHandle(createGeneration);
