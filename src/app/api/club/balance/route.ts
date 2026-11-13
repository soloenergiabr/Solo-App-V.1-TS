import { NextRequest, NextResponse } from 'next/server';
import { withHandle } from '@/app/api/api-utils';
import { AuthMiddleware } from '@/backend/auth/middleware/auth.middleware';
import { clubService } from '@/backend/club/services';
import { getClubSettings } from '@/backend/club/club-settings';

const getBalanceRoute = async (request: NextRequest): Promise<NextResponse> => {
    const userContext = await AuthMiddleware.extractUserContext(request);
    const [balance, settings] = await Promise.all([clubService.getClientBalance(userContext), getClubSettings()]);

    return NextResponse.json({
        success: true,
        data: {
            balance,
            currency: 'SOLO_COINS',
            // Regras do clube definidas pelo admin, exibidas ao cliente.
            referralRewardPercent: settings.referralRewardPercent,
            coinsDescription: settings.coinsDescription,
        },
    });
};

export const GET = withHandle(getBalanceRoute);
