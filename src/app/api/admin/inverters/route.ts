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
});

export async function POST(request: NextRequest) {
    try {
        // Verify authentication and master role
        const userContext = await AuthMiddleware.extractUserContext(request);
        // TODO: Explicit master role check

        const body = await request.json();
        const validatedData = createInverterSchema.parse(body);

        const inverter = new InverterModel(
            uuid(),
            validatedData.name,
            validatedData.provider,
            validatedData.providerId,
            validatedData.providerApiKey,
            validatedData.providerApiSecret,
            validatedData.providerUrl,
            validatedData.clientId
        );

        await inverterRepository.create(inverter);

        return NextResponse.json({
            success: true,
            message: 'Inverter registered successfully',
            data: inverter,
        });
    } catch (error: any) {
        console.error('Error registering inverter:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Failed to register inverter' },
            { status: error instanceof z.ZodError ? 400 : 500 }
        );
    }
}
