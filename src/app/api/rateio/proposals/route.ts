import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withHandle } from '@/app/api/api-utils';
import { AuthMiddleware } from '@/backend/auth/middleware/auth.middleware';
import { eventBus, EventType } from '@/backend/shared/event-bus';
import prisma from '@/lib/prisma';

const proposalSchema = z.object({
    plantId: z.string().min(1, 'Usina é obrigatória'),
    fromId: z.string().min(1, 'Origem é obrigatória'),
    toId: z.string().min(1, 'Destino é obrigatório'),
    allocationPercentage: z.coerce.number().min(0, 'Mínimo 0%').max(100, 'Máximo 100%'),
    startsAt: z.coerce.date().optional().nullable(),
    endsAt: z.coerce.date().optional().nullable(),
});

/**
 * POST /api/rateio/proposals
 * Create or update a credit allocation proposal (pending_push).
 */
const createProposal = async (request: NextRequest) => {
    const user = await AuthMiddleware.requireAuth(request);
    if (!user.clientId) throw new Error('Usuário sem cliente vinculado');

    const data = proposalSchema.parse(await request.json());
    const { plantId, fromId, toId, allocationPercentage, startsAt, endsAt } = data;

    // Validate that plant belongs to user's client
    const plant = await prisma.plant.findFirst({
        where: { id: plantId, clientId: user.clientId, deletedAt: null },
    });
    if (!plant) throw new Error('Usina não encontrada');

    // Validate origin is a generator unit
    const from = await prisma.consumerUnit.findFirst({
        where: { id: fromId, clientId: user.clientId, deletedAt: null },
    });
    if (!from) throw new Error('Unidade de origem não encontrada');
    if (!from.isGenerator) throw new Error('A unidade de origem precisa ser geradora');

    // Validate destination is a consumer unit
    const to = await prisma.consumerUnit.findFirst({
        where: { id: toId, clientId: user.clientId, deletedAt: null },
    });
    if (!to) throw new Error('Unidade de destino não encontrada');
    if (!to.isConsumer) throw new Error('A unidade de destino precisa ser consumidora');

    // Both must belong to the same plant
    if (from.plantId !== plantId || to.plantId !== plantId) {
        throw new Error('Origem e destino devem pertencer à mesma usina');
    }

    // Find existing active allocation for same plant/from/to
    const existing = await prisma.creditAllocation.findFirst({
        where: {
            clientId: user.clientId,
            plantId,
            fromId,
            toId,
            deletedAt: null,
            isActive: true,
        },
    });

    // Validate sum of percentages does not exceed 100%
    const existingAllocations = await prisma.creditAllocation.findMany({
        where: {
            clientId: user.clientId,
            plantId,
            deletedAt: null,
            isActive: true,
            enelSyncStatus: { not: 'failed' },
        },
        select: { id: true, allocationPercentage: true },
    });
    const existingSum = existingAllocations
        .filter((a) => a.id !== existing?.id)
        .reduce((sum, a) => sum + Number(a.allocationPercentage), 0);
    if (existingSum + allocationPercentage > 100) {
        throw new Error('A soma dos percentuais de rateio nao pode ultrapassar 100%');
    }

    let allocation;
    if (existing) {
        allocation = await prisma.creditAllocation.update({
            where: { id: existing.id },
            data: {
                allocationPercentage,
                startsAt: startsAt ?? existing.startsAt,
                endsAt: endsAt ?? existing.endsAt,
                enelSyncStatus: 'pending_push',
                requestedAt: new Date(),
                requestedByUserId: user.userId,
            },
        });
    } else {
        allocation = await prisma.creditAllocation.create({
            data: {
                clientId: user.clientId,
                plantId,
                fromId,
                toId,
                allocationPercentage,
                startsAt,
                endsAt,
                isActive: true,
                enelSyncStatus: 'pending_push',
                requestedAt: new Date(),
                requestedByUserId: user.userId,
            },
        });
    }

    eventBus.emit(EventType.RATEIO_CHANGE_REQUESTED, {
        allocationId: allocation.id,
        clientId: user.clientId,
    });

    return NextResponse.json({ success: true, data: allocation });
};

export const POST = withHandle(createProposal);
