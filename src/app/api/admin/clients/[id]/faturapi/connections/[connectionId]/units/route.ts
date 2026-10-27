import { faturapiAdminRoute, ok } from '@/backend/integrations/faturapi/faturapi-admin-route';
import { monitorUnitsSchema } from '@/backend/integrations/faturapi/faturapi-admin.schemas';

/** Monitora UCs descobertas pela conexao, criando no app as que nao existem. */
export const POST = faturapiAdminRoute<{ id: string; connectionId: string }>(async ({ request, params, service }) => {
    const data = monitorUnitsSchema.parse(await request.json());
    return ok(await service.monitorConnectionUnits(params.id, params.connectionId, data), 201);
});
