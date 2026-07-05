import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// -- Mocks --
const mockPlantFindMany = vi.fn();
const mockConsumerUnitFindMany = vi.fn();

vi.mock('@/lib/prisma', () => ({
    default: {
        plant: {
            findMany: mockPlantFindMany,
        },
        consumerUnit: {
            findMany: mockConsumerUnitFindMany,
        },
    },
}));

vi.mock('@/backend/auth/middleware/auth.middleware', () => ({
    AuthMiddleware: {
        requireRole: vi.fn(),
    },
}));

const { AuthMiddleware } = await import('@/backend/auth/middleware/auth.middleware');

async function callGET() {
    const { GET } = await import('./route');
    const request = new NextRequest(
        new Request('http://localhost/api/admin/approvals'),
    );
    return GET(request);
}

function makeMockPlant(overrides: Record<string, unknown> = {}) {
    return {
        id: 'plant-1',
        clientId: 'client-1',
        name: 'Usina Solar',
        validationStatus: 'pending_review',
        rejectionReason: null,
        createdAt: new Date('2026-05-15T10:00:00Z'),
        client: { id: 'client-1', name: 'Joao Silva' },
        ...overrides,
    };
}

function makeMockConsumerUnit(overrides: Record<string, unknown> = {}) {
    return {
        id: 'unit-1',
        clientId: 'client-1',
        name: 'Minha Casa',
        validationStatus: 'pending_review',
        rejectionReason: null,
        createdAt: new Date('2026-05-15T11:00:00Z'),
        client: { id: 'client-1', name: 'Joao Silva' },
        ...overrides,
    };
}

describe('GET /api/admin/approvals', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(AuthMiddleware.requireRole).mockResolvedValue({
            userId: 'admin-1',
            roles: ['master'],
        } as never);
    });

    describe('authorization', () => {
        it('returns error when not authenticated', async () => {
            vi.mocked(AuthMiddleware.requireRole).mockRejectedValue(
                new Error('User is not authenticated'),
            );

            const res = await callGET();
            // withHandle returns 400 since the error message
            // does not contain exact token/auth trigger words
            expect(res.status).toBe(400);
        });

        it('returns error when user is not master', async () => {
            vi.mocked(AuthMiddleware.requireRole).mockRejectedValue(
                new Error('User does not have role: master'),
            );

            const res = await callGET();
            // withHandle maps 'does not have role' to 403 (Authorization failed)
            expect(res.status).toBe(403);
        });
    });

    describe('data', () => {
        it('returns empty array when no pending items', async () => {
            mockPlantFindMany.mockResolvedValue([]);
            mockConsumerUnitFindMany.mockResolvedValue([]);

            const res = await callGET();
            expect(res.status).toBe(200);

            const body = await res.json();
            expect(body.success).toBe(true);
            expect(body.data).toEqual([]);
        });

        it('returns pending plants', async () => {
            mockPlantFindMany.mockResolvedValue([makeMockPlant()]);
            mockConsumerUnitFindMany.mockResolvedValue([]);

            const res = await callGET();
            expect(res.status).toBe(200);

            const body = await res.json();
            expect(body.data).toHaveLength(1);
            expect(body.data[0].type).toBe('plant');
            expect(body.data[0].id).toBe('plant-1');
            expect(body.data[0].clientName).toBe('Joao Silva');
        });

        it('returns pending consumer units', async () => {
            mockPlantFindMany.mockResolvedValue([]);
            mockConsumerUnitFindMany.mockResolvedValue([makeMockConsumerUnit()]);

            const res = await callGET();
            expect(res.status).toBe(200);

            const body = await res.json();
            expect(body.data).toHaveLength(1);
            expect(body.data[0].type).toBe('consumer_unit');
            expect(body.data[0].id).toBe('unit-1');
            expect(body.data[0].clientName).toBe('Joao Silva');
        });

        it('returns combined results ordered by createdAt asc', async () => {
            const earlyPlant = makeMockPlant({
                id: 'plant-1',
                createdAt: new Date('2026-05-15T10:00:00Z'),
            });
            const lateUnit = makeMockConsumerUnit({
                id: 'unit-2',
                createdAt: new Date('2026-05-16T10:00:00Z'),
            });
            mockPlantFindMany.mockResolvedValue([earlyPlant]);
            mockConsumerUnitFindMany.mockResolvedValue([lateUnit]);

            const res = await callGET();
            const body = await res.json();

            expect(body.data).toHaveLength(2);
            expect(body.data[0].id).toBe('plant-1');
            expect(body.data[1].id).toBe('unit-2');
        });

        it('queries only pending_review and non-deleted', async () => {
            mockPlantFindMany.mockResolvedValue([]);
            mockConsumerUnitFindMany.mockResolvedValue([]);

            await callGET();

            expect(mockPlantFindMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { validationStatus: 'pending_review', deletedAt: null },
                }),
            );
            expect(mockConsumerUnitFindMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { validationStatus: 'pending_review', deletedAt: null },
                }),
            );
        });

        it('includes rejectionReason when present', async () => {
            mockPlantFindMany.mockResolvedValue([
                makeMockPlant({ rejectionReason: 'Documentacao incompleta' }),
            ]);
            mockConsumerUnitFindMany.mockResolvedValue([]);

            const res = await callGET();
            const body = await res.json();

            expect(body.data[0].rejectionReason).toBe('Documentacao incompleta');
        });
    });
});
