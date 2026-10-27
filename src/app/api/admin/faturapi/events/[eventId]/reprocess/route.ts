import { after } from 'next/server';
import { faturapiAdminRoute, ok } from '@/backend/integrations/faturapi/faturapi-admin-route';
import { processFaturapiEvent } from '@/backend/integrations/faturapi/faturapi-webhook.service';

/** Reprocessa um webhook que falhou (ex.: UC cadastrada depois do evento). */
export const POST = faturapiAdminRoute<{ eventId: string }>(async ({ params, service }) => {
    await service.resetEventForReprocess(params.eventId);
    // A analise da fatura pode levar mais de um minuto: roda depois da resposta.
    after(() => processFaturapiEvent(params.eventId));
    return ok(null, 202);
});
