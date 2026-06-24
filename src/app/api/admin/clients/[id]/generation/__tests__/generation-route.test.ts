import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

const {
    mockPlantFindFirst,
    mockGenFindUnique,
    mockGenUpdate,
    mockRecordManualGeneration,
    mockRequireRole,
} = vi.hoisted(() => ({
    mockPlantFindFirst: vi.fn(),
    mockGenFindUnique: vi.fn(),
    mockGenUpdate: vi.fn(),
    mockRecordManualGeneration: vi.fn(),
    mockRequireRole: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
    default: {
        plant: { findFirst: mockPlantFindFirst },
        generationUnit: { findUnique: mockGenFindUnique, update: mockGenUpdate },
    },
}));

vi.mock('@/backend/auth/middleware/auth.middleware', () => ({
    AuthMiddleware: { requireRole: mockRequireRole },
}));

vi.mock('@/backend/generation/manual-generation.service', () => ({
    MANUAL_INVERTER_PROVIDER: 'manual',
    recordManualGeneration: mockRecordManualGeneration,
}));

import { POST } from '../route';
import { PATCH } from '../[unitId]/route';

function req(body: Record<string, unknown>): NextRequest {
    return { json: () => Promise.resolve(body) } as unknown as NextRequest;
}

beforeEach(() => {
    vi.clearAllMocks();
    mockRequireRole.mockResolvedValue({ userId: 'admin-1', roles: ['master'] });
});

describe('POST /api/admin/clients/[id]/generation', () => {
    it('records admin generation as active (source=manual) after validating the plant', async () => {
        mockPlantFindFirst.mockResolvedValue({ id: 'plant-1', clientId: 'client-1' });
        mockRecordManualGeneration.mockResolvedValue({ id: 'gen-1' });

        const res = await POST(
            req({ plantId: 'plant-1', referenceMonth: 5, referenceYear: 2026, energyKwh: 900 }),
            { params: Promise.resolve({ id: 'client-1' }) },
        );

        expect(res.status).toBe(201);
        expect(mockRecordManualGeneration).toHaveBeenCalledWith(
            expect.objectContaining({ clientId: 'client-1', plantId: 'plant-1', source: 'manual' }),
        );
    });

    it('rejects a plant that does not belong to the client', async () => {
        mockPlantFindFirst.mockResolvedValue(null);
        const res = await POST(
            req({ plantId: 'foreign', referenceMonth: 5, referenceYear: 2026, energyKwh: 1 }),
            { params: Promise.resolve({ id: 'client-1' }) },
        );
        // withHandle turns the thrown "Usina não encontrada" into an error envelope (not 201)
        expect(res.status).not.toBe(201);
        expect(mockRecordManualGeneration).not.toHaveBeenCalled();
    });
});

describe('PATCH /api/admin/clients/[id]/generation/[unitId]', () => {
    const pendingUnit = {
        id: 'gen-1',
        source: 'manual_pending',
        inverter: { id: 'inv-1', clientId: 'client-1' },
    };

    it('approve promotes the reading to source=manual', async () => {
        mockGenFindUnique.mockResolvedValue(pendingUnit);
        mockGenUpdate.mockResolvedValue({ id: 'gen-1', source: 'manual' });

        await PATCH(req({ action: 'approve' }), {
            params: Promise.resolve({ id: 'client-1', unitId: 'gen-1' }),
        });

        expect(mockGenUpdate).toHaveBeenCalledWith({
            where: { id: 'gen-1' },
            data: { source: 'manual' },
        });
    });

    it('reject soft-deletes the reading (deletedAt set), not source=null', async () => {
        mockGenFindUnique.mockResolvedValue(pendingUnit);
        mockGenUpdate.mockResolvedValue({ id: 'gen-1', source: 'manual_pending' });

        await PATCH(req({ action: 'reject' }), {
            params: Promise.resolve({ id: 'client-1', unitId: 'gen-1' }),
        });

        const updateArg = mockGenUpdate.mock.calls[0][0];
        expect(updateArg.where).toEqual({ id: 'gen-1' });
        expect(updateArg.data.deletedAt).toBeInstanceOf(Date);
        expect('source' in updateArg.data).toBe(false);
    });

    it('refuses to act on a unit from another client', async () => {
        mockGenFindUnique.mockResolvedValue({
            ...pendingUnit,
            inverter: { id: 'inv-x', clientId: 'other-client' },
        });

        const res = await PATCH(req({ action: 'approve' }), {
            params: Promise.resolve({ id: 'client-1', unitId: 'gen-1' }),
        });

        expect(res.status).toBe(400);
        expect(mockGenUpdate).not.toHaveBeenCalled();
    });
});
