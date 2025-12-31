import { NextRequest, NextResponse } from 'next/server';
import { initializeConsumptionDIContainer } from '@/backend/consumption/infrastructure/dependency-injection.container';
import { ConsumptionService } from '@/backend/consumption/services/consumption.service';
import { GetConsumptionDashboardUseCase } from '@/backend/consumption/use-cases/get-consumption-dashboard.use-case';
import { AuthMiddleware } from '@/backend/auth/middleware/auth.middleware';
import { withHandle } from '@/app/api/api-utils';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const container = initializeConsumptionDIContainer('prisma', prisma);

const consumptionService = new ConsumptionService(
    container.getConsumptionRepository()
);

const getConsumptionDashboardUseCase = new GetConsumptionDashboardUseCase(consumptionService);

const getDashboardRoute = async (request: NextRequest): Promise<NextResponse> => {
    const userContext = await AuthMiddleware.requireAuth(request);

    const { searchParams } = new URL(request.url);

    const clientId = searchParams.get('clientId');
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');

    if (!clientId) {
        return NextResponse.json({
            success: false,
            message: 'Client ID is required',
        }, { status: 400 });
    }

    const startDate = startDateParam ? new Date(startDateParam) : undefined;
    const endDate = endDateParam ? new Date(endDateParam) : undefined;

    const dashboardData = await getConsumptionDashboardUseCase.execute({
        clientId,
        startDate,
        endDate
    });

    return NextResponse.json({
        success: true,
        data: dashboardData,
        message: 'Consumption dashboard data retrieved successfully',
    });
};

export const GET = withHandle(getDashboardRoute);
