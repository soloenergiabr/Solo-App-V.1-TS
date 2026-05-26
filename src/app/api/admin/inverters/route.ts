import { NextRequest, NextResponse } from 'next/server';
import { AuthMiddleware } from '@/backend/auth/middleware/auth.middleware';
import { PrismaInverterRepository } from '@/backend/generation/repositories/implementations/prisma.inverter.repository';
import { InverterModel } from '@/backend/generation/models/inverter.model';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { uuid } from '@/lib/uuid';

// Instantiate dependencies
const inverterRepository = new PrismaInverterRepository(prisma);

const createInverterSchema = z.object({
    clientId: z.string().min(1, 'Client ID is required'),
    name: z.string().min(1, 'Name is required'),
    provider: z.string().min(1, 'Provider is required'),
    providerId: z.string().min(1, 'Provider ID is required'),
    providerApiKey: z.string().optional(),
    providerApiSecret: z.string().optional(),
    providerUrl: z.string().optional(),
    plantId: z.string().optional(),
    providerPlantId: z.string().optional(),
    providerPlantName: z.string().optional(),
    providerStatus: z.string().optional(),
    providerConfig: z.unknown().optional(),
    providerMetadata: z.unknown().optional(),
    serialNumber: z.string().optional(),
    manufacturer: z.string().optional(),
    modelName: z.string().optional(),
    firmwareVersion: z.string().optional(),
    nominalPowerKw: z.coerce.number().min(0).optional(),
    timezone: z.string().optional(),
    syncEnabled: z.boolean().optional(),
    syncIntervalMinutes: z.coerce.number().int().positive().optional(),
    installedAt: z.coerce.date().optional(),
    commissionedAt: z.coerce.date().optional(),
});

import { withHandle } from '@/app/api/api-utils';

// ... (imports)

// ... (instantiations)

const createInverter = async (request: NextRequest) => {
    // Verify authentication and master role
    await AuthMiddleware.extractUserContext(request);
    // TODO: Explicit master role check

    const body = await request.json();
    const validatedData = createInverterSchema.parse(body);

    if (validatedData.plantId) {
        const plant = await prisma.plant.findFirst({
            where: {
                id: validatedData.plantId,
                clientId: validatedData.clientId,
                deletedAt: null,
            },
        });

        if (!plant) {
            return NextResponse.json({ success: false, message: 'Usina não encontrada para este cliente' }, { status: 400 });
        }
    }

    const inverter = new InverterModel(
        uuid(),
        validatedData.name,
        validatedData.provider,
        validatedData.providerId,
        validatedData.providerApiKey,
        validatedData.providerApiSecret,
        validatedData.providerUrl,
        validatedData.clientId,
        {
            plantId: validatedData.plantId,
            providerPlantId: validatedData.providerPlantId ?? validatedData.providerId,
            providerPlantName: validatedData.providerPlantName,
            providerStatus: validatedData.providerStatus,
            providerConfig: validatedData.providerConfig,
            providerMetadata: validatedData.providerMetadata,
            serialNumber: validatedData.serialNumber,
            manufacturer: validatedData.manufacturer,
            modelName: validatedData.modelName,
            firmwareVersion: validatedData.firmwareVersion,
            nominalPowerKw: validatedData.nominalPowerKw,
            timezone: validatedData.timezone,
            syncEnabled: validatedData.syncEnabled,
            syncIntervalMinutes: validatedData.syncIntervalMinutes,
            installedAt: validatedData.installedAt,
            commissionedAt: validatedData.commissionedAt,
        }
    );

    await inverterRepository.create(inverter);

    return NextResponse.json({
        success: true,
        message: 'Inverter registered successfully',
        data: inverter,
    });
};

export const POST = withHandle(createInverter);
