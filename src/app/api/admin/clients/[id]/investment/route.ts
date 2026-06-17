import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withHandle } from '@/app/api/api-utils';
import { AuthMiddleware } from '@/backend/auth/middleware/auth.middleware';
import prisma from '@/lib/prisma';

const investmentSchema = z.object({
    totalInvested: z.coerce.number().min(0),
    startDate: z.coerce.date(),
    expectedPayoff: z.coerce.date().optional().nullable(),
    monthlyReturn: z.coerce.number().optional().nullable(),
});

const getInvestment = async (
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) => {
    await AuthMiddleware.extractUserContext(request);
    const { id: clientId } = await params;

    const investment = await prisma.investment.findFirst({
        where: { clientId, deletedAt: null },
        orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: investment });
};

const upsertInvestment = async (
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) => {
    await AuthMiddleware.extractUserContext(request);
    const { id: clientId } = await params;
    const data = investmentSchema.parse(await request.json());

    const client = await prisma.client.findFirst({ where: { id: clientId } });
    if (!client) throw new Error('Cliente not found');

    const existing = await prisma.investment.findFirst({
        where: { clientId, deletedAt: null },
        orderBy: { createdAt: 'desc' },
    });

    const investment = existing
        ? await prisma.investment.update({ where: { id: existing.id }, data })
        : await prisma.investment.create({ data: { ...data, clientId } });

    return NextResponse.json({ success: true, message: 'Investimento salvo com sucesso', data: investment });
};

export const GET = withHandle(getInvestment);
export const PUT = withHandle(upsertInvestment);
