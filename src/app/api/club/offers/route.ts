import { AuthMiddleware } from "@/backend/auth/middleware/auth.middleware";
import { clubService } from "@/backend/club/services";
import { NextRequest, NextResponse } from "next/server";
import { withHandle } from "@/app/api/api-utils";

const getOffersRoute = async (request: NextRequest): Promise<NextResponse> => {
    const userContext = await AuthMiddleware.extractUserContext(request);
    const offers = await clubService.getAllOffers();

    return NextResponse.json({
        success: true,
        data: offers,
    });
};

export const GET = withHandle(getOffersRoute);
