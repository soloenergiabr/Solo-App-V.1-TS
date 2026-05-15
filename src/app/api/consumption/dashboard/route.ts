import { NextRequest, NextResponse } from 'next/server';
import { AuthMiddleware } from '@/backend/auth/middleware/auth.middleware';
import { withHandle } from '@/app/api/api-utils';
import prisma from '@/lib/prisma';

const getDashboardRoute = async (request: NextRequest): Promise<NextResponse> => {
    await AuthMiddleware.requireAuth(request);

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

    const bills = await prisma.energyBill.findMany({
        where: {
            clientId,
            ...(startDate || endDate
                ? {
                    competenceDate: {
                        ...(startDate ? { gte: startDate } : {}),
                        ...(endDate ? { lte: endDate } : {}),
                    },
                }
                : {}),
        },
        orderBy: {
            competenceDate: 'asc',
        },
    });

    const toNumber = (value: unknown): number => {
        if (value === null || value === undefined) return 0;
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : 0;
    };

    const history = bills.map((bill) => {
        const consumptionKwh = toNumber(bill.consumptionKwh ?? bill.billedConsumptionKwh);
        const injectedEnergyKwh = toNumber(bill.injectedEnergyKwh);
        const tariffPerKwh = toNumber(bill.tariffPerKwh);
        const totalBillValue = toNumber(bill.totalBillValue ?? bill.totalAmount);

        return {
            competenceDate: bill.competenceDate,
            consumptionKwh,
            injectedEnergyKwh,
            tariffPerKwh,
            totalBillValue,
        };
    });

    const savings = bills.map((bill) => {
        const consumptionKwh = toNumber(bill.consumptionKwh ?? bill.billedConsumptionKwh);
        const injectedEnergyKwh = toNumber(bill.injectedEnergyKwh);
        const tariffPerKwh = toNumber(bill.tariffPerKwh);
        const actualBill = toNumber(bill.totalBillValue ?? bill.totalAmount);
        const estimatedSavings = toNumber(bill.estimatedSavings);
        const expectedBill = (consumptionKwh + injectedEnergyKwh) * tariffPerKwh;
        const calculatedSavings = Math.max(0, expectedBill - actualBill);

        return {
            period: bill.competenceDate,
            expectedBill: Math.max(0, expectedBill),
            actualBill,
            savings: estimatedSavings || calculatedSavings,
        };
    });

    const dashboardData = {
        history,
        savings,
        totalSavings: savings.reduce((acc, curr) => acc + curr.savings, 0),
    };

    return NextResponse.json({
        success: true,
        data: dashboardData,
        message: 'Consumption dashboard data retrieved successfully',
    });
};

export const GET = withHandle(getDashboardRoute);
