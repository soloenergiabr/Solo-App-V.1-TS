import { NextRequest, NextResponse } from 'next/server';
import { initializeGenerationDIContainer } from '@/backend/generation/infrastructure/dependency-injection.container';
import { InverterService } from '@/backend/generation/services/inverter.service';
import { AuthMiddleware } from '@/backend/auth/middleware/auth.middleware';
import { withHandle } from '@/app/api/api-utils';
import { ZodError } from 'zod';
import prisma from '@/lib/prisma';
import { CreateInverterRequestSchema } from '@/backend/generation/use-cases';

const container = initializeGenerationDIContainer('prisma', prisma);

const inverterService = new InverterService(container.getInverterRepository());

export async function GET(request: NextRequest) {
    try {
        const userContext = await AuthMiddleware.requireAuth(request);

        const result = await inverterService.getInverters(userContext);

        return NextResponse.json({
            success: true,
            data: result.inverters,
            count: result.inverters.length,
        });
    } catch (error) {
        console.error('Error fetching inverters:', error);

        if (error instanceof Error && error.message.includes('token')) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Authentication failed',
                    message: error.message,
                },
                { status: 401 }
            );
        }

        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch inverters',
                message: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const userContext = await AuthMiddleware.requirePermission(request, 'create_inverter');

        const body = await request.json();
        const validatedRequest = CreateInverterRequestSchema.parse(body);

        const result = await inverterService.createInverter(validatedRequest, userContext);

        return NextResponse.json({
            success: true,
            message: 'Inverter created successfully',
            data: result,
        }, { status: 201 });

    } catch (error) {
        console.error('Error creating inverter:', error);

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

        if (error instanceof Error &&
            (error.message.includes('token') || error.message.includes('permission'))) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Authorization failed',
                    message: error.message,
                },
                { status: error.message.includes('token') ? 401 : 403 }
            );
        }

        return NextResponse.json(
            {
                success: false,
                error: 'Failed to create inverter',
                message: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}
