import { describe, it, expect, vi, beforeEach } from 'vitest';

const {
    mockInverterFindFirst,
    mockInverterCreate,
    mockGenerationUnitUpsert,
} = vi.hoisted(() => ({
    mockInverterFindFirst: vi.fn(),
    mockInverterCreate: vi.fn(),
    mockGenerationUnitUpsert: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
    default: {
        inverter: {
            findFirst: mockInverterFindFirst,
            create: mockInverterCreate,
        },
        generationUnit: {
            upsert: mockGenerationUnitUpsert,
        },
    },
}));

import {
    recordManualGeneration,
    manualProviderRecordId,
    isManualInverter,
    MANUAL_INVERTER_PROVIDER,
} from '../manual-generation.service';

beforeEach(() => {
    vi.clearAllMocks();
    mockGenerationUnitUpsert.mockResolvedValue({ id: 'gen-1' });
});

describe('manualProviderRecordId', () => {
    it('zero-pads the month and prefixes with manual-', () => {
        expect(manualProviderRecordId(2026, 5)).toBe('manual-2026-05');
        expect(manualProviderRecordId(2026, 12)).toBe('manual-2026-12');
    });
});

describe('isManualInverter', () => {
    it('is true only for the manual provider', () => {
        expect(isManualInverter({ provider: MANUAL_INVERTER_PROVIDER })).toBe(true);
        expect(isManualInverter({ provider: 'hoymiles' })).toBe(false);
    });
});

describe('recordManualGeneration', () => {
    it('reuses an existing placeholder inverter and upserts one month with a UTC timestamp', async () => {
        mockInverterFindFirst.mockResolvedValue({ id: 'inv-1', provider: 'manual', plantId: 'plant-1' });

        await recordManualGeneration({
            clientId: 'client-1',
            plantId: 'plant-1',
            referenceYear: 2026,
            referenceMonth: 5,
            energyKwh: 1234,
            source: 'manual',
        });

        // No new inverter created when one already exists
        expect(mockInverterCreate).not.toHaveBeenCalled();

        const upsertArg = mockGenerationUnitUpsert.mock.calls[0][0];
        expect(upsertArg.where.inverterId_generationUnitType_providerRecordId).toEqual({
            inverterId: 'inv-1',
            generationUnitType: 'month',
            providerRecordId: 'manual-2026-05',
        });
        expect(upsertArg.create.energy).toBe(1234);
        expect(upsertArg.create.source).toBe('manual');
        expect(upsertArg.create.generationUnitType).toBe('month');
        expect(upsertArg.create.power).toBe(0);
        // First day of the competence month, in UTC (no local-timezone drift)
        expect(upsertArg.create.timestamp.toISOString()).toBe('2026-05-01T00:00:00.000Z');
        expect(upsertArg.update.energy).toBe(1234);
    });

    it('lazily creates a syncEnabled:false placeholder inverter keyed per plant', async () => {
        mockInverterFindFirst.mockResolvedValue(null);
        mockInverterCreate.mockResolvedValue({ id: 'inv-new', provider: 'manual', plantId: 'plant-9' });

        await recordManualGeneration({
            clientId: 'client-1',
            plantId: 'plant-9',
            referenceYear: 2026,
            referenceMonth: 1,
            energyKwh: 500,
            source: 'manual_pending',
        });

        const createArg = mockInverterCreate.mock.calls[0][0];
        expect(createArg.data.provider).toBe('manual');
        expect(createArg.data.providerId).toBe('manual-plant-9');
        expect(createArg.data.syncEnabled).toBe(false);
        expect(createArg.data.plantId).toBe('plant-9');

        // Client proposal lands as manual_pending
        expect(mockGenerationUnitUpsert.mock.calls[0][0].create.source).toBe('manual_pending');
    });
});
