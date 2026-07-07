import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { NextRequest } from 'next/server';
import { middleware } from './middleware';

function req(pathname: string, headers?: HeadersInit): NextRequest {
    return new NextRequest(new Request(`http://localhost:3000${pathname}`, { headers }));
}

describe('middleware edge bundle safety', () => {
    it('does not import Node-only backend auth services', () => {
        const source = readFileSync(join(process.cwd(), 'src/middleware.ts'), 'utf8');

        expect(source).not.toMatch(/backend\/auth/);
        expect(source).not.toMatch(/JwtService/);
        expect(source).not.toMatch(/jsonwebtoken/);
    });
});

describe('middleware route gating', () => {
    it('allows public routes without an authorization header', () => {
        const response = middleware(req('/'));

        expect(response.status).toBe(200);
    });

    it('rejects protected API routes without a bearer token', async () => {
        const response = middleware(req('/api/generation/sync'));

        expect(response.status).toBe(401);
        await expect(response.json()).resolves.toMatchObject({
            success: false,
            error: 'Authentication required',
        });
    });

    it('allows protected API routes with a bearer token for route-level verification', () => {
        const response = middleware(req('/api/generation/sync', {
            Authorization: 'Bearer scheduler-token',
        }));

        expect(response.status).toBe(200);
    });
});
