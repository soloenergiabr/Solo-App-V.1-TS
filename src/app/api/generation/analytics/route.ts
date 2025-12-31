import { NextRequest, NextResponse } from 'next/server';
import { initializeGenerationDIContainer } from '@/backend/generation/infrastructure/dependency-injection.container';
import { GenerationService } from '@/backend/generation/services/generation.service';
import { AuthMiddleware } from '@/backend/auth/middleware/auth.middleware';
import { ZodError } from 'zod';
import prisma from '@/lib/prisma';

// Initialize DI Container
const container = initializeGenerationDIContainer('prisma', prisma);

// Create service instance
const generationService = new GenerationService(
    container.getInverterRepository(),
    container.getGenerationUnitRepository()
);

export async function GET(request: NextRequest) {
    try {
        // Extrair contexto do usuário
        const userContext = await AuthMiddleware.requireAuth(request);

        const { searchParams } = new URL(request.url);
        const inverterId = searchParams.get('inverterId') || undefined;
        const startDate = searchParams.get('startDate') || undefined;
        const endDate = searchParams.get('endDate') || undefined;

        // Se inverterId não for fornecido, retorna analytics de todos os inversores do cliente
        // Se inverterId for fornecido, retorna analytics apenas daquele inversor
        const analytics = await generationService.getCompleteInverterAnalytics({
            inverterId,
            userContext,
            startDate,
            endDate
        });

        return NextResponse.json({
            success: true,
            data: analytics,
            message: inverterId
                ? `Analytics for inverter ${inverterId}`
                : `Analytics for all inverters of client ${userContext.clientId}`,
        });

    } catch (error) {
        console.error('Error generating analytics:', error);

        if (error instanceof ZodError) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Validation error',
                    message: 'Invalid request parameters',
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
                    message: 'The specified inverter does not exist',
                },
                { status: 404 }
            );
        }

        return NextResponse.json(
            {
                success: false,
                error: 'Failed to generate analytics',
                message: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}
