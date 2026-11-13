import { timingSafeEqual } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { PrismaIndicationRepository } from '@/backend/club/repositories/implementations/prisma.indication.repository';
import { PrismaTransactionRepository } from '@/backend/club/repositories/implementations/prisma.transaction.repository';
import { ProcessJestorWebhookUseCase } from '@/backend/club/use-cases/process-jestor-webhook.use-case';
import prisma from '@/lib/prisma';
import { getReferralRewardPercent } from '@/backend/club/club-settings';

// O Jestor chama com ?token=<JESTOR_WEBHOOK_SECRET> (ou header x-webhook-token).
// Sem o segredo configurado, recusa: o webhook credita Solo Coins.
function isAuthorizedJestorCall(request: Pick<NextRequest, 'headers' | 'nextUrl'>, secret = process.env.JESTOR_WEBHOOK_SECRET): boolean {
    if (!secret) return false;
    const given = request.headers.get('x-webhook-token') ?? request.nextUrl.searchParams.get('token') ?? '';
    const a = Buffer.from(given);
    const b = Buffer.from(secret);
    return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request: NextRequest) {
    if (!isAuthorizedJestorCall(request)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    try {
        const body = await request.json();

        const jestorId = body.id_jestor || body.object_id || body.id;
        const internalId = body.id_lead_soloapp || body.internal_id || body.indication_id;
        const status = body.status || body.fase || body.stage;
        const projectValue = body.valor_projeto || body.project_value || body.amount;
        const email = body.email || body.email_lead;
        const cpf = body.cpf || body.cpf_cnpj;

        if (!jestorId || !status) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const indicationRepository = new PrismaIndicationRepository(prisma);
        const transactionRepository = new PrismaTransactionRepository(prisma);
        const useCase = new ProcessJestorWebhookUseCase(indicationRepository, transactionRepository, getReferralRewardPercent);

        await useCase.execute({
            jestorId: String(jestorId),
            internalId: internalId ? String(internalId) : undefined,
            status: String(status),
            projectValue: projectValue ? Number(projectValue) : undefined,
            email: email ? String(email) : undefined,
            cpf: cpf ? String(cpf) : undefined,
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error processing Jestor webhook:', error);
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Erro interno' }, { status: 500 });
    }
}