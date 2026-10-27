import { faturapiAdminRoute, ok } from '@/backend/integrations/faturapi/faturapi-admin-route';

/** Busca a fatura agora, fora do agendamento (consome credito da Faturapi). */
export const POST = faturapiAdminRoute<{ id: string; unitId: string }>(async ({ params, service }) => {
    return ok(await service.checkUnit(params.id, params.unitId), 202);
});
