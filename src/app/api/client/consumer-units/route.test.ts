import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// -- Mocks --
const mockFindMany = vi.fn();
const mockFindFirst = vi.fn();
const mockCreate = vi.fn();
const mockRequireAuth = vi.fn();

vi.mock('@/lib/prisma', () => ({
    default: {
        consumerUnit: {
            findMany: mockFindMany,
            findFirst: mockFindFirst,
            create: mockCreate,
        },
        plant: {
            findFirst: mockFindFirst,
        },
    },
}));

vi.mock('@/backend/auth/middleware/auth.middleware', () => ({
    AuthMiddleware: {
        requireAuth: mockRequireAuth,
    },
}));

const { AuthMiddleware } = await import('@/backend/auth/middleware/auth.middleware');

async function callGET() {
    const { GET } = await import('./route');
    const request = new NextRequest(
        new Request('http://localhost/api/client/consumer-units', { method: 'GET' }),
    );
    return GET(request);
}

async function callPOST(body: Record<string, unknown>) {
    const { POST } = await import('./route');
    const request = new NextRequest(
        new Request('http://localhost/api/client/consumer-units', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        }),
    );
    return POST(request);
}

const mockUserContext = { userId: 'user-1', clientId: 'client-1' };

function makeConsumerUnit(overrides: Record<string, unknown> = {}) {
    return {
        id: 'unit-1',
        clientId: 'client-1',
        plantId: 'plant-1',
        name: 'Minha Casa',
        clientNumber: '123456',
        installationNumber: '98765',
        distributor: 'Enel',
        address: 'Rua A, 123',
        city: 'Sao Paulo',
        state: 'SP',
        ...overrides,
    };
}

function makePlant(overrides: Record<string, unknown> = {}) {
    return { id: 'plant-1', clientId: 'client-1', name: 'Usina', ...overrides };
}

describe('GET /api/client/consumer-units', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(AuthMiddleware.requireAuth).mockResolvedValue(mockUserContext as never);
    });

    describe('authentication', () => {
        it('returns 400 when not authenticated', async () => {
            mockRequireAuth.mockRejectedValue(new Error('User is not authenticated'));

            const res = await callGET();
            expect(res.status).toBe(400);
        });

        it('returns error when user has no clientId', async () => {
            mockRequireAuth.mockResolvedValue({ userId: 'user-1', clientId: undefined } as never);

            const res = await callGET();
            expect(res.status).toBe(400);

            const body = await res.json();
            expect(body.message).toBe('Cliente nao identificado.');
        });
    });

    describe('listing consumer units', () => {
        it('returns empty list when client has no units', async () => {
            mockFindMany.mockResolvedValue([]);

            const res = await callGET();
            expect(res.status).toBe(200);

            const body = await res.json();
            expect(body.success).toBe(true);
            expect(body.data).toEqual([]);
        });

        it('returns units scoped to authenticated client', async () => {
            const units = [makeConsumerUnit()];
            mockFindMany.mockResolvedValue(units);

            const res = await callGET();
            expect(res.status).toBe(200);

            const body = await res.json();
            expect(body.success).toBe(true);
            expect(body.data).toHaveLength(1);
            expect(body.data[0].id).toBe('unit-1');

            expect(mockFindMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({ clientId: 'client-1' }),
                }),
            );
        });

        it('includes plant info', async () => {
            const unit = makeConsumerUnit({ plant: { id: 'plant-1', name: 'Usina' } });
            mockFindMany.mockResolvedValue([unit]);

            const res = await callGET();
            const body = await res.json();

            expect(body.data[0].plant).toBeDefined();
            expect(body.data[0].plant.name).toBe('Usina');
        });
    });
});

describe('POST /api/client/consumer-units', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(AuthMiddleware.requireAuth).mockResolvedValue(mockUserContext as never);
    });

    describe('authentication', () => {
        it('returns 400 when not authenticated', async () => {
            mockRequireAuth.mockRejectedValue(new Error('User is not authenticated'));

            const res = await callPOST({ plantId: 'plant-1', name: 'Teste' });
            expect(res.status).toBe(400);
        });

        it('returns error when user has no clientId', async () => {
            mockRequireAuth.mockResolvedValue({ userId: 'user-1', clientId: undefined } as never);

            const res = await callPOST({ plantId: 'plant-1', name: 'Teste' });
            expect(res.status).toBe(400);

            const body = await res.json();
            expect(body.message).toBe('Cliente nao identificado.');
        });
    });

    describe('validation', () => {
        it('returns 400 when name is empty', async () => {
            mockFindFirst.mockResolvedValue(makePlant());

            const res = await callPOST({ plantId: 'plant-1', name: '' });
            expect(res.status).toBe(400);
        });

        it('returns 400 when plantId is missing', async () => {
            const res = await callPOST({ name: 'Unidade' });
            expect(res.status).toBe(400);
        });

        it('returns 400 when plant does not belong to client', async () => {
            mockFindFirst.mockResolvedValue(null);

            const res = await callPOST({ plantId: 'plant-other', name: 'Unidade' });
            expect(res.status).toBe(400);

            const body = await res.json();
            expect(body.message).toBe('Usina nao encontrada');
        });
    });

    describe('successful creation', () => {
        it('creates consumer unit linked to plant and client', async () => {
            mockFindFirst.mockResolvedValue(makePlant());
            mockCreate.mockResolvedValue(makeConsumerUnit({ id: 'new-unit' }));

            const res = await callPOST({
                plantId: 'plant-1',
                name: 'Loja',
                clientNumber: '999888',
                distributor: 'CPFL',
            });
            expect(res.status).toBe(201);

            const body = await res.json();
            expect(body.success).toBe(true);
            expect(body.message).toBe('Unidade consumidora criada com sucesso');
            expect(body.data.id).toBe('new-unit');

            expect(mockCreate).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        clientId: 'client-1',
                        plantId: 'plant-1',
                        name: 'Loja',
                        clientNumber: '999888',
                        distributor: 'CPFL',
                    }),
                }),
            );
        });

        it('verifies plant ownership before creating', async () => {
            mockFindFirst.mockResolvedValue(makePlant());
            mockCreate.mockResolvedValue(makeConsumerUnit());

            await callPOST({ plantId: 'plant-1', name: 'Casa' });

            // Should verify plant belongs to client (clientId + id check)
            expect(mockFindFirst).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({
                        id: 'plant-1',
                        clientId: 'client-1',
                        deletedAt: null,
                    }),
                }),
            );
        });
    });
});
