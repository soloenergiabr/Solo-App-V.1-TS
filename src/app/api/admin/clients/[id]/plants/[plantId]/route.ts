import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { Prisma } from '@/app/generated/prisma';
import { withHandle } from '@/app/api/api-utils';
import { AuthMiddleware } from '@/backend/auth/middleware/auth.middleware';
import prisma from '@/lib/prisma';

const plantSchema = z.object({
    name: z.string().trim().min(1).optional(),
    provider: z.string().trim().optional().nullable(),
    providerStatus: z.string().trim().optional().nullable(),
    providerPlantId: z.string().trim().optional().nullable(),
    installedPowerKw: z.coerce.number().min(0).optional().nullable(),
    totalEnergyKwh: z.coerce.number().min(0).optional().nullable(),
    address: z.string().trim().optional().nullable(),
    city: z.string().trim().optional().nullable(),
    state: z.string().trim().optional().nullable(),
    timezone: z.string().trim().optional().nullable(),
    latitude: z.coerce.number().optional().nullable(),
    longitude: z.coerce.number().optional().nullable(),
    providerMetadata: z.unknown().optional().nullable(),
});

const updatePlant = async (
    request: NextRequest,
    { params }: { params: Promise<{ id: string; plantId: string }> }
) => {
    await AuthMiddleware.extractUserContext(request);
    const { id: clientId, plantId } = await params;
    const data = plantSchema.parse(await request.json());
    const providerMetadata =
        data.providerMetadata === undefined
            ? undefined
            : data.providerMetadata === null
                ? Prisma.JsonNull
                : data.providerMetadata as Prisma.InputJsonValue;

    const existing = await prisma.plant.findFirst({ where: { id: plantId, clientId, deletedAt: null } });
    if (!existing) throw new Error('Usina not found');

    const plant = await prisma.plant.update({
        where: { id: plantId },
        data: {
            ...data,
            providerMetadata,
        },
    });

    return NextResponse.json({ success: true, message: 'Usina atualizada com sucesso', data: plant });
};

const deletePlant = async (
    request: NextRequest,
    { params }: { params: Promise<{ id: string; plantId: string }> }
) => {
    await AuthMiddleware.extractUserContext(request);
    const { id: clientId, plantId } = await params;

    const existing = await prisma.plant.findFirst({ where: { id: plantId, clientId, deletedAt: null } });
    if (!existing) throw new Error('Usina not found');

    await prisma.plant.update({
        where: { id: plantId },
        data: { deletedAt: new Date() },
    });

    return NextResponse.json({ success: true, message: 'Usina removida com sucesso' });
};

const validationSchema = z.object({
    validationStatus: z.enum(['confirmed', 'rejected']),
});

const validatePlant = async (
    request: NextRequest,
    { params }: { params: Promise<{ id: string; plantId: string }> }
) => {
    await AuthMiddleware.extractUserContext(request);
    const { id: clientId, plantId } = await params;
    const { validationStatus } = validationSchema.parse(await request.json());

    const existing = await prisma.plant.findFirst({ where: { id: plantId, clientId, deletedAt: null } });
    if (!existing) throw new Error('Usina not found');

    const plant = await prisma.plant.update({
        where: { id: plantId },
        data: { validationStatus },
    });

    return NextResponse.json({ success: true, message: 'Status de validacao atualizado', data: plant });
};

export const PUT = withHandle(updatePlant);
export const DELETE = withHandle(deletePlant);
export const PATCH = withHandle(validatePlant);
