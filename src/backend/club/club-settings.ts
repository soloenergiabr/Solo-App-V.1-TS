import prisma from "@/lib/prisma";

export const DEFAULT_REFERRAL_REWARD_PERCENT = 5;
export const CLUB_SETTINGS_ID = "default";

/** Solo Coins pagos por uma indicação convertida: % configurado sobre o valor do projeto. */
export function calculateReferralReward(projectValue: number, percent: number): number {
    return Math.round(projectValue * percent) / 100;
}

export async function getClubSettings() {
    const row = await prisma.clubSettings.findUnique({ where: { id: CLUB_SETTINGS_ID } });
    return {
        referralRewardPercent: row?.referralRewardPercent ?? DEFAULT_REFERRAL_REWARD_PERCENT,
        coinsDescription: row?.coinsDescription ?? null,
        updatedAt: row?.updatedAt ?? null,
    };
}

export async function getReferralRewardPercent(): Promise<number> {
    return (await getClubSettings()).referralRewardPercent;
}
