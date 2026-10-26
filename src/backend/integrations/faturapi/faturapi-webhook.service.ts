import { Prisma } from '@/app/generated/prisma';
import prisma from '@/lib/prisma';
import { FaturapiClient } from './faturapi.client';
import type { FaturapiWebhookEvent } from './faturapi.types';
import { ProcessFaturapiEventUseCase } from './process-faturapi-event.use-case';

/**
 * Registra o evento pelo Faturapi-Event-Id. Retorna false quando o evento ja
 * foi recebido antes (reentrega) — nesse caso nao deve ser processado de novo.
 */
export async function recordFaturapiEvent(eventId: string, event: FaturapiWebhookEvent): Promise<boolean> {
    try {
        await prisma.faturapiWebhookEvent.create({
            data: {
                eventId,
                type: event.type,
                payload: event as unknown as Prisma.InputJsonValue,
            },
        });
        return true;
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            return false;
        }
        throw error;
    }
}

/** Processa um evento ja registrado e grava o resultado (processed | failed). */
export async function processFaturapiEvent(eventId: string): Promise<void> {
    const record = await prisma.faturapiWebhookEvent.findUnique({ where: { eventId } });
    if (!record || record.status === 'processed') return;

    try {
        const useCase = new ProcessFaturapiEventUseCase(prisma, new FaturapiClient());
        await useCase.execute(record.payload as unknown as FaturapiWebhookEvent);

        await prisma.faturapiWebhookEvent.update({
            where: { eventId },
            data: { status: 'processed', processedAt: new Date(), error: null },
        });
    } catch (error) {
        console.error(`[Faturapi] Falha ao processar evento ${eventId} (${record.type}):`, error);
        await prisma.faturapiWebhookEvent.update({
            where: { eventId },
            data: { status: 'failed', error: error instanceof Error ? error.message : String(error) },
        });
    }
}
