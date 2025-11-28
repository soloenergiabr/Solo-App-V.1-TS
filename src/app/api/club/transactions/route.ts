import { NextRequest, NextResponse } from 'next/server';
import { ClubService } from '@/backend/club/services/club.service';
import { PrismaIndicationRepository } from '@/backend/club/repositories/implementations/prisma.indication.repository';
import { PrismaTransactionRepository } from '@/backend/club/repositories/implementations/prisma.transaction.repository';
import { withHandle } from '@/app/api/api-utils';
import prisma from '@/lib/prisma';
import { AuthMiddleware } from '@/backend/auth/middleware/auth.middleware';
import { PrismaOfferRepository } from '@/backend/club/repositories/implementations/prisma.offer.repository';
import { clubService } from '@/backend/club/services';

const getTransactionsRoute = async (request: NextRequest): Promise<NextResponse> => {
    const userContext = await AuthMiddleware.extractUserContext(request);

    const transactions = await clubService.getClientTransactions(userContext);

    return NextResponse.json({
        success: true,
        data: transactions.map(tx => ({
            id: tx.id,
            type: tx.type,
            amount: tx.amount,
            description: tx.description,
            createdAt: tx.createdAt.toISOString(),
        })),
    });
};

export const GET = withHandle(getTransactionsRoute);
