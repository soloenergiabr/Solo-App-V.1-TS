import { NextRequest, NextResponse } from 'next/server';
import { PrismaIndicationRepository } from '@/backend/club/repositories/implementations/prisma.indication.repository';
import { PrismaTransactionRepository } from '@/backend/club/repositories/implementations/prisma.transaction.repository';
import { ProcessJestorWebhookUseCase } from '@/backend/club/use-cases/process-jestor-webhook.use-case';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
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
        const useCase = new ProcessJestorWebhookUseCase(indicationRepository, transactionRepository);

        await useCase.execute({
            jestorId: String(jestorId),
            internalId: internalId ? String(internalId) : undefined,
            status: String(status),
            projectValue: projectValue ? Number(projectValue) : undefined,
            email: email ? String(email) : undefined,
            cpf: cpf ? String(cpf) : undefined,
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error processing Jestor webhook:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}