import { AuthMiddleware } from "@/backend/auth/middleware/auth.middleware";
import { clubService } from "@/backend/club/services";
import { NextRequest, NextResponse } from "next/server";
import { withHandle } from "@/app/api/api-utils";

// POST - Confirm redemption usage with secret code
const confirmUsageRoute = async (request: NextRequest): Promise<NextResponse> => {
    const userContext = await AuthMiddleware.extractUserContext(request);
    const body = await request.json();

    const { redemptionId, confirmationCode } = body;

    if (!redemptionId || !confirmationCode) {
        return NextResponse.json({
            success: false,
            message: 'ID do voucher e código de confirmação são obrigatórios',
        }, { status: 400 });
    }

    const result = await clubService.confirmRedemptionUsage(redemptionId, confirmationCode);

    if (!result.success) {
        return NextResponse.json({
            success: false,
            message: result.message,
        }, { status: 400 });
    }

    return NextResponse.json({
        success: true,
        message: result.message,
    });
};

export const POST = withHandle(confirmUsageRoute);
