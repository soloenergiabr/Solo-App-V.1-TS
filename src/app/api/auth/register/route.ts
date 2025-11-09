import { NextRequest, NextResponse } from 'next/server';
import { AuthService, RegisterRequest } from '@/backend/auth/services/auth.service';
import { PrismaUserRepository } from '@/backend/auth/repositories/prisma-user.repository';
import { withHandle } from '@/app/api/api-utils';
import { z } from 'zod';
import prisma from '@/lib/prisma';

// Schema de validação para registro
const RegisterRequestSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters long'),
    email: z.string().email('Invalid email format'),
    cpfCnpj: z.string().min(11, 'CPF/CNPJ is required'),
    phone: z.string().optional(),
    address: z.string().optional(),
    avgEnergyCost: z.number().optional(),
    enelInvoiceFile: z.string().optional(),
    indicationCode: z.string().optional(),
}).refine(data => data.avgEnergyCost || data.enelInvoiceFile, {
    message: 'Either average energy cost or ENEL invoice must be provided',
});

// Criar instância do repositório e service
const userRepository = new PrismaUserRepository(prisma);
const authService = new AuthService(userRepository, prisma);

const registerRoute = async (request: NextRequest): Promise<NextResponse> => {
    const body = await request.json();

    // Validar dados de entrada
    const validatedRequest = RegisterRequestSchema.parse(body) as RegisterRequest;

    // Realizar registro
    const result = await authService.register(validatedRequest);

    return NextResponse.json({
        success: true,
        message: result.message,
        data: result.client,
    }, { status: 201 });
};

export const POST = withHandle(registerRoute);
