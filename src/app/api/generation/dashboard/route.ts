import { NextRequest, NextResponse } from 'next/server';
import { initializeDIContainer } from '@/backend/generation/infrastructure/dependency-injection.container';
import { GenerationService } from '@/backend/generation/services/generation.service';
import { AuthMiddleware } from '@/backend/auth/middleware/auth.middleware';
import { withHandle } from '@/app/api/api-utils';
import prisma from '@/lib/prisma';

const container = initializeDIContainer('prisma', prisma);

const generationService = new GenerationService(
    container.getInverterRepository(),
    container.getGenerationUnitRepository()
);

const getDashboardRoute = async (request: NextRequest): Promise<NextResponse> => {
    const userContext = await AuthMiddleware.requireAuth(request);

    const { searchParams } = new URL(request.url);

    // Extrair filtros dos query params
    const generationUnitType = searchParams.get('type') as 'real_time' | 'day' | 'month' | 'year' | null;
    const inverterIdsParam = searchParams.get('inverterIds');
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;

    // Parse inverterIds (pode ser uma string separada por vírgulas)
    const inverterIds = inverterIdsParam
        ? inverterIdsParam.split(',').map(id => id.trim()).filter(Boolean)
        : undefined;

    const analytics = await generationService.getDashboardAnalytics(
        {
            generationUnitType: generationUnitType || undefined,
            inverterIds,
            startDate,
            endDate,
        },
        userContext
    );

    return NextResponse.json({
        success: true,
        data: analytics,
        message: 'Dashboard analytics retrieved successfully',
    });
};

export const GET = withHandle(getDashboardRoute);
