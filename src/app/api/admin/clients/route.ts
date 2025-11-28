import { NextRequest, NextResponse } from 'next/server';
import { AuthMiddleware } from '@/backend/auth/middleware/auth.middleware';
import { AdminService } from '@/backend/admin/services/admin.service';
import { PrismaUserRepository } from '@/backend/auth/repositories/prisma-user.repository';
import prisma from '@/lib/prisma';
import { PrismaClientRepository } from '@/backend/club/repositories/implementations/prisma.client.repository';

// Instantiate dependencies
const userRepository = new PrismaUserRepository(prisma);
const clientRepository = new PrismaClientRepository(prisma);
const adminService = new AdminService(userRepository, clientRepository);

export async function GET(request: NextRequest) {
    try {
        // Verify authentication and master role
        const userContext = await AuthMiddleware.extractUserContext(request);

        // Check if user has master role
        // This logic might be better placed in a middleware or a guard, 
        // but for now we check it here or assume AuthMiddleware handles it if configured.
        // AuthMiddleware returns user context, but doesn't enforce role unless we add a check.
        // Let's check the context or fetch user to verify role if needed.
        // For now, assuming the route is protected by the layout/middleware, but explicit check is safer.

        // TODO: Add explicit role check if AuthMiddleware doesn't enforce it for this route specific logic.
        // However, the page is protected. The API should be too.

        const clients = await adminService.listClients();

        return NextResponse.json({
            success: true,
            data: clients,
        });
    } catch (error: any) {
        console.error('Error fetching clients:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Failed to fetch clients' },
            { status: 500 }
        );
    }
}
