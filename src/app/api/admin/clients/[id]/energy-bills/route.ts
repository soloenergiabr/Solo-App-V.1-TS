import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withHandle } from '@/app/api/api-utils';
import { AuthMiddleware } from '@/backend/auth/middleware/auth.middleware';
import { Prisma } from '@/app/generated/prisma';
import prisma from '@/lib/prisma';
import { EnergyBillStatus } from '@/shared/economia/types';

const optionalNumber = z.coerce.number().optional().nullable();
const optionalDate = z.coerce.date().optional().nullable();

const energyBillSchema = z.object({
    plantId: z.string().min(1),
    consumerUnitId: z.string().min(1),
    competenceDate: z.coerce.date(),
    referenceMonth: z.coerce.number().int().min(1).max(12),
    referenceYear: z.coerce.number().int().min(2000).max(2100),
    billFileUrl: z.string().optional().nullable(),
    rawBillFileKey: z.string().optional().nullable(),
    rawBillFileSize: z.coerce.number().int().optional().nullable(),
    accountHolder: z.string().optional().nullable(),
    accountNumber: z.string().optional().nullable(),
    clientNumber: z.string().optional().nullable(),
    instalationNumber: z.string().optional().nullable(),
    distributor: z.string().optional().nullable(),
    consumerClass: z.string().optional().nullable(),
    tariffModality: z.string().optional().nullable(),
    connectionType: z.string().optional().nullable(),
    tariffPeriod: z.string().optional().nullable(),
    billingDays: z.coerce.number().int().optional().nullable(),
    readingPeriodFrom: optionalDate,
    readingPeriodTo: optionalDate,
    creditExpiryDate: optionalDate,
    monitoredGenerationKwh: optionalNumber,
    billedConsumptionKwh: optionalNumber,
    consumptionKwh: optionalNumber,
    realConsumptionKwh: optionalNumber,
    injectedEnergyKwh: optionalNumber,
    compensatedEnergyKwh: optionalNumber,
    previousCreditsKwh: optionalNumber,
    currentCreditsKwh: optionalNumber,
    expectedGenerationKwh: optionalNumber,
    generationEfficiency: optionalNumber,
    meterReadingCurrent: optionalNumber,
    meterReadingPrevious: optionalNumber,
    demandContractedKw: optionalNumber,
    demandMeasuredKw: optionalNumber,
    totalBillValue: optionalNumber,
    totalAmount: optionalNumber,
    energyCost: optionalNumber,
    availabilityCost: optionalNumber,
    publicLightingCost: optionalNumber,
    icmsCost: optionalNumber,
    pisCost: optionalNumber,
    cofinsCost: optionalNumber,
    pisCofinsCost: optionalNumber,
    tariffPerKwh: optionalNumber,
    tariffTeValue: optionalNumber,
    tariffTusdValue: optionalNumber,
    tariffFlag: z.string().optional().nullable(),
    tariffFlagCost: optionalNumber,
    sectoralCharges: optionalNumber,
    fineAmount: optionalNumber,
    interestAmount: optionalNumber,
    otherCharges: optionalNumber,
    estimatedSavings: optionalNumber,
    aiAnalysis: z.string().optional().nullable(),
    aiExplanations: z.unknown().optional().nullable(),
    aiRecommendations: z.unknown().optional().nullable(),
    alerts: z.unknown().optional().nullable(),
    extraCharges: z.unknown().optional().nullable(),
    billingItems: z.unknown().optional().nullable(),
    creditSummary: z.unknown().optional().nullable(),
    billScore: optionalNumber,
    status: z.enum(['draft', 'pending_review', 'confirmed', 'paid', 'rejected']).optional().nullable(),
});

async function assertBillRelations(clientId: string, plantId: string, consumerUnitId: string) {
    const [plant, unit] = await Promise.all([
        prisma.plant.findFirst({ where: { id: plantId, clientId, deletedAt: null } }),
        prisma.consumerUnit.findFirst({ where: { id: consumerUnitId, clientId, deletedAt: null } }),
    ]);

    if (!plant) throw new Error('Usina not found');
    if (!unit) throw new Error('Unidade consumidora not found');
    if (unit.plantId !== plantId) {
        throw new Error('A unidade consumidora deve pertencer à usina selecionada');
    }
}

function jsonValue(value: unknown) {
    if (value === undefined) return undefined;
    return value === null ? Prisma.JsonNull : value as Prisma.InputJsonValue;
}

const listEnergyBills = async (
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) => {
    await AuthMiddleware.extractUserContext(request);
    const { id: clientId } = await params;
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year');
    const unitId = searchParams.get('consumerUnitId');

    const bills = await prisma.energyBill.findMany({
        where: {
            clientId,
            ...(year ? { referenceYear: Number(year) } : {}),
            ...(unitId ? { consumerUnitId: unitId } : {}),
        },
        include: {
            plant: { select: { id: true, name: true } },
            consumerUnit: { select: { id: true, name: true, clientNumber: true, installationNumber: true } },
        },
        orderBy: [{ referenceYear: 'desc' }, { referenceMonth: 'desc' }],
    });

    return NextResponse.json({ success: true, data: bills });
};

const createEnergyBill = async (
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) => {
    await AuthMiddleware.extractUserContext(request);
    const { id: clientId } = await params;
    const data = energyBillSchema.parse(await request.json());

    await assertBillRelations(clientId, data.plantId, data.consumerUnitId);

    const bill = await prisma.energyBill.upsert({
        where: {
            consumerUnitId_referenceMonth_referenceYear: {
                consumerUnitId: data.consumerUnitId,
                referenceMonth: data.referenceMonth,
                referenceYear: data.referenceYear,
            },
        },
        update: {
            ...data,
            aiExplanations: jsonValue(data.aiExplanations),
            aiRecommendations: jsonValue(data.aiRecommendations),
            alerts: jsonValue(data.alerts),
            extraCharges: jsonValue(data.extraCharges),
            billingItems: jsonValue(data.billingItems),
            creditSummary: jsonValue(data.creditSummary),
        },
        create: {
            ...data,
            clientId,
            aiExplanations: jsonValue(data.aiExplanations),
            aiRecommendations: jsonValue(data.aiRecommendations),
            alerts: jsonValue(data.alerts),
            extraCharges: jsonValue(data.extraCharges),
            billingItems: jsonValue(data.billingItems),
            creditSummary: jsonValue(data.creditSummary),
        },
    });

    return NextResponse.json({ success: true, message: 'Fatura salva com sucesso', data: bill }, { status: 201 });
};

export const GET = withHandle(listEnergyBills);
export const POST = withHandle(createEnergyBill);
