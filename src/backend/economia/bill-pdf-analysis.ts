import { Prisma } from '@/app/generated/prisma';
import { getBillAnalyzer, computeDeterministicFlags } from '@/backend/economia/analyzer';
import { mapRawToBillJson } from '@/backend/economia/analyzer/mapping';

// Pipeline de analise da fatura (extracao por IA + flags deterministicas + analise),
// compartilhado entre o upload manual e a fatura que chega pela Faturapi.

export function numberOrNull(value: unknown): number | null {
    if (value === null || value === undefined || value === '') return null;
    const normalized = typeof value === 'string'
        ? value.replace(/\./g, '').replace(',', '.')
        : value;
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : null;
}

export function stringOrNull(value: unknown): string | null {
    if (value === null || value === undefined) return null;
    const text = String(value).trim();
    return text.length > 0 ? text : null;
}

export function dateOrNull(value: unknown): Date | null {
    const text = stringOrNull(value);
    if (!text) return null;
    const date = new Date(text);
    return Number.isNaN(date.getTime()) ? null : date;
}

export function inferCompetenceDate(referenceMonth: number, referenceYear: number, rawCompetenceDate: unknown): Date {
    const parsed = dateOrNull(rawCompetenceDate);
    if (parsed) return new Date(parsed.getFullYear(), parsed.getMonth(), 1);
    return new Date(referenceYear, referenceMonth - 1, 1);
}

type NullableJson = Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput;

/** Dados da UC usados quando a extracao nao encontra o campo na fatura. */
export interface BillFieldFallback {
    accountHolder: string | null;
    accountNumber: string | null;
    clientNumber: string | null;
    installationNumber: string | null;
    distributor: string | null;
}

export async function analyzeBillPdf({ buffer, mimeType, fallback }: {
    buffer: Buffer;
    mimeType: string;
    fallback: BillFieldFallback;
}) {
    const analyzer = getBillAnalyzer();
    const rawData = await analyzer.extract({ buffer, mimeType });

    const referenceMonth = Number(rawData.referenceMonth) || new Date().getMonth() + 1;
    const referenceYear = Number(rawData.referenceYear) || new Date().getFullYear();
    const competenceDate = inferCompetenceDate(referenceMonth, referenceYear, rawData.competenceDate);

    const flags = computeDeterministicFlags(rawData);

    // Run AI analysis
    const analysis = await analyzer.analyze({ raw: rawData, flags });

    // Map raw data to JSON columns
    const jsonColumns = mapRawToBillJson(rawData);

    const fields = {
        accountHolder: stringOrNull(rawData.accountHolder) ?? fallback.accountHolder,
        accountNumber: stringOrNull(rawData.accountNumber) ?? fallback.accountNumber,
        clientNumber: stringOrNull(rawData.clientNumber) ?? fallback.clientNumber,
        instalationNumber: stringOrNull(rawData.instalationNumber) ?? fallback.installationNumber,
        distributor: stringOrNull(rawData.distributor) ?? fallback.distributor,
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
        estimatedSavings: analysis.estimatedSavings ?? flags.estimatedSavings ?? numberOrNull(rawData.estimatedSavings),
        aiAnalysis: analysis.aiAnalysis ?? stringOrNull(rawData.aiAnalysis),
        aiExplanations: (analysis.aiExplanations ?? Prisma.JsonNull) as NullableJson,
        aiRecommendations: (analysis.aiRecommendations ?? Prisma.JsonNull) as NullableJson,
        alerts: (analysis.alerts ?? Prisma.JsonNull) as NullableJson,
        extraCharges: jsonColumns.extraCharges as NullableJson,
        billingItems: jsonColumns.billingItems as NullableJson,
        creditSummary: jsonColumns.creditSummary as NullableJson,
        billScore: analysis.billScore ?? flags.billScore ?? numberOrNull(rawData.billScore),
    };

    return { referenceMonth, referenceYear, competenceDate, fields };
}
