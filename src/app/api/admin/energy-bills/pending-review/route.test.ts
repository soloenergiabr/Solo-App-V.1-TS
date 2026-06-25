import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// -- Mocks for GET (pending-review list) --
const mockFindMany = vi.fn();
const mockFindUnique = vi.fn();
const mockUpdate = vi.fn();
const mockEventBusEmit = vi.fn();
const mockGenerationFindMany = vi.fn();

vi.mock('@/lib/prisma', () => ({
    default: {
        energyBill: {
            findMany: mockFindMany,
            findUnique: mockFindUnique,
            update: mockUpdate,
        },
        generationUnit: {
            findMany: mockGenerationFindMany,
        },
    },
}));

vi.mock('@/backend/auth/middleware/auth.middleware', () => ({
    AuthMiddleware: {
        requireRole: vi.fn(),
    },
}));

vi.mock('@/backend/shared/event-bus', () => ({
    eventBus: {
        emit: mockEventBusEmit,
    },
    EventType: {
        BILL_CONFIRMED: 'bill.confirmed',
    },
}));

const { AuthMiddleware } = await import('@/backend/auth/middleware/auth.middleware');

// ---------- GET tests ----------

async function callGET() {
    const { GET } = await import('./route');
    const request = new NextRequest(
        new Request('http://localhost/api/admin/energy-bills/pending-review'),
    );
    return GET(request);
}

// ---------- PATCH tests ----------

async function callPATCH(billId: string, body: unknown) {
    const { PATCH } = await import('./[billId]/route');
    const request = new NextRequest(
        new Request(`http://localhost/api/admin/energy-bills/pending-review/${billId}`, {
            method: 'PATCH',
            body: JSON.stringify(body),
            headers: { 'Content-Type': 'application/json' },
        }),
    );
    return PATCH(request, { params: Promise.resolve({ billId }) });
}

function makeMockBill(overrides: Record<string, unknown> = {}) {
    return {
        id: 'bill-1',
        clientId: 'client-1',
        consumerUnitId: 'unit-1',
        referenceMonth: 5,
        referenceYear: 2026,
        totalBillValue: 450.75,
        totalAmount: null,
        billFileUrl: 'https://example.com/bill.pdf',
        status: 'pending_review',
        createdAt: new Date('2026-05-15T10:00:00Z'),
        client: { id: 'client-1', name: 'Joao Silva' },
        consumerUnit: { id: 'unit-1', name: 'Minha Casa', clientNumber: '67890', installationNumber: '98765' },
        ...overrides,
    };
}

describe('GET /api/admin/energy-bills/pending-review', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(AuthMiddleware.requireRole).mockResolvedValue({
            userId: 'admin-1',
            roles: ['master'],
        } as never);
        mockGenerationFindMany.mockResolvedValue([]);
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
            // withHandle returns 400 since the error message
            // does not contain exact token/auth trigger words
            expect(res.status).toBe(400);
        });
    });

    describe('data', () => {
        it('returns pending review bills', async () => {
            mockFindMany.mockResolvedValue([makeMockBill()]);

            const res = await callGET();
            expect(res.status).toBe(200);

            const body = await res.json();
            expect(body.success).toBe(true);
            expect(body.data).toHaveLength(1);
            expect(body.data[0].id).toBe('bill-1');
        });

        it('queries only pending_review status', async () => {
            mockFindMany.mockResolvedValue([]);

            await callGET();

            expect(mockFindMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { status: 'pending_review' },
                }),
            );
        });

        it('includes client name and consumer unit info', async () => {
            mockFindMany.mockResolvedValue([makeMockBill()]);

            const res = await callGET();
            const body = await res.json();

            expect(body.data[0].clientName).toBe('Joao Silva');
            expect(body.data[0].consumerUnitName).toBe('Minha Casa');
        });

        it('orders by most recent first', async () => {
            mockFindMany.mockResolvedValue([]);

            await callGET();

            expect(mockFindMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    orderBy: { createdAt: 'desc' },
                }),
            );
        });

        it('returns empty array when no pending bills', async () => {
            mockFindMany.mockResolvedValue([]);

            const res = await callGET();
            const body = await res.json();

            expect(body.data).toEqual([]);
        });
    });
});

describe('PATCH /api/admin/energy-bills/pending-review/[billId]', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(AuthMiddleware.requireRole).mockResolvedValue({
            userId: 'admin-1',
            roles: ['master'],
        } as never);

        mockFindUnique.mockResolvedValue(makeMockBill());
        mockUpdate.mockResolvedValue(makeMockBill({ status: 'confirmed' }));
    });

    describe('authorization', () => {
        it('returns error when not authenticated', async () => {
            vi.mocked(AuthMiddleware.requireRole).mockRejectedValue(
                new Error('User is not authenticated'),
            );

            const res = await callPATCH('bill-1', { action: 'confirm' });
            expect(res.status).toBe(400);
        });

        it('returns error when user is not master', async () => {
            vi.mocked(AuthMiddleware.requireRole).mockRejectedValue(
                new Error('User does not have role: master'),
            );

            const res = await callPATCH('bill-1', { action: 'confirm' });
            expect(res.status).toBe(400);
        });
    });

    describe('validation', () => {
        it('returns 400 when action is missing', async () => {
            const res = await callPATCH('bill-1', {});
            expect(res.status).toBe(400);

            const body = await res.json();
            expect(body.message).toContain('invalida');
        });

        it('returns 400 when action is invalid', async () => {
            const res = await callPATCH('bill-1', { action: 'invalid' });
            expect(res.status).toBe(400);

            const body = await res.json();
            expect(body.message).toContain('invalida');
        });

        it('returns 404 when bill does not exist', async () => {
            mockFindUnique.mockResolvedValue(null);

            const res = await callPATCH('nonexistent', { action: 'confirm' });
            expect(res.status).toBe(404);

            const body = await res.json();
            expect(body.message).toBe('Fatura nao encontrada.');
        });

        it('returns 400 when bill is not pending_review', async () => {
            mockFindUnique.mockResolvedValue(makeMockBill({ status: 'confirmed' }));

            const res = await callPATCH('bill-1', { action: 'confirm' });
            expect(res.status).toBe(400);

            const body = await res.json();
            expect(body.message).toBe('Fatura nao esta em revisao.');
        });
    });

    describe('confirm', () => {
        it('updates bill status to confirmed', async () => {
            mockUpdate.mockResolvedValue(makeMockBill({ status: 'confirmed' }));

            const res = await callPATCH('bill-1', { action: 'confirm' });
            expect(res.status).toBe(200);

            expect(mockUpdate).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { id: 'bill-1' },
                    data: { status: 'confirmed' },
                }),
            );
        });

        it('emits bill.confirmed event', async () => {
            mockUpdate.mockResolvedValue(makeMockBill({ status: 'confirmed' }));

            await callPATCH('bill-1', { action: 'confirm' });

            expect(mockEventBusEmit).toHaveBeenCalledWith('bill.confirmed', {
                billId: 'bill-1',
                clientId: 'client-1',
                confirmedBy: 'admin-1',
            });
        });
    });

    describe('reject', () => {
        it('updates bill status to rejected', async () => {
            mockUpdate.mockResolvedValue(makeMockBill({ status: 'rejected' }));

            const res = await callPATCH('bill-1', { action: 'reject' });
            expect(res.status).toBe(200);

            expect(mockUpdate).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { id: 'bill-1' },
                    data: { status: 'rejected' },
                }),
            );
        });

        it('does not emit bill.confirmed event', async () => {
            mockUpdate.mockResolvedValue(makeMockBill({ status: 'rejected' }));

            await callPATCH('bill-1', { action: 'reject' });

            expect(mockEventBusEmit).not.toHaveBeenCalled();
        });
    });
});
