import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withHandle } from '@/app/api/api-utils';
import { AuthMiddleware } from '@/backend/auth/middleware/auth.middleware';
import { eventBus, EventType } from '@/backend/shared/event-bus';

const patchPendingReviewBill = async (
    request: NextRequest,
    { params }: { params: Promise<{ billId: string }> },
) => {
    const userContext = await AuthMiddleware.requireRole(request, 'master');
    const { billId } = await params;

    const body = await request.json();
    const { action } = body as { action: 'confirm' | 'reject' };

    if (!action || !['confirm', 'reject'].includes(action)) {
        return NextResponse.json(
            { success: false, message: 'Acao invalida. Use "confirm" ou "reject".' },
            { status: 400 },
        );
    }

    const bill = await prisma.energyBill.findUnique({
        where: { id: billId },
    });

    if (!bill) {
        return NextResponse.json(
            { success: false, message: 'Fatura nao encontrada.' },
            { status: 404 },
        );
    }

    if (bill.status !== 'pending_review') {
        return NextResponse.json(
            { success: false, message: 'Fatura nao esta em revisao.' },
            { status: 400 },
        );
    }

    const updated = await prisma.energyBill.update({
        where: { id: billId },
        data: {
            status: action === 'confirm' ? 'confirmed' : 'rejected',
        },
    });

    if (action === 'confirm') {
        eventBus.emit(EventType.BILL_CONFIRMED, {
            billId: updated.id,
            clientId: updated.clientId,
            confirmedBy: userContext.userId,
        });
    }

    return NextResponse.json({
        success: true,
        data: {
            id: updated.id,
            status: updated.status,
        },
    });
};

export const PATCH = withHandle(patchPendingReviewBill);
