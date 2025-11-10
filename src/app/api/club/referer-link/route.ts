import { NextRequest, NextResponse } from 'next/server';
import { GetRefererLinkUseCase } from '@/backend/club/use-cases/get-referer-link.use-case';
import { PrismaClientRepository } from '@/backend/club/repositories/implementations/prisma.client.repository';
import { withHandle } from '@/app/api/api-utils';
import prisma from '@/lib/prisma';
import { AuthMiddleware } from '@/backend/auth/middleware/auth.middleware';

// Criar instância do service
const clientRepository = new PrismaClientRepository(prisma);
const getRefererLinkUseCase = new GetRefererLinkUseCase(clientRepository);

const getRefererLinkRoute = async (request: NextRequest): Promise<NextResponse> => {
    const userContext = await AuthMiddleware.extractUserContext(request);

    // Buscar link de indicação
    const result = await getRefererLinkUseCase.execute(userContext);

    return NextResponse.json({
        success: true,
        data: result,
    });
};

export const GET = withHandle(getRefererLinkRoute);
