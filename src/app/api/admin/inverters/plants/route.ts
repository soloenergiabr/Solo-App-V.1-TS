import { NextRequest, NextResponse } from 'next/server';
import { AuthMiddleware } from '@/backend/auth/middleware/auth.middleware';
import { InverterApiFactory } from '@/backend/generation/repositories/inverter-api.factory';
import { withHandle } from '@/app/api/api-utils';

const listPlants = async (request: NextRequest) => {
    // Verify authentication
    await AuthMiddleware.extractUserContext(request);

    // Get the provider from query string
    const url = new URL(request.url);
    const provider = url.searchParams.get('provider');

    if (!provider) {
        return NextResponse.json(
            { success: false, message: 'Provider parameter is required' },
            { status: 400 }
        );
    }

    try {
        // Create repository using admin credentials via the factory
        const inverterRepository = InverterApiFactory.createForProvider(provider);
        const plants = await inverterRepository.listPlants();

        return NextResponse.json({
            success: true,
            data: plants,
        });
    } catch (error: any) {
        console.error('Error fetching plants:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Error fetching plants' },
            { status: 500 }
        );
    }
};

export const GET = withHandle(listPlants);
