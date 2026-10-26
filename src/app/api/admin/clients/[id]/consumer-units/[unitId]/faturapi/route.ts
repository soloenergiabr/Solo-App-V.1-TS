import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withHandle } from '@/app/api/api-utils';
import { AuthMiddleware } from '@/backend/auth/middleware/auth.middleware';
import { FaturapiClient, FaturapiError } from '@/backend/integrations/faturapi/faturapi.client';
import prisma from '@/lib/prisma';

// Vincula a UC a uma unidade monitorada da Faturapi, que passa a buscar a fatura
// todo mes e avisar via webhook (invoice.received). A senha da distribuidora vai
// direto para a Faturapi (que a guarda criptografada) e nunca e salva aqui.
const linkSchema = z.object({
    source: z.enum(['pessoa', 'empresa', 'inbox']),
    credentials: z.object({
        email: z.string().trim().min(1),
        password: z.string().min(1),
    }).optional(),
    backfill: z.number().int().min(0).max(24).optional(),
}).refine(
    (data) => (data.source === 'inbox') === !data.credentials,
    { message: 'credentials sao obrigatorias para pessoa/empresa e proibidas para inbox', path: ['credentials'] },
);

const linkConsumerUnit = async (
    request: NextRequest,
    { params }: { params: Promise<{ id: string; unitId: string }> }
) => {
    await AuthMiddleware.requireRole(request, 'master');
    const { id: clientId, unitId } = await params;
    const data = linkSchema.parse(await request.json());

    const existing = await prisma.consumerUnit.findFirst({ where: { id: unitId, clientId, deletedAt: null } });
    if (!existing) throw new Error('Unidade consumidora not found');

    if (existing.faturapiUnitId) {
        return NextResponse.json(
            { success: false, error: 'Conflict', message: 'Unidade consumidora ja vinculada a Faturapi' },
            { status: 409 },
        );
    }

    if (!existing.clientNumber) {
        return NextResponse.json(
            { success: false, message: 'Informe o numero do cliente (UC) antes de vincular a Faturapi.' },
            { status: 400 },
        );
    }

    try {
        const { unit } = await new FaturapiClient().createUnit({
            uc: existing.clientNumber,
            source: data.source,
            credentials: data.credentials,
            label: existing.name ?? undefined,
            backfill: data.backfill,
        });

        const updated = await prisma.consumerUnit.update({
            where: { id: unitId },
            data: { faturapiUnitId: unit.id, faturapiStatus: unit.status },
        });

        return NextResponse.json({ success: true, message: 'Unidade vinculada a Faturapi', data: updated });
    } catch (error) {
        // Tratado aqui para nao cair nas heuristicas de mensagem do withHandle
        // (ex.: "credentials" na mensagem viraria 403).
        if (error instanceof FaturapiError) {
            // 401/403 da Faturapi = problema na FATURAPI_KEY, nao na sessao do admin.
            const status = error.status >= 500 || error.status === 401 || error.status === 403 ? 502 : error.status;
            return NextResponse.json(
                { success: false, error: error.code, message: error.message },
                { status },
            );
        }
        throw error;
    }
};

export const POST = withHandle(linkConsumerUnit);
