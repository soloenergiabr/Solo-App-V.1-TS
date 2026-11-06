import { dateOrNull, numberOrNull, stringOrNull } from '@/backend/economia/bill-pdf-analysis';

// Campos da fatura que a Faturapi ja entrega extraidos em `invoice.parsed`
// (schemaVersion 1). Preenchem a EnergyBill mesmo quando a analise por IA do app
// falha ou nao roda.

type Obj = Record<string, unknown>;

function section(parsed: Obj, key: string): Obj {
    const value = parsed[key];
    return value && typeof value === 'object' && !Array.isArray(value) ? (value as Obj) : {};
}

export function mapFaturapiParsedToBill(parsed: Obj | null | undefined) {
    if (!parsed || typeof parsed !== 'object') return {};

    const customer = section(parsed, 'customer');
    const identification = section(parsed, 'identification');
    const consumption = section(parsed, 'consumption');
    const charges = section(parsed, 'charges');
    const tariffFlag = section(parsed, 'tariffFlag');
    const demand = section(parsed, 'demand');
    const dg = section(parsed, 'distributedGeneration');

    const fields = {
        consumerClass: stringOrNull(customer.consumerClass),
        billingDays: numberOrNull(identification.billingDays),
        readingPeriodFrom: dateOrNull(identification.previousReadingDate),
        readingPeriodTo: dateOrNull(identification.currentReadingDate),
        consumptionKwh: numberOrNull(consumption.totalKwh),
        billedConsumptionKwh: numberOrNull(consumption.billedKwh),
        compensatedEnergyKwh: numberOrNull(dg.compensatedKwh),
        currentCreditsKwh: numberOrNull(dg.creditBalanceKwh),
        demandContractedKw: numberOrNull(demand.contractedKw),
        demandMeasuredKw: numberOrNull(demand.measuredPeakKw),
        energyCost: numberOrNull(charges.energy),
        publicLightingCost: numberOrNull(charges.publicLighting),
        sectoralCharges: numberOrNull(charges.sectorCharges),
        fineAmount: numberOrNull(charges.fine),
        interestAmount: numberOrNull(charges.interest),
        tariffTeValue: numberOrNull(charges.rateTe),
        tariffTusdValue: numberOrNull(charges.rateTusd),
        tariffFlag: stringOrNull(tariffFlag.flag),
        tariffFlagCost: numberOrNull(tariffFlag.value),
    };

    // Sem nulos: assim os campos se combinam com a analise por IA sem apagar nada.
    return Object.fromEntries(
        Object.entries(fields).filter(([, value]) => value !== null),
    ) as Partial<{ [K in keyof typeof fields]: NonNullable<(typeof fields)[K]> }>;
}
