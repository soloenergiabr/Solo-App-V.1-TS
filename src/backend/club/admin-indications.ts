import prisma from "@/lib/prisma";
import type { Prisma } from "@/app/generated/prisma";

/** Indicações com indicador, indicado e Solo Coins pagos, para o controle do admin. */
export async function listIndicationsForAdmin(where: Prisma.IndicationWhereInput = {}) {
    const rows = await prisma.indication.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
            referrer: { select: { id: true, name: true, email: true } },
            referred: { select: { id: true, name: true, email: true, phone: true } },
        },
    });
    const rewards = await prisma.transaction.groupBy({
        by: ['indicationId'],
        where: { type: 'indication_reward', indicationId: { in: rows.map((r) => r.id) } },
        _sum: { amount: true },
    });
    const rewardById = new Map(rewards.map((r) => [r.indicationId, r._sum.amount ?? 0]));

    return rows.map((r) => ({
        id: r.id,
        status: r.status,
        projectValue: r.projectValue,
        jestorId: r.jestorId,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        referrer: r.referrer,
        referred: r.referred,
        rewardCoins: rewardById.get(r.id) ?? 0,
    }));
}

/** Ranking de engajamento no clube: indicações convertidas e Solo Coins ganhos/resgatados por cliente. */
export async function clubEngagementRanking() {
    const [indications, earned, spent] = await Promise.all([
        prisma.indication.groupBy({ by: ['referrerId', 'status'], _count: true }),
        prisma.transaction.groupBy({ by: ['clientId'], where: { amount: { gt: 0 } }, _sum: { amount: true } }),
        prisma.transaction.groupBy({
            by: ['clientId'],
            where: { type: 'offer_redemption', amount: { lt: 0 } },
            _sum: { amount: true },
            _count: true,
        }),
    ]);

    type Row = { clientId: string; indications: number; approved: number; coinsEarned: number; coinsRedeemed: number; redemptions: number };
    const byClient = new Map<string, Row>();
    const row = (clientId: string) => {
        let r = byClient.get(clientId);
        if (!r) byClient.set(clientId, r = { clientId, indications: 0, approved: 0, coinsEarned: 0, coinsRedeemed: 0, redemptions: 0 });
        return r;
    };
    for (const i of indications) {
        const r = row(i.referrerId);
        r.indications += i._count;
        if (i.status === 'approved') r.approved += i._count;
    }
    for (const e of earned) row(e.clientId).coinsEarned = e._sum.amount ?? 0;
    for (const s of spent) {
        const r = row(s.clientId);
        r.coinsRedeemed = Math.abs(s._sum.amount ?? 0);
        r.redemptions = s._count;
    }

    const clients = await prisma.client.findMany({
        where: { id: { in: [...byClient.keys()] } },
        select: { id: true, name: true },
    });
    const nameById = new Map(clients.map((c) => [c.id, c.name]));

    return [...byClient.values()]
        .map((r) => ({ ...r, name: nameById.get(r.clientId) ?? '—' }))
        .sort((a, b) => b.approved - a.approved || b.coinsEarned - a.coinsEarned || b.indications - a.indications);
}
