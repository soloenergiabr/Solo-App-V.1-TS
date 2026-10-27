import { faturapiAdminRoute, ok } from '@/backend/integrations/faturapi/faturapi-admin-route';

/** Lista de novo as UCs da conta na distribuidora. */
export const POST = faturapiAdminRoute<{ id: string; connectionId: string }>(async ({ params, service }) => {
    return ok(await service.syncConnection(params.id, params.connectionId), 202);
});
