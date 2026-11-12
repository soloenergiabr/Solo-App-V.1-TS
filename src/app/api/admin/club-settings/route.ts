import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { withHandle } from '@/app/api/api-utils';
import { AuthMiddleware } from '@/backend/auth/middleware/auth.middleware';
import { CLUB_SETTINGS_ID, getClubSettings } from '@/backend/club/club-settings';

const SettingsSchema = z.object({
    referralRewardPercent: z.number().min(0, 'O percentual não pode ser negativo').max(100, 'O percentual máximo é 100%'),
    coinsDescription: z.string().trim().max(1000).nullish().transform((val) => val || null),
});

const getSettings = async (request: NextRequest) => {
    await AuthMiddleware.requireRole(request, 'master');
    return NextResponse.json({ success: true, data: await getClubSettings() });
};

const updateSettings = async (request: NextRequest) => {
    await AuthMiddleware.requireRole(request, 'master');
    const data = SettingsSchema.parse(await request.json());
    await prisma.clubSettings.upsert({
        where: { id: CLUB_SETTINGS_ID },
        create: { id: CLUB_SETTINGS_ID, ...data },
        update: data,
    });
    return NextResponse.json({ success: true, data: await getClubSettings() });
};

export const GET = withHandle(getSettings);
export const PUT = withHandle(updateSettings);
