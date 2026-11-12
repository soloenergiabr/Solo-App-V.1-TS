import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { withHandle } from '@/app/api/api-utils';
import { AuthMiddleware } from '@/backend/auth/middleware/auth.middleware';
import { PrismaIndicationRepository } from '@/backend/club/repositories/implementations/prisma.indication.repository';
import { PrismaTransactionRepository } from '@/backend/club/repositories/implementations/prisma.transaction.repository';
import { ProcessJestorWebhookUseCase } from '@/backend/club/use-cases/process-jestor-webhook.use-case';
import { getReferralRewardPercent } from '@/backend/club/club-settings';

const UpdateStatusSchema = z.object({
    status: z.enum(['pending', 'approved', 'rejected']),
    projectValue: z.number().positive('O valor do projeto deve ser maior que zero').optional(),
});

// Mesmo fluxo do webhook do Jestor: aprovar credita a comissão ao indicador (uma única vez).
const updateIndicationStatus = async (
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) => {
    await AuthMiddleware.requireRole(request, 'master');
    const { id } = await params;
    const { status, projectValue } = UpdateStatusSchema.parse(await request.json());

    const indicationRepository = new PrismaIndicationRepository(prisma);
    const indication = await indicationRepository.findById(id);
    if (!indication) {
        return NextResponse.json({ success: false, message: 'Indicação não encontrada' }, { status: 404 });
    }
    if (status === 'approved' && !projectValue && !indication.projectValue) {
        return NextResponse.json(
            { success: false, message: 'Informe o valor do projeto para aprovar e gerar a comissão.' },
            { status: 400 },
        );
    }

    const useCase = new ProcessJestorWebhookUseCase(
        indicationRepository,
        new PrismaTransactionRepository(prisma),
        getReferralRewardPercent,
    );
    await useCase.applyStatus(indication, status, projectValue);

    return NextResponse.json({ success: true });
};

export const PATCH = withHandle(updateIndicationStatus);
