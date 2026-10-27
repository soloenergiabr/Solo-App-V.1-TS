import { faturapiAdminRoute, ok } from '@/backend/integrations/faturapi/faturapi-admin-route';
import { assignUnitSchema } from '@/backend/integrations/faturapi/faturapi-admin.schemas';

/** Liga uma unidade monitorada sem UC no app a uma UC existente. */
export const POST = faturapiAdminRoute<{ unitId: string }>(async ({ request, params, service }) => {
    const { consumerUnitId } = assignUnitSchema.parse(await request.json());
    return ok(await service.assignUnit(params.unitId, consumerUnitId));
});
