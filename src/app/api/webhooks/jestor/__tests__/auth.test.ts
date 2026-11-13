import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const execute = vi.fn();
vi.mock('@/lib/prisma', () => ({ default: {} }));
vi.mock('@/backend/club/use-cases/process-jestor-webhook.use-case', () => ({
    ProcessJestorWebhookUseCase: class { execute = execute },
}));

const { POST } = await import('../route');
const call = (url: string, headers: Record<string, string> = {}) =>
    POST(new NextRequest(url, { method: 'POST', headers, body: JSON.stringify({ id: 'j1', status: 'ganho', valor_projeto: 99999 }) }));

describe('POST /api/webhooks/jestor — autenticação', () => {
    afterEach(() => { vi.unstubAllEnvs(); execute.mockReset(); });

    it('recusa quando o segredo não está configurado', async () => {
        vi.stubEnv('JESTOR_WEBHOOK_SECRET', '');
        expect((await call('http://x/api/webhooks/jestor?token=qualquer')).status).toBe(401);
        expect(execute).not.toHaveBeenCalled();
    });

    it('recusa token errado ou ausente', async () => {
        vi.stubEnv('JESTOR_WEBHOOK_SECRET', 's3cret');
        expect((await call('http://x/api/webhooks/jestor')).status).toBe(401);
        expect((await call('http://x/api/webhooks/jestor?token=errado')).status).toBe(401);
        expect(execute).not.toHaveBeenCalled();
    });

    it('aceita o token pela URL ou pelo header', async () => {
        vi.stubEnv('JESTOR_WEBHOOK_SECRET', 's3cret');
        expect((await call('http://x/api/webhooks/jestor?token=s3cret')).status).toBe(200);
        expect((await call('http://x/api/webhooks/jestor', { 'x-webhook-token': 's3cret' })).status).toBe(200);
        expect(execute).toHaveBeenCalledTimes(2);
    });
});
