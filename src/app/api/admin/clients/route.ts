import { NextRequest, NextResponse } from 'next/server';
import { AuthMiddleware } from '@/backend/auth/middleware/auth.middleware';
import { AdminService } from '@/backend/admin/services/admin.service';
import { PrismaUserRepository } from '@/backend/auth/repositories/prisma-user.repository';
import prisma from '@/lib/prisma';
import { PrismaClientRepository } from '@/backend/club/repositories/implementations/prisma.client.repository';
import { z } from 'zod';

import { withHandle } from '@/app/api/api-utils';

// Instantiate dependencies
const userRepository = new PrismaUserRepository(prisma);
const clientRepository = new PrismaClientRepository(prisma);
const adminService = new AdminService(userRepository, clientRepository);

const createClientSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email'),
    cpfCnpj: z.string().min(11, 'Invalid CPF/CNPJ'),
    phone: z.string().optional(),
    address: z.string().optional(),
    status: z.enum(['lead', 'client', 'inactive']).optional(),
});

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

const createClient = async (request: NextRequest) => {
    const userContext = await AuthMiddleware.extractUserContext(request);
    // TODO: Explicit master role check

    const body = await request.json();
    const validatedData = createClientSchema.parse(body);

    const newClient = await adminService.createClient(validatedData);

    return NextResponse.json({
        success: true,
        message: 'Client created successfully',
        data: newClient,
    });
};

export const GET = withHandle(getClients);
export const POST = withHandle(createClient);
