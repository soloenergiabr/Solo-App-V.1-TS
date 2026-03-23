import { NextRequest, NextResponse } from 'next/server';
import { AuthMiddleware } from '@/backend/auth/middleware/auth.middleware';
import { PrismaInverterRepository } from '@/backend/generation/repositories/implementations/prisma.inverter.repository';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { withHandle } from '@/app/api/api-utils';

const inverterRepository = new PrismaInverterRepository(prisma);

const updateInverterSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    providerApiKey: z.string().optional(),
    providerApiSecret: z.string().optional(),
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

    existingInverter.name = validatedData.name;
    // We preserve the rest
    if (validatedData.providerApiKey !== undefined) existingInverter.providerApiKey = validatedData.providerApiKey;
    if (validatedData.providerApiSecret !== undefined) existingInverter.providerApiSecret = validatedData.providerApiSecret;

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
