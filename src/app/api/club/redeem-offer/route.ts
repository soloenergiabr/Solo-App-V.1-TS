import { NextRequest, NextResponse } from 'next/server';
import { withHandle } from '@/app/api/api-utils';
import { z } from 'zod';
import { AuthMiddleware } from '@/backend/auth/middleware/auth.middleware';
import { clubService } from '@/backend/club/services';

const RedeemOfferRequestSchema = z.object({
    offerId: z.string().min(1, 'Offer ID is required'),
});

const redeemOfferRoute = async (request: NextRequest): Promise<NextResponse> => {
    const body = await request.json();

    // Validar dados de entrada
    const validatedRequest = RedeemOfferRequestSchema.parse(body);

    const userContext = await AuthMiddleware.extractUserContext(request);

    // Verificar se oferta existe e está ativa
    const offer = await clubService.getOfferById(validatedRequest.offerId);
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

    // Verificar quantas vezes o cliente já resgatou esta oferta
    const clientRedemptions = await clubService.getClientRedemptions(userContext);
    const offerRedemptionsCount = clientRedemptions.filter(r => r.offerId === offer.id).length;

    if (offerRedemptionsCount >= offer.maxRedemptionsPerClient) {
        return NextResponse.json({
            success: false,
            message: `Você já resgatou esta oferta o máximo de vezes permitido (${offer.maxRedemptionsPerClient})`,
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

    // Resgatar oferta usando o service (que cria transação e redemption)
    const result = await clubService.redeemOffer(validatedRequest.offerId, userContext);

    if (!result.success) {
        return NextResponse.json({
            success: false,
            message: result.message,
        }, { status: 400 });
    }

    // Retornar sucesso com o código do voucher
    return NextResponse.json({
        success: true,
        message: 'Oferta resgatada com sucesso!',
        data: {
            redemptionId: result.redemption?.id,
            redemptionCode: result.redemption?.redemptionCode,
            offerTitle: offer.title,
            cost: offer.cost,
        },
    });
};

export const POST = withHandle(redeemOfferRoute);
