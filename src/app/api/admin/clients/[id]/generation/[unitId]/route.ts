import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withHandle } from '@/app/api/api-utils';
import { AuthMiddleware } from '@/backend/auth/middleware/auth.middleware';

const patchGenerationUnit = async (
    request: NextRequest,
    { params }: { params: Promise<{ id: string; unitId: string }> },
) => {
    const userContext = await AuthMiddleware.requireRole(request, 'master');
    const { id: clientId, unitId } = await params;

    const body = await request.json();
    const { action } = body as { action: 'approve' | 'reject' };

    if (!action || !['approve', 'reject'].includes(action)) {
        return NextResponse.json(
            { success: false, message: 'Acao invalida. Use "approve" ou "reject".' },
            { status: 400 },
        );
    }

    const unit = await prisma.generationUnit.findUnique({
        where: { id: unitId },
        include: {
            inverter: {
                select: { id: true, clientId: true },
            },
        },
    });

    if (!unit) {
        return NextResponse.json(
            { success: false, message: 'Unidade de geracao nao encontrada.' },
            { status: 404 },
        );
    }

    if (unit.inverter.clientId !== clientId) {
        return NextResponse.json(
            { success: false, message: 'Unidade de geracao nao pertence ao cliente informado.' },
            { status: 400 },
        );
    }

    if (unit.source !== 'manual_pending') {
        return NextResponse.json(
            { success: false, message: 'Unidade de geracao nao esta pendente de aprovacao.' },
            { status: 400 },
        );
    }

    // Approve: promote to active ('manual'). Reject: soft-delete so the reading
    // is excluded from every aggregate and from the pending-validation count by
    // the standard `deletedAt: null` filters (no lingering orphaned row).
    const updated = await prisma.generationUnit.update({
        where: { id: unitId },
        data:
            action === 'approve'
                ? { source: 'manual' }
                : { deletedAt: new Date() },
    });

    return NextResponse.json({
        success: true,
        data: {
            id: updated.id,
            source: updated.source,
            status: action === 'approve' ? 'approved' : 'rejected',
        },
    });
};

export const PATCH = withHandle(patchGenerationUnit);
