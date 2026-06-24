import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withHandle } from '@/app/api/api-utils';
import { AuthMiddleware } from '@/backend/auth/middleware/auth.middleware';
import prisma from '@/lib/prisma';
import { computeFallbackSavings } from '@/backend/economia/manual-bill-savings';

const createBillSchema = z.object({
    plantId: z.string().min(1, 'Usina é obrigatória'),
    consumerUnitId: z.string().min(1, 'Unidade consumidora é obrigatória'),
    competenceDate: z.string().min(1, 'Data de competência é obrigatória'),
    referenceMonth: z.coerce.number().int().min(1).max(12),
    referenceYear: z.coerce.number().int().min(2020),
    monitoredGenerationKwh: z.coerce.number().min(0).optional(),
    consumptionKwh: z.coerce.number().min(0).optional(),
    injectedEnergyKwh: z.coerce.number().min(0).optional(),
    tariffPerKwh: z.coerce.number().min(0).optional(),
    totalBillValue: z.coerce.number().min(0).optional(),
    estimatedSavings: z.coerce.number().optional(),
    paymentStatus: z.enum(['a_pagar', 'paga', 'vencida']).optional(),
});

const createBill = async (request: NextRequest) => {
    const userContext = await AuthMiddleware.requireAuth(request);
    const clientId = userContext.clientId;
    if (!clientId) throw new Error('Cliente nao identificado.');

    const data = createBillSchema.parse(await request.json());

    // Validate plant belongs to client
    const plant = await prisma.plant.findFirst({
        where: { id: data.plantId, clientId, deletedAt: null },
    });
    if (!plant) throw new Error('Usina não encontrada');

    // Validate consumer unit belongs to client AND plant
    const consumerUnit = await prisma.consumerUnit.findFirst({
        where: { id: data.consumerUnitId, clientId, plantId: data.plantId },
    });
    if (!consumerUnit) throw new Error('Unidade consumidora não encontrada');

    // Compute fallback savings using the shared utility
    const estimatedSavings = computeFallbackSavings({
        estimatedSavings: data.estimatedSavings,
        consumptionKwh: data.consumptionKwh,
        tariffPerKwh: data.tariffPerKwh,
        totalBillValue: data.totalBillValue,
    });

    const competenceDate = new Date(data.competenceDate);
    const status = 'pending_review';
    const paymentStatus = data.paymentStatus ?? 'a_pagar';

    // Upsert on the compound unique: [consumerUnitId, referenceMonth, referenceYear]
    const bill = await prisma.energyBill.upsert({
        where: {
            consumerUnitId_referenceMonth_referenceYear: {
                consumerUnitId: data.consumerUnitId,
                referenceMonth: data.referenceMonth,
                referenceYear: data.referenceYear,
            },
        },
        create: {
            clientId,
            plantId: data.plantId,
            consumerUnitId: data.consumerUnitId,
            competenceDate,
            referenceMonth: data.referenceMonth,
            referenceYear: data.referenceYear,
            monitoredGenerationKwh: data.monitoredGenerationKwh ?? null,
            consumptionKwh: data.consumptionKwh ?? null,
            injectedEnergyKwh: data.injectedEnergyKwh ?? null,
            tariffPerKwh: data.tariffPerKwh ?? null,
            totalBillValue: data.totalBillValue ?? null,
            estimatedSavings,
            status,
            paymentStatus,
        },
        update: {
            plantId: data.plantId,
            competenceDate,
            monitoredGenerationKwh: data.monitoredGenerationKwh ?? null,
            consumptionKwh: data.consumptionKwh ?? null,
            injectedEnergyKwh: data.injectedEnergyKwh ?? null,
            tariffPerKwh: data.tariffPerKwh ?? null,
            totalBillValue: data.totalBillValue ?? null,
            estimatedSavings,
            status,
            paymentStatus,
        },
    });

    return NextResponse.json(
        { success: true, message: 'Fatura enviada para revisão', data: bill },
        { status: 201 }
    );
};

export const POST = withHandle(createBill);
