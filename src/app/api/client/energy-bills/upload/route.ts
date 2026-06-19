import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@/app/generated/prisma';
import prisma from '@/lib/prisma';
import { withHandle } from '@/app/api/api-utils';
import { AuthMiddleware } from '@/backend/auth/middleware/auth.middleware';
import { uploadObject } from '@/lib/object-storage';
import { createGeminiBillAnalyzer, computeDeterministicFlags } from '@/backend/economia/analyzer';
import { eventBus, EventType } from '@/backend/shared/event-bus';

function cleanJsonText(text: string): string {
    let clean = text.trim();
    if (clean.startsWith('```json')) clean = clean.slice(7);
    if (clean.startsWith('```')) clean = clean.slice(3);
    if (clean.endsWith('```')) clean = clean.slice(0, -3);
    return clean.trim();
}

function numberOrNull(value: unknown): number | null {
    if (value === null || value === undefined || value === '') return null;
    const normalized = typeof value === 'string'
        ? value.replace(/\./g, '').replace(',', '.')
        : value;
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : null;
}

function stringOrNull(value: unknown): string | null {
    if (value === null || value === undefined) return null;
    const text = String(value).trim();
    return text.length > 0 ? text : null;
}

function dateOrNull(value: unknown): Date | null {
    const text = stringOrNull(value);
    if (!text) return null;
    const date = new Date(text);
    return Number.isNaN(date.getTime()) ? null : date;
}

function inferCompetenceDate(referenceMonth: number, referenceYear: number, rawCompetenceDate: unknown): Date {
    const parsed = dateOrNull(rawCompetenceDate);
    if (parsed) return new Date(parsed.getFullYear(), parsed.getMonth(), 1);
    return new Date(referenceYear, referenceMonth - 1, 1);
}

const uploadClientBill = async (request: NextRequest) => {
    const userContext = await AuthMiddleware.requireAuth(request);

    if (!userContext.clientId) {
        return NextResponse.json(
            { success: false, message: 'Cliente nao identificado.' },
            { status: 403 },
        );
    }

    const clientId = userContext.clientId;
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const consumerUnitId = stringOrNull(formData.get('consumerUnitId'));

    if (!file) {
        return NextResponse.json({ success: false, message: 'Nenhum arquivo enviado.' }, { status: 400 });
    }

    if (!consumerUnitId) {
        return NextResponse.json({ success: false, message: 'Selecione uma unidade consumidora.' }, { status: 400 });
    }

    const consumerUnit = await prisma.consumerUnit.findFirst({
        where: { id: consumerUnitId, clientId, deletedAt: null },
        include: { plant: true },
    });

    if (!consumerUnit) {
        return NextResponse.json({ success: false, message: 'Unidade consumidora nao encontrada.' }, { status: 404 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const mimeType = file.type || 'application/pdf';

    // Upload PDF to object storage
    const fileKey = [
        'energy-bills',
        clientId,
        consumerUnitId,
        `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`,
    ].join('/');

    const uploaded = await uploadObject({
        key: fileKey,
        body: buffer,
        contentType: mimeType,
    });

    // Run analyzer
    const analyzer = createGeminiBillAnalyzer();
    const rawData = await analyzer.extract({ buffer, mimeType });

    const referenceMonth = Number(rawData.referenceMonth) || new Date().getMonth() + 1;
    const referenceYear = Number(rawData.referenceYear) || new Date().getFullYear();
    const competenceDate = inferCompetenceDate(referenceMonth, referenceYear, rawData.competenceDate);

    const flags = computeDeterministicFlags(rawData);

    const billData = {
        clientId,
        plantId: consumerUnit.plantId,
        consumerUnitId,
        competenceDate,
        referenceMonth,
        referenceYear,
        billFileUrl: uploaded.url,
        rawBillFileKey: uploaded.key,
        rawBillFileSize: buffer.byteLength,
        accountHolder: stringOrNull(rawData.accountHolder) ?? consumerUnit.accountHolder,
        accountNumber: stringOrNull(rawData.accountNumber) ?? consumerUnit.accountNumber,
        clientNumber: stringOrNull(rawData.clientNumber) ?? consumerUnit.clientNumber,
        instalationNumber: stringOrNull(rawData.instalationNumber) ?? consumerUnit.installationNumber,
        distributor: stringOrNull(rawData.distributor) ?? consumerUnit.distributor,
        consumerClass: stringOrNull(rawData.consumerClass),
        tariffModality: stringOrNull(rawData.tariffModality),
        connectionType: stringOrNull(rawData.connectionType),
        tariffPeriod: stringOrNull(rawData.tariffPeriod),
        billingDays: numberOrNull(rawData.billingDays),
        readingPeriodFrom: dateOrNull(rawData.readingPeriodFrom),
        readingPeriodTo: dateOrNull(rawData.readingPeriodTo),
        creditExpiryDate: dateOrNull(rawData.creditExpiryDate),
        monitoredGenerationKwh: numberOrNull(rawData.monitoredGenerationKwh),
        billedConsumptionKwh: numberOrNull(rawData.billedConsumptionKwh),
        consumptionKwh: numberOrNull(rawData.consumptionKwh),
        realConsumptionKwh: numberOrNull(rawData.realConsumptionKwh),
        injectedEnergyKwh: numberOrNull(rawData.injectedEnergyKwh),
        compensatedEnergyKwh: numberOrNull(rawData.compensatedEnergyKwh),
        previousCreditsKwh: numberOrNull(rawData.previousCreditsKwh),
        currentCreditsKwh: numberOrNull(rawData.currentCreditsKwh),
        expectedGenerationKwh: numberOrNull(rawData.expectedGenerationKwh),
        generationEfficiency: numberOrNull(rawData.generationEfficiency),
        meterReadingCurrent: numberOrNull(rawData.meterReadingCurrent),
        meterReadingPrevious: numberOrNull(rawData.meterReadingPrevious),
        demandContractedKw: numberOrNull(rawData.demandContractedKw),
        demandMeasuredKw: numberOrNull(rawData.demandMeasuredKw),
        totalBillValue: numberOrNull(rawData.totalBillValue),
        totalAmount: numberOrNull(rawData.totalAmount),
        energyCost: numberOrNull(rawData.energyCost),
        availabilityCost: numberOrNull(rawData.availabilityCost),
        publicLightingCost: numberOrNull(rawData.publicLightingCost),
        icmsCost: numberOrNull(rawData.icmsCost),
        pisCost: numberOrNull(rawData.pisCost),
        cofinsCost: numberOrNull(rawData.cofinsCost),
        pisCofinsCost: numberOrNull(rawData.pisCofinsCost),
        tariffPerKwh: numberOrNull(rawData.tariffPerKwh),
        tariffTeValue: numberOrNull(rawData.tariffTeValue),
        tariffTusdValue: numberOrNull(rawData.tariffTusdValue),
        tariffFlag: stringOrNull(rawData.tariffFlag),
        tariffFlagCost: numberOrNull(rawData.tariffFlagCost),
        sectoralCharges: numberOrNull(rawData.sectoralCharges),
        fineAmount: numberOrNull(rawData.fineAmount),
        interestAmount: numberOrNull(rawData.interestAmount),
        otherCharges: numberOrNull(rawData.otherCharges),
        estimatedSavings: flags.estimatedSavings ?? numberOrNull(rawData.estimatedSavings),
        aiAnalysis: stringOrNull(rawData.aiAnalysis),
        aiExplanations: rawData.aiExplanations ?? Prisma.JsonNull,
        aiRecommendations: rawData.aiRecommendations ?? Prisma.JsonNull,
        alerts: rawData.alerts ?? Prisma.JsonNull,
        extraCharges: rawData.extraCharges ?? Prisma.JsonNull,
        billingItems: rawData.billingItems ?? Prisma.JsonNull,
        creditSummary: rawData.creditSummary ?? Prisma.JsonNull,
        billScore: flags.billScore ?? numberOrNull(rawData.billScore),
        status: 'draft',
    };

    const bill = await prisma.energyBill.upsert({
        where: {
            consumerUnitId_referenceMonth_referenceYear: {
                consumerUnitId,
                referenceMonth,
                referenceYear,
            },
        },
        update: billData,
        create: billData,
    });

    // Emit upload event
    eventBus.emit(EventType.BILL_UPLOADED, {
        billId: bill.id,
        clientId,
        consumerUnitId,
    });

    return NextResponse.json({
        success: true,
        message: 'Fatura enviada com sucesso',
        data: { id: bill.id, status: bill.status },
    });
};

export const POST = withHandle(uploadClientBill);
