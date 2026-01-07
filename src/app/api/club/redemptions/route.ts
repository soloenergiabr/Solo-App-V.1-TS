import { AuthMiddleware } from "@/backend/auth/middleware/auth.middleware";
import { clubService } from "@/backend/club/services";
import { NextRequest, NextResponse } from "next/server";
import { withHandle } from "@/app/api/api-utils";

// GET - List client's redemptions (vouchers)
const getRedemptionsRoute = async (request: NextRequest): Promise<NextResponse> => {
    const userContext = await AuthMiddleware.extractUserContext(request);

    const redemptions = await clubService.getClientRedemptions(userContext);

    return NextResponse.json({
        success: true,
        data: redemptions,
    });
};

// POST - Redeem an offer
const redeemOfferRoute = async (request: NextRequest): Promise<NextResponse> => {
    const userContext = await AuthMiddleware.extractUserContext(request);
    const body = await request.json();

    const { offerId } = body;

    if (!offerId) {
        return NextResponse.json({
            success: false,
            message: 'ID da oferta é obrigatório',
        }, { status: 400 });
    }

    const result = await clubService.redeemOffer(offerId, userContext);

    if (!result.success) {
        return NextResponse.json({
            success: false,
            message: result.message,
        }, { status: 400 });
    }

    return NextResponse.json({
        success: true,
        message: result.message,
        data: result.redemption,
    });
};

export const GET = withHandle(getRedemptionsRoute);
export const POST = withHandle(redeemOfferRoute);
