import { describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const requireRole = vi.fn();
vi.mock('@/backend/auth/middleware/auth.middleware', () => ({ AuthMiddleware: { requireRole } }));
vi.mock('fs/promises', () => ({ writeFile: vi.fn(), mkdir: vi.fn() }));

const { POST } = await import('../route');
const upload = (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return POST(new NextRequest('http://x/api/upload', { method: 'POST', body: form }));
};

describe('POST /api/upload', () => {
    it('recusa quem não é admin', async () => {
        requireRole.mockRejectedValueOnce(new Error('User does not have role: master'));
        expect((await upload(new File(['x'], 'a.png', { type: 'image/png' }))).status).toBe(403);
    });

    it('recusa arquivo que não é imagem', async () => {
        requireRole.mockResolvedValueOnce({});
        expect((await upload(new File(['<script>'], 'a.html', { type: 'text/html' }))).status).toBe(400);
    });

    it('aceita imagem e força a extensão pelo tipo', async () => {
        requireRole.mockResolvedValueOnce({});
        const res = await upload(new File(['x'], 'foto.php.png', { type: 'image/png' }));
        const body = await res.json();
        expect(res.status).toBe(200);
        expect(body.data.url).toMatch(/^\/uploads\/\d+_foto_php\.png$/);
    });
});
