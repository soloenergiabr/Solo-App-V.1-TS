import prisma from '@/lib/prisma';

/**
 * Manual generation entry (Sprint 4 / A1).
 *
 * Clients without an integrated inverter API still need a place to record
 * monthly generation. We reuse the existing `GenerationUnit` model with the
 * already-aggregated `generationUnitType: 'month'` value, stored against a
 * per-plant placeholder inverter (so no schema migration is required).
 *
 * Source semantics (the propose -> Solo validates gate):
 *   - 'manual'          -> active immediately (admin-entered).
 *   - 'manual_pending'  -> client proposal awaiting Solo validation; excluded
 *                          from active generation aggregates until approved.
 */

export const MANUAL_INVERTER_PROVIDER = 'manual';

export type ManualGenerationSource = 'manual' | 'manual_pending';

export function isManualInverter(inverter: { provider: string }): boolean {
    return inverter.provider === MANUAL_INVERTER_PROVIDER;
}

/** Stable per-month record id, e.g. `manual-2026-05`. Zero-padded so it sorts. */
export function manualProviderRecordId(year: number, month: number): string {
    return `manual-${year}-${String(month).padStart(2, '0')}`;
}

export interface RecordManualGenerationInput {
    clientId: string;
    plantId: string;
    referenceYear: number;
    referenceMonth: number;
    energyKwh: number;
    source: ManualGenerationSource;
}

/**
 * Find (or lazily create) the single placeholder inverter that holds a plant's
 * manual readings. It is flagged `syncEnabled: false` so it is never picked up
 * by the provider sync, and `provider: 'manual'` so it can be filtered out of
 * device-facing inverter lists via {@link isManualInverter}.
 */
export async function findOrCreateManualInverter(clientId: string, plantId: string) {
    const existing = await prisma.inverter.findFirst({
        where: {
            clientId,
            plantId,
            provider: MANUAL_INVERTER_PROVIDER,
            deletedAt: null,
        },
    });
    if (existing) return existing;

    return prisma.inverter.create({
        data: {
            clientId,
            plantId,
            provider: MANUAL_INVERTER_PROVIDER,
            providerId: `manual-${plantId}`,
            name: 'Entrada Manual',
            syncEnabled: false,
            providerStatus: 'manual',
        },
    });
}

/**
 * Upsert one monthly manual generation reading. Idempotent per
 * (plant, year, month): re-entering a month overwrites the kWh in place.
 */
export async function recordManualGeneration(input: RecordManualGenerationInput) {
    const inverter = await findOrCreateManualInverter(input.clientId, input.plantId);
    const providerRecordId = manualProviderRecordId(input.referenceYear, input.referenceMonth);
    const timestamp = new Date(Date.UTC(input.referenceYear, input.referenceMonth - 1, 1));

    return prisma.generationUnit.upsert({
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
            energy: input.energyKwh,
            power: 0,
            source: input.source,
            providerRecordId,
            timestamp,
        },
        update: {
            energy: input.energyKwh,
            power: 0,
            source: input.source,
            timestamp,
        },
    });
}
