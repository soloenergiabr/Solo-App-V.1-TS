import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withHandle } from '@/app/api/api-utils';
import { AuthMiddleware } from '@/backend/auth/middleware/auth.middleware';
import prisma from '@/lib/prisma';
import {
    recordManualGeneration,
    MANUAL_INVERTER_PROVIDER,
} from '@/backend/generation/manual-generation.service';

const createGenerationSchema = z.object({
    plantId: z.string().min(1, 'Usina é obrigatória'),
    referenceMonth: z.coerce.number().int().min(1).max(12),
    referenceYear: z.coerce.number().int().min(2000).max(2100),
    energyKwh: z.coerce.number().min(0, 'A geração deve ser maior ou igual a 0'),
});

/** List the client's manual monthly generation rows (admin view), newest first. */
const listManualGeneration = async (
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) => {
    await AuthMiddleware.requireRole(request, 'master');
    const { id: clientId } = await params;

    const units = await prisma.generationUnit.findMany({
        where: {
            inverter: { clientId, provider: MANUAL_INVERTER_PROVIDER },
            generationUnitType: 'month',
            deletedAt: null,
        },
        include: { inverter: { select: { plantId: true } } },
        orderBy: { timestamp: 'desc' },
    });

    return NextResponse.json({ success: true, data: units });
};

/** Solo team records a month's generation by hand. Admin entries are active immediately. */
const createManualGeneration = async (
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) => {
    await AuthMiddleware.requireRole(request, 'master');
    const { id: clientId } = await params;
    const data = createGenerationSchema.parse(await request.json());

    const plant = await prisma.plant.findFirst({
        where: { id: data.plantId, clientId, deletedAt: null },
    });
    if (!plant) throw new Error('Usina não encontrada');

    const unit = await recordManualGeneration({
        clientId,
        plantId: data.plantId,
        referenceYear: data.referenceYear,
        referenceMonth: data.referenceMonth,
        energyKwh: data.energyKwh,
        source: 'manual',
    });

    return NextResponse.json(
        { success: true, message: 'Geração registrada com sucesso', data: unit },
        { status: 201 },
    );
};

export const GET = withHandle(listManualGeneration);
export const POST = withHandle(createManualGeneration);
