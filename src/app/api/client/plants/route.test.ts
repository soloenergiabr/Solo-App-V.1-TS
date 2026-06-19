import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// -- Mocks --
const mockFindMany = vi.fn();
const mockCreate = vi.fn();
const mockRequireAuth = vi.fn();

vi.mock('@/lib/prisma', () => ({
    default: {
        plant: {
            findMany: mockFindMany,
            create: mockCreate,
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
        new Request('http://localhost/api/client/plants', { method: 'GET' }),
    );
    return GET(request);
}

async function callPOST(body: Record<string, unknown>) {
    const { POST } = await import('./route');
    const request = new NextRequest(
        new Request('http://localhost/api/client/plants', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        }),
    );
    return POST(request);
}

const mockUserContext = { userId: 'user-1', clientId: 'client-1' };

function makePlant(overrides: Record<string, unknown> = {}) {
    return {
        id: 'plant-1',
        clientId: 'client-1',
        name: 'Minha Usina',
        installedPowerKw: 5.0,
        address: 'Rua A, 123',
        city: 'Sao Paulo',
        state: 'SP',
        ...overrides,
    };
}

describe('GET /api/client/plants', () => {
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

    describe('listing plants', () => {
        it('returns empty list when client has no plants', async () => {
            mockFindMany.mockResolvedValue([]);

            const res = await callGET();
            expect(res.status).toBe(200);

            const body = await res.json();
            expect(body.success).toBe(true);
            expect(body.data).toEqual([]);
        });

        it('returns plants scoped to authenticated client', async () => {
            const plants = [makePlant()];
            mockFindMany.mockResolvedValue(plants);

            const res = await callGET();
            expect(res.status).toBe(200);

            const body = await res.json();
            expect(body.success).toBe(true);
            expect(body.data).toHaveLength(1);
            expect(body.data[0].id).toBe('plant-1');

            expect(mockFindMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({ clientId: 'client-1' }),
                }),
            );
        });

        it('excludes deleted plants', async () => {
            mockFindMany.mockResolvedValue([makePlant()]);

            await callGET();

            expect(mockFindMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({ deletedAt: null }),
                }),
            );
        });

        it('returns plant with counts', async () => {
            const plant = makePlant({
                _count: { inverters: 2, consumerUnits: 1, creditAllocations: 0, energyBills: 3 },
            });
            mockFindMany.mockResolvedValue([plant]);

            const res = await callGET();
            const body = await res.json();
            const p = body.data[0];

            expect(p._count.inverters).toBe(2);
            expect(p._count.consumerUnits).toBe(1);
            expect(p._count.energyBills).toBe(3);
        });
    });
});

describe('POST /api/client/plants', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(AuthMiddleware.requireAuth).mockResolvedValue(mockUserContext as never);
    });

    describe('authentication', () => {
        it('returns 400 when not authenticated', async () => {
            mockRequireAuth.mockRejectedValue(new Error('User is not authenticated'));

            const res = await callPOST({ name: 'Teste' });
            expect(res.status).toBe(400);
        });

        it('returns error when user has no clientId', async () => {
            mockRequireAuth.mockResolvedValue({ userId: 'user-1', clientId: undefined } as never);

            const res = await callPOST({ name: 'Teste' });
            expect(res.status).toBe(400);

            const body = await res.json();
            expect(body.message).toBe('Cliente nao identificado.');
        });
    });

    describe('validation', () => {
        it('returns 400 when name is empty', async () => {
            const res = await callPOST({ name: '' });
            expect(res.status).toBe(400);

            const body = await res.json();
            expect(body.success).toBe(false);
        });

        it('returns 400 when name is missing', async () => {
            const res = await callPOST({});
            expect(res.status).toBe(400);

            const body = await res.json();
            expect(body.success).toBe(false);
        });
    });

    describe('successful creation', () => {
        it('creates plant with clientId from auth context', async () => {
            mockCreate.mockResolvedValue(makePlant({ id: 'new-plant' }));

            const res = await callPOST({ name: 'Nova Usina', installedPowerKw: 7.5 });
            expect(res.status).toBe(201);

            const body = await res.json();
            expect(body.success).toBe(true);
            expect(body.message).toBe('Usina criada com sucesso');
            expect(body.data.id).toBe('new-plant');

            expect(mockCreate).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        clientId: 'client-1',
                        name: 'Nova Usina',
                        installedPowerKw: 7.5,
                    }),
                }),
            );
        });

        it('accepts optional fields', async () => {
            mockCreate.mockResolvedValue(makePlant());

            await callPOST({
                name: 'Usina',
                address: 'Rua B, 456',
                city: 'Rio de Janeiro',
                state: 'RJ',
                provider: 'Solis',
            });

            expect(mockCreate).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        address: 'Rua B, 456',
                        city: 'Rio de Janeiro',
                        state: 'RJ',
                        provider: 'Solis',
                    }),
                }),
            );
        });
    });
});
