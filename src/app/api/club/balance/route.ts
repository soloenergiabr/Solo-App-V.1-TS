import { NextRequest, NextResponse } from 'next/server';
import { ClubService } from '@/backend/club/services/club.service';
import { PrismaIndicationRepository } from '@/backend/club/repositories/implementations/prisma.indication.repository';
import { PrismaTransactionRepository } from '@/backend/club/repositories/implementations/prisma.transaction.repository';
import { withHandle } from '@/app/api/api-utils';
import prisma from '@/lib/prisma';
import { AuthMiddleware } from '@/backend/auth/middleware/auth.middleware';

// Criar instância do service
const indicationRepository = new PrismaIndicationRepository(prisma);
const transactionRepository = new PrismaTransactionRepository(prisma);
const clubService = new ClubService(indicationRepository, transactionRepository);

const getBalanceRoute = async (request: NextRequest): Promise<NextResponse> => {
    const userContext = await AuthMiddleware.extractUserContext(request);
    const balance = await clubService.getClientBalance(userContext);

    return NextResponse.json({
        success: true,
        data: {
            balance,
            currency: 'SOLO_COINS',
        },
    });
};

export const GET = withHandle(getBalanceRoute);
