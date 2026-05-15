import { NextRequest, NextResponse } from 'next/server';
import { AuthMiddleware } from '@/backend/auth/middleware/auth.middleware';
import { PrismaInverterRepository } from '@/backend/generation/repositories/implementations/prisma.inverter.repository';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { withHandle } from '@/app/api/api-utils';

const inverterRepository = new PrismaInverterRepository(prisma);

const updateInverterSchema = z.object({
    name: z.string().min(1, 'Name is required').optional(),
    provider: z.string().min(1).optional(),
    providerId: z.string().min(1).optional(),
    providerApiKey: z.string().optional().nullable(),
    providerApiSecret: z.string().optional().nullable(),
    providerUrl: z.string().optional().nullable(),
    plantId: z.string().optional().nullable(),
    providerPlantId: z.string().optional().nullable(),
    providerPlantName: z.string().optional().nullable(),
    providerStatus: z.string().optional().nullable(),
    providerConfig: z.unknown().optional().nullable(),
    providerMetadata: z.unknown().optional().nullable(),
    serialNumber: z.string().optional().nullable(),
    manufacturer: z.string().optional().nullable(),
    modelName: z.string().optional().nullable(),
    firmwareVersion: z.string().optional().nullable(),
    nominalPowerKw: z.coerce.number().min(0).optional().nullable(),
    timezone: z.string().optional().nullable(),
    syncEnabled: z.boolean().optional(),
    syncIntervalMinutes: z.coerce.number().int().positive().optional().nullable(),
    installedAt: z.coerce.date().optional().nullable(),
    commissionedAt: z.coerce.date().optional().nullable(),
});

const updateInverter = async (
    request: NextRequest,
    { params }: { params: { id: string } }
) => {
    await AuthMiddleware.extractUserContext(request);
    
    // We expect the next param unwarping natively in NextJs 15, but since the user added `await params` in other places, let's await it to be safe.
    const resolvedParams = await Promise.resolve(params);
    const inverterId = resolvedParams.id;

    if (!inverterId) {
        return NextResponse.json({ success: false, message: 'ID is missing' }, { status: 400 });
    }

    const body = await request.json();
    const validatedData = updateInverterSchema.parse(body);

    const existingInverter = await inverterRepository.findById(inverterId);
    if (!existingInverter) {
        return NextResponse.json({ success: false, message: 'Inversor não encontrado' }, { status: 404 });
    }

    if (validatedData.plantId) {
        const plant = await prisma.plant.findFirst({
            where: {
                id: validatedData.plantId,
                clientId: existingInverter.clientId,
                deletedAt: null,
            },
        });

        if (!plant) {
            return NextResponse.json({ success: false, message: 'Usina não encontrada para este cliente' }, { status: 400 });
        }
    }

    if (validatedData.name !== undefined) existingInverter.name = validatedData.name;
    if (validatedData.provider !== undefined) existingInverter.provider = validatedData.provider;
    if (validatedData.providerId !== undefined) existingInverter.providerId = validatedData.providerId;
    if (validatedData.providerApiKey !== undefined) existingInverter.providerApiKey = validatedData.providerApiKey ?? undefined;
    if (validatedData.providerApiSecret !== undefined) existingInverter.providerApiSecret = validatedData.providerApiSecret ?? undefined;
    if (validatedData.providerUrl !== undefined) existingInverter.providerUrl = validatedData.providerUrl ?? undefined;
    if (validatedData.plantId !== undefined) existingInverter.plantId = validatedData.plantId ?? undefined;
    if (validatedData.providerPlantId !== undefined) existingInverter.providerPlantId = validatedData.providerPlantId ?? undefined;
    if (validatedData.providerPlantName !== undefined) existingInverter.providerPlantName = validatedData.providerPlantName ?? undefined;
    if (validatedData.providerStatus !== undefined) existingInverter.providerStatus = validatedData.providerStatus ?? undefined;
    if (validatedData.providerConfig !== undefined) existingInverter.providerConfig = validatedData.providerConfig ?? undefined;
    if (validatedData.providerMetadata !== undefined) existingInverter.providerMetadata = validatedData.providerMetadata ?? undefined;
    if (validatedData.serialNumber !== undefined) existingInverter.serialNumber = validatedData.serialNumber ?? undefined;
    if (validatedData.manufacturer !== undefined) existingInverter.manufacturer = validatedData.manufacturer ?? undefined;
    if (validatedData.modelName !== undefined) existingInverter.modelName = validatedData.modelName ?? undefined;
    if (validatedData.firmwareVersion !== undefined) existingInverter.firmwareVersion = validatedData.firmwareVersion ?? undefined;
    if (validatedData.nominalPowerKw !== undefined) existingInverter.nominalPowerKw = validatedData.nominalPowerKw ?? undefined;
    if (validatedData.timezone !== undefined) existingInverter.timezone = validatedData.timezone ?? undefined;
    if (validatedData.syncEnabled !== undefined) existingInverter.syncEnabled = validatedData.syncEnabled;
    if (validatedData.syncIntervalMinutes !== undefined) existingInverter.syncIntervalMinutes = validatedData.syncIntervalMinutes ?? undefined;
    if (validatedData.installedAt !== undefined) existingInverter.installedAt = validatedData.installedAt ?? undefined;
    if (validatedData.commissionedAt !== undefined) existingInverter.commissionedAt = validatedData.commissionedAt ?? undefined;

    await inverterRepository.update(existingInverter);

    return NextResponse.json({
        success: true,
        message: 'Inversor atualizado com sucesso',
        data: existingInverter,
    });
};

const deleteInverter = async (
    request: NextRequest,
    { params }: { params: { id: string } }
) => {
    await AuthMiddleware.extractUserContext(request);
    
    const resolvedParams = await Promise.resolve(params);
    const inverterId = resolvedParams.id;

    if (!inverterId) {
        return NextResponse.json({ success: false, message: 'ID is missing' }, { status: 400 });
    }

    await inverterRepository.delete(inverterId);

    return NextResponse.json({
        success: true,
        message: 'Inversor removido com sucesso',
    });
};

export const PUT = withHandle(updateInverter);
export const DELETE = withHandle(deleteInverter);
