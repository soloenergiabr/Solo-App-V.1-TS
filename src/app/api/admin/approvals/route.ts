import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withHandle } from '@/app/api/api-utils';
import { AuthMiddleware } from '@/backend/auth/middleware/auth.middleware';

const getApprovals = async (request: NextRequest) => {
    await AuthMiddleware.requireRole(request, 'master');

    const [plants, consumerUnits] = await Promise.all([
        prisma.plant.findMany({
            where: { validationStatus: 'pending_review', deletedAt: null },
            include: {
                client: {
                    select: { id: true, name: true },
                },
            },
            orderBy: { createdAt: 'asc' },
        }),
        prisma.consumerUnit.findMany({
            where: { validationStatus: 'pending_review', deletedAt: null },
            include: {
                client: {
                    select: { id: true, name: true },
                },
            },
            orderBy: { createdAt: 'asc' },
        }),
    ]);

    const plantData = plants.map(plant => ({
        type: 'plant' as const,
        id: plant.id,
        name: plant.name,
        clientName: plant.client.name,
        clientId: plant.clientId,
        createdAt: plant.createdAt.toISOString(),
        validationStatus: plant.validationStatus,
        rejectionReason: plant.rejectionReason,
    }));

    const consumerUnitData = consumerUnits.map(unit => ({
        type: 'consumer_unit' as const,
        id: unit.id,
        name: unit.name,
        clientName: unit.client.name,
        clientId: unit.clientId,
        createdAt: unit.createdAt.toISOString(),
        validationStatus: unit.validationStatus,
        rejectionReason: unit.rejectionReason,
    }));

    const data = [...plantData, ...consumerUnitData].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );

    return NextResponse.json({ success: true, data });
};

export const GET = withHandle(getApprovals);
