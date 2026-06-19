import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withHandle } from '@/app/api/api-utils';
import { AuthMiddleware } from '@/backend/auth/middleware/auth.middleware';
import prisma from '@/lib/prisma';

const consumerUnitSchema = z.object({
    plantId: z.string().min(1).optional(),
    name: z.string().trim().min(1).optional().nullable(),
    isGenerator: z.boolean().optional(),
    isConsumer: z.boolean().optional(),
    accountHolder: z.string().trim().optional().nullable(),
    accountNumber: z.string().trim().optional().nullable(),
    clientNumber: z.string().trim().optional().nullable(),
    installationNumber: z.string().trim().optional().nullable(),
    distributor: z.string().trim().optional().nullable(),
    address: z.string().trim().optional().nullable(),
    city: z.string().trim().optional().nullable(),
    state: z.string().trim().optional().nullable(),
    status: z.string().trim().optional().nullable(),
});

const updateConsumerUnit = async (
    request: NextRequest,
    { params }: { params: Promise<{ id: string; unitId: string }> }
) => {
    await AuthMiddleware.extractUserContext(request);
    const { id: clientId, unitId } = await params;
    const data = consumerUnitSchema.parse(await request.json());

    const existing = await prisma.consumerUnit.findFirst({ where: { id: unitId, clientId, deletedAt: null } });
    if (!existing) throw new Error('Unidade consumidora not found');

    if (data.plantId) {
        const plant = await prisma.plant.findFirst({ where: { id: data.plantId, clientId, deletedAt: null } });
        if (!plant) throw new Error('Usina not found');
    }

    const unit = await prisma.consumerUnit.update({
        where: { id: unitId },
        data,
    });

    return NextResponse.json({ success: true, message: 'Unidade consumidora atualizada com sucesso', data: unit });
};

const deleteConsumerUnit = async (
    request: NextRequest,
    { params }: { params: Promise<{ id: string; unitId: string }> }
) => {
    await AuthMiddleware.extractUserContext(request);
    const { id: clientId, unitId } = await params;

    const existing = await prisma.consumerUnit.findFirst({ where: { id: unitId, clientId, deletedAt: null } });
    if (!existing) throw new Error('Unidade consumidora not found');

    await prisma.consumerUnit.update({
        where: { id: unitId },
        data: { deletedAt: new Date() },
    });

    return NextResponse.json({ success: true, message: 'Unidade consumidora removida com sucesso' });
};

const validationSchema = z.object({
    validationStatus: z.enum(['confirmed', 'rejected']),
});

const validateConsumerUnit = async (
    request: NextRequest,
    { params }: { params: Promise<{ id: string; unitId: string }> }
) => {
    await AuthMiddleware.extractUserContext(request);
    const { id: clientId, unitId } = await params;
    const { validationStatus } = validationSchema.parse(await request.json());

    const existing = await prisma.consumerUnit.findFirst({ where: { id: unitId, clientId, deletedAt: null } });
    if (!existing) throw new Error('Unidade consumidora not found');

    const unit = await prisma.consumerUnit.update({
        where: { id: unitId },
        data: { validationStatus },
    });

    return NextResponse.json({ success: true, message: 'Status de validacao atualizado', data: unit });
};

export const PUT = withHandle(updateConsumerUnit);
export const DELETE = withHandle(deleteConsumerUnit);
export const PATCH = withHandle(validateConsumerUnit);
