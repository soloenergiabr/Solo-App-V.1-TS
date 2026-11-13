import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

const prismaUser = { findUnique: vi.fn(), findMany: vi.fn(), findFirst: vi.fn(), create: vi.fn(), update: vi.fn() };
vi.mock('@/lib/prisma', () => ({ default: { user: prismaUser } }));
vi.mock('@/backend/auth/middleware/auth.middleware', () => ({
    AuthMiddleware: { requireAuth: vi.fn().mockResolvedValue({ userId: 'me' }) },
}));

const { GET, POST } = await import('./route');
const { PATCH } = await import('./[id]/route');
const { ALL_PERMISSIONS } = await import('@/shared/admin-users/permissions');

const me = { id: 'me', isActive: true, roles: ['master'], permissions: [...ALL_PERMISSIONS] };
const req = (method: string, body?: unknown) =>
    new NextRequest(new Request('http://localhost/api/admin/users', { method, body: body ? JSON.stringify(body) : undefined }));

beforeEach(() => {
    vi.clearAllMocks();
    prismaUser.findUnique.mockResolvedValue(me);
});

describe('/api/admin/users', () => {
    it('nega quem não tem manage_roles/manage_permissions', async () => {
        prismaUser.findUnique.mockResolvedValue({ ...me, permissions: ['read_clients'] });
        expect((await GET(req('GET'))).status).toBe(403);
        expect(prismaUser.findMany).not.toHaveBeenCalled();
    });

    it('lista sem expor a senha', async () => {
        prismaUser.findMany.mockResolvedValue([]);
        await GET(req('GET'));
        expect(prismaUser.findMany.mock.calls[0][0].select.password).toBeUndefined();
    });

    it('recusa e-mail duplicado (sem diferenciar maiúsculas)', async () => {
        prismaUser.findFirst.mockResolvedValue({ id: 'x' });
        const res = await POST(req('POST', { name: 'Ana', email: 'ANA@x.com', password: 'Senha1234', permissions: [] }));
        expect(res.status).toBe(409);
        expect(prismaUser.findFirst.mock.calls[0][0].where.email).toEqual({ equals: 'ana@x.com', mode: 'insensitive' });
        expect(prismaUser.create).not.toHaveBeenCalled();
    });

    it('recusa senha fraca', async () => {
        const res = await POST(req('POST', { name: 'Ana', email: 'ana@x.com', password: 'fraca', permissions: [] }));
        expect(res.status).toBe(400);
    });

    it('impede desativar a si mesmo', async () => {
        prismaUser.findMany.mockResolvedValue([me]);
        const res = await PATCH(req('PATCH', { isActive: false }), { params: Promise.resolve({ id: 'me' }) });
        expect(res.status).toBe(403);
        expect(prismaUser.update).not.toHaveBeenCalled();
    });
});
