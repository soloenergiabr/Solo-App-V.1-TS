import { NextRequest, NextResponse } from 'next/server';
import { initializeDIContainer } from '@/backend/generation/infrastructure/dependency-injection.container';
import { InverterService } from '@/backend/generation/services/inverter.service';
import { AuthMiddleware } from '@/backend/auth/middleware/auth.middleware';
import { ZodError } from 'zod';
import prisma from '@/lib/prisma';

// Initialize DI Container
const container = initializeDIContainer('prisma', prisma);

// Create service instance
const inverterService = new InverterService(
    container.getInverterRepository()
);

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // Extrair contexto do usuário
        const userContext = await AuthMiddleware.requireAuth(request);

        const { id } = params;

        const result = await inverterService.getInverterById({ inverterId: id }, userContext);

        return NextResponse.json({
            success: true,
            data: result.inverter,
        });
    } catch (error) {
        console.error('Error fetching inverter:', error);

        if (error instanceof ZodError) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Validation error',
                    message: 'Invalid inverter ID',
                    details: error.issues,
                },
                { status: 400 }
            );
        }

        // Tratar erros de autenticação/autorização
        if (error instanceof Error &&
            (error.message.includes('token') || error.message.includes('permission') || error.message.includes('access'))) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Authorization failed',
                    message: error.message,
                },
                { status: error.message.includes('token') ? 401 : 403 }
            );
        }

        if (error instanceof Error && error.message === 'Inverter not found') {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Inverter not found',
                    message: `Inverter with id ${params.id} not found`,
                },
                { status: 404 }
            );
        }

        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch inverter',
                message: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        const body = await request.json();

        // Note: For now, we'll return a not implemented response
        // To properly implement PUT, we'd need an UpdateInverterUseCase
        return NextResponse.json(
            {
                success: false,
                error: 'Not implemented',
                message: 'PUT operation not yet implemented. Please use POST to create new inverters.',
            },
            { status: 501 }
        );

    } catch (error) {
        console.error('Error updating inverter:', error);

        return NextResponse.json(
            {
                success: false,
                error: 'Failed to update inverter',
                message: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}
