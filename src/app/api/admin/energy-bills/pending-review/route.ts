import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withHandle } from '@/app/api/api-utils';
import { AuthMiddleware } from '@/backend/auth/middleware/auth.middleware';

const getPendingReviewBills = async (request: NextRequest) => {
    await AuthMiddleware.requireRole(request, 'master');

    const bills = await prisma.energyBill.findMany({
        where: { status: 'pending_review' },
        include: {
            client: {
                select: { id: true, name: true },
            },
            consumerUnit: {
                select: { id: true, name: true, clientNumber: true, installationNumber: true },
            },
        },
        orderBy: { createdAt: 'desc' },
    });

    const data = bills.map(bill => ({
        id: bill.id,
        clientId: bill.clientId,
        clientName: bill.client.name,
        consumerUnitId: bill.consumerUnitId,
        consumerUnitName: bill.consumerUnit.name,
        consumerUnitNumber: bill.consumerUnit.clientNumber,
        referenceMonth: bill.referenceMonth,
        referenceYear: bill.referenceYear,
        totalBillValue: bill.totalBillValue ? Number(bill.totalBillValue) : null,
        totalAmount: bill.totalAmount ? Number(bill.totalAmount) : null,
        billFileUrl: bill.billFileUrl,
        status: bill.status,
        createdAt: bill.createdAt.toISOString(),
    }));

    return NextResponse.json({ success: true, data });
};

export const GET = withHandle(getPendingReviewBills);
