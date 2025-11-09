import { NextRequest, NextResponse } from 'next/server';
import { ClubService } from '@/backend/club/services/club.service';
import { PrismaIndicationRepository } from '@/backend/club/repositories/implementations/prisma.indication.repository';
import { PrismaTransactionRepository } from '@/backend/club/repositories/implementations/prisma.transaction.repository';
import { PrismaOfferRepository } from '@/backend/club/repositories/implementations/prisma.offer.repository';
import { withHandle } from '@/app/api/api-utils';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { AuthMiddleware } from '@/backend/auth/middleware/auth.middleware';

// Schema de validação para resgate de oferta
const RedeemOfferRequestSchema = z.object({
    offerId: z.string().min(1, 'Offer ID is required'),
});

// Criar instância do service
const indicationRepository = new PrismaIndicationRepository(prisma);
const transactionRepository = new PrismaTransactionRepository(prisma);
const offerRepository = new PrismaOfferRepository(prisma);
const clubService = new ClubService(indicationRepository, transactionRepository);

const redeemOfferRoute = async (request: NextRequest): Promise<NextResponse> => {
    const body = await request.json();

    // Validar dados de entrada
    const validatedRequest = RedeemOfferRequestSchema.parse(body);

    const userContext = await AuthMiddleware.extractUserContext(request);

    // Verificar se oferta existe e está ativa
    const offer = await offerRepository.findById(validatedRequest.offerId);
    if (!offer) {
        return NextResponse.json({
            success: false,
            message: 'Oferta não encontrada',
        }, { status: 404 });
    }

    if (!offer.isActive) {
        return NextResponse.json({
            success: false,
            message: 'Oferta não está ativa',
        }, { status: 400 });
    }

    // Verificar validade da oferta
    const now = new Date();
    if (offer.validFrom && now < offer.validFrom) {
        return NextResponse.json({
            success: false,
            message: 'Oferta ainda não está válida',
        }, { status: 400 });
    }
    if (offer.validTo && now > offer.validTo) {
        return NextResponse.json({
            success: false,
            message: 'Oferta expirou',
        }, { status: 400 });
    }

    // Verificar saldo suficiente
    const currentBalance = await clubService.getClientBalance(userContext);
    if (currentBalance < offer.cost) {
        return NextResponse.json({
            success: false,
            message: 'Saldo insuficiente',
        }, { status: 400 });
    }

    // Criar transação de resgate
    const { TransactionModel } = await import('@/backend/club/models/transaction.model');
    const transaction = new TransactionModel({
        clientId: userContext.clientId!,
        type: 'offer_redemption',
        amount: -offer.cost,
        description: `Resgate da oferta: ${offer.title}`,
        offerId: offer.id,
    });

    await transactionRepository.create(transaction);

    // Retornar sucesso
    return NextResponse.json({
        success: true,
        message: 'Oferta resgatada com sucesso!',
        data: {
            transactionId: transaction.id,
            offerTitle: offer.title,
            cost: offer.cost,
        },
    });
};

export const POST = withHandle(redeemOfferRoute);
