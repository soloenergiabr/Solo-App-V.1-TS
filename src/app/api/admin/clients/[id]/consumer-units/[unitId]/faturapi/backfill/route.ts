import { faturapiAdminRoute, ok } from '@/backend/integrations/faturapi/faturapi-admin-route';
import { backfillSchema } from '@/backend/integrations/faturapi/faturapi-admin.schemas';

/** Busca as faturas dos ultimos N meses (consome credito por fatura). */
export const POST = faturapiAdminRoute<{ id: string; unitId: string }>(async ({ request, params, service }) => {
    const { months } = backfillSchema.parse(await request.json());
    return ok(await service.backfillUnit(params.id, params.unitId, months), 202);
});
