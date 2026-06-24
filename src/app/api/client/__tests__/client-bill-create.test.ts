import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// --- Mocks must be defined before any imports that use them ---

vi.mock('@/lib/prisma', () => ({
    default: {
        plant: {
            findFirst: vi.fn(),
        },
        consumerUnit: {
            findFirst: vi.fn(),
        },
        energyBill: {
            upsert: vi.fn(),
        },
    },
}));

vi.mock('@/backend/auth/middleware/auth.middleware', () => ({
    AuthMiddleware: {
        requireAuth: vi.fn(),
    },
}));

// Module that `computeFallbackSavings` is imported from — we do NOT mock it
// so the real implementation runs in tests.

import prisma from '@/lib/prisma';
import { AuthMiddleware } from '@/backend/auth/middleware/auth.middleware';

const { POST } = await import('../energy-bills/route');

function mockRequest(body: Record<string, unknown>): NextRequest {
    return {
        json: () => Promise.resolve(body),
    } as unknown as NextRequest;
}

describe('POST /api/client/energy-bills', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('creates a bill with status=pending_review and returns 201', async () => {
        vi.mocked(AuthMiddleware.requireAuth).mockResolvedValue({ clientId: 'client-1' } as any);
        vi.mocked(prisma.plant.findFirst).mockResolvedValue({ id: 'plant-1', clientId: 'client-1' } as any);
        vi.mocked(prisma.consumerUnit.findFirst).mockResolvedValue({
            id: 'uc-1',
            clientId: 'client-1',
            plantId: 'plant-1',
        } as any);
        vi.mocked(prisma.energyBill.upsert).mockResolvedValue({
            id: 'bill-1',
            clientId: 'client-1',
            plantId: 'plant-1',
            consumerUnitId: 'uc-1',
            referenceMonth: 6,
            referenceYear: 2026,
            status: 'pending_review',
        } as any);

        const response = await POST(
            mockRequest({
                plantId: 'plant-1',
                consumerUnitId: 'uc-1',
                competenceDate: '2026-06-01',
                referenceMonth: 6,
                referenceYear: 2026,
                consumptionKwh: 500,
                tariffPerKwh: 0.85,
                totalBillValue: 350,
            })
        );

        const body = await response.json();
        expect(response.status).toBe(201);
        expect(body.success).toBe(true);
        expect(body.message).toBe('Fatura enviada para revisão');
        expect(body.data?.status).toBe('pending_review');
    });

    it('rejects with 400 when plant is not found', async () => {
        vi.mocked(AuthMiddleware.requireAuth).mockResolvedValue({ clientId: 'client-1' } as any);
        vi.mocked(prisma.plant.findFirst).mockResolvedValue(null); // plant does not exist

        const response = await POST(
            mockRequest({
                plantId: 'plant-unknown',
                consumerUnitId: 'uc-1',
                competenceDate: '2026-06-01',
                referenceMonth: 6,
                referenceYear: 2026,
            })
        );

        const body = await response.json();
        expect(response.status).toBe(400);
        expect(body.message).toMatch(/encontrada/i);
    });

    it('rejects with 400 when consumer unit does not belong to client/plant', async () => {
        vi.mocked(AuthMiddleware.requireAuth).mockResolvedValue({ clientId: 'client-1' } as any);
        vi.mocked(prisma.plant.findFirst).mockResolvedValue({ id: 'plant-1', clientId: 'client-1' } as any);
        // consumer unit found but clientId/plantId don't match
        vi.mocked(prisma.consumerUnit.findFirst).mockResolvedValue(null);

        const response = await POST(
            mockRequest({
                plantId: 'plant-1',
                consumerUnitId: 'uc-other-client',
                competenceDate: '2026-06-01',
                referenceMonth: 6,
                referenceYear: 2026,
            })
        );

        const body = await response.json();
        expect(response.status).toBe(400);
        expect(body.message).toMatch(/encontrada/i);
    });

    it('rejects with 400 on missing required fields', async () => {
        vi.mocked(AuthMiddleware.requireAuth).mockResolvedValue({ clientId: 'client-1' } as any);

        const response = await POST(mockRequest({}));

        const body = await response.json();
        expect(response.status).toBe(400);
        expect(body.error).toBe('Validation error');
    });

    it('rejects with 401 when not authenticated', async () => {
        vi.mocked(AuthMiddleware.requireAuth).mockRejectedValue(new Error('Invalid or missing token'));

        const response = await POST(
            mockRequest({
                plantId: 'plant-1',
                consumerUnitId: 'uc-1',
                competenceDate: '2026-06-01',
                referenceMonth: 6,
                referenceYear: 2026,
            })
        );

        const body = await response.json();
        expect(response.status).toBe(401);
        expect(body.error).toBe('Authentication failed');
    });
});
