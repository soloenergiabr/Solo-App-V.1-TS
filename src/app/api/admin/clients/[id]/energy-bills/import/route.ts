import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { withHandle } from '@/app/api/api-utils';
import { AuthMiddleware } from '@/backend/auth/middleware/auth.middleware';
import { Prisma } from '@/app/generated/prisma';
import prisma from '@/lib/prisma';
import { uploadObject } from '@/lib/object-storage';

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

const importEnergyBill = async (
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) => {
    await AuthMiddleware.extractUserContext(request);
    const { id: clientId } = await params;
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
        return NextResponse.json({ success: false, message: 'Unidade consumidora não encontrada.' }, { status: 404 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const mimeType = file.type || 'application/pdf';
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return NextResponse.json({ success: false, message: 'Chave de API do Gemini não configurada no servidor.' }, { status: 500 });
    }

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

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `
Você é um especialista em faturas brasileiras de energia elétrica e geração distribuída.
Extraia os campos abaixo da fatura enviada e retorne APENAS JSON válido, sem markdown.
Use null quando não encontrar um campo. Use números sem símbolo de moeda. Datas em ISO yyyy-mm-dd.

{
  "referenceMonth": number,
  "referenceYear": number,
  "competenceDate": "yyyy-mm-dd",
  "accountHolder": string | null,
  "accountNumber": string | null,
  "clientNumber": string | null,
  "instalationNumber": string | null,
  "distributor": string | null,
  "consumerClass": string | null,
  "tariffModality": string | null,
  "connectionType": string | null,
  "tariffPeriod": string | null,
  "billingDays": number | null,
  "readingPeriodFrom": "yyyy-mm-dd" | null,
  "readingPeriodTo": "yyyy-mm-dd" | null,
  "creditExpiryDate": "yyyy-mm-dd" | null,
  "monitoredGenerationKwh": number | null,
  "billedConsumptionKwh": number | null,
  "consumptionKwh": number | null,
  "realConsumptionKwh": number | null,
  "injectedEnergyKwh": number | null,
  "compensatedEnergyKwh": number | null,
  "previousCreditsKwh": number | null,
  "currentCreditsKwh": number | null,
  "expectedGenerationKwh": number | null,
  "generationEfficiency": number | null,
  "meterReadingCurrent": number | null,
  "meterReadingPrevious": number | null,
  "demandContractedKw": number | null,
  "demandMeasuredKw": number | null,
  "totalBillValue": number | null,
  "totalAmount": number | null,
  "energyCost": number | null,
  "availabilityCost": number | null,
  "publicLightingCost": number | null,
  "icmsCost": number | null,
  "pisCost": number | null,
  "cofinsCost": number | null,
  "pisCofinsCost": number | null,
  "tariffPerKwh": number | null,
  "tariffTeValue": number | null,
  "tariffTusdValue": number | null,
  "tariffFlag": string | null,
  "tariffFlagCost": number | null,
  "sectoralCharges": number | null,
  "fineAmount": number | null,
  "interestAmount": number | null,
  "otherCharges": number | null,
  "estimatedSavings": number | null,
  "billingItems": [],
  "creditSummary": {},
  "extraCharges": [],
  "alerts": [],
  "aiAnalysis": string | null,
  "aiExplanations": {},
  "aiRecommendations": [],
  "billScore": number | null
}
`;

    const result = await model.generateContent([
        prompt,
        {
            inlineData: {
                data: buffer.toString('base64'),
                mimeType,
            },
        },
    ]);

    const extracted = JSON.parse(cleanJsonText(result.response.text()));
    const referenceMonth = Number(extracted.referenceMonth) || new Date().getMonth() + 1;
    const referenceYear = Number(extracted.referenceYear) || new Date().getFullYear();
    const competenceDate = inferCompetenceDate(referenceMonth, referenceYear, extracted.competenceDate);

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
        accountHolder: stringOrNull(extracted.accountHolder) ?? consumerUnit.accountHolder,
        accountNumber: stringOrNull(extracted.accountNumber) ?? consumerUnit.accountNumber,
        clientNumber: stringOrNull(extracted.clientNumber) ?? consumerUnit.clientNumber,
        instalationNumber: stringOrNull(extracted.instalationNumber) ?? consumerUnit.installationNumber,
        distributor: stringOrNull(extracted.distributor) ?? consumerUnit.distributor,
        consumerClass: stringOrNull(extracted.consumerClass),
        tariffModality: stringOrNull(extracted.tariffModality),
        connectionType: stringOrNull(extracted.connectionType),
        tariffPeriod: stringOrNull(extracted.tariffPeriod),
        billingDays: numberOrNull(extracted.billingDays),
        readingPeriodFrom: dateOrNull(extracted.readingPeriodFrom),
        readingPeriodTo: dateOrNull(extracted.readingPeriodTo),
        creditExpiryDate: dateOrNull(extracted.creditExpiryDate),
        monitoredGenerationKwh: numberOrNull(extracted.monitoredGenerationKwh),
        billedConsumptionKwh: numberOrNull(extracted.billedConsumptionKwh),
        consumptionKwh: numberOrNull(extracted.consumptionKwh),
        realConsumptionKwh: numberOrNull(extracted.realConsumptionKwh),
        injectedEnergyKwh: numberOrNull(extracted.injectedEnergyKwh),
        compensatedEnergyKwh: numberOrNull(extracted.compensatedEnergyKwh),
        previousCreditsKwh: numberOrNull(extracted.previousCreditsKwh),
        currentCreditsKwh: numberOrNull(extracted.currentCreditsKwh),
        expectedGenerationKwh: numberOrNull(extracted.expectedGenerationKwh),
        generationEfficiency: numberOrNull(extracted.generationEfficiency),
        meterReadingCurrent: numberOrNull(extracted.meterReadingCurrent),
        meterReadingPrevious: numberOrNull(extracted.meterReadingPrevious),
        demandContractedKw: numberOrNull(extracted.demandContractedKw),
        demandMeasuredKw: numberOrNull(extracted.demandMeasuredKw),
        totalBillValue: numberOrNull(extracted.totalBillValue),
        totalAmount: numberOrNull(extracted.totalAmount),
        energyCost: numberOrNull(extracted.energyCost),
        availabilityCost: numberOrNull(extracted.availabilityCost),
        publicLightingCost: numberOrNull(extracted.publicLightingCost),
        icmsCost: numberOrNull(extracted.icmsCost),
        pisCost: numberOrNull(extracted.pisCost),
        cofinsCost: numberOrNull(extracted.cofinsCost),
        pisCofinsCost: numberOrNull(extracted.pisCofinsCost),
        tariffPerKwh: numberOrNull(extracted.tariffPerKwh),
        tariffTeValue: numberOrNull(extracted.tariffTeValue),
        tariffTusdValue: numberOrNull(extracted.tariffTusdValue),
        tariffFlag: stringOrNull(extracted.tariffFlag),
        tariffFlagCost: numberOrNull(extracted.tariffFlagCost),
        sectoralCharges: numberOrNull(extracted.sectoralCharges),
        fineAmount: numberOrNull(extracted.fineAmount),
        interestAmount: numberOrNull(extracted.interestAmount),
        otherCharges: numberOrNull(extracted.otherCharges),
        estimatedSavings: numberOrNull(extracted.estimatedSavings),
        aiAnalysis: stringOrNull(extracted.aiAnalysis),
        aiExplanations: extracted.aiExplanations ?? Prisma.JsonNull,
        aiRecommendations: extracted.aiRecommendations ?? Prisma.JsonNull,
        alerts: extracted.alerts ?? Prisma.JsonNull,
        extraCharges: extracted.extraCharges ?? Prisma.JsonNull,
        billingItems: extracted.billingItems ?? Prisma.JsonNull,
        creditSummary: extracted.creditSummary ?? Prisma.JsonNull,
        billScore: numberOrNull(extracted.billScore),
        status: 'needs_review',
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

    return NextResponse.json({
        success: true,
        message: 'Fatura importada com sucesso',
        data: bill,
    });
};

export const POST = withHandle(importEnergyBill);
