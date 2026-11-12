import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withHandle } from '@/app/api/api-utils';
import { AuthMiddleware } from '@/backend/auth/middleware/auth.middleware';

// Indicadores do painel do admin (contrato 2.10): base de clientes, faturas, consumo,
// clube e o que esta pendente de acao.
const getDashboard = async (request: NextRequest) => {
    await AuthMiddleware.requireRole(request, 'master');

    const now = new Date();
    const today = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
    const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), 1);

    const [
        clientsByStatus, plants, consumerUnits, monitoredUnits,
        billsPaid, billsOverdue, billsOpen, billsLast12,
        pendingPlants, pendingUnits, pendingBills, pendingGeneration,
        activeOffers, redemptions, indicationsByStatus, coinsIssued, topClients,
        recentBills,
    ] = await Promise.all([
        prisma.client.groupBy({ by: ['status'], where: { deletedAt: null }, _count: true }),
        prisma.plant.count({ where: { deletedAt: null } }),
        prisma.consumerUnit.count({ where: { deletedAt: null } }),
        prisma.consumerUnit.count({ where: { deletedAt: null, faturapiUnitId: { not: null } } }),
        prisma.energyBill.count({ where: { OR: [{ paymentStatus: 'paga' }, { paidAt: { not: null } }] } }),
        prisma.energyBill.count({ where: { paymentStatus: { not: 'paga' }, paidAt: null, dueDate: { lt: today } } }),
        prisma.energyBill.count({ where: { paymentStatus: { not: 'paga' }, paidAt: null, OR: [{ dueDate: { gte: today } }, { dueDate: null }] } }),
        prisma.energyBill.aggregate({
            where: { competenceDate: { gte: yearAgo } },
            _count: true,
            _avg: { consumptionKwh: true },
            _sum: { estimatedSavings: true, totalBillValue: true },
        }),
        prisma.plant.count({ where: { validationStatus: 'pending_review', deletedAt: null } }),
        prisma.consumerUnit.count({ where: { validationStatus: 'pending_review', deletedAt: null } }),
        prisma.energyBill.count({ where: { status: 'pending_review' } }),
        prisma.generationUnit.count({ where: { source: 'manual_pending' } }),
        prisma.offer.count({
            where: { isActive: true, OR: [{ validTo: null }, { validTo: { gte: now } }] },
        }),
        prisma.offerRedemption.count(),
        prisma.indication.groupBy({ by: ['status'], _count: true }),
        prisma.transaction.aggregate({ where: { amount: { gt: 0 } }, _sum: { amount: true } }),
        // Ranking do clube: quem mais acumulou Solo Coins.
        prisma.transaction.groupBy({
            by: ['clientId'],
            where: { amount: { gt: 0 } },
            _sum: { amount: true },
            orderBy: { _sum: { amount: 'desc' } },
            take: 5,
        }),
        prisma.energyBill.findMany({
            orderBy: { createdAt: 'desc' },
            take: 6,
            select: {
                id: true, referenceMonth: true, referenceYear: true, totalBillValue: true, dueDate: true,
                paymentStatus: true, paidAt: true, faturapiInvoiceId: true, createdAt: true,
                client: { select: { id: true, name: true } },
                consumerUnit: { select: { name: true } },
            },
        }),
    ]);

    const topClientNames = await prisma.client.findMany({
        where: { id: { in: topClients.map((t) => t.clientId) } },
        select: { id: true, name: true },
    });
    const nameById = new Map(topClientNames.map((c) => [c.id, c.name]));
    const countBy = <T extends string>(rows: { status: T; _count: number }[], status: T) =>
        rows.find((r) => r.status === status)?._count ?? 0;

    return NextResponse.json({
        success: true,
        data: {
            clients: {
                active: countBy(clientsByStatus, 'client'),
                leads: countBy(clientsByStatus, 'lead'),
                inactive: countBy(clientsByStatus, 'inactive'),
            },
            plants,
            consumerUnits,
            monitoredUnits,
            bills: {
                paid: billsPaid,
                overdue: billsOverdue,
                open: billsOpen,
                last12Months: billsLast12._count,
                avgConsumptionKwh: Number(billsLast12._avg.consumptionKwh ?? 0),
                savingsLast12Months: Number(billsLast12._sum.estimatedSavings ?? 0),
                billedLast12Months: Number(billsLast12._sum.totalBillValue ?? 0),
            },
            pending: {
                plants: pendingPlants,
                consumerUnits: pendingUnits,
                bills: pendingBills,
                generation: pendingGeneration,
            },
            club: {
                activeOffers,
                redemptions,
                indications: indicationsByStatus.reduce((sum, r) => sum + r._count, 0),
                indicationsApproved: countBy(indicationsByStatus, 'approved'),
                coinsIssued: coinsIssued._sum.amount ?? 0,
                ranking: topClients.map((t) => ({
                    clientId: t.clientId,
                    name: nameById.get(t.clientId) ?? '—',
                    coins: t._sum.amount ?? 0,
                })),
            },
            recentBills: recentBills.map((b) => ({
                id: b.id,
                clientId: b.client.id,
                clientName: b.client.name,
                unitName: b.consumerUnit?.name ?? null,
                reference: `${String(b.referenceMonth).padStart(2, '0')}/${b.referenceYear}`,
                total: b.totalBillValue != null ? Number(b.totalBillValue) : null,
                dueDate: b.dueDate,
                paid: b.paymentStatus === 'paga' || b.paidAt != null,
                source: b.faturapiInvoiceId ? 'automática' : 'manual',
                createdAt: b.createdAt,
            })),
        },
    });
};

export const GET = withHandle(getDashboard);
