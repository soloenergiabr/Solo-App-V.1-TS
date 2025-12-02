import { NextRequest, NextResponse } from 'next/server';
import { AuthMiddleware } from '@/backend/auth/middleware/auth.middleware';
import { AdminService } from '@/backend/admin/services/admin.service';
import { PrismaUserRepository } from '@/backend/auth/repositories/prisma-user.repository';
import prisma from '@/lib/prisma';
import { PrismaClientRepository } from '@/backend/club/repositories/implementations/prisma.client.repository';

import { withHandle } from '@/app/api/api-utils';

// Instantiate dependencies
const userRepository = new PrismaUserRepository(prisma);
const clientRepository = new PrismaClientRepository(prisma);
const adminService = new AdminService(userRepository, clientRepository);

const getClients = async (request: NextRequest) => {
    // Verify authentication and master role
    const userContext = await AuthMiddleware.extractUserContext(request);

    // TODO: Explicit master role check if not handled by middleware/layout

    const clients = await adminService.listClients();

    return NextResponse.json({
        success: true,
        data: clients,
    });
};

export const GET = withHandle(getClients);
