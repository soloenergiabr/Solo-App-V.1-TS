import { NextRequest, NextResponse } from 'next/server';
import { initializeGenerationDIContainer } from '@/backend/generation/infrastructure/dependency-injection.container';
import { GenerationAnalyticsService } from '@/backend/generation/services/generation-analytics.service';
import { CreateGenerationUnitRequestSchema } from '@/backend/generation/use-cases/create-generation-unit.use-case';
import { AuthMiddleware } from '@/backend/auth/middleware/auth.middleware';
import { ZodError } from 'zod';
import prisma from '@/lib/prisma';

// Initialize DI Container
const container = initializeGenerationDIContainer('prisma', prisma);

// Create service instance
const generationAnalyticsService = new GenerationAnalyticsService(
    container.getInverterRepository(),
    container.getGenerationUnitRepository()
);

export async function GET(request: NextRequest) {
    try {
        // Extrair contexto do usuário
        const userContext = await AuthMiddleware.requireAuth(request);

        const { searchParams } = new URL(request.url);
        const inverterId = searchParams.get('inverterId');
        const type = searchParams.get('type');
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        if (!inverterId) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Missing required parameter',
                    message: 'inverterId is required',
                },
                { status: 400 }
            );
        }

        const result = await generationAnalyticsService.getGenerationUnitsByInverterId({
            inverterId,
            type: type as any,
            startDate: startDate || undefined,
            endDate: endDate || undefined,
        }, userContext);

        return NextResponse.json({
            success: true,
            data: result.generationUnits,
            count: result.count,
        });

    } catch (error) {
        console.error('Error fetching generation units:', error);

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
                error: 'Failed to fetch generation units',
                message: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        // Extrair contexto do usuário e verificar permissão
        const userContext = await AuthMiddleware.requirePermission(request, 'create_generation_unit');

        const body = await request.json();

        // Validate request using Zod schema
        const validatedRequest = CreateGenerationUnitRequestSchema.parse(body);

        const result = await generationAnalyticsService.createGenerationUnit(validatedRequest, userContext);

        return NextResponse.json({
            success: true,
            message: 'Generation unit created successfully',
            data: { id: result.generationUnitId },
        }, { status: 201 });

    } catch (error) {
        console.error('Error creating generation unit:', error);

        if (error instanceof ZodError) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Validation error',
                    message: 'Invalid request data',
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
                error: 'Failed to create generation unit',
                message: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}
