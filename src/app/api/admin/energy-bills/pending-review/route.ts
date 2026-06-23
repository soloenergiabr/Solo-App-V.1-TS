import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withHandle } from '@/app/api/api-utils';
import { AuthMiddleware } from '@/backend/auth/middleware/auth.middleware';

const getPendingReviewBills = async (request: NextRequest) => {
    await AuthMiddleware.requireRole(request, 'master');

    const [bills, generationUnits] = await Promise.all([
        prisma.energyBill.findMany({
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
        }),
        prisma.generationUnit.findMany({
            where: { source: 'manual_pending' },
            include: {
                inverter: {
                    include: {
                        client: {
                            select: { id: true, name: true },
                        },
                        plant: {
                            select: { id: true, name: true },
                        },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        }),
    ]);

    const billData = bills.map(bill => ({
        type: 'bill' as const,
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

    const generationData = generationUnits.map(unit => ({
        type: 'generation' as const,
        id: unit.id,
        clientId: unit.inverter.client.id,
        clientName: unit.inverter.client.name,
        plantId: unit.inverter.plant?.id ?? null,
        plantName: unit.inverter.plant?.name ?? null,
        power: unit.power,
        energy: unit.energy,
        generationUnitType: unit.generationUnitType,
        timestamp: unit.timestamp.toISOString(),
        source: unit.source,
        createdAt: unit.createdAt.toISOString(),
    }));

    const data = [...billData, ...generationData].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    return NextResponse.json({ success: true, data });
};

export const GET = withHandle(getPendingReviewBills);
