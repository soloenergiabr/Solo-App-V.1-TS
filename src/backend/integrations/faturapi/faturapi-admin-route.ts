import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { AuthMiddleware } from '@/backend/auth/middleware/auth.middleware';
import prisma from '@/lib/prisma';
import { FaturapiClient, FaturapiError } from './faturapi.client';
import { FaturapiAdminError, FaturapiAdminService } from './faturapi-admin.service';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Context = { params: Promise<any> };
type Handler<P> = (args: {
    request: NextRequest;
    params: P;
    service: FaturapiAdminService;
}) => Promise<NextResponse>;

export function faturapiAdminService() {
    return new FaturapiAdminService(prisma, new FaturapiClient());
}

/**
 * Rota do painel da Faturapi: so master. Erros da Faturapi/servico viram
 * respostas com a mensagem certa, sem passar pelas heuristicas do withHandle
 * (ex.: "credentials" na mensagem viraria 403).
 */
export function faturapiAdminRoute<P = Record<string, string>>(handler: Handler<P>) {
    return async (request: NextRequest, context: Context): Promise<NextResponse> => {
        try {
            await AuthMiddleware.requireRole(request, 'master');
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Authentication failed';
            const status = message.includes('role') ? 403 : 401;
            return NextResponse.json({ success: false, message }, { status });
        }

        try {
            const params = (await context.params) as P;
            return await handler({ request, params, service: faturapiAdminService() });
        } catch (error) {
            if (error instanceof ZodError) {
                return NextResponse.json(
                    { success: false, message: 'Dados invalidos', details: error.issues },
                    { status: 400 },
                );
            }
            if (error instanceof FaturapiAdminError) {
                return NextResponse.json({ success: false, message: error.message }, { status: error.status });
            }
            if (error instanceof FaturapiError) {
                // 401/403 da Faturapi = problema na FATURAPI_KEY, nao na sessao do admin.
                const status = error.status >= 500 || error.status === 401 || error.status === 403 ? 502 : error.status;
                return NextResponse.json({ success: false, error: error.code, message: error.message }, { status });
            }
            console.error('[Faturapi admin] erro inesperado:', error);
            return NextResponse.json({ success: false, message: 'Erro interno' }, { status: 500 });
        }
    };
}

export function ok(data: unknown, status = 200) {
    return NextResponse.json({ success: true, data }, { status });
}
