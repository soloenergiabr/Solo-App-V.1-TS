import { clubService } from "@/backend/club/services";
import { NextRequest, NextResponse } from "next/server";
import { withHandle } from "@/app/api/api-utils";

const validateRedemptionRoute = async (request: NextRequest): Promise<NextResponse> => {
    const body = await request.json();
    const { redemptionCode, partnerPassword } = body;

    // Verify partner password first
    const envPassword = process.env.PARTNER_PASSWORD;
    if (!envPassword || partnerPassword !== envPassword) {
        return NextResponse.json({
            success: false,
            message: 'Não autorizado',
        }, { status: 401 });
    }

    if (!redemptionCode) {
        return NextResponse.json({
            success: false,
            message: 'Código do voucher é obrigatório',
        }, { status: 400 });
    }

    const result = await clubService.validateRedemptionByCode(redemptionCode);

    if (!result.success) {
        return NextResponse.json({
            success: false,
            message: result.message,
        }, { status: 400 });
    }

    return NextResponse.json({
        success: true,
        message: result.message,
        data: {
            offer: result.redemption?.offer,
            client: result.redemption?.client,
            usedAt: result.redemption?.usedAt,
        },
    });
};

export const POST = withHandle(validateRedemptionRoute);
